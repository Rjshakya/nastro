# AGENTS.md — Nastro Monorepo Agent Guide

This document gives agentic coding assistants the full context needed to work safely and consistently across the Nastro monorepo.

> **Project in one sentence:** Nastro turns Notion pages into customizable public websites with custom domains, themes, and real-time preview.

## 1. Project Overview

Nastro is a SaaS platform built as a **Turborepo** monorepo using **pnpm workspaces**. It is deployed entirely on Cloudflare's edge:

- **`apps/web`** — Public landing page, authenticated dashboard, site editor, and live site renderer. Built with **TanStack Start + React + Vite + Tailwind CSS v4 + shadcn/ui**.
- **`apps/server`** — REST API backend. Built with **Hono on Cloudflare Workers**, using **Drizzle ORM + PostgreSQL**, **Effect.ts** services, **better-auth**, **KV**, and **R2**.
- **`packages/notion-api`** — Low-level Notion API client with a plugin system.
- **`packages/notion-orm`** — TypeScript-first ORM for Notion databases.
- **`packages/cli`** — CLI for pushing/comparing Notion database schemas.

> ⚠️ **Important context drift to avoid:** Older docs (and the previous version of this file) mention "Astro" for the frontend. The frontend is **TanStack Start**, not Astro.

## 2. Monorepo Structure

```
.
├── apps/
│   ├── server/          # Hono Cloudflare Worker
│   └── web/             # TanStack Start + React frontend
├── packages/
│   ├── notion-api/      # @nastro-dev/notion-api
│   ├── notion-orm/      # @nastro-dev/notion-orm
│   └── cli/             # @nastro-dev/notion-orm-cli
├── examples/
│   └── basic/           # Example Hono + Notion ORM app
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
└── README.md
```

## 3. Tech Stack Summary

| Concern              | Technology                                         |
| -------------------- | -------------------------------------------------- |
| Package manager      | pnpm 9.x                                           |
| Monorepo task runner | Turborepo 2.x                                      |
| Frontend framework   | TanStack Start (React + Vite)                      |
| Frontend styling     | Tailwind CSS v4, CSS variables                     |
| UI primitives        | shadcn/ui v4 with @base-ui/react                   |
| Frontend state       | Zustand, SWR                                       |
| Frontend auth        | better-auth client                                 |
| Backend framework    | Hono 4.x on Cloudflare Workers                     |
| Backend effects / DI | Effect.ts v4 beta                                  |
| Backend ORM          | Drizzle ORM + drizzle-zod                          |
| Database             | PostgreSQL via Cloudflare Hyperdrive               |
| Auth                 | better-auth with Drizzle adapter                   |
| OAuth providers      | Google, Notion                                     |
| Cache                | Cloudflare KV                                      |
| Object storage       | Cloudflare R2 (S3-compatible)                      |
| Rate limiting        | hono-rate-limiter + Cloudflare Rate Limit bindings |
| Validation           | Zod v4 + @hono/zod-validator                       |
| Lint / Format        | oxlint, oxfmt, Prettier (root only)                |

## 4. Development Commands

### Root commands (run from repo root)

```bash
# Install everything
pnpm install

# Start all apps in dev mode
pnpm dev

# Build all apps
pnpm build

# Lint all apps
pnpm lint

# Format (root Prettier command)
pnpm format

# Type check all apps
pnpm check-types

# Run a command in only one app
pnpm dev --filter=web
pnpm build --filter=server
pnpm lint --filter=web
```

### Individual app commands

```bash
# Server
cd apps/server
pnpm dev            # wrangler dev on port 8000
pnpm deploy         # wrangler deploy --minify
pnpm cf-typegen     # regenerate Cloudflare binding types
pnpm db:push        # push Drizzle schema
pnpm db:studio      # Drizzle Studio
pnpm lint
pnpm fmt

# Web
cd apps/web
pnpm dev            # Vite dev on port 3000
pnpm build          # Vite production build
pnpm preview        # preview production build
pnpm deploy         # lint + build + wrangler deploy --minify
pnpm typecheck      # tsc --noEmit
pnpm lint
pnpm fmt
```

## 5. Cross-Cutting Code Style

### TypeScript

- Strict mode is enabled everywhere.
- Prefer explicit return types on public functions and service methods.
- Avoid `any`. Use `unknown` + narrowing when a type is truly unknown.
- Path alias `@/*` maps to `src/*` in both apps. Prefer it over relative imports.

### File naming

