# Plan: Notion as Website Service

## Overview

Build a system that allows users to create websites from their Notion pages, with a site editor that uses react-notion-x for rendering.

---

## Current State

### Server Side

- **NotionWebsite service** (`services/notion/website.ts`): Uses `NotionAPI` from `notion-client` to fetch page content
- **Sites DB schema** (`db/schema/site.ts`): Fields: id, userId, pageId, databaseId, shortId, siteSetting (JSONB), createdAt, updatedAt
- **API pattern**: Hono + Effect.runPromise
- **Tokens**: getAccessToken function using Effect

### Web Side

- **Typed API client**: Using hono client with hcWithType
- **useNotionPages hook**: SWR-based data fetching
- **Dashboard**: React component with sidebar layout
- **UI Components**: shadcn/ui with radix-ui

---

## Implementation Plan

### Phase 1: Backend - Sites Service & API

#### 1.1 Create Sites Service (`services/site.ts`)

```
Location: apps/server/src/services/site.ts
```

**Requirements:**

- MUST define explicit TypeScript interfaces for all inputs/outputs
- MUST specify return types for all Effect operations
- MUST use proper error types with Effect

- Define SiteSetting type (theme, colors, seo, etc.)
- Use `nanoid` for generating shortId (server-side only)
- Use `drizzle-zod` to generate Zod schemas from DB schema
- Create Effect-based service with methods:
  - `createSite(userId, pageId, settings)` - Create new site (generates shortId via nanoid)
  - `getSites(userId)` - Get all sites for user
  - `getSite(siteId)` - Get single site
  - `updateSite(siteId, settings)` - Update site settings
  - `deleteSite(siteId)` - Delete site
- Use drizzle for DB operations wrapped in Effect.tryPromise

**TypeScript Example:**

```typescript
interface SiteSetting {
  theme?: {
    primaryColor: string;
    backgroundColor: string;
    fontFamily: string;
  };
  seo?: {
    title: string;
    description: string;
    ogImage?: string;
  };
}

interface CreateSiteInput {
  pageId: string;
  siteName: string;
}

interface Site {
  id: string;
  userId: string;
  pageId: string;
  siteName: string;
  shortId: string;
  siteSetting: SiteSetting | null;
  createdAt: Date;
  updatedAt: Date;
}
```

#### 1.2 Create Sites API Routes (`api/sites.ts`)

```
Location: apps/server/src/api/sites.ts
```

**Requirements:**

- MUST use `zValidator` for all inputs (body, params, query)
- Define explicit Zod schemas for each endpoint
- Define TypeScript interfaces for input/output

Endpoints:
| Method | Path | Description | Validation |
|--------|------|-------------|------------|
| GET | /sites | Get all user sites | - |
| GET | /sites/:id | Get single site | params: z.object({ id: z.string().uuid() }) |
| POST | /sites | Create new site | json: z.object({ pageId: z.string(), siteName: z.string() }) |
| PATCH | /sites/:id | Update site | params + json |
| DELETE | /sites/:id | Delete site | params |

#### 1.3 Update Notion API for Page Content (`api/notion.ts`)

**Requirements:**

- MUST use `zValidator` for params validation

Add endpoint:
| Method | Path | Description | Validation |
|--------|------|-------------|------------|
| GET | /notion/pages/:pageId | Get page content for rendering | params: z.object({ pageId: z.string() }) |

#### 1.4 Register Routes (`api/index.ts`)

Add sites route: `.route("/sites", sitesApp)`

---

### Phase 2: Frontend - Sites Management

#### 2.1 Create Sites Hook (`hooks/use-sites.ts`)

```
Location: apps/web/src/hooks/use-sites.ts
```

- `useSites()` - Get all sites with SWR
- `useSite(siteId)` - Get single site
- `useCreateSite()` - Mutation for creating site
- `useUpdateSite()` - Mutation for updating site
- `useDeleteSite()` - Mutation for deleting site

#### 2.2 Create Site Card Component (`components/site-card.tsx`)

- Display site preview (page title, thumbnail placeholder)
- Quick actions: Edit, View, Delete
- Status indicator

