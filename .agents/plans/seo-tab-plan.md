# SEO Tab Implementation Plan

## Overview

Create a simple SEO tab component following the TabGeneral pattern - props-based configuration with dynamic rendering.

## Current State Analysis

### TabGeneral Pattern (Already Working)

```typescript
// tab-general.tsx
export interface TabGeneralProps {
  siteName?: { type: string; label: string };
  pageWidth?: { type: string; label: string; min: number; max: number };
  header?: { type: string; label: string };
  footer?: { type: string; label: string };
}

export function TabGeneral({ tabProps }: { tabProps: TabGeneralProps }) {
  // Dynamically renders based on tabProps types
}
```

### SEO Type (From customization.ts)

```typescript
export interface SEO {
  title?: string;
  description?: string;
  ogImage?: string;
  pageUrl?: string;
  pageTitle?: string;
  pageIcon?: string;
}
```

## Implementation Plan

### Step 1: Create TabSeo Component

**File**: `apps/tanstack/src/components/site/settings/tabs/tab-seo.tsx`

```typescript
import { useNotionSettingsStore } from "#/stores/notion-settings";
import type { SEO } from "#/types/customization";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface TabSeoProps {
  title?: { type: string; label: string };
  description?: { type: string; label: string };
  ogImage?: { type: string; label: string };
  pageUrl?: { type: string; label: string };
  pageTitle?: { type: string; label: string };
  pageIcon?: { type: string; label: string };
}

export function TabSeo({ tabProps }: { tabProps: TabSeoProps }) {
  const { settings, updateSettings } = useNotionSettingsStore();

  return (
    <div className="space-y-4">
      {Object.entries(tabProps).map(([k, v]) => (
        <div key={k} className="space-y-2">
          <Label htmlFor={k}>{v.label}</Label>
          <Input
            id={k}
            value={settings?.seo?.[k as keyof SEO] as string}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updateSettings({
                ...settings,
                seo: { ...settings?.seo, [k]: e.target.value },
              })
            }
            placeholder={v.label}
          />
        </div>
      ))}
    </div>
  );
}
```

### Step 2: Add SEO Config in Parent

**File**: `apps/tanstack/src/components/site/settings/settings.tsx`

Add import:

```typescript
import { TabSeo, type TabSeoProps } from "./tabs/tab-seo";
```

Add config:

```typescript
const seoSections: TabSeoProps = {
  title: { label: "Page Title", type: "text" },
  description: { label: "Description", type: "text" },
  ogImage: { label: "OG Image URL", type: "text" },
  pageUrl: { label: "Page URL", type: "text" },
  pageTitle: { label: "Page Title (SEO)", type: "text" },
  pageIcon: { label: "Page Icon URL", type: "text" },
};
```

### Step 3: Update Tab Rendering

In settings.tsx TabsContent:

```typescript
{key === "seo" ? (
  <TabSeo tabProps={seoSections} />
) : null}
```

## Key Design Decisions

1. **Simple Type**: All fields are `type: "text"` - no special handling needed
2. **Consistent Pattern**: Follows exact same pattern as TabGeneral
3. **Dynamic Rendering**: Maps through tabProps to render inputs
4. **Store Integration**: Uses `useNotionSettingsStore` for state management

## Fields to Include

**Keys must match SEO interface exactly:**

| Key         | Type | Label            |
| ----------- | ---- | ---------------- |
| title       | text | Page Title       |
| description | text | Description      |
| ogImage     | text | OG Image URL     |
| pageUrl     | text | Page URL         |
| pageTitle   | text | Page Title (SEO) |
| pageIcon    | text | Page Icon URL    |

## File Changes

1. **NEW**: `apps/tanstack/src/components/site/settings/tabs/tab-seo.tsx`
   - TabSeoProps interface
   - TabSeo component

2. **MODIFY**: `apps/tanstack/src/components/site/settings/settings.tsx`
   - Import TabSeo
   - Add seoSections config
   - Update tab rendering

## Success Criteria

- [ ] TabSeo component created following TabGeneral pattern
- [ ] All 4 SEO fields render as text inputs
- [ ] Values save to store correctly
- [ ] No unnecessary complexity
- [ ] Clean, simple code
