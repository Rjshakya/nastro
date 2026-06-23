# AGENTS.md — Nastro Server (Cloudflare Workers Backend)

This document gives agentic coding assistants the context needed to work safely and consistently in `apps/server`.

> **App in one sentence:** The Nastro REST API backend — Hono on Cloudflare Workers, Effect.ts services, Drizzle ORM over PostgreSQL.

## 1. Overview

The server is a Cloudflare Worker built with:

- **Hono 4.x** for HTTP routing
- **Effect.ts v4 beta** for functional effects, error handling, and dependency injection
- **Drizzle ORM + drizzle-zod** for PostgreSQL access and validation schemas
- **better-auth** for session + OAuth (Google, Notion)
- **Cloudflare KV** for caching
- **Cloudflare R2** (via AWS S3 SDK) for file/object storage
- **Cloudflare Rate Limit bindings** for rate limiting

## 2. Directory Structure

```
apps/server/src
├── api/                 # Hono route handlers
│   ├── analytics.ts
│   ├── apikey.ts
│   ├── custom-domain.ts
│   ├── index.ts
│   ├── notion.ts
│   ├── site.ts
│   ├── template.ts
│   ├── theme.ts
│   └── upload.ts
├── db/
│   ├── index.ts         # DataBase service + DatabaseLive layer
│   ├── repo.ts          # generic makeRepo factory
│   └── schema/          # Drizzle schemas
│       ├── analytics.ts
│       ├── auth-schema.ts
│       ├── custom-domain.ts
│       ├── seo.ts
│       ├── site.ts
│       ├── template.ts
│       └── theme.ts
├── errors/
│   └── tagged.errors.ts # Effect tagged errors
├── lib/                 # cross-cutting utilities
│   ├── analytics.ts
│   ├── api.ts
│   ├── auth.ts
│   ├── cache.ts
│   ├── crypto.ts
│   ├── hono-types.ts
│   ├── id.ts
│   ├── notion.ts
│   ├── tokens.ts
│   └── utils.ts
├── middlewares/
│   └── auth.ts          # session + API key auth middleware
├── repo/                # thin repo wrappers per table
│   ├── analytics.ts
│   ├── apikey.ts
│   ├── custom-domain.ts
│   ├── seo.ts
│   ├── site.ts
│   ├── template.ts
│   └── theme.ts
├── services/            # Effect services for business logic
│   ├── analytics.ts
│   ├── apikey.ts
│   ├── custom-domain.ts
│   ├── file.upload.ts
│   ├── index.ts
│   ├── kv-store.ts
│   ├── notion/
│   │   └── main.ts
│   ├── site.ts
│   └── slug.ts
├── types/               # additional domain types
│   ├── cloudflare.ts
│   └── site.setting.ts
├── app.ts               # Hono app entry + onError handler
├── domain.ts            # exported types consumed by apps/web
└── hc.ts                # typed Hono client generator
```

## 3. Development Commands

```bash
cd apps/server

pnpm dev              # wrangler dev (port 8000)
pnpm deploy           # wrangler deploy --minify
pnpm cf-typegen       # regenerate worker-configuration.d.ts
pnpm db:push          # drizzle-kit push
pnpm db:studio        # drizzle-kit studio
pnpm db:generate      # generate a new migration
pnpm build            # tsc (typecheck + emit to dist/)
pnpm lint             # oxlint
pnpm fmt              # oxfmt
```

## 4. Schema Patterns

Schemas live in `src/db/schema/*.ts`. Use `pgTable`, `text`, `timestamp`, `jsonb`, `index`, etc.

```ts
import { index, pgTable, text, timestamp, jsonb } from "drizzle-orm/pg-core";
import { v7 } from "uuid";

export const sites = pgTable(
  "site",
  {
    id: text()
      .primaryKey()
      .$defaultFn(() => v7()),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    slug: text().unique().notNull(),
    name: text("site_name").notNull(),
    setting: jsonb("site_setting"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("site_slug_idx").on(table.slug),
    index("site_userId_idx").on(table.userId),
  ],
);

export type SiteTableSelect = typeof sites.$inferSelect;
export type SiteTableInsert = typeof sites.$inferInsert;
```

### Rules

- Primary keys: prefer `text().$defaultFn(() => v7())`.
- Always include `createdAt` and `updatedAt`.
- Add indexes for query columns.
- Export inferred types as `*TableSelect` / `*TableInsert`.

## 5. Repository Patterns

Repos are thin wrappers around a generic `makeRepo` factory. They provide CRUD + raw `execute` access.

```ts
import { DataBase } from "@/db";
import { makeRepo } from "@/db/repo";
import { sites } from "@/db/schema/site";
import { Effect } from "effect";

export const SiteRepo = Effect.gen(function* () {
  const dbService = yield* DataBase;
  const db = yield* dbService.getDb();
  return makeRepo(db, sites);
});
```

Usage in a service:

```ts
const repo = yield* SiteRepo;
const sites = yield* repo.findById("userId", userId);
const [updated] = yield* repo.updateById("id", id, { name: "New name" });
const result = yield* repo.execute((db, table) =>
  Effect.tryPromise({ try: async () => db.select().from(table).where(...), catch: ... }),
);
```

## 6. Service Patterns

Services use `ServiceMap.Service` and are provided via `Layer.effect`.

