import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { navigationLinks } from './test-support/navigation-links';
import { expectPublicPath, publicRoutes } from './test-support/public-routes';

const appSource = readFileSync(new URL('./App.tsx', import.meta.url), 'utf8');

function checkNavigation(source: string) {
  const routes = publicRoutes(source);
  const links = navigationLinks(source);
  expect(links.length, 'App.tsx must expose internal navigation links').toBeGreaterThan(0);
  for (const link of links) {
    // Check the destination page, not whether a section exists or scrolls.
    const path = new URL(link.href, 'https://navigation.test/').pathname;
    try {
      expectPublicPath(routes, path);
    } catch (error) {
      throw new Error(`${link.location}: offending internal link "${link.href}" does not resolve to a public page`, { cause: error });
    }
  }
  return links;
}

describe('internal navigation coverage (independent of sitemap)', () => {
  it('checks desktop/mobile menus, footer, and page calls to action against Wouter', () => {
    const links = checkNavigation(appSource);
    expect(links.some((link) => link.location.includes('link-footer-about'))).toBe(true);
    expect(links.filter((link) => link.location.includes('<NavLink>') && link.href === '/about')).toHaveLength(2);
    expect(links.some((link) => link.location.includes('<ButtonArrow>') && link.href === '/about#service-philosophy')).toBe(true);
  });

  it.each([
    ['menu list', "{ href: '/about', label: 'About' }", "{ href: '/abotu', label: 'About' }", '/abotu'],
    ['desktop menu', 'href={link.href}', 'href="/missing-desktop"', '/missing-desktop'],
    ['mobile menu', 'href={link.href} className="block', 'href="/missing-mobile" className="block', '/missing-mobile'],
    ['footer', 'href="/terms" className="hover:text-white"', 'href="/missing-terms" className="hover:text-white"', '/missing-terms'],
    ['call to action', 'href="/about#service-philosophy"', 'href="/missing-about#service-philosophy"', '/missing-about#service-philosophy'],
    ['CTA default', "href = '/request-a-quote'", "href = '/missing-default'", '/missing-default'],
    ['removed destination', '<Route path="/about" component={AboutPage} />', '', '/about'],
    ['NotFound destination', 'path="/about" component={AboutPage}', 'path="/about" component={NotFound}', '/about'],
  ])('identifies a broken %s link', (_name, before, after, destination) => {
    const changed = appSource.replace(before, after);
    expect(changed).not.toBe(appSource);
    // Exercise the default prop even though all current CTA callers pass href.
    const source = _name === 'CTA default' ? changed.replace('<ButtonArrow href="/">', '<ButtonArrow>') : changed;
    expect(() => checkNavigation(source)).toThrow(`offending internal link "${destination}"`);
    expect(() => checkNavigation(source)).toThrow(/App\.tsx:\d+:\d+/);
  });

  it('ignores external, protocol-relative, telephone, email and fragment-only links', () => {
    expect(navigationLinks(`const links = <>
      <a href="https://elsewhere.test/missing">External</a>
      <a href="//elsewhere.test/missing">External</a>
      <a href="tel:123">Phone</a><a href={\`mailto:\${email}\`}>Email</a>
      <a href="#section">Section</a>
      {/* <Link href="/commented-out" /> */}
    </>`)).toEqual([]);
  });

  it('checks a page with a query and fragment using only its pathname', () => {
    checkNavigation(appSource.replace('href="/terms"', 'href={"/terms?from=footer#details"}'));
  });

  it('fails explicitly rather than silently skipping an unsupported dynamic href', () => {
    expect(() => navigationLinks('<Link href={getDestination()} />')).toThrow('cannot inspect navigation expression getDestination()');
  });
});
