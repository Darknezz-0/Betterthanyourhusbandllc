import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Router, Switch } from 'wouter';
import { expectPublicPath, publicRoutes } from './test-support/public-routes';

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
