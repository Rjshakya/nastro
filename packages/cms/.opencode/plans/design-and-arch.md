# Notion CMS Design & Architecture

## Overview

A layered, plugin-based library for using Notion as a CMS. Provides clean separation between content fetching and CMS transformation, with extensible plugin architecture at both layers.

## Core Principles

1. **Layered Architecture**: Clear separation between fetching and CMS transformation
2. **Plugin-Based Extensibility**: Chainable async plugins at both layers
3. **Template-Driven CMS**: You provide a Notion template that users duplicate
4. **Type-Safe**: Full TypeScript support with generated types from actual Notion pages

---

## Architecture Layers

### Layer 1: Content Fetching (`core/`)

**Primary Class: `ContentSource`**

Responsible for all Notion API interactions and raw content fetching.

```typescript
class ContentSource {
  private plugins: ContentTransform<any>[] = [];

  // Chain plugins - output of plugin N → input of plugin N+1
  use<Output>(plugin: ContentTransform<Output>): ContentSource;

  // Fetch methods
  fetch(pageId: string): Promise<Page>;
  fetch(pageId: string, opts: { contentOnly: true }): Promise<PageContentOnly>;

  // Internal: Fetch from Notion API, then chain through plugins
  private async fetchFromNotion(
    pageId: string,
    opts?: FetchOptions,
  ): Promise<any>;
}
```

**Plugin System (Layer 1):**

```typescript
type ContentTransform<Output> = (
  page: Page | PageContentOnly,
) => Promise<Output> | Output;
```

**Built-in Plugins:**

- `toHTML`: ContentTransform<string>
- `toMarkdown`: ContentTransform<string>

---

### Layer 2: CMS (`cms/`)

**Primary Class: `NotionCMS<T>`**

Transforms fetched content into your predefined CMS structure using a template.

```typescript
// You provide this template structure
interface CMSPage {
  title: string;
  slug: string;
  content: BlockContent[];
  metadata: Record<string, any>;
  // ... your defined fields
}

class NotionCMS<T = CMSPage> {
  constructor(
    source: ContentSource,
    template: TemplateConfig, // Maps Notion props to CMS structure
  );

  // Get transformed pages
  getPage(pageId: string): Promise<T>;
  getCollection(databaseId: string): Promise<T[]>;

  // CMS-level plugins (transform CMS page)
  use<Output>(plugin: CMSPlugin<T, Output>): NotionCMS<Output>;
}
```

**Plugin System (Layer 2):**

```typescript
type CMSPlugin<Input, Output> = (page: Input) => Promise<Output> | Output;
```

**Template System:**

- You provide a Notion page template
- Users duplicate this template in their workspace
- TemplateConfig maps Notion properties to CMS fields
- Supports validation and type coercion

---

### Layer 3: CLI (`cli/`)

**Command: `generate-types`**

Generates TypeScript types by introspecting a live Notion page.

```bash
npx notion-cms generate-types --page-id <id> --output ./types
```

**Features:**

- Analyzes Notion database schema
- Generates TypeScript interfaces for properties
- Creates type-safe CMS page types
- Supports custom property mappings

---

## Plugin Chain Flow

```
Notion API
    ↓
ContentSource.fetch() → [Plugin1] → [Plugin2] → ... → [PluginN] → Output
    ↓                                                           ↓
Page / PageContentOnly                                   Final Result
    ↓
NotionCMS.getPage() → [CMS Plugin1] → [CMS Plugin2] → ... → Output
```

**Key Behaviors:**

- Plugins are executed in order (array sequence)
- Each plugin receives the output of the previous plugin
- Last plugin's output is the final result
- All plugins support async operations
- Type safety is maintained through the chain

---

## Folder Structure

