import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { businessInfo } from './lib/business';

const name = 'Better Than Your Husband Handyman Services LLC';
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

describe('business identity', () => {
  it('uses the full name for both legal and customer-facing references', () => {
    expect(businessInfo.legalName).toBe(name);
    expect(businessInfo.displayName).toBe(name);
    expect(businessInfo.contact.email).toBe('support@betterthanyourhusbandllc.com');
  });

  it('has one homepage title and one primary description using the full name', () => {
    const titles = [...html.matchAll(/<title>(.*?)<\/title>/g)];
    const descriptions = [...html.matchAll(/<meta name="description" content="([^"]*)"/g)];
    expect(titles).toHaveLength(1);
    expect(titles[0][1]).toBe(`${name} | Kansas City Handyman Services`);
    expect(descriptions).toHaveLength(1);
    expect(descriptions[0][1]).toContain(name);
    expect(descriptions[0][1]).toContain('pressure washing, property cleanups, and outdoor projects');
  });

  it.each(['og:title', 'og:description', 'twitter:title', 'twitter:description'])(
    'updates %s without duplicating it',
    (key) => {
      const tags = [...html.matchAll(new RegExp(`<meta (?:name|property)="${key}" content="([^"]*)"`, 'g'))];
      expect(tags).toHaveLength(1);
      expect(tags[0][1]).toContain(name);
    },
  );

  it('keeps business structured data valid and the domain unchanged', () => {
    const json = html.match(/<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/);
    expect(json).not.toBeNull();
    const data = JSON.parse(json![1]);
    expect(data.name).toBe(name);
    expect(data['@context']).toBe('https://schema.org');
    expect(data['@type']).toBe('HomeAndConstructionBusiness');
    expect(data.url).toBe('https://www.betterthanyourhusbandllc.com/');
  });

  it('uses the official logo and a complete square favicon', () => {
    const app = readFileSync(new URL('./App.tsx', import.meta.url), 'utf8');
    expect(app).toContain('assets/official-logo.png?v=handyman-services-llc');
    expect(app).toContain('alt={businessInfo.legalName}');
    const icons = [...html.matchAll(/<link rel="icon"[^>]*>/g)];
    expect(icons).toHaveLength(1);
    expect(icons[0][0]).toContain('type="image/png"');
    expect(icons[0][0]).toContain('href="/favicon.png?v=handyman-services-llc"');
    const icon = readFileSync(new URL('../public/favicon.png', import.meta.url));
    expect(icon.subarray(1, 4).toString()).toBe('PNG');
    expect(icon.readUInt32BE(16)).toBe(64);
    expect(icon.readUInt32BE(20)).toBe(64);
  });

  it('does not reintroduce outdated literal business identities in page content', () => {
    const prefix = ['Better', 'Than', 'Your', 'Husband'].join(' ');
    const outdated = new RegExp(`${prefix}(?! Handyman Services LLC)`);
    for (const path of ['./App.tsx', './lib/business.ts', './pages/WebsiteDisclaimer.tsx']) {
      expect(readFileSync(new URL(path, import.meta.url), 'utf8')).not.toMatch(outdated);
    }
  });
});
