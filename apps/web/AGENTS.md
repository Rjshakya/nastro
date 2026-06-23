# AGENTS.md — Nastro Web (TanStack Start Frontend)

This document gives agentic coding assistants the context needed to work safely and consistently in `apps/web`.

> **App in one sentence:** The Nastro frontend — TanStack Start + React + Vite + Tailwind CSS v4 + shadcn/ui.

## 1. Overview

The web frontend is built with:

- **TanStack Start** — full-stack React framework with file-based routing and server functions
- **React 19** + **Vite 8**
- **Tailwind CSS v4** — CSS-first configuration
- **shadcn/ui v4** — UI primitives built on `@base-ui/react`
- **Zustand** — client state
- **SWR** — server cache / mutations
- **better-auth** — auth client
- **@tabler/icons-react** + **lucide-react** — icons

> ⚠️ This is **not** Astro. Older docs may say Astro; this file and `README.md` are the source of truth.

## 2. Directory Structure

```
apps/web/src
├── components/          # React components
│   ├── ui/              # shadcn/ui primitives
│   ├── notion/          # Notion-specific renderers
│   └── *.tsx            # app-level components
├── hooks/               # SWR-based data hooks
├── lib/                 # utilities + API client
├── routes/              # TanStack Router file-based routes
│   ├── __root.tsx
│   ├── _app/            # authenticated app shell
│   ├── _live_site/      # public rendered sites
│   └── _marketing/      # public marketing pages
├── schemas/             # Zod schemas
├── server.ts            # TanStack Start server entry
├── router.tsx           # router entry
├── routeTree.gen.ts     # generated route tree
├── stores/              # Zustand stores
├── styles/              # Tailwind + global styles
└── types/               # domain types
```

## 3. Development Commands

```bash
cd apps/web

pnpm dev              # Vite dev server (port 3000)
pnpm build            # production build
pnpm preview          # preview production build
pnpm deploy           # lint + build + wrangler deploy
pnpm typecheck        # tsc --noEmit
pnpm lint             # oxlint
pnpm fmt              # oxfmt
```

## 4. Routing

Routes are file-based via TanStack Router. The generated tree is in `src/routeTree.gen.ts` (do not edit manually).

```tsx
// src/routes/_app/dashboard/route.tsx
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/dashboard")({
  component: DashboardPage,
  errorComponent: Error,
});
```

### Layout groups

- `__root.tsx` — root layout (html, meta, providers)
- `_app/` — authenticated app shell; uses `beforeLoad: protectedLoader`
- `_live_site/` — public rendered Notion sites
- `_marketing/` — public marketing pages + custom-domain fallback

### Route loaders

```tsx
export const Route = createFileRoute("/_app/site/$pageId")({
  loaderDeps({ search: { slug } }) {
    return { slug };
  },
  loader: async ({ params, deps }) => {
    const { pageId } = params;
    const { slug } = deps;
    const { data } = await getSite({ rootPageId: pageId, slug });
    return { site: data?.site, page: data?.page, slug };
  },
  component: SiteEditorPage,
  errorComponent: Error,
});
```

### Server functions

```ts
import { createServerFn } from "@tanstack/react-start";

export const myServerFn = createServerFn()
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    // runs on the server
    return { ok: true };
  });
```

## 5. Component Patterns

Functional components with explicit prop types.

```tsx
interface SiteHeaderProps {
  siteName: string;
}

export function SiteHeader({ siteName }: SiteHeaderProps) {
  return <header>...</header>;
}
```

### shadcn/ui + `cn()`

```tsx
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

<Button variant="outline" className={cn("ml-auto", isActive && "bg-primary")}>
  Save
</Button>;
```

Use `cn()` everywhere for class merging.

## 6. State Management

### Zustand

Small, focused stores in `src/stores/`.

```ts
import { create } from "zustand";

interface CreateSiteStore {
  openDialog: boolean;
  setOpenDialog: (b: boolean) => void;
}

export const useCreateSiteStore = create<CreateSiteStore>((set) => ({
  openDialog: false,
  setOpenDialog(b) {
    set({ openDialog: b });
  },
}));
```

Stores can read each other via `.getState()` when needed.

### SWR for server data

```ts
import useSWR from "swr";

export const useSites = () => {
  const fetcher = () => getSites();
  const swr = useSWR("/sites", fetcher);
  return {
    data: swr.data?.data as Site[],
    isLoading: swr.isLoading,
    mutate: swr.mutate,
  };
};
```

Mutations use `useSWRMutation`, then `router.invalidate({ sync: true })` to refresh route data.

## 7. API Client

The web imports the typed Hono client from `server/hc`.