```
packages/cms/
├── src/
│   ├── core/                           # Layer 1: Content Fetching
│   │   ├── ContentSource.ts            # Main fetching class
│   │   ├── client.ts                   # Notion API client wrapper
│   │   ├── plugins/
│   │   │   ├── html.ts                 # HTML transform plugin
│   │   │   └── markdown.ts             # Markdown transform plugin
│   │   ├── blocks/                     # Block processing
│   │   │   ├── index.ts                # Block dispatcher
│   │   │   ├── text-blocks.ts
│   │   │   ├── list-blocks.ts
│   │   │   ├── media-blocks.ts
│   │   │   ├── embed-blocks.ts
│   │   │   ├── table-blocks.ts
│   │   │   ├── nav-blocks.ts
│   │   │   ├── special-blocks.ts
│   │   │   ├── structure-blocks.ts
│   │   │   ├── page-metadata.ts
│   │   │   └── utils.ts
│   │   └── types.ts                    # Core types (Page, BlockContent, etc.)
│   │
│   ├── cms/                            # Layer 2: CMS
│   │   ├── NotionCMS.ts                # Main CMS class
│   │   ├── templates/
│   │   │   ├── default.ts              # Default CMS template
│   │   │   └── types.ts                # Template type definitions
│   │   ├── plugins/                    # CMS-level plugins
│   │   └── types.ts                    # CMS-specific types
│   │
│   ├── cli/                            # Layer 3: CLI Tools
│   │   ├── index.ts                    # CLI entry point
│   │   ├── commands/
│   │   │   └── generate-types.ts       # Type generation command
│   │   └── utils/
│   │       └── notion-introspect.ts    # Page/schema analyzer
│   │
│   └── main.ts                         # Orchestrator / Public API
│
├── templates/                          # Notion page templates (for users)
│   └── blog.json                       # Example: Blog template
│
└── package.json
```

---

## Public API (main.ts)

The orchestrator that exposes a clean interface to users:

```typescript
// Core exports
export { ContentSource } from "./core/ContentSource";
export { NotionCMS } from "./cms/NotionCMS";

// Built-in plugins
export { toHTML, toMarkdown } from "./core/plugins";

// Types
export * from "./core/types";
export * from "./cms/types";

// Template utilities
export { defineTemplate } from "./cms/templates";

// Convenience factory (optional)
export function createCMS(options: CMSOptions): NotionCMS;
```

---

## Usage Examples

### Basic Usage

```typescript
import { ContentSource, toMarkdown } from "@nastro/cms";

const source = new ContentSource({ token: "..." });

// Fetch raw content
const page = await source.fetch("page-id");

// With plugins
const markdown = await source.use(toMarkdown).fetch("page-id");
```

### CMS Usage

```typescript
import { NotionCMS, createCMS } from "@nastro/cms";

// Using factory
const cms = createCMS({
  token: "...",
  template: "blog", // Use built-in template
});

// Fetch CMS-structured page
const post = await cms.getPage("page-id");
// Returns: { title, slug, content, metadata, ... }

// With custom plugin
const enrichedCMS = cms.use(async (page) => ({
  ...page,
  readingTime: calculateReadingTime(page.content),
}));
```

### Type Generation

```bash
# Generate types from your Notion template
npx notion-cms generate-types \
  --page-id 123456789 \
  --output ./src/types/cms.ts
```

---

## Future Extensions

Planned features for later:

1. **Renderer Layer**: React/Vue/Svelte components for rendering CMS content
2. **Caching Layer**: Redis/file-based caching with invalidation strategies
3. **Webhook Integration**: Real-time updates from Notion
4. **Multi-tenant Support**: Workspace isolation for SaaS use cases
5. **Asset Pipeline**: Image optimization and CDN integration

---

## Design Decisions

1. **Why Chainable Plugins?**
   - Composable transformations
   - Each step is testable in isolation
   - Users can mix built-in and custom plugins

2. **Why Template-Based?**
   - You control the data structure
   - Users don't need to learn complex configuration
   - Type generation works predictably

3. **Why Two Plugin Layers?**
   - Content plugins: Format transformations (HTML, Markdown)
   - CMS plugins: Business logic (reading time, SEO metadata)
   - Clean separation of concerns

4. **Why CLI for Types?**
   - Real-time schema introspection
   - No manual type maintenance
   - Always in sync with actual Notion structure