#### 2.3 Create Create Site Dialog (`components/create-site-dialog.tsx`)

- Uses Sheet/Dialog from radix-ui
- Shows list of user's Notion pages
- Page selection with search/filter
- "Create Site" button

#### 2.4 Update Dashboard - Add Sites Section (`components/dashboard/index.tsx`)

- Add "Sites" section below Notion pages
- Show list of sites as cards grid
- "New Site" button to open CreateSiteDialog

---

### Phase 3: Frontend - Site Editor

#### 3.1 Create Site Editor Page (`pages/site/[id].astro`)

```
Location: apps/web/src/pages/site/[id].astro
```

- Route: `/site/:id?pageId=xxx`
- Layout with sidebar for settings panel

#### 3.2 Create Site Editor Component (`components/site-editor.tsx`)

- Two-panel layout:
  - Left: Notion page content (react-notion-x)
  - Right: Settings panel (collapsible)

#### 3.3 Settings Panel (`components/site-settings.tsx`)

Sections:

- **Theme**: Background color, text color, accent color
- **SEO**: Title, description, OG image
- **Header**: Show/hide, custom nav links
- **Footer**: Custom footer content

#### 3.4 Integrate react-notion-x (`components/notion-renderer.tsx`)

- Use NotionRenderer from react-notion-x
- Fetch page data from `/api/notion/pages/:pageId`
- Custom theming support via CSS variables

---

### Phase 4: Database

#### 4.1 Add Site Relations

Update `db/schema/site.ts` to add:

- Relations to user table
- Index on userId for faster queries

---

## File Structure

```
apps/server/
├── src/
│   ├── services/
│   │   ├── site.ts          # NEW - Sites service with Effect
│   │   └── notion/
│   │       └── website.ts   # EXISTING
│   ├── api/
│   │   ├── sites.ts         # NEW - Sites API routes
│   │   ├── notion.ts        # MODIFY - Add page content endpoint
│   │   └── index.ts         # MODIFY - Register sites route
│   └── db/
│       └── schema/
│           └── site.ts      # MODIFY - Add relations

apps/web/
├── src/
│   ├── hooks/
│   │   ├── use-sites.ts     # NEW - Sites hooks
│   │   └── use-notion.ts    # EXISTING
│   ├── components/
│   │   ├── site-card.tsx    # NEW - Site card component
│   │   ├── create-site-dialog.tsx  # NEW - Create site dialog
│   │   ├── notion-renderer.tsx      # NEW - Notion renderer
│   │   ├── site-settings.tsx       # NEW - Settings panel
│   │   ├── site-editor.tsx          # NEW - Editor component
│   │   ├── dashboard/
│   │   │   └── index.ts     # MODIFY - Add sites section
│   │   └── ui/             # Existing components
│   └── pages/
│       └── site/
│           └── [id].astro   # NEW - Site editor page
```

---

## API Types (Generated by Hono)

After implementing backend, types will be available via:

```typescript
import { client } from "@/lib/api-client";

// Example usage:
client.api.sites.$get();
client.api.sites.$post({ json: { pageId, settings } });
client.api.sites[":id"].$get();
client.api.sites[":id"].$patch({ json: { settings } });
client.api.sites[":id"].$delete();
client.api.notion.pages[":pageId"].$get();
```

---

## Key Dependencies

### Server

- drizzle-orm
- Effect v4
- notion-client (already installed)

### Web

- react-notion-x (already installed)
- @radix-ui/react-dialog (via existing shadcn)
- SWR (for data fetching)

---

## Implementation Order

1. **Backend**:
   - Sites service (Effect-based)
   - Sites API routes
   - Notion page content endpoint

2. **Frontend - Sites Management**:
   - useSites hook
   - Site card component
   - Create site dialog
   - Dashboard update

3. **Frontend - Editor**:
   - Notion renderer component
   - Settings panel
   - Site editor page

---

## Notes

### Input Validation & Type Safety

#### zValidator for Input Sanitization

All API routes MUST use `zValidator` from `@hono/zod-validator` for input validation. This ensures type-safe request parsing and prevents invalid data from reaching business logic.

