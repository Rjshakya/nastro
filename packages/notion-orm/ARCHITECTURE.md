# Notion-ORM Architecture Plan

## Overview

Notion-ORM is a TypeScript ORM for Notion databases that provides schema definition, CLI-based database creation, and a SQL-like query builder interface.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         notion-orm                                  │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐   ┌─────────────┐   ┌──────────────────────────┐  │
│  │   Schema    │   │    CLI      │   │      Query Builder       │  │
│  │ Definition  │   │   (Push)    │   │  (Select/Insert/Update)  │  │
│  └──────┬──────┘   └──────┬──────┘   └────────────┬─────────────┘  │
│         │                  │                       │                │
│         └──────────────────┼───────────────────────┘                │
│                            │                                         │
│              ┌───────────────┴────────────────┐                       │
│              │      Notion API Client         │                       │
│              │   (Wrapper with normalization) │                       │
│              └────────────────────────────────┘                       │
└─────────────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Schema Definition (`src/schema/`)

The schema system defines database structure with full TypeScript type inference.

```typescript
import * as n from "notion-orm/schema";

const projectsTable = n.table({
  title: "Projects", // Database title in Notion
  properties: {
    // Required: exactly one title property
    name: n.title({ name: "Project Name" }),

    // Column definitions with Notion property types
    status: n.status({
      name: "Status",
      options: [
        { name: "Not started", color: "default" },
        { name: "In progress", color: "blue" },
        { name: "Done", color: "green" },
      ],
    }),

    priority: n.select({
      name: "Priority",
      options: ["Low", "Medium", "High"],
    }),

    tags: n.multiSelect({
      name: "Tags",
      options: ["Feature", "Bug", "Design", "Tech"],
    }),

    dueDate: n.date({ name: "Due Date" }),
    budget: n.number({ name: "Budget", format: "dollar" }),
    completed: n.checkbox({ name: "Completed" }),
    description: n.richText({ name: "Description" }),

    // Relations use deferred resolution
    tasks: n.relation({
      name: "Tasks",
      relatedTo: "tasksTable", // References another schema by export name
    }),

    // Read-only system properties (automatically handled)
    createdAt: n.createdTime({ name: "Created" }),
    updatedAt: n.lastEditedTime({ name: "Updated" }),
  },
});

// Type inference
type Project = n.InferType<typeof projectsTable>;
// → { name: string, status: string, priority: string, tags: string[],
//     dueDate: string | null, budget: number | null, completed: boolean,
//     description: string, tasks: string[], createdAt: string, updatedAt: string }
```

#### Supported Property Types

| Type               | Config                                    | Writable    | Read Format                                     | Write Format                              |
| ------------------ | ----------------------------------------- | ----------- | ----------------------------------------------- | ----------------------------------------- |
| `title`            | `{ name: string }`                        | ✅ Required | `{ title: RichText[] }`                         | `string` or `RichText[]`                  |
| `rich_text`        | `{ name: string }`                        | ✅          | `{ rich_text: RichText[] }`                     | `string` or `RichText[]`                  |
| `number`           | `{ name: string, format?: NumberFormat }` | ✅          | `{ number: number }`                            | `number`                                  |
| `select`           | `{ name: string, options: Option[] }`     | ✅          | `{ select: { name, id, color } }`               | `{ name: string }`                        |
| `multi_select`     | `{ name: string, options: Option[] }`     | ✅          | `{ multi_select: Array<{name, id, color}> }`    | `string[]` or `Array<{name}>`             |
| `status`           | `{ name: string, options?: Option[] }`    | ✅          | `{ status: { name, id, color } }`               | `{ name: string }`                        |
| `date`             | `{ name: string }`                        | ✅          | `{ date: { start, end?, time_zone? } }`         | `string` or `{ start, end?, time_zone? }` |
| `people`           | `{ name: string }`                        | ✅          | `{ people: User[] }`                            | `Array<{ id: string }>`                   |
| `files`            | `{ name: string }`                        | ✅          | `{ files: File[] }`                             | `Array<{ name, external: {url} }>`        |
| `checkbox`         | `{ name: string }`                        | ✅          | `{ checkbox: boolean }`                         | `boolean`                                 |
| `url`              | `{ name: string }`                        | ✅          | `{ url: string }`                               | `string`                                  |
| `email`            | `{ name: string }`                        | ✅          | `{ email: string }`                             | `string`                                  |
| `phone_number`     | `{ name: string }`                        | ✅          | `{ phone_number: string }`                      | `string`                                  |
| `relation`         | `{ name: string, relatedTo?: string }`    | ✅          | `{ relation: Array<{id}>, has_more: boolean }`  | `string[]` (page IDs)                     |
| `formula`          | `{ name: string, expression: string }`    | ❌          | `{ formula: { type, [type]: value } }`          | -                                         |
| `rollup`           | `{ name: string, ... }`                   | ❌          | `{ rollup: { type, function, [type]: value } }` | -                                         |
| `unique_id`        | `{ name: string, prefix?: string }`       | ❌          | `{ unique_id: { prefix, number } }`             | -                                         |
| `created_time`     | `{ name: string }`                        | ❌          | `{ created_time: ISO8601 }`                     | -                                         |
| `created_by`       | `{ name: string }`                        | ❌          | `{ created_by: User }`                          | -                                         |
| `last_edited_time` | `{ name: string }`                        | ❌          | `{ last_edited_time: ISO8601 }`                 | -                                         |
| `last_edited_by`   | `{ name: string }`                        | ❌          | `{ last_edited_by: User }`                      | -                                         |

