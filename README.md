# Nastro

> Turn your Notion pages into beautiful, customizable websites — with custom domains, real-time sync, and zero code.

Nastro is a SaaS platform that bridges the gap between Notion's powerful content editing and the need for personalized, professional web presence. Perfect for creators, developers, and teams who want to publish Notion content without the constraints of generic Notion sites.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Cloudflare Edge                          │
│  ┌─────────────────┐          ┌─────────────────────────────┐   │
│  │  nastro.xyz     │          │  api.nastro.xyz             │   │
│  │  (Cloudflare    │◄────────►│  (Cloudflare Workers)       │   │
│  │   Pages)        │   API    │                             │   │
│  │                 │          │  • Hono HTTP framework      │   │
│  │  TanStack Start │          │  • Effect.ts services       │   │
│  │  React + Vite   │          │  • Drizzle ORM + Postgres   │   │
│  │  Tailwind v4    │          │  • better-auth (OAuth)      │   │
│  │  shadcn/ui      │          │  • KV cache + R2 storage    │   │
│  └─────────────────┘          └─────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │   Notion API    │
                    │  (Official API  │
                    │   + Client)     │
                    └─────────────────┘
```

## Monorepo Structure

This is a [Turborepo](https://turbo.build/) monorepo managed with [pnpm](https://pnpm.io/).

| App/Package           | Description                                                                        | Deploy Target      |
| --------------------- | ---------------------------------------------------------------------------------- | ------------------ |
| `apps/web`            | TanStack Start frontend — landing page, dashboard, site editor, live site renderer | Cloudflare Pages   |
| `apps/server`         | Hono API backend — auth, site management, Notion integration, file upload          | Cloudflare Workers |
| `packages/notion-api` | Custom Notion API client with block rendering, markdown/HTML plugins               | npm package        |
| `packages/notion-orm` | Notion ORM with typed queries, filters, and schema management                      | npm package        |
| `packages/cli`        | CLI tooling for schema comparison, database push, and config management            | npm package        |

## Tech Stack

### Frontend (`apps/web`)

| Layer            | Technology                                                                      |
| ---------------- | ------------------------------------------------------------------------------- |
| Framework        | [TanStack Start](https://tanstack.com/start) (React + Vite-based SSR framework) |
| Styling          | [Tailwind CSS v4](https://tailwindcss.com/)                                     |
| UI Components    | [shadcn/ui](https://ui.shadcn.com/)                                             |
| Animation        | [Motion](https://motion.dev/) (Framer Motion successor)                         |
| State            | [Zustand](https://zustand-demo.pmnd.rs/)                                        |
| Data Fetching    | TanStack Router loaders + SWR                                                   |
| Icons            | [Tabler Icons](https://tabler-icons.io/)                                        |
| Auth             | [better-auth](https://www.better-auth.com/) (client)                            |
| Notion Render    | [react-notion-x](https://github.com/NotionX/react-notion-x)                     |
| Code Editor      | Monaco Editor                                                                   |
| Color Picker     | react-color-palette                                                             |
| Syntax Highlight | Shiki + PrismJS                                                                 |

### Backend (`apps/server`)

| Layer         | Technology                                                                                 |
| ------------- | ------------------------------------------------------------------------------------------ |
| Framework     | [Hono](https://hono.dev/)                                                                  |
| Language      | TypeScript (strict mode)                                                                   |
| Effects       | [Effect.ts](https://effect.website/) (functional error handling, dependency injection)     |
| ORM           | [Drizzle ORM](https://orm.drizzle.team/) + drizzle-zod                                     |
| Database      | PostgreSQL (via Cloudflare Hyperdrive)                                                     |
| Auth          | [better-auth](https://www.better-auth.com/) with Drizzle adapter                           |
| OAuth         | Google + Notion                                                                            |
| Cache         | Cloudflare KV                                                                              |
| Storage       | Cloudflare R2 (S3-compatible)                                                              |
| Rate Limiting | [hono-rate-limiter](https://github.com/rhinofi/hono-rate-limiter) with Cloudflare bindings |
| Validation    | [Zod](https://zod.dev/) + @hono/zod-validator                                              |

### Shared Packages

| Package               | Purpose                                                                    |
| --------------------- | -------------------------------------------------------------------------- |
| `packages/notion-api` | Type-safe Notion API client with plugin system (markdown, HTML, block-map) |
| `packages/notion-orm` | ORM layer for Notion databases with query builders and filters             |
| `packages/cli`        | Schema management, comparison, and push tooling                            |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) >= 18
- [pnpm](https://pnpm.io/) 9.x
- PostgreSQL (local or remote)
- Cloudflare account (for deployment)
- Notion integration (for OAuth)
- Google OAuth credentials (optional)

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd nastro

# Install dependencies
pnpm install

# Set up environment variables
cp apps/server/.env.example apps/server/.env
cp apps/web/.env.example apps/web/.env
```

