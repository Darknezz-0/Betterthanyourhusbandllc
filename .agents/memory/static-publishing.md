---
name: Static publishing and API routing
description: Why a successful frontend build alone does not prove this site's published estimator will work.
---

When troubleshooting publishing, distinguish the root publishing target from artifact build settings. A static target can serve the built site but cannot run a dynamic API. Changing the workspace configuration alone does not change an already-published static release; publishing changes require a user-initiated republish.

**Why:** A failed publish had a correct frontend build but an invalid static public directory. Fixing the directory addressed that error only; it did not make an API available on static hosting. The live deployment can remain static even after the local deployment target is updated.

**How to apply:** Check both the configured target and live deployment metadata before calling publishing functional. Do not presume code changes are live before republishing. Direct edits to the root Replit config are rejected here; write a full temp TOML and use its schema-validation replacement callback.

The owner has chosen to keep this site on static publishing and remove customer-facing review submission while retaining approved reviews.

**Why:** They want to avoid Autoscale's usage-based charges when visitors use the site.

**How to apply:** Do not switch the publishing target, add a separately hosted backend, or restore customer review submission without asking first. Static republishing is appropriate for approved site updates.