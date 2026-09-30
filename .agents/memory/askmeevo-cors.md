---
name: AskMeevo CORS redirect
description: External widget config request can fail in browser even when the launcher renders.
---

On 2026-09-30 UTC, the supplied AskMeevo widget rendered its launcher, but browser previews reported a CORS error when fetching its agent configuration. The request to askmeevo.com redirected to www.askmeevo.com; the redirect response omitted an Access-Control-Allow-Origin header even though the final response included one. Sending localhost, the development domain, and both published-site domains as Origin all produced the same redirect headers, while the direct www endpoint returned 200 with a wildcard allow-origin header. This is not evidence of a preview-only block or domain whitelist, though it does not verify a published browser session using the new embed.

**Why:** The visible launcher is insufficient evidence that the chat is usable, and this external redirect cannot be repaired by changing the site's exact user-supplied embed.

**How to apply:** When evaluating the widget, inspect browser network errors and verify the provider's redirect behavior again; if it still fails, ask the provider to fix CORS on the redirect or make the config URL non-redirecting. Do not silently alter the requested embed.