| Kind             | Convention           | Example                             |
| ---------------- | -------------------- | ----------------------------------- |
| Source files     | kebab-case           | `auth-client.ts`, `site-setting.ts` |
| React components | PascalCase           | `SiteHeader.tsx`, `Button.tsx`      |
| Utilities        | camelCase            | `cn()`, `getDB()`                   |
| Constants        | SCREAMING_SNAKE_CASE | `SLUG_REGEX`, `BANNED_SUBDOMAINS`   |
| Effect services  | PascalCase           | `SiteService`, `AnalyticsService`   |

### Imports

Group imports in this order, separated by a blank line:

1. External packages
2. Internal workspace packages (`server/hc`, `@nastro-dev/notion-orm`, etc.)
3. Internal aliases (`@/components/...`, `@/lib/...`)
4. Relative imports (avoid when possible)

Use named imports. Example:

```ts
import { Effect, Layer } from "effect";
import { Hono } from "hono";

import { AnalyticsService, AnalyticsServiceLive } from "@/services/analytics";
import { ApiResponse } from "@/lib/api";
import { authMiddleWare } from "@/middlewares/auth";
```

### Git hygiene

- Do not run `git commit`, `git push`, `git rebase`, or `git reset` unless explicitly asked.
- Before committing, run `pnpm lint` and `pnpm format`.
- Keep commits focused on one logical change.

### When modifying code

- Make the **minimal** change that satisfies the requirement.
- If you change `AGENTS.md`, schemas, build scripts, or environment variables, update this file and the app-specific `AGENTS.md` files.
- If you add a new schema, you must generate a Drizzle migration (`pnpm db:generate` or `pnpm db:push` in `apps/server`).
- If you add/change Cloudflare bindings, run `pnpm cf-typegen` in the relevant app and commit the updated `worker-configuration.d.ts`.

## 6. Architecture Principles

### Backend layering

```
API Routes (Hono)
    ↓
Services (Effect.ts)     ← business logic, external APIs, caching
    ↓
Repositories (Effect.ts) ← database queries via Drizzle
    ↓
Database (Drizzle ORM)   ← PostgreSQL via Hyperdrive
```

### Frontend layering

```
Routes (TanStack Router file-based)
    ↓
Loaders / Server Functions (TanStack Start)
    ↓
API Client (typed Hono client from server/hc)
    ↓
Components + Stores (Zustand, SWR)
```

### Shared code

- `apps/web` imports `server` via `"server": "workspace:*"` for the typed Hono client (`server/hc`) and domain types (`server/domain`).
- Shared packages live under `packages/*` and are consumed via `workspace:*`.

## 7. Environment Variables

### Server (`apps/server/.env`)

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5444/postgres
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NOTION_CLIENT_ID=
NOTION_CLIENT_SECRET=
CLIENT_URL=http://localhost:3000
```

Additional values come from Cloudflare bindings and secrets:
`BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, R2 endpoints, Cloudflare API tokens, etc.

### Web (`apps/web/.env`)

```env
VITE_PUBLIC_API_URL=http://localhost:8000
VITE_PUBLIC_CLIENT_URL=http://localhost:3000
VITE_PUBLIC_GOOGLE_FONTS_API_KEY=
VITE_PUBLIC_ENVIRONMENT=development
VITE_PUBLIC_SUBDOMAIN=nastro.site
```

## 8. Communication & API Contracts

- Backend returns a consistent envelope via `ApiResponse({ data, message, error })`.
- Frontend uses the typed Hono client and checks `res.ok` before parsing.
- Server functions in the web app use TanStack Start's `createServerFn()` and validate inputs with Zod.

## 9. Code Quality Standards

- **Linting:** `oxlint` is the linter. Warnings are allowed if pre-existing; do not introduce new errors.
- **Formatting:** `oxfmt` in apps, Prettier at root.
- **Type checking:** `pnpm typecheck` (web) / `pnpm build` (server).
- **Testing:** Vitest is available in `apps/web` and `packages/notion-orm`. Add tests for new shared utilities when practical.

## 10. Known Inconsistencies to be Aware of

1. `turbo.json` caches `.next/**` but the project uses Vite/TanStack Start. This is a leftover config.
2. `pnpm build` on the server currently surfaces pre-existing Effect.ts v4-beta type errors across the codebase. Follow existing patterns; do not try to "fix" the entire Effect type system in one change.
3. Some old docs/context files still mention Astro for the frontend. Use this file and `README.md` as the source of truth.

## 11. When to Ask the User

Ask before:

- Changing deployment targets or Cloudflare service bindings.
- Introducing a new database or replacing Drizzle.
- Changing the frontend framework.
- Making breaking changes to the typed Hono client contract.
- Adding new OAuth providers or changing auth flows.