### 2. NotionORM Client (`src/client/`)

The client manages connections and provides the query builder interface.

```typescript
import { notionOrm } from "notion-orm";

// Initialize with auth token and root page
const db = notionOrm({
  token: process.env.NOTION_TOKEN,
  rootPageId: "abc123...",
  schemas: {
    // Optional: for validation
    projects: projectsTable,
    tasks: tasksTable,
  },
});
```

**Root Page Structure:**

The ORM organizes databases as subpages under a root page:

```
Root Page (user-provided rootPageId)
├── Projects (subpage containing database)
│   └── [Data Source with schema properties]
├── Tasks (subpage containing database)
│   └── [Data Source with schema properties]
└── ...
```

**Why this structure?**

- Notion's Data Source API requires a database parent
- Each database can have multiple data sources (for wikis), but typically one
- Subpages keep databases organized under the root page

### 3. Query Builder (`src/query/`)

#### SELECT Queries

```typescript
// Basic select all
const allProjects = await db.select().from(projectsTable).execute();

// With WHERE clause using operators
const activeProjects = await db
  .select()
  .from(projectsTable)
  .where(n.and(n.eq("status", "In progress"), n.gt("budget", 10000)))
  .execute();

// Complex filters with OR/AND
const filtered = await db
  .select()
  .from(projectsTable)
  .where(
    n.or(
      n.and(
        n.eq("status", "In progress"),
        n.in("priority", ["High", "Medium"]),
      ),
      n.lt("dueDate", "2024-12-31"),
    ),
  )
  .orderBy("dueDate", "asc")
  .limit(10)
  .execute();

// Pagination
const page2 = await db
  .select()
  .from(projectsTable)
  .cursor("next-cursor-from-previous")
  .execute();

// Select specific columns (performance optimization)
const namesOnly = await db
  .select("name", "status")
  .from(projectsTable)
  .execute();
```

**Available Filter Operators:**

| Operator                    | Description           | Types                                                    |
| --------------------------- | --------------------- | -------------------------------------------------------- |
| `eq(column, value)`         | equals                | all                                                      |
| `ne(column, value)`         | not equals            | all                                                      |
| `gt(column, value)`         | greater than          | number, date                                             |
| `lt(column, value)`         | less than             | number, date                                             |
| `gte(column, value)`        | greater than or equal | number, date                                             |
| `lte(column, value)`        | less than or equal    | number, date                                             |
| `contains(column, value)`   | contains              | title, rich_text, url, email, phone_number, multi_select |
| `startsWith(column, value)` | starts with           | title, rich_text, url, email, phone_number               |
| `endsWith(column, value)`   | ends with             | title, rich_text, url, email, phone_number               |
| `in(column, values[])`      | in array              | select, status, multi_select                             |
| `isEmpty(column)`           | is empty              | all                                                      |
| `isNotEmpty(column)`        | is not empty          | all                                                      |
| `and(...conditions)`        | logical AND           | -                                                        |
| `or(...conditions)`         | logical OR            | -                                                        |

#### INSERT Queries

```typescript
// Insert single row - values are auto-normalized
const newProject = await db
  .insert(projectsTable)
  .values({
    name: "New Website", // Plain string → converts to title
    status: "Not started", // Plain string → converts to status option
    priority: "High", // Plain string → converts to select option
    budget: 5000,
    tags: ["Feature", "Design"], // String array → converts to multi_select
    dueDate: "2024-12-31", // String → converts to date
    tasks: ["task-page-id-1"], // Page IDs for relations
  })
  .execute();

// Insert multiple rows
const newProjects = await db
  .insert(projectsTable)
  .values([project1, project2, project3])
  .execute();
```

