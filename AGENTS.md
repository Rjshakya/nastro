# AGENTS.md - Agent Coding Guidelines

This document provides guidance for agentic coding agents working in this repository.

## Project Overview

This is a monorepo using Turborepo with two main applications:

- **apps/server**: Cloudflare Workers backend using Hono, Drizzle ORM, better-auth
- **apps/web**: Astro frontend with React, Tailwind CSS v4, shadcn/ui

## Build Commands

### Root Commands (via Turbo)

```bash
pnpm build          # Build all apps
pnpm dev            # Start all apps in development mode
pnpm lint           # Lint all apps
pnpm format         # Format code with Prettier
pnpm check-types    # TypeScript type checking
```

### Individual App Commands

**Server (Cloudflare Workers):**

```bash
cd apps/server
pnpm dev             # Start wrangler dev
pnpm deploy          # Deploy to Cloudflare
pnpm cf-typegen      # Generate Cloudflare binding types
```

**Web (Astro + React):**

```bash
cd apps/web
pnpm dev             # Start Astro dev server
pnpm build           # Build for production
pnpm preview         # Preview production build
```

### Running Single Commands

Use Turbo filters to run commands on specific apps:

```bash
pnpm build --filter=server    # Build only server
pnpm dev --filter=web         # Dev only web app
pnpm lint --filter=server     # Lint only server
```

## Code Style Guidelines

### TypeScript

- Strict mode is enabled in all tsconfig files
- Always define return types for functions
- Use explicit types rather than `any`
- Path aliases: use `@/*` for relative imports (e.g., `@/lib/utils`)

### Imports

- Use named imports: `import { Button } from "@/components/ui/button"`
- Group imports: external -> internal -> relative
- Prefer path aliases over relative paths when possible

### Naming Conventions

- **Files**: kebab-case (e.g., `auth-client.ts`, `site-header.tsx`)
- **Components**: PascalCase (e.g., `SiteHeader.tsx`, `Button.tsx`)
- **Utilities**: camelCase (e.g., `cn()`, `getDB()`)
- **Constants**: SCREAMING_SNAKE_CASE where appropriate

### React/Astro Components

- Use functional components with explicit prop types
- Prefer composition over inheritance
- Use TypeScript interfaces for complex props
- Keep components small and focused

Example component structure:

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline"
  size?: "default" | "sm" | "lg" | "icon"
}

export function Button({ className, variant = "default", ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant }), className)} {...props} />
}
```

### Tailwind CSS

- Use utility classes for styling
- Use `cn()` utility from `@/lib/utils` for conditional class merging
- Follow shadcn/ui patterns with cva (class-variance-authority)
- Use CSS variables for theming where applicable

### Database (Drizzle ORM)

- Define schemas in `apps/*/src/db/schema/`
- Use migrations via drizzle-kit
- Type-safe queries with Drizzle

### Error Handling

- Use try/catch with explicit error handling
- Return appropriate HTTP status codes in API routes
- Log errors appropriately for debugging

### Cloudflare Workers

- Use `env` from "cloudflare:workers" for environment variables
- Define types in `worker-configuration.d.ts`
- Handle async operations properly

## Architecture Notes

### Shared Code

- The `server` package can be imported in `web` via `workspace:*` protocol
- Auth is handled by better-auth with social providers (Google, Notion)
- Database uses PostgreSQL with Drizzle ORM

### Environment Variables

- Server: DATABASE_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, NOTION_CLIENT_ID, NOTION_CLIENT_SECRET, CLIENT_URL
- Web: VITE\_\* variables for client-side config

### Development Workflow

1. Run `pnpm dev` from root to start both apps
2. Server runs on port 8787 (wrangler)
3. Web runs on port 4321 (astro)
4. Use Prettier before committing: `pnpm format`