### Environment Variables

#### `apps/server/.env`

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5444/postgres
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_secret
NOTION_CLIENT_ID=your_notion_client_id
NOTION_CLIENT_SECRET=your_notion_secret
CLIENT_URL=http://localhost:3000
```

#### `apps/web/.env`

```env
VITE_API_URL=http://localhost:8000
```

### Database Setup

```bash
cd apps/server

# Push schema to database
pnpm db:push

# Or open Drizzle Studio
pnpm db:studio
```

### Development

```bash
# Start all apps in development mode
pnpm dev

# Or start individually
pnpm dev --filter=web      # Frontend only (port 3000)
pnpm dev --filter=server   # Backend only (port 8000)
```

### Build

```bash
# Build all apps
pnpm build

# Build specific app
pnpm build --filter=web
pnpm build --filter=server
```

### Lint & Format

```bash
pnpm lint           # Lint all apps
pnpm format         # Format with Prettier
pnpm check-types    # TypeScript type checking
```

## Development Workflow

### Root Commands (via Turbo)

```bash
pnpm build          # Build all apps
pnpm dev            # Start all apps in dev mode
pnpm lint           # Lint all apps
pnpm format         # Format code
pnpm check-types    # TypeScript checking
```

### Individual App Commands

**Server (Cloudflare Workers):**

```bash
cd apps/server
pnpm dev             # Start wrangler dev (port 8000)
pnpm deploy          # Deploy to Cloudflare
pnpm cf-typegen      # Generate Cloudflare binding types
pnpm db:push         # Push Drizzle schema
pnpm db:studio       # Open Drizzle Studio
```

**Web (TanStack Start):**

```bash
cd apps/web
pnpm dev             # Start Vite dev server (port 3000)
pnpm build           # Build for production
pnpm preview         # Preview production build
pnpm deploy          # Lint + build + deploy to Cloudflare Pages
```

## Database Schema

The database uses PostgreSQL with Drizzle ORM. Key entities:

| Table      | Purpose                                                  |
| ---------- | -------------------------------------------------------- |
| `user`     | Authenticated users (better-auth)                        |
| `session`  | User sessions (better-auth)                              |
| `account`  | OAuth accounts (better-auth)                             |
| `site`     | Published Notion sites (slug, settings, theme, template) |
| `theme`    | Customizable themes (JSON settings, public/private)      |
| `template` | Pre-built site templates (paid/free)                     |

### Relationships

- `site` → `user` (many-to-one)
- `site` → `theme` (many-to-one, optional)
- `site` → `template` (many-to-one, optional)
- `theme` → `user` (many-to-one)
- `template` → `user` (many-to-one)

### Schema Files

```
apps/server/src/db/schema/
├── auth-schema.ts    # User, session, account, verification
├── site.ts           # Site entity with settings
├── theme.ts          # Theme entity with JSON settings
└── template.ts       # Template entity with pricing
```

## API Design

The backend follows a layered architecture with Effect.ts for composable, type-safe services.

### Layers

```
API Routes (Hono)
    ↓
Services (Effect.ts)     ← Business logic, caching, external APIs
    ↓
Repositories (Effect.ts) ← Database queries via Drizzle
    ↓
