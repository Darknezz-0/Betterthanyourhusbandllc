import { pathToFileURL } from 'node:url';
import { request as httpRequest } from 'node:http';
import { request as httpsRequest } from 'node:https';
import { gunzipSync, brotliDecompressSync } from 'node:zlib';

// Unlike fetch(), Node's HTTP client preserves the encoded wire bytes.
export function requestRaw(url, headers) {
  return new Promise((resolve, reject) => {
    const request = (new URL(url).protocol === 'https:' ? httpsRequest : httpRequest)(
      url, { headers, signal: AbortSignal.timeout(20_000) }, (response) => {
        const chunks = [];
        response.on('data', (chunk) => chunks.push(chunk));
        response.on('error', reject);
        response.on('end', () => resolve({
          status: response.statusCode,
          headers: new Headers(response.headers),
          body: Buffer.concat(chunks),
        }));
      },
    );
    request.on('error', reject);
    request.end();
  });
}

const javascriptTypes = new Set([
  'text/javascript', 'application/javascript', 'text/ecmascript', 'application/ecmascript',
]);
const looksLikeHtml = (body) => /^\s*(?:<!--[\s\S]*?-->\s*)*(?:<!doctype\s+html\b|<html\b|<head\b|<body\b)/i.test(body);

function attributes(tag) {
  const result = {};
  for (const match of tag.matchAll(/([^\s=<>/]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/g)) {
    result[match[1].toLowerCase()] = (match[2] ?? match[3] ?? match[4])
      .replace(/&amp;/g, '&');
  }
  return result;
}

export function homepageAssets(html, homepageUrl) {
  const cleanHtml = html.replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, (script) => script.slice(0, script.indexOf('>') + 1));
  const baseTag = cleanHtml.match(/<base\b[^>]*>/i);
  const base = baseTag ? new URL(attributes(baseTag[0]).href || homepageUrl, homepageUrl) : homepageUrl;
  const assets = new Map();
  for (const [tag] of cleanHtml.matchAll(/<(?:script|link)\b[^>]*>/gi)) {
    const attrs = attributes(tag);
    const script = /^<script\b/i.test(tag);
    const rel = (attrs.rel || '').toLowerCase().split(/\s+/);
    const kind = script || rel.includes('modulepreload') ? 'javascript'
      : rel.includes('stylesheet') ? 'css' : undefined;
    const reference = script ? attrs.src : attrs.href;
    if (!kind || !reference) continue;
    const url = new URL(reference, base);
    if (url.origin === new URL(homepageUrl).origin) assets.set(url.href, kind);
  }
  if (![...assets.values()].includes('javascript') || ![...assets.values()].includes('css')) {
    throw new Error('Homepage must reference at least one first-party JavaScript and CSS file');
  }
  return assets;
}

function assertContent(kind, type, body) {
  if (!body.trim()) throw new Error('empty response body');
  if (looksLikeHtml(body)) throw new Error('received SPA HTML instead of the requested file');
  if (kind === 'xml') {
    if (!['application/xml', 'text/xml'].includes(type)) throw new Error(`expected XML Content-Type, got ${type}`);
    if (!/^\s*(?:<\?xml[^>]*>\s*)?(?:<!--[\s\S]*?-->\s*)*<(urlset|sitemapindex)\b[\s\S]*<\/\1>\s*$/.test(body)) {
      throw new Error('expected an XML sitemap document');
    }
  } else if (kind === 'text') {
    if (type !== 'text/plain') throw new Error(`expected text/plain, got ${type}`);
    if (!/^\s*User-agent\s*:/im.test(body)) throw new Error('expected robots.txt User-agent directive');
  } else if (kind === 'css') {
    if (type !== 'text/css') throw new Error(`expected text/css, got ${type}`);
  } else if (!javascriptTypes.has(type)) {
    throw new Error(`expected JavaScript Content-Type, got ${type}`);
  }
}

