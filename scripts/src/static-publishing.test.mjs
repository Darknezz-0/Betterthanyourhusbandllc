import assert from 'node:assert/strict';
import test from 'node:test';
import { checkStaticPublishing, homepageAssets } from './static-publishing.mjs';

const origin = 'https://deployment.example/';
const html = `<!doctype html><html><head>
  <script type="module" src="/assets/app-hash.js"></script>
  <link rel="stylesheet" href="/assets/app-hash.css">
  <link rel="modulepreload" href="/assets/chunk-hash.js">
  <link rel="stylesheet" href="https://fonts.example/font.css">
</head><body></body></html>`;
const files = {
  '/': ['text/html; charset=utf-8', html],
  '/sitemap.xml': ['application/xml; charset=utf-8', '<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://deployment.example/</loc></url></urlset>'],
  '/robots.txt': ['text/plain; charset=utf-8', 'User-agent: *\nAllow: /\n'],
  '/assets/app-hash.js': ['text/javascript', 'console.log("app");'],
  '/assets/chunk-hash.js': ['application/javascript', 'export const ready = true;'],
  '/assets/app-hash.css': ['text/css', 'body { color: black; }'],
};

function fixture(change = () => {}) {
  const requests = [];
  return {
    requests,
    fetchImpl: async (url, options) => {
      requests.push({ url, options });
      const path = new URL(url).pathname;
      assert.ok(files[path], `unexpected request: ${url}`);
      const [type, body] = files[path];
      const response = { type, body, status: 200, url };
      change(response, path, options);
      return {
        status: response.status, url: response.url,
        headers: new Headers({ 'content-type': response.type }),
        text: async () => response.body,
      };
    },
    log: () => {},
  };
}

test('checks crawler files and every first-party homepage asset in both request modes', async () => {
  const mock = fixture();
  assert.deepEqual(await checkStaticPublishing(origin, mock), { checked: 10 });
  assert.equal(mock.requests.length, 12);
  for (const path of Object.keys(files)) {
    const requests = mock.requests.filter(({ url }) => new URL(url).pathname === path);
    assert.equal(requests.length, 2);
    assert.equal(requests[0].options.headers, undefined);
    assert.deepEqual(requests[1].options.headers, { 'Cache-Control': 'no-cache', Pragma: 'no-cache' });
    assert.equal(requests[1].options.cache, 'no-store');
  }
});

for (const path of Object.keys(files).filter((path) => path !== '/')) {
  for (const mode of ['normal', 'no-cache']) {
    test(`rejects SPA HTML fallback for ${path} on ${mode} requests`, async () => {
      await assert.rejects(checkStaticPublishing(origin, fixture((response, requestedPath, options) => {
        const requestMode = options.cache === 'no-store' ? 'no-cache' : 'normal';
        if (requestedPath === path && requestMode === mode) {
          response.type = 'text/html';
          response.body = html;
        }
      })), new RegExp(`\\[${mode}\\].*received SPA HTML`));
    });
  }
}

test('rejects incorrect MIME types even when the body is correct', async () => {
  await assert.rejects(checkStaticPublishing(origin, fixture((response, path) => {
    if (path !== '/') response.type = 'application/octet-stream';
  })), /expected XML Content-Type[\s\S]*expected text\/plain[\s\S]*expected JavaScript Content-Type[\s\S]*expected text\/css/);
});

test('rejects HTML masquerading under the correct MIME type', async () => {
  await assert.rejects(checkStaticPublishing(origin, fixture((response, path) => {
    if (path !== '/') response.body = html;
  })), /received SPA HTML/);
});

test('does not mistake HTML strings embedded in JavaScript for an HTML document', async () => {
  await checkStaticPublishing(origin, fixture((response, path) => {
    if (path.endsWith('.js')) response.body = 'const template = "<html><body>Hello</body></html>";';
  }));
});

test('rejects missing files, redirects, empty bodies, and network failures', async () => {
  for (const change of [
    (response) => { response.status = 404; },
    (response) => { response.url = `${origin}index.html`; },
    (response) => { response.body = ''; },
    () => { throw new Error('network failure'); },
  ]) {
    await assert.rejects(checkStaticPublishing(origin, fixture((response, path) => {
      if (path === '/robots.txt') change(response);
    })), /robots.txt/);
  }
});

test('requires sitemap XML and robots directives, not arbitrary non-HTML bodies', async () => {
  await assert.rejects(checkStaticPublishing(origin, fixture((response, path) => {
    if (path === '/sitemap.xml' || path === '/robots.txt') response.body = 'not the expected file';
  })), /expected an XML sitemap document[\s\S]*expected robots.txt/);
});

test('discovers changed hashes, absolute same-origin URLs, base URLs, and ignores comments and inline scripts', () => {
  const assets = homepageAssets(`<base href="/build/">
    <!-- <script src="/missing.js"></script> -->
    <script>const fake = '<link rel="stylesheet" href="/fake.css">';</script>
    <script src='new.js'></script>
    <link href="${origin}new.css?v=2&amp;x=1" rel='stylesheet'>`, origin);
  assert.deepEqual([...assets], [
    [`${origin}build/new.js`, 'javascript'],
    [`${origin}new.css?v=2&x=1`, 'css'],
  ]);
  assert.throws(() => homepageAssets('<html></html>', origin), /at least one/);
});

test('requires an explicit HTTPS origin rather than defaulting to a guessed deployment', async () => {
  for (const url of ['http://deployment.example', `${origin}contact`, `${origin}?x=1`]) {
    await assert.rejects(checkStaticPublishing(url, fixture()), /verified HTTPS deployment origin/);
  }
});
