# @nastro-dev/notion-orm

A TypeScript-first ORM for Notion databases. Define schemas as code, push them to Notion, and query with a fluent, type-safe API.

## Features

- **Schema-as-code** — Define Notion databases with plain TypeScript objects
- **Type-safe queries** — Full type inference for inserts, updates, and selects
- **Fluent API** — Chainable query builders with filters, sorting, and pagination
- **CLI companion** — Push schema changes to Notion with change detection
- **CRUD operations** — Insert, select, update, and delete rows

## Installation

```bash
npm install @nastro-dev/notion-orm
```

## Quick Start

### 1. Define a schema

```typescript
import { table, title, richText, select, date, checkbox } from "@nastro-dev/notion-orm";

export const tasksTable = table("Tasks", {
  name: title(),
  description: richText(),
  status: select({
    options: ["Todo", "In Progress", "Done"],
  }),
  dueDate: date(),
  completed: checkbox(),
});

// Inferred types
export type TaskInsert = InferInsertType<typeof tasksTable>;
export type Task = InferSelectType<typeof tasksTable>;
```

### 2. Create a database client

```typescript
import { createNotionDB } from "@nastro-dev/notion-orm";

const db = createNotionDB({
  token: process.env.NOTION_TOKEN!,
});
```

### 3. Query your data

```typescript
import { eq } from "@nastro-dev/notion-orm";

// Select all rows
const { rows, nextCursor } = await db.select().from(tasksTable).execute();

// Select by ID
const { rows } = await db
  .select()
  .from(tasksTable)
  .where(eq("id", "page-id-here"))
  .execute();

// Select with filters
const { rows } = await db
  .select()
  .from(tasksTable)
  .where(eq("status", "Done"))
  .execute();

// Sort and paginate
const { rows, nextCursor } = await db
  .select()
  .from(tasksTable)
  .sort("dueDate", "asc")
  .limit(10)
  .setCursor(nextCursor)
  .execute();
```

### 4. Insert data

```typescript
const newTask = await db.insert(tasksTable).values({
  name: "Write documentation",
  status: "Todo",
  dueDate: "2024-12-31",
});
```

### 5. Update data

```typescript
await db
  .update(tasksTable)
  .values({ status: "Done" })
  .where(eq("id", "page-id-here"))
  .execute();
```

### 6. Delete data

```typescript
await db
  .delete(tasksTable)
  .where(eq("id", "page-id-here"))
  .execute();
```

## Schema Definition

### Column Types

```typescript
import {
  title,        // required, exactly one per table
  richText,
  number,
  select,       // { options: ["A", "B"] }
  multiSelect,  // { options: ["A", "B"] }
  status,       // { options: ["A", "B"] }
  date,
  people,
  files,
  checkbox,
  url,
  email,
  phoneNumber,
  relation,     // { relatedTo: "otherTableName" }
  formula,      // { expression: "..." }
  rollup,       // { function, relation_property_name, rollup_property_name }
  uniqueId,     // { prefix?: "..." }
  createdTime,
  createdBy,
  lastEditedTime,
  lastEditedBy,
} from "@nastro-dev/notion-orm";
```

### Column Options

All columns accept these optional properties:

```typescript
name: title({
  name: "Task Name",      // override property name in Notion
  description: "...",     // property description
});
```

## Type Inference

```typescript
import type { InferInsertType, InferSelectType } from "@nastro-dev/notion-orm";

// Insert type: title required, everything else optional
type TaskInsert = InferInsertType<typeof tasksTable>;
// { name: string, description?: string, status?: string, ... }

// Select type: all readable columns + id
type Task = InferSelectType<typeof tasksTable>;
// { id: string, name: string, description: string, status: string | null, ... }
```

## Filters

```typescript
import { eq, ne, gt, gte, lt, lte, and, or } from "@nastro-dev/notion-orm";

// Equality
eq("status", "Done");
eq("id", "page-id");           // special: fetches by page ID directly

// Comparison
gt("number", 100);
gte("date", "2024-01-01");
lt("unique_id", 50);

// Combining filters
and(eq("status", "Todo"), gt("number", 10));
or(eq("status", "Done"), eq("status", "Archived"));
```

## Select Query Builder

```typescript
db.select()
  .from(tasksTable)
  .where(eq("status", "Todo"))      // filter
  .sort("dueDate", "asc")            // sort (chainable)
  .limit(50)                         // page size
  .setCursor(cursor)                 // pagination cursor
  .raw({ /* raw Notion filter */ })  // pass raw filter object
  .execute();                        // returns { rows, nextCursor }
```

## Requirements

- Node.js >= 18
- A Notion integration token
- Databases must be pushed to Notion first using the CLI

## Related Packages

- [`@nastro-dev/notion-api`](https://www.npmjs.com/package/@nastro-dev/notion-api) — Low-level Notion API wrapper
- [`@nastro-dev/notion-orm-cli`](https://www.npmjs.com/package/@nastro-dev/notion-orm-cli) — CLI for pushing schemas

## License

ISC
