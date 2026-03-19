# Site Service Migration Plan (Updated)

## Current State Analysis

### 1. SiteRepo Pattern (`/repo/site.ts`)

The `SiteRepo` uses Effect v4's `ServiceMap.Service` pattern:

- **Pure database operations only** - no caching, no business logic
- Methods take `db: NodePgDatabase` as a parameter
- Returns `Effect.Effect<Success, SiteRepoError, never>`
- Provides a `SiteRepoLayer` for dependency injection

### 2. DataBase Service Pattern (`/db/index.ts`)

New `DataBase` service for DB access:

```typescript
export class DataBase extends ServiceMap.Service<
  DataBase,
  {
    readonly getDb: () => Effect.Effect<NodePgDatabase, void, never>;
  }
>()("DataBase") {}
```

### 3. New Service Pattern (`createSiteService`)

Current implementation in `/services/site.ts`:

```typescript
export const createSiteService = Effect.fn("createSiteService")((
  input: SiteInsert,
) => {
  return Effect.gen(function* () {
    const dbService = yield* DataBase; // Get DB service
    const db = yield* dbService.getDb(); // Get DB instance
    const siteService = yield* SiteRepo; // Get Repo service
    const site = yield* siteService.createSite(input, db); // Execute
    return site;
  });
});
```

**Key characteristics:**

- Uses `Effect.fn("functionName")` for naming
- Uses `Effect.gen` for composition
- Yields `DataBase` service and calls `getDb()`
- Yields `SiteRepo` service
- Services handle caching (via `withCache`)
- Repos are pure DB only

### 4. Missing in SiteRepo

The `SiteRepo` is missing `getSiteByShortId` method:

```typescript
readonly getSiteByShortId: (
  shortId: string,
  db: NodePgDatabase,
) => Effect.Effect<SiteSelect | null, SiteRepoError, never>;
```

## Migration Tasks

### Task 1: Add Missing Repo Method

**File:** `apps/server/src/repo/site.ts`

Add to `SiteRepo` service definition:

1. Add `getSiteByShortId` type signature
2. Implement `getSiteByShortId` function
3. Add to `SiteRepoLayer` return object

### Task 2: Create New Service Functions

**File:** `apps/server/src/services/site.ts`

Create 6 new service functions following the `createSiteService` pattern:

#### 2.1 `createSiteService` (Already exists - reference pattern)

```typescript
export const createSiteService = Effect.fn("createSiteService")((
  input: SiteInsert,
) => {
  return Effect.gen(function* () {
    const dbService = yield* DataBase;
    const db = yield* dbService.getDb();
    const siteService = yield* SiteRepo;
    const site = yield* siteService.createSite(input, db);
    return site;
  });
});
```

#### 2.2 `getSitesByUserService`

```typescript
export const getSitesByUserService = Effect.fn("getSitesByUserService")((
  userId: string,
) => {
  return Effect.gen(function* () {
    const dbService = yield* DataBase;
    const db = yield* dbService.getDb();
    const siteService = yield* SiteRepo;
    const sites = yield* siteService.getUserSites(userId, db);
    return sites;
  });
});
```

#### 2.3 `getSiteByIdService`

```typescript
export const getSiteByIdService = Effect.fn("getSiteByIdService")((
  siteId: string,
) => {
  return Effect.gen(function* () {
    const dbService = yield* DataBase;
    const db = yield* dbService.getDb();
    const siteService = yield* SiteRepo;
    const site = yield* siteService.getSiteById(siteId, db);

    if (!site) {
      return yield* Effect.fail(
        new SiteError({ code: "NOT_FOUND", message: "Site not found" }),
      );
    }

    return site;
  });
});
```

#### 2.4 `getSiteByShortIdService`

```typescript
export const getSiteByShortIdService = Effect.fn("getSiteByShortIdService")((
  shortId: string,
) => {
  return Effect.gen(function* () {
    const dbService = yield* DataBase;
    const db = yield* dbService.getDb();
    const siteService = yield* SiteRepo;
    const site = yield* siteService.getSiteByShortId(shortId, db);

    if (!site) {
      return yield* Effect.fail(
        new SiteError({ code: "NOT_FOUND", message: "Site not found" }),
      );
    }

    return site;
  });
});
```