```ts
import { Env } from "@/lib/env";
import { hcWithType, type serverTypes } from "server/hc";

export const client = hcWithType(Env.apiUrl, {
  init: { credentials: "include" },
});

export type { serverTypes as ApiTypes };
```

### Making calls

```ts
const res = await client.api.site[":id"].$patch({
  param: { id: siteId },
  json: input,
  query: { pageId },
});

if (!res.ok) {
  const error = await res.json();
  handleHttpError()({
    message: error?.message,
    statusCode: res.status,
    error,
    throwError: true,
    showToast: true,
  });
}

return res.json();
```

### Error helper

```ts
import { handleHttpError } from "@/lib/error";

handleHttpError()({
  message: "Failed to load",
  statusCode: 500,
  error,
  throwError: true,
  showToast: true,
});
```

## 8. Styling

Tailwind CSS v4 uses CSS-first config in `src/styles/styles.css`.

```css
@import "tailwindcss";
@import "tw-animate-css";

:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.148 0.004 228.8);
  --primary: oklch(0.508 0.118 165.612);
  /* ... */
}

@theme inline {
  --color-background: var(--background);
  --color-primary: var(--primary);
  --font-sans: "Manrope Variable", sans-serif;
}
```

### `cn()` utility

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

## 9. Form & Input Patterns

Controlled inputs with local state or Zustand.

```tsx
const { settings, updateGeneral } = useSiteSettingStore();
const general = settings.general;

<Input
  value={general.pageWidth}
  onChange={(e) =>
    updateGeneral({ ...general, pageWidth: Number(e.target.value) })
  }
/>;
```

For file uploads, use a hidden file input and helper functions from `@/lib/upload`.

## 10. Live Site Rendering

Live sites are rendered via `src/routes/_live_site/$pageId.tsx` and `src/lib/live-site.ts`.

- `liveSiteLoader` fetches from `/api/site` using the current pageId and resolved slug.
- `customDomainSiteLoader` fetches from `/api/custom-domain/site` using hostname.
- `buildLiveSiteHead` generates meta tags, OG image, GA4 scripts, custom CSS/JS links, and inline CSS variables.
- `NotionRenderer` renders the Notion page with `react-notion-x`.

Slugs are resolved from subdomain or search param:

```ts
const resolveSlug = (baseSlug?: string) => {
  if (baseSlug) return baseSlug;

  const req = getRequest();
  const host = new URL(req.url).hostname;

  if (host.includes(Env.subdomain)) {
    return host.split(`.${Env.subdomain}`)[0].trim();
  }
  return "";
};
```

## 11. Environment Variables

Client-side env vars must be prefixed with `VITE_PUBLIC_`.

```env
VITE_PUBLIC_API_URL=http://localhost:8000
VITE_PUBLIC_CLIENT_URL=http://localhost:3000
VITE_PUBLIC_GOOGLE_FONTS_API_KEY=
VITE_PUBLIC_ENVIRONMENT=development
VITE_PUBLIC_SUBDOMAIN=nastro.site
```

Access via `src/lib/env.ts`:

```ts
export const Env = {
  apiUrl: import.meta.env.VITE_PUBLIC_API_URL as string,
  clientUrl: import.meta.env.VITE_PUBLIC_CLIENT_URL as string,
  subdomain: import.meta.env.VITE_PUBLIC_SUBDOMAIN as string,
};
```

## 12. Code Style Specifics

- File names: `kebab-case.ts` / `kebab-case.tsx`
- Components: `PascalCase.tsx`
- Hooks: `useCamelCase.ts`
- Stores: `*.store.ts`
- Utilities: `camelCase.ts`
- Prefer `@/*` imports over relative imports.
- Use named imports.
- Group imports: external → workspace → `@/...` → relative.
- Use `oxlint` / `oxfmt` for linting/formatting.
- Prettier config exists but the active formatter is `oxfmt`.

## 13. Common Gotchas

1. **Client env vars:** Only `VITE_PUBLIC_*` variables are exposed to the browser. Server-side env vars are read from Wrangler bindings in `worker-configuration.d.ts`.
2. **Route tree:** After adding/deleting route files, the generated `routeTree.gen.ts` updates automatically in dev. Run `pnpm dev` if it seems stale.
3. **Server functions:** Validate inputs with Zod inside `createServerFn().inputValidator(...)`.
4. **Live site CSS variables:** Computed styles are injected into a `<style id="LIVE_SITE_STYLES">` tag. Mutating it directly is sometimes necessary for real-time preview.
5. **Typed Hono client:** The web depends on `server/hc`. Do not change server route contracts without updating callers here.
6. **Auth:** Use `protectedLoader` from `@/lib/auth-client` on authenticated routes.
