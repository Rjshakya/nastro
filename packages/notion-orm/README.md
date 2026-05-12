# @nastro-dev/notion-orm

A TypeScript-first ORM for Notion databases. Define schemas as code, push them to Notion, and query with a fluent, type-safe API—just like Drizzle ORM, but backed by Notion.

> See a real-world implementation: [github.com/Rjshakya/portfolio-26](https://github.com/Rjshakya/portfolio-26)

## Features

- **Schema-as-code** — Define Notion databases with plain TypeScript objects
- **Type-safe queries** — Full type inference for inserts, updates, and selects
- **Fluent API** — Chainable query builders with filters, sorting, and pagination
- **CLI companion** — Push schema changes to Notion with change detection
- **Auto-generated mappings** — CLI generates database ID mappings so you never hard-code Notion IDs
- **CRUD operations** — Insert, select, update, and delete rows

## Installation

Install the ORM runtime and the CLI (used to push schemas):

```bash
npm install @nastro-dev/notion-orm
npm install -D @nastro-dev/notion-orm-cli
```

## Complete Setup Guide

### 1. Create a Notion integration

1. Go to [https://nastro.xyz/developer](https://nastro.xyz/developer)
2. Connect with notion .
3. Give access to notion page and copy that page id.
4. Copy your notion access token .

### 2. Create `notion-orm.config.ts`

Place this in your project root:

```typescript
import type { NotionOrmConfig } from "@nastro-dev/notion-orm-cli";

export default {
  token: process.env.NOTION_TOKEN!, //  notion access token (get it from nastro.xyz/developers)
  rootPage: "your-root-page-id", // 32-character Notion page ID (page id of page you have given access when creating connection in nastro.xyz/developers)
  schema: "src/db/schema.ts", // glob pattern to your schema file(s)
} satisfies NotionOrmConfig;
```

> **Tip:** To find your root page ID, open any Notion page and copy the 32-character ID from the URL.

### 3. Define your schema

```typescript
// src/db/schema.ts
import * as n from "@nastro-dev/notion-orm";

export const pagesTable = n.table("Pages", {
  route: n.title(),
  headerTitle: n.richText(),
  headerDescription: n.richText(),
  headerImage: n.url(),
  content: n.richText(),
});

export const projectsTable = n.table("Projects", {
  name: n.title(),
  description: n.richText(),
  status: n.select({
    options: ["live", "working"],
  }),
  liveLink: n.url(),
  githubLink: n.url(),
  tectStackInfo: n.richText(),
});

export const educationTable = n.table("Education", {
  name: n.title(),
  description: n.richText(),
  institution: n.richText(),
  startDate: n.date(),
  endDate: n.date(),
});

export const blogsTable = n.table("Blogs", {
  name: n.title(),
  description: n.richText(),
  link: n.url(),
});

// Inferred types
export type PagesTableInsert = n.InferInsertType<typeof pagesTable>;
export type PagesTableSelect = n.InferSelectType<typeof pagesTable>;

export type ProjectsTableInsert = n.InferInsertType<typeof projectsTable>;
export type ProjectsTableSelect = n.InferSelectType<typeof projectsTable>;
```

### 4. Push to Notion

Run the CLI to create/update databases and generate the ID mapping:

> **Important!** Create .env file (otherwise cli will throw error)

```bash
npx notion-orm push
```

This will:

- Load all schema files matching your glob pattern
- Compare each table against existing Notion databases
- Create new databases for tables that don't exist
- Update existing databases when properties are added or changed
- Generate **`notion-orm.generated.ts`** with database ID mappings

### 5. Create the database client

Import the generated mapping and create your client:

```typescript
// src/db/db.server.ts
import { createNotionDB } from "@nastro-dev/notion-orm";
import { databaseMapping } from "../../notion-orm.generated";

export const db = createNotionDB({
  token: process.env.NOTION_TOKEN!,
  /**
   *  for serverless platform (for eg:cloudflare workers)
   *  - you have to explicitly specify overrideMapping
   *  - just like we are doing here.
   *
   *  while for other platforms (where we have files access , for eg:vps)
   *  - it will automatically handled for you,
   */
  overrideMapping: databaseMapping,
});
```

> **Why `overrideMapping`?** Notion database IDs are unstable. The generated mapping locks table names to IDs, so your code stays clean and portable across environments.

### 6. Query your data

```typescript
// Tanstack start example
// src/functions/projects.functions.ts

import { db } from "#/db/db.server";
import { projectsTable } from "#/db/schema";
import { eq } from "@nastro-dev/notion-orm";
import { createServerFn } from "@tanstack/react-start";

export const getProjects = createServerFn().handler(async () => {
  const { rows } = await db.select().from(projectsTable).execute();
  return rows;
});

export const getProject = createServerFn()
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data: { id } }) => {
    const { rows } = await db.select().from(projectsTable).where(eq("id", id)).execute();
    return rows[0];
  });
```

---

## API Reference

### Schema Definition

#### `table(name, properties)`

Defines a Notion database schema.

```typescript
import { table, title, richText, select, date, url } from "@nastro-dev/notion-orm";

const postsTable = table("Posts", {
  title: title(),
  excerpt: richText(),
  status: select({ options: ["draft", "published"] }),
  publishedAt: date(),
  canonicalUrl: url(),
});
```

#### Column Types

```typescript
import {
  title, // required, exactly one per table
  richText, // plain or formatted text
  number, // numeric values (optional format)
  select, // single choice: { options: ["A", "B"] }
  multiSelect, // multiple choices: { options: ["A", "B"] }
  status, // status columns: { options: ["Todo", "Done"] }
  date, // ISO date strings
  people, // user mentions
  files, // uploaded files or external links
  checkbox, // boolean
  url, // URL strings
  email, // email strings
  phoneNumber, // phone strings
  relation, // { relatedTo: "otherTableName" } — partial support
  formula, // { expression: "..." } — read-only, partial support
  rollup, // read-only, partial support
  uniqueId, // { prefix?: "TASK" } — read-only
  createdTime, // read-only timestamp
  createdBy, // read-only user
  lastEditedTime, // read-only timestamp
  lastEditedBy, // read-only user
} from "@nastro-dev/notion-orm";
```

#### Column Options

All columns accept these optional properties:

```typescript
name: title({
  name: "Display Name", // override property name shown in Notion
  description: "...", // property description
});
```

---

### Type Inference

```typescript
import type { InferInsertType, InferSelectType } from "@nastro-dev/notion-orm";

// Insert: title required, everything else optional
type PostInsert = InferInsertType<typeof postsTable>;
// { title: string, excerpt?: string, status?: string, ... }

// Select: all readable columns + id (nullable where applicable)
type Post = InferSelectType<typeof postsTable>;
// { id: string, title: string, excerpt: string, status: string | null, ... }
```

---

### Query Builders

#### Select

```typescript
import { eq, gt, and } from "@nastro-dev/notion-orm";

// All rows
const { rows, nextCursor } = await db.select().from(postsTable).execute();

// By ID (fetches the page directly)
const { rows } = await db.select().from(postsTable).where(eq("id", "page-id-here")).execute();

// Filtered
const { rows } = await db
  .select()
  .from(postsTable)
  .where(eq(postsTable.status, "published"))
  .execute();

// Raw Notion filter
const { rows } = await db
  .select()
  .from(postsTable)
  .raw({ property: "Status", select: { equals: "published" } })
  .execute();
```

#### Insert

```typescript
const newPost = await db.insert(postsTable).values({
  title: "Hello World",
  status: "draft",
  publishedAt: "2024-12-31",
});

// With page content (Notion blocks)
await db.insert(postsTable).values({ title: "Hello World" }, [
  {
    object: "block",
    type: "paragraph",
    paragraph: { rich_text: [{ text: { content: "Body text" } }] },
  },
]);
```

#### Update

```typescript
// Update by ID
await db
  .update(postsTable)
  .values({ status: "published" })
  .where(eq("id", "page-id-here"))
  .execute();

// Bulk update by filter
await db
  .update(postsTable)
  .values({ status: "archived" })
  .where(eq(postsTable.status, "draft"))
  .execute();
```

#### Delete

```typescript
// Soft-delete (moves to trash) by ID
await db.delete(postsTable).where(eq("id", "page-id-here")).execute();

// Bulk soft-delete by filter
await db.delete(postsTable).where(eq(postsTable.status, "archived")).execute();
```

---

### Filters

```typescript
import { eq, ne, gt, gte, lt, lte, and, or } from "@nastro-dev/notion-orm";

// Equality
eq(table.column, "published");
eq("id", "page-id"); // special: fetches by page ID directly

// Comparison
gt(table.column, 100);
gte(table.column, "2024-01-01");
lt(table.column, 50);

// Combining filters
and(eq(table.column, "draft"), gt("number", 10));
or(eq(table.column, "done"), eq("status", "archived"));
```

---

## CLI Reference

### `push`

Push schema changes to Notion.

```bash
npx notion-orm push
npx notion-orm push --force                    # allow property deletions
npx notion-orm push --rename "oldName=newName" # rename properties
```

| Flag                        | Description                                           |
| --------------------------- | ----------------------------------------------------- |
| `-f, --force`               | Force push even if properties would be deleted        |
| `-r, --rename <renames...>` | Rename properties in format `"oldName=newName"`       |
| `-c, --config <path>`       | Path to config file (default: `notion-orm.config.ts`) |
| `-t, --token <token>`       | Notion integration token                              |
| `--root-page <id>`          | Notion root page ID                                   |
| `-s, --schema <path>`       | Schema file glob pattern                              |

---

## Real-World Example: Portfolio CMS

This package powers the CMS behind [my-portfolio](https://github.com/Rjshakya/portfolio-26). The entire content layer lives in Notion and is queried at request time via server functions.

**Why Notion as a CMS?**

- Edit content in a familiar UI
- No custom admin panel needed
- Version control for schema via `schema.ts`
- Type-safe queries from frontend to backend

---

## Requirements

- Node.js >= 20.12
- A Notion integration token
- Root page Id (any notion page id that you want to use as root)
- Databases must be pushed to Notion first using the CLI

## Related Packages

- [`@nastro-dev/notion-api`](https://www.npmjs.com/package/@nastro-dev/notion-api) — Low-level Notion API wrapper
- [`@nastro-dev/notion-orm-cli`](https://www.npmjs.com/package/@nastro-dev/notion-orm-cli) — CLI for pushing schemas

## License

ISC