**Value Normalization:**

The ORM automatically converts user-friendly values to Notion API format:

| User Input | Notion API Format | Example                                                           |
| ---------- | ----------------- | ----------------------------------------------------------------- |
| `string`   | Rich text array   | `"Hello"` → `{ title: [{ text: { content: "Hello" } }] }`         |
| `string`   | Select option     | `"High"` → `{ select: { name: "High" } }`                         |
| `string[]` | Multi-select      | `["A", "B"]` → `{ multi_select: [{ name: "A" }, { name: "B" }] }` |
| `string`   | Date              | `"2024-12-31"` → `{ date: { start: "2024-12-31" } }`              |
| `string[]` | Relation          | `["page-id-1"]` → `{ relation: [{ id: "page-id-1" }] }`           |

#### UPDATE Queries

```typescript
// Update rows matching where clause
await db
  .update(projectsTable)
  .set({
    status: "Done",
    completed: true,
  })
  .where(n.eq("id", "page-id-123"))
  .execute();

// Bulk update
await db
  .update(projectsTable)
  .set({ priority: "Low" })
  .where(n.lt("budget", 1000))
  .execute();
```

#### DELETE Queries

```typescript
// Delete rows (moves to trash in Notion)
await db.delete(projectsTable).where(n.eq("id", "page-id-123")).execute();
```

### 4. CLI Push (`src/cli/`)

```bash
# Push schema changes to Notion
npx notion-orm push --token <token> --root-page <page-id> --schema ./schemas.ts

# Options
npx notion-orm push --dry-run    # Preview changes without applying
npx notion-orm push --force      # Force recreate (destructive)
```

**Push Algorithm:**

1. **Initialize** - Load schema definitions from the schema file
2. **Create Root Structure** - For each schema:
   - Check if subpage exists under root page
   - If not, create subpage with database
3. **Create/Update Data Source**:
   - New schema: Create data source with properties (`POST /v1/data_sources`)
   - Existing schema: Update properties if changed (`PATCH /v1/data_sources/{id}`)
4. **Handle Relations** (Two-phase process):
   - Phase 1: Create all tables without relations
   - Phase 2: Update tables to add relations (now that target data_source_ids exist)

**Relation Resolution Strategy:**

Relations require `data_source_id` which only exists after the related database is created. The ORM uses a two-phase approach:

```typescript
// Schema definition - use export name reference
const tasksTable = n.table({
  title: "Tasks",
  properties: {
    title: n.title({ name: "Title" }),
    project: n.relation({
      name: "Project",
      relatedTo: "projectsTable", // Export name of related schema
    }),
  },
});

// Push Phase 1: Create all tables without relations
// Push Phase 2: Add relations using resolved data_source_ids
```

This approach:

- Avoids circular dependency issues
- Allows TypeScript to validate table references at compile time (via schema export names)
- Enables deferred resolution without runtime schema objects

## File Structure

```
packages/notion-orm/
├── src/
│   ├── index.ts              # Main exports
│   ├── schema/
│   │   ├── index.ts          # Schema builders (table, column types)
│   │   ├── types.ts          # Schema type definitions
│   │   └── infer.ts          # Type inference helpers
│   ├── client/
│   │   ├── index.ts          # notionOrm() factory
│   │   ├── client.ts         # NotionORM class
│   │   └── types.ts          # Client configuration types
│   ├── query/
│   │   ├── index.ts          # Query builders
│   │   ├── select.ts         # SelectQueryBuilder
│   │   ├── insert.ts         # InsertQueryBuilder
│   │   ├── update.ts         # UpdateQueryBuilder
│   │   ├── delete.ts         # DeleteQueryBuilder
│   │   ├── operators.ts      # Filter operators
│   │   ├── normalize.ts      # Value normalization (user → Notion API)
│   │   ├── denormalize.ts    # Value denormalization (Notion API → user)
│   │   └── types.ts          # Query result types
│   ├── api/
│   │   ├── index.ts          # Notion API wrapper
│   │   ├── data-sources.ts   # Data source operations
│   │   ├── pages.ts          # Page (row) operations
│   │   └── utils.ts          # API utilities
│   └── cli/
│       ├── index.ts          # CLI entry point
│       ├── push.ts           # Push command implementation
│       └── args.ts           # CLI argument parsing
├── package.json
├── tsconfig.json
└── README.md
```

