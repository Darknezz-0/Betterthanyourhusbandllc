---
name: Shell runtime auto-install
description: A shell invocation of Python can mutate the Replit runtime configuration.
---

Avoid invoking Python solely for throwaway workspace checks when Node or shell utilities suffice. Check the workspace status afterward if Python was invoked.

**Why:** A Python shell command caused the environment to add a Python module to .replit without a deliberate configuration request. This unrelated change needed validation-based restoration.

**How to apply:** Use installed JavaScript tooling for small scripts; if a runtime auto-install occurred, restore the previous configuration through its schema-validated replacement flow.