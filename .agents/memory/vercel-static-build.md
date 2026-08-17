---
name: Vercel static build
description: Cross-platform build constraint for the marriage committee Vite SPA.
---

The marriage committee app is a static Vite SPA deployed from a pnpm workspace. Its build must not require Replit preview variables such as `PORT` or `BASE_PATH`; those may be absent in Vercel's build environment.

**Why:** Vercel failed before compilation when the Vite config treated Replit's preview variables as mandatory.

**How to apply:** Keep Replit-specific values as optional defaults in build configuration, and keep the Vercel build command scoped to `@workspace/marriage-committee` with its nested static output directory.