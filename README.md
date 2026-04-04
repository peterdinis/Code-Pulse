# Code-Pulse STILL UNDER DEVELOPMENT

**Code-Pulse** connects to your GitHub repositories and delivers AI-assisted feedback on pull requests. It includes a marketing site, authenticated dashboard, docs, and a type-safe API built with the [T3 Stack](https://create.t3.gg/) patterns.

## Features

- **GitHub sign-in** — OAuth via [Better Auth](https://www.better-auth.com/) with email/password support
- **Repositories & PRs** — Track repos and PR review jobs from the dashboard
- **AI reviews** — OpenAI-backed reviews (optional `OPENAI_API_KEY`; users can also store keys in settings)
- **Notifications** — In-app notifications for review activity
- **Theming** — Light/dark mode (`next-themes`)
- **Polished UX** — Framer Motion on the landing and 404 pages, Sonner toasts

## Tech stack

| Layer | Choice |
|--------|--------|
| Framework | [Next.js 15](https://nextjs.org) (App Router, Turbopack in dev) |
| API | [tRPC](https://trpc.io) + [TanStack Query](https://tanstack.com/query) |
| Auth | [Better Auth](https://www.better-auth.com/) + Drizzle adapter |
| Database | [PostgreSQL](https://www.postgresql.org/) |
| ORM | [Drizzle ORM](https://orm.drizzle.team) + [Drizzle Kit](https://orm.drizzle.team/kit-docs/overview) |
| Validation / env | [Zod](https://zod.dev) + [@t3-oss/env-nextjs](https://env.t3.gg/) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com), [shadcn/ui](https://ui.shadcn.com) (Base UI) |
| Lint / format | [Biome](https://biomejs.dev) |
| Animation | [Framer Motion](https://www.framer.com/motion/) |

## Prerequisites

- **Node.js** 20+ (recommended)
- **PostgreSQL** 14+ (local install, Docker, or a hosted provider)

## Getting started

### 1. Clone and install

```bash
git clone <your-repo-url>
cd Code-Pulse
npm install
```

### 2. Environment variables

Create a `.env` (or `.env.local`) in the project root. Required variables are validated at runtime via `src/env.js`.

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string, e.g. `postgresql://user:password@localhost:5432/code_pulse` |
| `BETTER_AUTH_SECRET` | Yes | Long random secret for signing sessions |
| `BETTER_AUTH_URL` | Yes | App origin used by Better Auth, e.g. `http://localhost:3000` |
| `GITHUB_CLIENT_ID` | Yes | GitHub OAuth app client ID |
| `GITHUB_CLIENT_SECRET` | Yes | GitHub OAuth app client secret |
| `GITHUB_CALLBACK_URL` | No | Override GitHub OAuth callback (defaults to `{BETTER_AUTH_URL}/api/auth/callback/github`) |
| `OPENAI_API_KEY` | No | Server default for AI reviews if users don’t set their own key |
| `NEXT_PUBLIC_APP_URL` | No | Public site URL (used for client-side links / callbacks) |
| `NEXT_PUBLIC_AUTH_CALLBACK_URL` | No | Optional auth callback hint for the client |

**GitHub OAuth app**

- Authorization callback URL should match your Better Auth setup (e.g. `http://localhost:3000/api/auth/callback/github` for local dev).

### 3. Database

Create the database, then apply migrations:

```bash
# Example: create DB (adjust for your setup)
createdb code_pulse

npm run db:migrate
```

For quick local iteration you can sync the schema without migration files:

```bash
npm run db:push
```

Inspect data with Drizzle Studio:

```bash
npm run db:studio
```

After schema changes, generate new migrations:

```bash
npm run db:generate
```

### 4. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Next.js dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run preview` | Build then start locally |
| `npm run typecheck` | TypeScript check (`tsc --noEmit`) |
| `npm run check` | Biome lint/format check |
| `npm run check:write` | Biome with auto-fix |
| `npm run db:generate` | Generate Drizzle migrations from `src/server/db/schema.ts` |
| `npm run db:migrate` | Run pending migrations |
| `npm run db:push` | Push schema to DB (dev) |
| `npm run db:studio` | Open Drizzle Studio |

## Project structure (high level)

```
src/
  app/                 # App Router pages, layouts, API routes
  server/
    api/               # tRPC routers & context
    auth/              # Better Auth configuration
    db/                # Drizzle schema & DB client
  components/          # Shared UI (shadcn, theme, etc.)
  trpc/                # tRPC React client
  env.js               # Validated environment variables
drizzle/               # SQL migrations + Drizzle meta
```

## Deployment

- Set all required env vars on your host (Vercel, Railway, Docker, etc.).
- Use a production `DATABASE_URL` and HTTPS `BETTER_AUTH_URL`.
- For Docker/CI builds you can set `SKIP_ENV_VALIDATION=1` if env isn’t available at build time (see `src/env.js`).

## Learn more

- [T3 Stack](https://create.t3.gg/)
- [Next.js docs](https://nextjs.org/docs)
- [tRPC docs](https://trpc.io/docs)
- [Drizzle docs](https://orm.drizzle.team/docs/overview)
- [Better Auth docs](https://www.better-auth.com/docs)

---

Originally bootstrapped with [create-t3-app](https://github.com/t3-oss/create-t3-app).
