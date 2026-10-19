import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const rootConfig = readFileSync(new URL('../../../.replit', import.meta.url), 'utf8');
const artifactConfig = readFileSync(
  new URL('../.replit-artifact/artifact.toml', import.meta.url),
  'utf8',
);

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
    const sitemap = readFileSync(new URL('../public/sitemap.xml', import.meta.url), 'utf8');
    const robots = readFileSync(new URL('../public/robots.txt', import.meta.url), 'utf8');

    expect(sitemap).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    expect(robots).toContain('Allow: /');
    expect(robots).toContain('Sitemap: https://www.betterthanyourhusbandllc.com/sitemap.xml');
    // Specific rewrites could override crawler requests. Only use the fallback;
    // Replit serves existing files before applying this wildcard.
    expect(rootConfig.match(/^\[\[deployment\.rewrites\]\]$/gm)).toHaveLength(1);
  });
});
