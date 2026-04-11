# Contributing to CodePulse

Thanks for helping improve CodePulse. This guide keeps pull requests predictable and reviews fast.

## Before you open a PR

1. **Branch from `main`** (or the default branch your team uses) with a clear name, e.g. `fix/auth-callback`, `feat/seo-metadata`.
2. **Run checks locally** (same as CI expectations):

   ```bash
   npm run validate
   ```

   (`validate` runs `check` + `typecheck`.)

3. **Database** — If you change `src/server/db/schema.ts`, generate a migration and describe it in the PR:

   ```bash
   npm run db:generate
   ```

4. **Environment** — Do not commit secrets. Use `.env.local` (gitignored). Document new variables in `README.md` and `src/env.js` when you add required config.

## Pull request contents

- **What** changed and **why** (problem → solution), in plain language.
- **How to test** — steps or scenarios (e.g. “Sign in with GitHub”, “Open dashboard PR review”).
- **Screenshots** for UI changes when helpful.

## Code style

- Match existing patterns (imports, naming, Tailwind, tRPC routers).
- Prefer focused commits; avoid unrelated refactors in the same PR.
- Lint/format: **Biome** (`npm run check`). Do not fight the formatter.

## Questions

Open a discussion or issue on GitHub if you are unsure about scope or approach before investing a large change.