```ts
import { Effect, Layer, ServiceMap } from "effect";
import { SiteRepo } from "@/repo/site";

export class SiteService extends ServiceMap.Service<
  SiteService,
  {
    getSite: (
      slug: string,
      pageId: string,
    ) => Effect.Effect<SiteResult, SiteError | RepoError>;
  }
>()("services/site") {}

export const SiteServiceLive = Layer.effect(
  SiteService,
  Effect.gen(function* () {
    const repo = yield* SiteRepo;

    const getSite = (slug: string, pageId: string) =>
      Effect.gen(function* () {
        // ...
      });

    return { getSite };
  }),
);
```

### Layer provision in routes

```ts
import { DatabaseLive } from "@/db";
import { KVStoreLive } from "@/services/kv-store";

const programLayer = Layer.mergeAll(
  DatabaseLive(),
  KVStoreLive,
  SomeServiceLive.pipe(Layer.provideMerge(Layer.mergeAll(DatabaseLive()))),
);

const program = someEffect.pipe(Effect.provide(programLayer));
const result = await Effect.runPromise(program);
```

### Rules

- Keep business logic in services, not routes.
- Return typed `Effect.Effect<T, ErrorType, never>`.
- Use tagged errors from `src/errors/tagged.errors.ts`.

## 7. API Route Patterns

Routes live in `src/api/*.ts` and are registered in `src/api/index.ts`.

```ts
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { ApiResponse } from "@/lib/api";

const someApp = new Hono<{ Variables: Vars }>().get(
  "/",
  zValidator("query", z.object({ id: z.string() })),
  async (c) => {
    const { id } = c.req.valid("query");
    // ... call service ...
    return c.json(ApiResponse({ data, message: "..." }));
  },
);
```

### Auth

Use `authMiddleWare()` for session-protected routes:

```ts
import { authMiddleWare } from "@/middlewares/auth";

const app = new Hono<{ Variables: Vars }>()
  .use(authMiddleWare())
  .get("/protected", async (c) => {
    const userId = c.get("user")?.id;
    // ...
  });
```

The `Vars` type in `src/lib/hono-types.ts` exposes `user`, `session`, `userId`, `permission`.

### Rate limiting

```ts
import { rateLimiter } from "hono-rate-limiter";
import { env } from "cloudflare:workers";
import { getConnInfo } from "hono/cloudflare-workers";

rateLimiter({
  binding: env.SITE_READ_LIMITER,
  keyGenerator(c) {
    const info = getConnInfo(c);
    return info.remote.address ?? c.req.path;
  },
  message: "Rate limit exceeded",
});
```

## 8. Error Handling

All domain errors are tagged errors in `src/errors/tagged.errors.ts`:

```ts
export class SiteError extends Data.TaggedError("SiteError")<{
  message: string;
  type: SiteErrorType;
  code?: number;
}>() {}
```

Return them with `yield* new SiteError({ ... })` inside `Effect.gen`.

The global `onError` handler in `src/app.ts` maps each tagged error to an `ApiResponse` envelope. Add a new `if (e instanceof NewError)` branch when you introduce a new tagged error.

## 9. Cloudflare Bindings & Environment

Access env vars and bindings via `cloudflare:workers`:

```ts
import { env } from "cloudflare:workers";

const connectionString = env.HYPERDRIVE.connectionString;
const kv = env.NASTRO_KV;
```

Key bindings:

| Binding                                    | Purpose                      |
| ------------------------------------------ | ---------------------------- |
| `HYPERDRIVE`                               | PostgreSQL connection string |
| `NASTRO_KV`                                | KV cache                     |
| `TEMPLATES_BUCKET` / `SITES_BUCKET`        | R2 object storage            |
| `SITE_READ_LIMITER` / `SITE_WRITE_LIMITER` | Rate limits                  |
| `NOTION_PAGES_API_READ_LIMITER`            | Notion API rate limit        |

After adding/changing bindings, run `pnpm cf-typegen` and commit `worker-configuration.d.ts`.

## 10. Typed Hono Client

The server exports a typed Hono client consumed by `apps/web`:

```ts
// apps/server/src/hc.ts
import { app } from "./app";
import { hc } from "hono/client";

export const hcWithType = (...args: Parameters<typeof hc<typeof app>>) =>
  hc<typeof app>(...args);

export type serverTypes = typeof app;
```

Web usage:

```ts
import { hcWithType } from "server/hc";
const client = hcWithType("https://api.nastro.xyz");
```

Do **not** break this contract without explicit user approval.

## 11. Code Style Specifics

- File names: `kebab-case.ts`
- Effect service names: `PascalCaseService`
- Error types: `PascalCaseError`
- Strict TypeScript; explicit return types on service methods.
- Prefer `@/*` imports over relative imports.
- Use `oxlint` / `oxfmt` for linting/formatting.

## 12. Common Gotchas

1. **Effect context errors:** When a service depends on a repo (which depends on `DataBase`), provide the layer with `Layer.provideMerge`:
   ```ts
   AnalyticsServiceLive.pipe(
     Layer.provideMerge(Layer.mergeAll(DatabaseLive())),
   );
   ```
2. **Auth middleware order:** Place `.use(authMiddleWare())` before protected route handlers.
3. **Better-auth init:** `getAuth()` is async and creates a fresh better-auth instance. Cache if needed for performance.
4. **Database writes + migrations:** New schemas need `pnpm db:generate` (or `pnpm db:push`) and a committed migration file in `apps/server/drizzle/`.
5. **Type-safe client changes:** Any change to route paths, request/response shapes, or query params is a breaking change for `apps/web`.