Database (Drizzle ORM)   ← PostgreSQL via Hyperdrive
```

### API Routes

| Route                  | Description                        |
| ---------------------- | ---------------------------------- |
| `POST/GET /api/auth/*` | better-auth endpoints              |
| `GET /api/site`        | Fetch public site by slug + pageId |
| `GET /api/site/all`    | List user's sites                  |
| `POST /api/site`       | Create new site                    |
| `PATCH /api/site/:id`  | Update site                        |
| `DELETE /api/site/:id` | Delete site                        |
| `GET /api/notion/page` | List user's Notion pages           |
| `GET /api/theme`       | List themes                        |
| `GET /api/template`    | List templates                     |
| `POST /api/upload/*`   | Presigned URLs for R2 uploads      |

### Error Handling

All errors are typed using Effect.ts tagged errors:

- `SiteError` — Site not found, not public, slug conflicts
- `NotionError` — API failures, page not found, missing tokens
- `SlugServiceError` — Slug validation, availability
- `DatabaseError` — Connection failures
- `KVStoreError` — Cache read/write failures

### Type-Safe Client

The `server` package exports a typed Hono client:

```typescript
import { hcWithType } from "server/hc";

const client = hcWithType("https://api.nastro.xyz");
const res = await client.api.site.$get({ query: { slug, rootPageId } });
```

## Key Features

### 🎨 Customization

- Full theme system (colors, fonts, spacing, layouts)
- Custom CSS/JS injection per site
- Template marketplace (free + paid)
- Real-time preview in site editor

### 🚀 Publishing

- Custom subdomains (`yourname.nastro.xyz`)
- Custom domain support
- SEO optimization (meta tags, OG images, favicons)
- Google Analytics 4 integration

### 📝 Notion Integration

- One-click Notion OAuth
- Automatic page sync
- Support for all Notion block types
- Public page validation

### 🔒 Auth & Security

- OAuth via Google and Notion
- Session-based authentication
- Rate limiting per endpoint
- CORS configured for custom domains

## Deployment

Both apps deploy to Cloudflare's edge network.

### Server (Cloudflare Workers)

```bash
cd apps/server
pnpm deploy
```

**Wrangler Config:**

- Service: `nastro-api`
- Custom domain: `api.nastro.xyz`
- Database: Hyperdrive → PostgreSQL
- Cache: KV namespace (`NASTRO_KV`)
- Storage: R2 buckets (`TEMPLATES_BUCKET`, `SITES_BUCKET`)

### Web (Cloudflare Pages)

```bash
cd apps/web
pnpm deploy
```

**Wrangler Config:**

- Service: `nastro`
- Custom domain: `nastro.xyz`
- Wildcard: `*.nastro.site/*` (for user subdomains)
- SSR via TanStack Start server entry

## Auth Configuration

Auth is handled by [better-auth](https://www.better-auth.com/) with the following providers:

| Provider   | Use Case                           |
| ---------- | ---------------------------------- |
| **Google** | Standard OAuth login               |
| **Notion** | OAuth + content access permissions |

Both providers support account linking (users can connect both Google and Notion to the same account).

## Code Style

### TypeScript

- Strict mode enabled
- Explicit return types for functions
- No `any` — use explicit types
- Path aliases: `@/*` for internal imports

### Naming Conventions

- **Files**: `kebab-case.ts` (e.g., `auth-client.ts`)
- **Components**: `PascalCase.tsx` (e.g., `SiteHeader.tsx`)
- **Utilities**: `camelCase` (e.g., `cn()`, `getDB()`)

### Imports

- Named imports preferred
- Grouped: external → internal → relative
- Path aliases over relative paths when possible

### React Components

- Functional components with explicit prop types
- TypeScript interfaces for complex props
- Small, focused components

## Roadmap

- [ ] Custom domain SSL automation
- [ ] E-commerce integrations
- [ ] Advanced analytics dashboard

## License

[MIT](LICENSE)

---

Built with ❤️ using Notion, React, and Cloudflare.