/** Read-only check; caller supplies a URL verified using deployment metadata. */
export async function checkStaticPublishing(deploymentUrl, {
  fetchImpl = fetch, rawRequestImpl = requestRaw, log = console.log,
} = {}) {
  const homepage = new URL(deploymentUrl);
  if (homepage.protocol !== 'https:' || homepage.username || homepage.password ||
      homepage.pathname !== '/' || homepage.search || homepage.hash) {
    throw new Error('Supply the verified HTTPS deployment origin, without a path, query, or credentials');
  }
  const failures = [];
  const assets = new Map();
  let checked = 0;
  for (const mode of ['normal', 'no-cache']) {
    const options = mode === 'no-cache'
      ? { cache: 'no-store', headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' } }
      : {};
    async function read(url) {
      const response = await fetchImpl(url, { ...options, signal: AbortSignal.timeout(20_000) });
      if (response.status !== 200) throw new Error(`expected HTTP 200, got ${response.status}`);
      if (response.url && new URL(response.url).href !== new URL(url).href) {
        throw new Error(`unexpected redirect to ${response.url}`);
      }
      return {
        type: (response.headers.get('content-type') || '(missing)').split(';')[0].trim().toLowerCase(),
        body: await response.text(),
      };
    }
    const targets = new Map([
      [new URL('/sitemap.xml', homepage).href, 'xml'],
      [new URL('/robots.txt', homepage).href, 'text'],
    ]);
    try {
      const { type, body } = await read(homepage.href);
      if (type !== 'text/html' || !looksLikeHtml(body)) throw new Error('expected HTML homepage');
      for (const [url, kind] of homepageAssets(body, homepage.href)) targets.set(url, kind);
    } catch (error) {
      failures.push(`[${mode}] ${homepage.href}: ${error.message}`);
    }
    for (const [url, kind] of targets) {
      try {
        const { type, body } = await read(url);
        assertContent(kind, type, body);
        if (kind === 'javascript' || kind === 'css') assets.set(url, { kind, type, body });
        checked++;
        log(`PASS [${mode}] ${url} (${type})`);
      } catch (error) {
        failures.push(`[${mode}] ${url}: ${error.message}`);
      }
    }
  }
  for (const encoding of ['identity', 'gzip', 'br']) {
    for (const [url, expected] of assets) {
      try {
        const response = await rawRequestImpl(url, { 'Accept-Encoding': encoding });
        if (response.status !== 200) throw new Error(`expected HTTP 200, got ${response.status}`);
        const actual = (response.headers.get('content-encoding') || 'identity').trim().toLowerCase();
        if (actual !== 'identity' && actual !== encoding) {
          throw new Error(`unexpected Content-Encoding ${actual} for Accept-Encoding ${encoding}`);
        }
        let bytes = response.body;
        try {
          if (actual === 'gzip') bytes = gunzipSync(bytes);
          if (actual === 'br') bytes = brotliDecompressSync(bytes);
        } catch {
          throw new Error(`cannot decode ${actual} response: corrupt content or Content-Encoding mismatch`);
        }
        let body;
        try {
          body = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
        } catch {
          throw new Error(`invalid UTF-8 after ${actual} decoding; possible Content-Encoding mismatch`);
        }
        const type = (response.headers.get('content-type') || '(missing)').split(';')[0].trim().toLowerCase();
        assertContent(expected.kind, type, body);
        if (type !== expected.type || body !== expected.body) {
          throw new Error('decoded content or Content-Type differs from the normal asset response');
        }
        checked++;
        log(`PASS [Accept-Encoding: ${encoding}] ${url} (${type}; Content-Encoding: ${actual})`);
      } catch (error) {
        failures.push(`[Accept-Encoding: ${encoding}] ${url}: ${error.message}`);
      }
    }
  }
  if (failures.length) throw new Error(`Static publishing check failed:\n${failures.join('\n')}`);
  log(`Static publishing check passed: ${checked} file responses across normal, no-cache, and identity/gzip/Brotli requests.`);
  return { checked };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const url = process.argv[2];
  if (!url || process.argv.length !== 3) {
    console.error('Usage: pnpm --filter @workspace/scripts check:static-publishing <verified-https-deployment-url>');
    process.exitCode = 1;
  } else {
    try {
      await checkStaticPublishing(url);
    } catch (error) {
      console.error(error.message);
      process.exitCode = 1;
    }
  }
}
