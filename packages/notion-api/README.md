# @nastro/notion-api

A lightweight, promise-based wrapper around the Notion API with a plugin system for content transformation.

## Features

- **Promise-based API** — Clean async/await interface over Notion's official client
- **Plugin system** — Chain transformations (HTML, Markdown, block map) after fetching
- **Pagination helpers** — Built-in cursor-based pagination for databases and page blocks
- **Type-safe** — Full TypeScript support with types from `@notionhq/client`
- **Zero-config** — Just pass your integration token and go

## Installation

```bash
npm install @nastro/notion-api
```

## Quick Start

```typescript
import { createNotionApi } from "@nastro/notion-api";

const notion = createNotionApi({ token: process.env.NOTION_API_TOKEN! });

// Fetch a page
const page = await notion.getPage("page-id");
```

## Core API

### `createNotionApi(options)`

Factory function to create a `NotionApi` instance.

```typescript
const notion = createNotionApi({ token: "your-integration-token" });
```

### Database Operations

```typescript
// Create a database
const db = await notion.createDatabase(params);

// Retrieve a database
const db = await notion.getDataBase("database-id");

// Get database + its data source
const { db, ds } = await notion.getDataBaseWithDataSource("database-id");

// Query a data source (database rows)
const { pages, nextCursor } = await notion.queryDataBase({
  data_source_id: "datasource-id",
  filter: { /* ... */ },
});

// Get rows with pagination
const { pages, nextCursor } = await notion.getDataBaseRows({
  id: "datasource-id",
  pageSize: 10,
});
```

### Page Operations

```typescript
// Retrieve a page
const page = await notion.getPage("page-id");

// Create a page
const newPage = await notion.createPage(params);

// Update a page
const updated = await notion.updatePage(params);

// Get page blocks (children)
const blocks = await notion.getPageBlocks({ pageId: "page-id" });
```

### Data Source Operations

```typescript
// Retrieve a data source
const ds = await notion.getDataSource("datasource-id");

// Update a data source (schema changes)
await notion.updateDataSource(params);

// Create a data source
const ds = await notion.createDataSource(params);
```

## Plugin System

Transform fetched content using the chainable `.use()` method.

```typescript
import { createNotionApi, toHTML, toMarkdown, toBlockMap } from "@nastro/notion-api";

const notion = createNotionApi({ token: "..." });

// Convert page to HTML
const html = await notion
  .fetch("page-id")
  .use(toHTML())
  .run();

// Convert page to Markdown
const markdown = await notion
  .fetch("page-id")
  .use(toMarkdown())
  .run();

// Convert page to a block map
const blockMap = await notion
  .fetch("page-id")
  .use(toBlockMap())
  .run();
```

### Available Plugins

| Plugin | Description | Output Type |
|--------|-------------|-------------|
| `toHTML()` | Converts Notion blocks to HTML string | `string` |
| `toMarkdown()` | Converts Notion blocks to Markdown string | `string` |
| `toBlockMap()` | Converts Notion blocks to a flat block map | `Record<string, Block>` |

### Custom Plugins

```typescript
const notion = createNotionApi({ token: "..." });

const myPlugin = (page) => {
  return {
    title: page.title,
    wordCount: page.content.length,
  };
};

const result = await notion
  .fetch("page-id")
  .use(myPlugin)
  .run();
// result: { title: string, wordCount: number }
```

## Pagination Helpers

```typescript
import { getPagePaginated, getPageBlocksPaginated } from "@nastro/notion-api";

// Paginate through all page blocks
for await (const blocks of getPageBlocksPaginated({ token: "...", pageId: "..." })) {
  console.log(blocks);
}

// Paginate through page content
for await (const page of getPagePaginated({ token: "...", pageId: "..." })) {
  console.log(page);
}
```

## Block Handlers (Advanced)

For direct block content extraction:

```typescript
import { getBlockContent, getBlockContentRecursively } from "@nastro/notion-api";

const content = await getBlockContent({ token: "...", blockId: "..." });
const allContent = await getBlockContentRecursively({ token: "...", blockId: "..." });
```

## Types

All types are re-exported from `@notionhq/client` along with custom content types:

```typescript
import type {
  Page,
  RichText,
  ParagraphContent,
  HeadingContent,
  CalloutContent,
  ToDoContent,
  MediaContent,
  // ... and more
} from "@nastro/notion-api";
```

## Requirements

- Node.js >= 18
- A Notion integration token ([get one here](https://www.notion.so/my-integrations))

## License

ISC