**Example Pattern:**

```typescript
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

const route = app.post(
  "/posts",
  zValidator(
    "form",
    z.object({
      body: z.string(),
    }),
  ),
  (c) => {
    const validated = c.req.valid("form");
    // ... use your validated data
  },
);
```

#### Strict TypeScript Rules

1. **No `any`**: NEVER use `any` type unless absolutely necessary (e.g., dynamic third-party APIs with unknown schemas)
2. **Explicit Return Types**: Always define return types for functions
   ```typescript
   function getUser(id: string): Promise<User | null> { ... }
   ```
3. **Input/Output Types**: Define explicit interfaces for all inputs and outputs

   ```typescript
   interface CreateSiteInput {
     pageId: string;
     siteName: string;
   }

   interface SiteOutput {
     id: string;
     pageId: string;
     createdAt: Date;
   }
   ```

4. **Effect Return Types**: Always specify Effect return types
   ```typescript
   return Effect.tryPromise({
     try: async () => { ... },
     catch: (e) => new SiteError({ message: e instanceof Error ? e.message : "Unknown error" }),
   });
   ```
5. **Zod Schemas**: Use Zod for all API input/output validation
   - Request body: `zValidator('json', z.object({ ... }))`
   - Request params: `zValidator('param', z.object({ ... }))`
   - Query params: `zValidator('query', z.object({ ... }))`

#### Using drizzle-zod for Schema Generation

Use `drizzle-zod` to generate Zod schemas directly from Drizzle table definitions. This ensures type consistency between DB and API validation.

```typescript
import { drizzleZod } from "drizzle-zod";
import { sites } from "@/db/schema/site";

// Generate Zod schema from table
const siteSchema = drizzleZod(sites);

// Access specific fields for validation
const createSiteSchema = siteSchema
  .pick({
    pageId: true,
    siteName: true,
  })
  .extend({
    siteName: z.string().min(1).max(100),
  });

const updateSiteSchema = siteSchema.partial().pick({
  siteName: true,
  siteSetting: true,
});

const siteParamsSchema = z.object({
  id: z.string().uuid("Invalid site ID"),
});
```

#### API Route Implementation Template

```typescript
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { Effect } from "effect";
import { drizzleZod } from "drizzle-zod";
import { sites } from "@/db/schema/site";

// Generate Zod schema from Drizzle table
const siteSchema = drizzleZod(sites);

// Input schemas using drizzle-zod
const createSiteSchema = siteSchema
  .pick({
    pageId: true,
  })
  .extend({
    siteName: z.string().min(1).max(100),
  });

const updateSiteSchema = siteSchema.partial().pick({
  siteName: true,
  siteSetting: true,
});

const siteParamsSchema = z.object({
  id: z.string().uuid("Invalid site ID"),
});

// Typed input/output interfaces
interface CreateSiteInput extends z.infer<typeof createSiteSchema> {}
interface SiteResponse {
  id: string;
  pageId: string;
  siteName: string;
  createdAt: string;
}

// Route handler
const createSiteRoute = app.post(
  "/sites",
  zValidator("json", createSiteSchema),
  async (c) => {
    const input = c.req.valid("json") as CreateSiteInput;

    const result = await Effect.runPromise(
      createSite(input.pageId, input.siteName),
    );

    return c.json(
      ApiResponse({
        data: result as SiteResponse,
        message: "Site created successfully",
      }),
    );
  },
);
```

#### ID Generation with nanoid

For generating short, URL-friendly IDs (e.g., for shareable site URLs), use `nanoid`:

```typescript
import { nanoid } from "nanoid";

// Generate a short ID (default 21 chars)
const shortId = nanoid();

// Generate a shorter ID (e.g., 10 chars)
const customId = nanoid(10);

// Usage in createSite:
const newSite = await db.insert(sites).values({
  id: nanoid(),
  shortId: nanoid(10),
  pageId: input.pageId,
  // ...
});
```

- Use Effect.tryPromise for all DB operations
- Generate Cloudflare types after adding new bindings
- Use workspace protocol for server package imports in web
- Follow existing patterns for API response format (ApiResponse wrapper)
