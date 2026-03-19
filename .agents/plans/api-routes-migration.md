# API Routes Migration Plan (Effect Layer Pattern)

## Current Pattern Analysis

The user has established a new pattern for Effect-based API routes:

```typescript
const program = serviceFunction(params).pipe(
  Effect.provide(SiteRepoLayer),
  Effect.provide(DatabaseLive),
);

return Effect.runPromise(program).then((result) => {
  // Optional: cache invalidation
  return c.json(ApiResponse({ data: result, message: "..." }));
});
```

**Key characteristics:**

1. Create a program by calling the service function
2. Pipe it with `.provide()` to inject dependencies (SiteRepoLayer, DatabaseLive)
3. Use `Effect.runPromise(program)` to execute
4. Use `.then()` for handling the resolved value
5. Handle cache operations in the `.then()` callback
6. No `async/await` - uses Promise chains instead

## Routes Status

### ✅ Already Migrated

1. **GET /** - Uses `getUserSitesService`
2. **POST /** - Uses `createSiteService`

### ⏳ Need Migration

#### 1. GET /:id (LEAVE AS-IS FOR NOW)

**Decision:** Keep using old function `getSiteById(id, pageId)` for now. This is a complex endpoint that fetches both site and Notion page data with caching.

**Future:** Can be migrated later to a composite service if needed.

#### 2. PATCH /:id (Update Site)

**Current Code:**

```typescript
.patch("/:id", zValidator("param", siteParamsSchema), zValidator("json", updateSiteSchema), async (c) => {
  const userId = c.get("user")?.id;
  const { id } = c.req.valid("param");
  const input = c.req.valid("json") as UpdateSiteInput;
  const site = await Effect.runPromise(updateSite(id, input));
  await KeyManager.delete.getUserSites(userId as string);

  return c.json(ApiResponse({ data: site, message: "Site updated successfully" }));
})
```

**Migration:**

```typescript
.patch("/:id", zValidator("param", siteParamsSchema), zValidator("json", updateSiteSchema), (c) => {
  const userId = c.get("user")?.id;
  const { id } = c.req.valid("param");
  const input = c.req.valid("json");

  const program = updateSiteService(id, input).pipe(
    Effect.provide(SiteRepoLayer),
    Effect.provide(DatabaseLive),
  );

  return Effect.runPromise(program).then((site) => {
    KeyManager.delete.getUserSites(userId as string);
    return c.json(ApiResponse({ data: site, message: "Site updated successfully" }));
  });
})
```

#### 3. DELETE /:id (Delete Site)

**Current Code:**

```typescript
.delete("/:id", zValidator("param", siteParamsSchema), zValidator("query", z.object({ pageId: z.string() })), async (c) => {
  const userId = c.get("user")?.id;
  const { id } = c.req.valid("param");
  const { pageId } = c.req.valid("query");
  await Effect.runPromise(deleteSite(id, pageId));
  await KeyManager.delete.getUserSites(userId as string);

  return c.json(ApiResponse({ data: null, message: "Site deleted successfully" }));
})
```

**Migration:**

```typescript
.delete("/:id", zValidator("param", siteParamsSchema), zValidator("query", z.object({ pageId: z.string() })), (c) => {
  const userId = c.get("user")?.id;
  const { id } = c.req.valid("param");
  const { pageId } = c.req.valid("query");

  const program = deleteSiteService(id).pipe(
    Effect.provide(SiteRepoLayer),
    Effect.provide(DatabaseLive),
  );

  return Effect.runPromise(program).then(() => {
    KeyManager.delete.getUserSites(userId as string);
    KeyManager.delete.getSiteById(id);
    KeyManager.delete.getPageContent(pageId);
    return c.json(ApiResponse({ data: null, message: "Site deleted successfully" }));
  });
})
```

**Note:** Includes all three cache invalidations as requested:

- `getUserSites(userId)` - Clear user's site list
- `getSiteById(id)` - Clear specific site cache
- `getPageContent(pageId)` - Clear page content cache

## Summary of Required Changes

### In `api/sites.ts`:

1. **PATCH /:id Route:**
   - Change from `async (c) => { ... }` to `(c) => { ... }`
   - Replace `await Effect.runPromise(updateSite(id, input))` with program pattern
   - Move cache deletion into `.then()` callback
   - Remove `UpdateSiteInput` type cast (let schema validation handle it)

2. **DELETE /:id Route:**
   - Change from `async (c) => { ... }` to `(c) => { ... }`
   - Replace `await Effect.runPromise(deleteSite(id, pageId))` with program pattern
   - Move cache deletions into `.then()` callback:
     - `KeyManager.delete.getUserSites(userId as string)`
     - `KeyManager.delete.getSiteById(id)`
     - `KeyManager.delete.getPageContent(pageId)`

3. **GET /:id Route:**
   - **LEAVE AS-IS** - Keep using old `getSiteById(id, pageId)` function

### Imports to Update:

**Remove (after migration):**

```typescript
import {
  deleteSite, // OLD - remove
  updateSite, // OLD - remove
} from "@/services/site";
```

**Keep:**

```typescript
import {
  createSiteService,
  deleteSiteService,
  getSiteById, // KEEP - still used by GET /:id
  getUserSitesService,
  updateSiteService,
} from "@/services/site";
```

## Migration Checklist

- [ ] Update PATCH /:id route to new pattern
- [ ] Update DELETE /:id route to new pattern with all cache invalidations
- [ ] LEAVE GET /:id route unchanged (using old function)
- [ ] Clean up unused imports (remove deleteSite, updateSite)
- [ ] Test PATCH endpoint
- [ ] Test DELETE endpoint
- [ ] Remove old function exports from services/site.ts (optional cleanup)

## Potential Type Issues

1. **UpdateSiteInput:** The new service expects `UpdateSiteInput` interface. Make sure the zod schema `updateSiteSchema` produces compatible output.

2. **Error handling:** Old functions had explicit `SiteError` handling. New services let errors bubble up through Effect. Make sure error responses are still handled properly.

## Post-Migration API Structure

```
GET /:id          → Old pattern (getSiteById) - KEEP
GET /             → New pattern (getUserSitesService) ✅
POST /            → New pattern (createSiteService) ✅
PATCH /:id        → New pattern (updateSiteService) ⏳
DELETE /:id       → New pattern (deleteSiteService) ⏳
```

## Implementation Order

1. **PATCH /:id** - Simple migration
2. **DELETE /:id** - Add all cache invalidations
3. **Test** - Verify all endpoints work
4. **Cleanup** - Remove old exports (optional)
