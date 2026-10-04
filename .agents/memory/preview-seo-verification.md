---
name: Preview SEO verification
description: Avoid false duplicate-title reports from development tooling injected into preview HTML.
---

Verify SEO tag counts using actual document-head elements or production-build HTML, not an unrestricted tag regex over the entire development response.

**Why:** Replit's injected development tooling can contain a literal empty title tag inside a JavaScript string used for a sandbox document. That string is not a homepage title element, but an unrestricted source search counts it as one.

**How to apply:** When checking title or meta-description uniqueness, inspect the rendered head or parse the HTML while excluding script contents. Also check the production HTML for metadata available before JavaScript runs.