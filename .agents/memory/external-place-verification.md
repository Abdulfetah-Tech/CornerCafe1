---
name: External place verification
description: How to handle business details sourced from a map short link when building a public-facing site.
---

Treat the place name and location resolved from a provided map link as verified only to that level. Do not invent hours, phone numbers, social handles, menu items, or prices. Store missing details as null or an explicit pending value and make the UI explain the pending state cleanly.

**Why:** Public business information is trust-critical, and search results for generic café names can point to unrelated businesses.

**How to apply:** When building a site from a maps short link, use the resolved listing for identity/location, then gather explicit owner-provided details before publishing operational claims.