## Value Mapping

### Write Mapping (User → Notion API)

| Type         | User Value                                     | Notion API Value                                   |
| ------------ | ---------------------------------------------- | -------------------------------------------------- |
| title        | `"Hello"`                                      | `{ title: [{ text: { content: "Hello" } }] }`      |
| title        | `[{ text: { content: "Hello" } }]`             | `{ title: [...] }` (pass through)                  |
| rich_text    | `"Hello"`                                      | `{ rich_text: [{ text: { content: "Hello" } }] }`  |
| number       | `42`                                           | `{ number: 42 }`                                   |
| select       | `"Option"`                                     | `{ select: { name: "Option" } }`                   |
| select       | `{ name: "Option" }`                           | `{ select: { name: "Option" } }`                   |
| multi_select | `["A", "B"]`                                   | `{ multi_select: [{ name: "A" }, { name: "B" }] }` |
| status       | `"Done"`                                       | `{ status: { name: "Done" } }`                     |
| date         | `"2024-12-31"`                                 | `{ date: { start: "2024-12-31" } }`                |
| date         | `{ start: "2024-12-31", end: "2025-01-31" }`   | `{ date: { start: "...", end: "..." } }`           |
| people       | `["user-id-1"]`                                | `{ people: [{ id: "user-id-1" }] }`                |
| relation     | `["page-id-1"]`                                | `{ relation: [{ id: "page-id-1" }] }`              |
| checkbox     | `true`                                         | `{ checkbox: true }`                               |
| url          | `"https://..."`                                | `{ url: "https://..." }`                           |
| email        | `"test@example.com"`                           | `{ email: "test@example.com" }`                    |
| phone        | `"555-1234"`                                   | `{ phone_number: "555-1234" }`                     |
| files        | `[{ name: "file", external: { url: "..." } }]` | `{ files: [...] }`                                 |

### Read Mapping (Notion API → User)

| Type             | Notion API Value                                              | User Value                         |
| ---------------- | ------------------------------------------------------------- | ---------------------------------- | ------ | ------- | ----------- |
| title            | `{ title: [...] }`                                            | `string` (concatenated plain_text) |
| rich_text        | `{ rich_text: [...] }`                                        | `string` (concatenated plain_text) |
| number           | `{ number: 42 }`                                              | `number`                           |
| select           | `{ select: { name: "Option", id: "...", color: "..." } }`     | `string` (name)                    |
| multi_select     | `{ multi_select: [{ name: "A", id: "..." }, ...] }`           | `string[]` (names)                 |
| status           | `{ status: { name: "Done", id: "...", color: "..." } }`       | `string` (name)                    |
| date             | `{ date: { start: "...", end: "...", time_zone: "..." } }`    | `DateObject` or `string`           |
| people           | `{ people: [{ id: "...", name: "...", ... }] }`               | `User[]`                           |
| relation         | `{ relation: [{ id: "page-id-1" }], has_more: false }`        | `string[]` (page IDs)              |
| formula          | `{ formula: { type: "number", number: 42 } }`                 | `number                            | string | boolean | DateObject` |
| rollup           | `{ rollup: { type: "number", number: 42, function: "sum" } }` | depends on aggregation             |
| unique_id        | `{ unique_id: { prefix: "TASK", number: 123 } }`              | `string` ("TASK-123")              |
| created_time     | `{ created_time: "2024-..." }`                                | `string` (ISO8601)                 |
| created_by       | `{ created_by: { id: "...", name: "..." } }`                  | `User`                             |
| last_edited_time | `{ last_edited_time: "2024-..." }`                            | `string` (ISO8601)                 |
| last_edited_by   | `{ last_edited_by: { id: "...", name: "..." } }`              | `User`                             |

## Implementation Phases

### Phase 1: Core Schema & Client

- [ ] Schema definition builders (all property types)
- [ ] Type inference system (InferType)
- [ ] NotionORM client initialization
- [ ] Basic API wrapper (using @notionhq/client)

### Phase 2: Query Builder - SELECT

- [ ] Select query builder with column selection
- [ ] All filter operators (eq, gt, lt, contains, etc.)
- [ ] AND/OR composition
- [ ] Sorting support
- [ ] Pagination (cursor-based)
- [ ] Value denormalization for results

### Phase 3: Query Builder - Write Operations

