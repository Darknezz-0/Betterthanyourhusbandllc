import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';
import { Route, Router, Switch } from 'wouter';

const rootConfig = readFileSync(new URL('../../../.replit', import.meta.url), 'utf8');
const artifactConfig = readFileSync(
  new URL('../.replit-artifact/artifact.toml', import.meta.url),
  'utf8',
);
const appSource = readFileSync(new URL('./App.tsx', import.meta.url), 'utf8');
const sitemap = readFileSync(new URL('../public/sitemap.xml', import.meta.url), 'utf8');

// Independent baseline: deleting a page from both App.tsx and the sitemap must fail.
const requiredSitemapPaths = [
  '/',
  '/about',
  '/estimate',
  '/request-a-quote',
  '/contact',
  '/privacy-policy',
  '/terms',
  '/disclaimer',
  '/legal-disclaimer',
];
// These public routes exist today but are intentionally not advertised in the sitemap.
const unlistedPublicPaths = ['/services', '/service-agreement'];

function sitemapPaths(xml: string) {
  const locations = [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/g)];
  expect(locations.length, 'sitemap must contain page URLs').toBeGreaterThan(0);
  return locations.map(([, location]) => new URL(location).pathname);
}

function publicRoutes(source: string) {
  // Parse JSX rather than matching source text: comments and formatting aren't routes.
  // Do not import App.tsx, which brings in browser-only UI and side effects.
  const file = ts.createSourceFile('App.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const switches: ts.JsxElement[] = [];
  function visit(node: ts.Node) {
    if (ts.isJsxElement(node) && node.openingElement.tagName.getText(file) === 'Switch') {
      switches.push(node);
    }
    ts.forEachChild(node, visit);
  }
  visit(file);
  expect(switches, 'expected one public Wouter Switch in App.tsx').toHaveLength(1);

  return switches[0].children.flatMap((child) => {
    if (ts.isJsxText(child)) return [];
    // Ignore JSX comments but fail explicitly if routing moves to dynamic expressions.
    if (ts.isJsxExpression(child) && !child.expression) return [];
    const opening = ts.isJsxElement(child) ? child.openingElement : child;
    if (!ts.isJsxOpeningElement(opening) && !ts.isJsxSelfClosingElement(opening)) {
      throw new Error('Unsupported Switch child; update the route coverage check');
    }
    expect(opening.tagName.getText(file)).toBe('Route');
    const attributes = opening.attributes.properties;
    expect(attributes.some(ts.isJsxSpreadAttribute), 'inspect spread route props explicitly').toBe(false);
    const pathAttribute = attributes.find(
      (attribute) => ts.isJsxAttribute(attribute) && attribute.name.getText(file) === 'path',
    );
    let path: string | undefined;
    if (pathAttribute && ts.isJsxAttribute(pathAttribute)) {
      const initializer = pathAttribute.initializer;
      if (!initializer || !ts.isStringLiteral(initializer)) {
        throw new Error('Expected a literal public route path; update the route coverage check');
      }
      path = initializer.text;
    }
    let isNotFound = false;
    function findNotFound(node: ts.Node) {
      if (ts.isIdentifier(node) && node.text === 'NotFound') isNotFound = true;
      ts.forEachChild(node, findNotFound);
    }
    findNotFound(child);
    // Wouter itself selects the first matching Route, including the pathless fallback.
    return [createElement(Route, { key: String(path), path },
      isNotFound ? 'not-found' : `public:${path}`,
    )];
  });
}

function expectPublicPath(routes: ReturnType<typeof publicRoutes>, path: string) {
  const rendered = renderToStaticMarkup(
    createElement(Router, { ssrPath: path, children: createElement(Switch, null, ...routes) }),
  );
  expect(rendered, `${path} must resolve to its public Route, not NotFound or another route`)
    .toBe(`public:${path}`);
}

function section(config: string, heading: string) {
  return config.split(heading)[1]?.split(/^\[/m)[0] ?? '';
}

describe('static publishing routing', () => {
  it('keeps static hosting pointed at the website build', () => {
    const root = section(rootConfig, '[deployment]');
    const artifact = section(artifactConfig, '[services.production]');
    const publicDir = '"artifacts/better-than-your-husband-services/dist/public"';

    expect(root).toContain('deploymentTarget = "static"');
    expect(root).toContain(`publicDir = ${publicDir}`);
    expect(artifact).toContain('serve = "static"');
    expect(artifact).toContain(`publicDir = ${publicDir}`);
  });

  it('sets the SPA fallback on both the root publisher and the artifact', () => {
    for (const [config, heading] of [
      [rootConfig, '[[deployment.rewrites]]'],
      [artifactConfig, '[[services.production.rewrites]]'],
    ]) {
      const fallback = section(config, heading);
      expect(fallback).toMatch(/^from = "\/\*"$/m);
      expect(fallback).toMatch(/^to = "\/index\.html"$/m);
    }
  });

  it('keeps the crawler files as physical files rather than HTML rewrites', () => {
    const robots = readFileSync(new URL('../public/robots.txt', import.meta.url), 'utf8');

    expect(sitemap).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    expect(robots).toContain('Allow: /');
    expect(robots).toContain('Sitemap: https://www.betterthanyourhusbandllc.com/sitemap.xml');
    // Specific rewrites could override crawler requests. Only use the fallback;
    // Replit serves existing files before applying this wildcard.
    expect(rootConfig.match(/^\[\[deployment\.rewrites\]\]$/gm)).toHaveLength(1);
  });
});

describe('public route and sitemap coverage', () => {
  const routes = publicRoutes(appSource);

  it.each(sitemapPaths(sitemap))('sitemap URL %s resolves to a public Wouter route', (path) => {
    expectPublicPath(routes, path);
  });

  it.each([...requiredSitemapPaths, ...unlistedPublicPaths])(
    'keeps the required public route %s even if it is also removed from the sitemap',
    (path) => {
      expectPublicPath(routes, path);
    },
  );

  it('keeps required pages in the sitemap without requiring intentionally unlisted routes', () => {
    expect(sitemapPaths(sitemap)).toEqual(expect.arrayContaining(requiredSitemapPaths));
  });

  it('keeps unknown paths on the NotFound fallback', () => {
    const rendered = renderToStaticMarkup(
      createElement(Router, {
        ssrPath: '/not-a-public-page',
        children: createElement(Switch, null, ...routes),
      }),
    );
    expect(rendered).toBe('not-found');
  });

  it('rejects a stale sitemap entry', () => {
    const staleSitemap = sitemap.replace('</urlset>', '<url><loc>https://www.betterthanyourhusbandllc.com/retired-page</loc></url></urlset>');
    expect(() => {
      for (const path of sitemapPaths(staleSitemap)) expectPublicPath(routes, path);
    }).toThrow('/retired-page must resolve');
  });

  it.each([
    ['removed route', appSource.replace('<Route path="/about" component={AboutPage} />', '')],
    ['route pointing to NotFound', appSource.replace('path="/about" component={AboutPage}', 'path="/about" component={NotFound}')],
    ['fallback shadowing public routes', appSource.replace('<Switch>', '<Switch><Route component={NotFound} />')],
  ])('detects a %s', (_label, changedSource) => {
    expect(changedSource).not.toBe(appSource);
    expect(() => expectPublicPath(publicRoutes(changedSource), '/about')).toThrow('/about must resolve');
  });
});
