# Published domain redirect audit

Checked: October 23, 2026, approximately 22:58 UTC.

## Scope and source

Fresh deployment metadata reported a public, static deployment with a successful
current build:

- Primary: `https://www.betterthanyourhusbandllc.com`
- Additional: `https://betterthanyourhusbandllc.com`
- Additional: `https://better-than-your-husband-services.replit.app`

The primary matches the canonical origin in
`artifacts/better-than-your-husband-services/public/sitemap.xml`. The tested
paths were `/`, `/about`, and `/contact`.

No source code, publishing configuration, DNS, or domain settings were changed.
Nothing was published.

## Method

Made 18 independent GET requests: three hosts, two schemes, and three paths.
Used curl with normal certificate verification (no insecure bypass), followed
redirects with a limit of 10, and recorded every response header, final URL,
status, redirect count, and certificate verification result.

HTTPS requests used no redirects. HTTP on the custom domains used a single
301 redirect to HTTPS on the **same host**, preserving the requested path.
Those Location headers include the standard HTTPS port `:443`; this does not
change the destination origin.

## Results

In the table, “same path” means the final URL retained the exact requested
`/`, `/about`, or `/contact` path.

| Requested host | Scheme | Path | Final status | Redirects | Final destination |
| --- | --- | --- | --- | --- | --- |
| www.betterthanyourhusbandllc.com | HTTPS | / | 200 | 0 | Same host, same path |
| www.betterthanyourhusbandllc.com | HTTPS | /about | 200 | 0 | Same host, same path |
| www.betterthanyourhusbandllc.com | HTTPS | /contact | 200 | 0 | Same host, same path |
| www.betterthanyourhusbandllc.com | HTTP | / | 200 | 1 (301) | HTTPS, same host, same path |
| www.betterthanyourhusbandllc.com | HTTP | /about | 200 | 1 (301) | HTTPS, same host, same path |
| www.betterthanyourhusbandllc.com | HTTP | /contact | 200 | 1 (301) | HTTPS, same host, same path |
| betterthanyourhusbandllc.com | HTTPS | / | 200 | 0 | Same alternate host, same path |
| betterthanyourhusbandllc.com | HTTPS | /about | 200 | 0 | Same alternate host, same path |
| betterthanyourhusbandllc.com | HTTPS | /contact | 200 | 0 | Same alternate host, same path |
| betterthanyourhusbandllc.com | HTTP | / | 200 | 1 (301) | HTTPS, same alternate host, same path |
| betterthanyourhusbandllc.com | HTTP | /about | 200 | 1 (301) | HTTPS, same alternate host, same path |
| betterthanyourhusbandllc.com | HTTP | /contact | 200 | 1 (301) | HTTPS, same alternate host, same path |
| better-than-your-husband-services.replit.app | HTTPS | / | 200 | 0 | Same alternate host, same path |
| better-than-your-husband-services.replit.app | HTTPS | /about | 200 | 0 | Same alternate host, same path |
| better-than-your-husband-services.replit.app | HTTPS | /contact | 200 | 0 | Same alternate host, same path |
| better-than-your-husband-services.replit.app | HTTP | / | No response | 0 | Connection failed on port 80 |
| better-than-your-husband-services.replit.app | HTTP | /about | No response | 0 | Connection failed on port 80 |
| better-than-your-husband-services.replit.app | HTTP | /contact | No response | 0 | Connection failed on port 80 |

All 15 completed chains ended at HTTPS with certificate verification result 0
(successful). The three generated-host HTTP requests failed with curl exit code
7 and status `000` (not an HTTP response code). An additional IPv4-only request
to that host's HTTP `/about` URL failed the same way. This is an observation
from the checking environment, not proof of a global outage or its cause.

A browser screenshot of `https://betterthanyourhusbandllc.com/about` rendered
the About page and reported that same non-www URL after loading, providing an
additional check that it did not immediately redirect to www.

## Conclusions

- **Primary site:** all tested HTTPS paths respond successfully.
- **HTTPS:** certificates validate for all three reported domains.
- **Alternate-to-primary redirects: not present.** Both additional HTTPS
  addresses return 200 on their own hostname, rather than sending visitors to
  `https://www.betterthanyourhusbandllc.com`.
- **HTTP upgrade:** works for both custom domains, but the non-www address
  remains non-www after upgrading.
- **Path loss:** none observed in the completed redirect chains.
- **Redirect loops:** none observed in the completed redirect chains.
- **Generated-host HTTP:** unreachable from this environment, so no HTTP
  upgrade or redirect behavior could be confirmed for it.

Canonical metadata is not a substitute for a visitor redirect. Any corrective
domain or publishing change requires separate authorization. Recheck fresh
deployment metadata and all tested paths after an authorized correction.