- [ ] Insert with value normalization
- [ ] Update with where clauses
- [ ] Delete with where clauses
- [ ] Batch operations

### Phase 4: CLI Push

- [ ] CLI argument parsing (flags)
- [ ] Schema file loading
- [ ] Database creation (subpages)
- [ ] Data source creation with properties
- [ ] Two-phase relation resolution
- [ ] Dry-run support

### Phase 5: Advanced Features

- [ ] Schema diffing (update existing)
- [ ] Formula property support (computed)
- [ ] Rollup property support (computed)
- [ ] File upload support
- [ ] Rate limiting / retry logic
- [ ] Pagination for large relations (>25 items)

## API Endpoints Used

| Endpoint                                      | Purpose                                     |
| --------------------------------------------- | ------------------------------------------- |
| `POST /v1/data_sources`                       | Create data source with schema              |
| `GET /v1/data_sources/{id}`                   | Retrieve data source schema                 |
| `PATCH /v1/data_sources/{id}`                 | Update data source (title, properties)      |
| `POST /v1/data_sources/{id}/query`            | Query rows (pages) in data source           |
| `POST /v1/pages`                              | Create new row (page)                       |
| `PATCH /v1/pages/{id}`                        | Update row properties                       |
| `DELETE /v1/pages/{id}`                       | Delete row (move to trash)                  |
| `GET /v1/pages/{id}`                          | Retrieve page (row) details                 |
| `GET /v1/pages/{id}/properties/{property_id}` | Retrieve specific property (for pagination) |

## Usage Example (Complete)

```typescript
// 1. Define schema
import * as n from "notion-orm/schema";

const tasksTable = n.table({
  title: "Tasks",
  properties: {
    title: n.title({ name: "Title" }),
    status: n.status({
      name: "Status",
      options: ["Todo", "In Progress", "Done"],
    }),
    assignee: n.people({ name: "Assignee" }),
    dueDate: n.date({ name: "Due Date" }),
    completed: n.checkbox({ name: "Completed" }),
  },
});

export { tasksTable };

// 2. Initialize client
import { notionOrm } from "notion-orm";

const db = notionOrm({
  token: process.env.NOTION_TOKEN!,
  rootPageId: "your-root-page-id",
  schemas: { tasks: tasksTable },
});

// 3. Push schema to Notion (via CLI)
// $ npx notion-orm push \
//     --token $NOTION_TOKEN \
//     --root-page "your-root-page-id" \
//     --schema ./schemas.ts

// 4. Query
const overdueTasks = await db
  .select()
  .from(tasksTable)
  .where(
    n.and(n.lt("dueDate", new Date().toISOString()), n.eq("completed", false)),
  )
  .orderBy("dueDate", "asc")
  .execute();

// 5. Insert
const newTask = await db
  .insert(tasksTable)
  .values({
    title: "Fix bug #123",
    status: "Todo",
    dueDate: { start: "2024-12-31" },
  })
  .execute();

// 6. Update
await db
  .update(tasksTable)
  .set({ status: "Done", completed: true })
  .where(n.eq("id", newTask.id))
  .execute();
```

## Key Technical Decisions

### 1. Subpage Structure

Each schema creates a subpage under the root page containing a database with a data source. This keeps databases organized and follows Notion's API structure where data sources require a database parent.

### 2. Relation Handling

Relations use deferred resolution via export names. This:

- Avoids circular dependencies
- Allows compile-time validation
- Enables two-phase push (create tables → add relations)

### 3. Type Inference

Schema objects carry full TypeScript type information via generic inference, allowing `InferType<typeof table>` to extract row types without code generation.

### 4. Value Normalization

The query builder automatically converts simple values to Notion's complex format:

- Strings → Rich text arrays
- Plain strings → Select/Status options
- String arrays → Multi-select options
- ISO date strings → Date objects

This provides a cleaner API while maintaining full access to Notion's rich features when needed.

### 5. CLI-First Approach

Starting with CLI flags rather than config files keeps the initial implementation simple while still supporting the core push workflow.

### 6. Read-Only Properties

System properties (created_time, created_by, last_edited_time, last_edited_by, formula, rollup, unique_id) are marked as read-only in the schema but included in type inference so users can read them in queries.

## Future Considerations

- **Migrations**: Schema versioning and migration support
- **Webhooks**: Real-time sync via Notion webhooks
- **Caching**: Local caching layer for performance
- **Query Optimization**: Automatic filter_properties selection
- **Template Support**: Database templates for row creation
- **Multi-workspace**: Support for multiple Notion workspaces