#### 2.5 `updateSiteService`

```typescript
export const updateSiteService = Effect.fn("updateSiteService")((
  siteId: string,
  input: UpdateSiteInput,
) => {
  return Effect.gen(function* () {
    const dbService = yield* DataBase;
    const db = yield* dbService.getDb();
    const siteService = yield* SiteRepo;

    // First get existing site to merge updates
    const existingSite = yield* siteService.getSiteById(siteId, db);

    if (!existingSite) {
      return yield* Effect.fail(
        new SiteError({ code: "NOT_FOUND", message: "Site not found" }),
      );
    }

    const updateData: SiteInsert = {
      ...existingSite,
      ...input,
      id: siteId, // Ensure ID stays the same
    };

    const site = yield* siteService.updateSite(updateData, db);
    return site;
  });
});
```

#### 2.6 `deleteSiteService`

```typescript
export const deleteSiteService = Effect.fn("deleteSiteService")((
  siteId: string,
) => {
  return Effect.gen(function* () {
    const dbService = yield* DataBase;
    const db = yield* dbService.getDb();
    const siteService = yield* SiteRepo;
    const site = yield* siteService.deleteSite(siteId, db);
    return site;
  });
});
```

### Task 3: Services with Caching (Optional Enhancement)

If caching is needed at service level, wrap with `withCache`:

```typescript
export const getSitesByUserServiceWithCache = Effect.fn(
  "getSitesByUserServiceWithCache",
)((userId: string) => {
  return Effect.gen(function* () {
    const sites = yield* withCache({
      execute: getSitesByUserService(userId),
      key: KeyManager.getUserSites(userId),
      ttl: 60 * 60,
    });
    return sites;
  });
});
```

**Note:** Cache management can also stay in API routes layer - user's choice.

## Architecture Layers

```
┌─────────────────────────────────────────────┐
│  API Routes (Hono) - User handles this      │
│  - Input validation, cache invalidation     │
│  - Calls service functions                  │
└──────────────────────┬──────────────────────┘
                       │
┌──────────────────────▼──────────────────────┐
│  Service Layer (Effect) - YOU IMPLEMENT     │
│  - Business logic                           │
│  - Caching (withCache)                      │
│  - Error handling (SiteError)               │
│  - Yields: DataBase, SiteRepo               │
└──────────────────────┬──────────────────────┘
                       │
┌──────────────────────▼──────────────────────┐
│  Repository Layer (Effect) - YOU IMPLEMENT  │
│  - Pure database operations                 │
│  - No caching, no business logic            │
│  - Returns: Effect<Success, SiteRepoError>  │
└──────────────────────┬──────────────────────┘
                       │
┌──────────────────────▼──────────────────────┐
│  Database (Drizzle ORM)                     │
└─────────────────────────────────────────────┘
```

## Summary

### Files to Modify:

1. **`apps/server/src/repo/site.ts`**
   - Add `getSiteByShortId` method to `SiteRepo` service
   - Add `getSiteByShortId` implementation function
   - Add to `SiteRepoLayer` return object

2. **`apps/server/src/services/site.ts`**
   - Keep existing `createSiteService` (already done)
   - Add: `getSitesByUserService`
   - Add: `getSiteByIdService`
   - Add: `getSiteByShortIdService`
   - Add: `updateSiteService`
   - Add: `deleteSiteService`
   - Remove old exports after migration complete (keep `SiteError` class)

### Key Design Rules:

1. **Repos = Pure DB only** - No caching, no business logic, just CRUD
2. **Services = Business logic + Caching** - Use `withCache` if needed
3. **Pattern**: All services follow the same structure:
   ```typescript
   Effect.fn("name")((input) =>
     Effect.gen(function* () {
       const dbService = yield* DataBase;
       const db = yield* dbService.getDb();
       const repo = yield* SiteRepo;
       const result = yield* repo.method(input, db);
       return result;
     }),
   );
   ```
4. **API routes**: User will update these separately

### Deliverables:

After this migration, the following new functions should be available:

- `createSiteService` (already exists)
- `getSitesByUserService`
- `getSiteByIdService`
- `getSiteByShortIdService`
- `updateSiteService`
- `deleteSiteService`

All following the Effect v4 pattern with proper dependency injection.
