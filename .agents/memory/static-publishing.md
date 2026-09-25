---
name: Static publishing and API routing
description: Why a successful frontend build alone does not prove this site's published estimator will work.
---

When troubleshooting publishing, distinguish the root publishing target from artifact build settings. A static target may serve the built site but cannot run the API needed by the estimator and owner tools.

**Why:** A failed publish had a correct frontend build but an invalid static public directory. Fixing the directory addresses that error only; it does not make the API available on static hosting.

**How to apply:** Check both the configured publishing target and the public directory before calling a deployment functional. For the complete site, guide the user to an HTTP-capable publish target in Publishing.