---
name: Static publishing and API routing
description: Why a successful frontend build alone does not prove this site's published estimator will work.
---

When troubleshooting publishing, distinguish the root publishing target from artifact build settings. A static target may serve the built site but cannot run the API needed by the estimator and review submissions. Changing the workspace configuration alone does not change an already-published static release; the owner must select a server-capable type in Publishing and republish.

**Why:** A failed publish had a correct frontend build but an invalid static public directory. Fixing the directory addressed that error only; it did not make the API available on static hosting. The live deployment can remain static even after the local deployment target is updated.

**How to apply:** Check both the configured target and live deployment metadata before calling publishing functional. For the complete site, guide the user to an HTTP-capable publish target in Publishing, then confirm the live type and API route after republishing. Direct edits to the root Replit config are rejected here; write a full temp TOML and use its schema-validation replacement callback.