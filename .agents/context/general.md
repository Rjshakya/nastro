A `context.md` (or `clara_instructions.md` / `.cursorrules`) is essential for keeping an AI assistant aligned with your specific architectural choices. Since you are building **Nastro** using **Astro**, **React**, and the **Notion API**, the context needs to focus on content transformation and performance.

Here is a structured `context.md` tailored for your stack:

---

# Project Context: Nastro

## Project Overview

**Nastro** is a high-performance platform that transforms **Notion** pages into customizable, SEO-optimized websites. It is designed specifically for developers and solo builders who want the ease of Notion's editor with the power of a modern web framework.

## Core Tech Stack

- **Framework:** Astro (latest)
- **UI Library:** React (integrated via `@astrojs/react`)
- **Data Source:** Notion API (via `@notionhq/client`)
- **Styling:** Tailwind CSS
- **Deployment:** Cloudflare Workers / Pages
- **Type Safety:** TypeScript (Strict mode)

## Architecture & Data Flow

### 1. Content Fetching

- All Notion data fetching should happen in the **Astro frontmatter** or within **server-side API routes** to keep the Notion Integration Token hidden from the client.
- Use a caching layer or ISR (Incremental Static Regeneration) where possible to avoid hitting Notion API rate limits.

### 2. Rendering Strategy

- **Astro Components:** Use for static structural elements (Layouts, Headers, Footers).
- **React Components:** Use only for highly interactive elements (Search bars, Theme switchers, dynamic Filtering).
- **Blocks:** Notion blocks (Paragraphs, Images, Code) should be mapped to specific UI components. Avoid using massive "all-in-one" Notion-to-HTML libraries if they bloat the bundle.

## Implementation Guidelines

### Notion Integration

- Treat Notion pages as "databases" for the site metadata.
- Map Notion's `RichText` objects to clean HTML/React fragments.
- Ensure images use **Astro’s Image component** to optimize remote Notion URLs (which are temporary and require handling).

### Performance Standards

- **Zero-JS by Default:** If a component doesn't need interactivity, it must be a `.astro` component.
- **Island Architecture:** When using React, use `client:visible` or `client:load` directives judiciously.

### Code Style

- Prefer **Functional Programming** patterns (map/filter/reduce) for transforming Notion JSON blocks.
- Use **Zod** for validating the shape of Notion properties before they hit the components.
- Keep components small and atomic.

## Project-Specific Constraints

- **Themes:** Must support customizable themes for developers.
- **Developer-First:** The output code must be clean enough for a user to fork and modify.
- **Cloudflare Compatibility:** Ensure all libraries are compatible with the Cloudflare Workers runtime (avoid Node-specific APIs like `fs` or `path` in the runtime code).

---
