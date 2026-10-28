import assert from 'node:assert/strict';
import test from 'node:test';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { gzipSync, brotliCompressSync } from 'node:zlib';
import { checkStaticPublishing, homepageAssets, requestRaw } from './static-publishing.mjs';

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

function fixture(change = () => {}, changeRaw = () => {}) {
  const requests = [];
  const rawRequests = [];
  return {
    requests,
    rawRequests,
    rawRequestImpl: async (url, headers) => {
      rawRequests.push({ url, headers });
      const path = new URL(url).pathname;
      const [type, body] = files[path];
      const source = { type, body, status: 200, url };
      change(source, path, {});
      const response = {
        status: source.status, headers: new Headers({ 'content-type': source.type }), body: Buffer.from(source.body),
      };
      changeRaw(response, path, headers['Accept-Encoding']);
      return response;
    },
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
  assert.deepEqual(await checkStaticPublishing(origin, mock), { checked: 19 });
  assert.equal(mock.requests.length, 12);
  assert.equal(mock.rawRequests.length, 9);
  for (const encoding of ['identity', 'gzip', 'br']) {
    assert.equal(mock.rawRequests.filter(({ headers }) => headers['Accept-Encoding'] === encoding).length, 3);
  }
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

for (const [encoding, compress] of [['gzip', gzipSync], ['br', brotliCompressSync]]) {
  test(`decodes negotiated ${encoding} JavaScript and CSS with consistent MIME types`, async () => {
    const mock = fixture(undefined, (response, path, requested) => {
      if (requested === encoding) {
        response.body = compress(response.body);
        response.headers.set('content-encoding', encoding);
      }
    });
    assert.deepEqual(await checkStaticPublishing(origin, mock), { checked: 19 });
  });

  for (const path of ['/assets/app-hash.js', '/assets/app-hash.css']) {
    for (const [scenario, change, error] of [
      ['HTML fallback', (r) => { r.body = compress(Buffer.from(html)); }, /received SPA HTML/],
      ['incorrect MIME', (r) => { r.headers.set('content-type', 'text/html'); }, /expected .*Content-Type|expected text\/css/],
      ['missing MIME', (r) => { r.headers.delete('content-type'); }, /expected .*Content-Type|expected text\/css/],
      ['corrupt bytes', (r) => { r.body = Buffer.from('not a compressed stream'); }, /cannot decode/],
      ['truncated bytes', (r) => { r.body = r.body.subarray(0, -4); }, /cannot decode/],
      ['wrong encoding label', (r) => { r.body = encoding === 'gzip' ? brotliCompressSync(Buffer.from('body {}')) : gzipSync(Buffer.from('export {};')); }, /cannot decode/],
      ['missing encoding label', (r) => { r.headers.delete('content-encoding'); }, /UTF-8|differs from/],
      ['different decoded file', (r) => { r.body = compress(Buffer.from('/* different file */')); }, /differs from/],
    ]) {
      test(`rejects ${encoding} ${scenario} for ${path}`, async () => {
        await assert.rejects(checkStaticPublishing(origin, fixture(undefined, (response, requestedPath, requested) => {
          if (requested === encoding && requestedPath === path) {
            response.body = compress(response.body);
            response.headers.set('content-encoding', encoding);
            change(response);
          }
        })), error);
      });
    }
  }
}

test('accepts explicitly labelled identity when the server declines compression', async () => {
  await checkStaticPublishing(origin, fixture(undefined, (response) => {
    response.headers.set('content-encoding', 'identity');
  }));
});

for (const actual of ['deflate', 'gzip, br', 'unknown', 'gzip']) {
  test(`rejects unnegotiated Content-Encoding ${actual}`, async () => {
    await assert.rejects(checkStaticPublishing(origin, fixture(undefined, (response, path, requested) => {
      if (requested === 'identity') response.headers.set('content-encoding', actual);
    })), /unexpected Content-Encoding/);
  });
}

test('reports raw HTTP errors, redirects, empty bodies and network errors with request context', async () => {
  for (const change of [
    (response) => { response.status = 404; },
    (response) => { response.status = 302; },
    (response) => { response.body = Buffer.alloc(0); },
    () => { throw new Error('network failure'); },
  ]) {
    await assert.rejects(checkStaticPublishing(origin, fixture(undefined, (response, path) => {
      if (path.endsWith('.css')) change(response);
    })), /\[Accept-Encoding: gzip\].*app-hash.css/);
  }
});

test('HTTP transport preserves compressed bytes and sends the exact negotiation header', async (t) => {
  const observed = [];
  const server = createServer((req, res) => {
    observed.push(req.headers['accept-encoding']);
    const encoding = req.headers['accept-encoding'];
    const body = Buffer.from(files['/assets/app-hash.js'][1]);
    res.setHeader('Content-Type', 'text/javascript');
    if (encoding !== 'identity') res.setHeader('Content-Encoding', encoding);
    res.end(encoding === 'gzip' ? gzipSync(body) : encoding === 'br' ? brotliCompressSync(body) : body);
  });
  t.after(() => new Promise((resolve) => server.close(resolve)));
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  for (const encoding of ['identity', 'gzip', 'br']) {
    const response = await requestRaw(`http://127.0.0.1:${server.address().port}/asset.js`, { 'Accept-Encoding': encoding });
    const original = Buffer.from(files['/assets/app-hash.js'][1]);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('content-type'), 'text/javascript');
    assert.equal(response.headers.get('content-encoding'), encoding === 'identity' ? null : encoding);
    assert.deepEqual(response.body, encoding === 'gzip' ? gzipSync(original) : encoding === 'br' ? brotliCompressSync(original) : original);
  }
  assert.deepEqual(observed, ['identity', 'gzip', 'br']);
});
