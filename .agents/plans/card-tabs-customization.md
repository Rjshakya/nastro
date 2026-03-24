# Card and Tabs Customization Implementation Plan (Revised)

## Research Summary

Based on deep analysis of the codebase, the theme/customization system follows this architecture:

```
Settings (TypeScript Objects in types/notion-page-settings.ts)
    ↓
Compute Functions (stores/notion-settings.ts - computeLayout())
    ↓
CSS Variables (types/notion-page-styles.ts)
    ↓
Applied to DOM (notion-renderer.tsx via style prop)
    ↓
Styled via CSS (styles/notion.css)
```

### Key Findings

**Current State:**

1. **LayoutCardUI** (`types/notion-page-settings.ts:156-158`): Only has `borderSize?: number`
2. **LayoutCardCoverUI** (`types/notion-page-settings.ts:161-168`): Separate type with `height`, `radius`, `paddingX/Y`, `marginX/Y`
3. **LayoutCardBodyUI** (`types/notion-page-settings.ts:171-176`): Separate type with `paddingX/Y`, `marginX/Y`
4. **LayoutSettingsUI** (`types/notion-page-settings.ts:178-186`): Has `card`, `cardCover`, `cardBody` as separate properties

**Required Changes:**

1. **Card Restructure**: Nest `cover` and `body` inside `LayoutCardUI` - one container for all card settings
2. **Card Fields**: Only add `paddingX` and `paddingY` (NO radius)
3. **Tabs Simplification**: ONE tab section only with:
   - display (show/hide tab row)
   - background color
   - active background color

---

## Implementation Plan

### Phase 1: Card Restructure

#### 1.1 Update Type Definitions

**File:** `apps/tanstack/src/types/notion-page-settings.ts`

**REMOVE separate types and UPDATE LayoutCardUI:**

```typescript
// REMOVE these separate types (keep them for reference but merge into LayoutCardUI):
// - LayoutCardCoverUI
// - LayoutCardBodyUI

// REPLACE LayoutCardUI with nested structure:
export type LayoutCardUI = {
  borderSize?: number;
  paddingX?: number; // NEW: Card container padding X
  paddingY?: number; // NEW: Card container padding Y
  cover?: {
    // NEW: Nested cover settings
    height?: number;
    radius?: number;
    paddingX?: number;
    paddingY?: number;
    marginX?: number;
    marginY?: number;
  };
  body?: {
    // NEW: Nested body settings
    paddingX?: number;
    paddingY?: number;
    marginX?: number;
    marginY?: number;
  };
};

// UPDATE LayoutSettingsUI - REMOVE cardCover and cardBody:
export interface LayoutSettingsUI {
  header?: LayoutHeaderUI;
  footer?: LayoutFooterUI;
  sidebar?: LayoutHeaderUI;
  gallery?: LayoutGalleryUI;
  card?: LayoutCardUI; // Now includes cover and body
  // REMOVE: cardCover?: LayoutCardCoverUI;
  // REMOVE: cardBody?: LayoutCardBodyUI;
  tabs?: LayoutTabsUI; // NEW: Simple tabs settings
}
```

#### 1.2 Add Tabs Type

**File:** `apps/tanstack/src/types/notion-page-settings.ts`

Add new type:

```typescript
// NEW: Simple Tabs Settings
export type LayoutTabsUI = {
  display?: "flex" | "none"; // Show/hide tab row
  backgroundColor?: string; // Tab background color
  activeBackgroundColor?: string; // Active tab background color
};
```

#### 1.3 Update CSS Variable Types

**File:** `apps/tanstack/src/types/notion-page-styles.ts`

Keep existing card CSS vars (they're already correct for cover/body). Add tabs:

```typescript
// Tabs (NEW)
"--notion-collection-tab-row-display"?: string;
"--notion-collection-tab-bg"?: string;
"--notion-collection-tab-active-bg"?: string;
```

#### 1.4 Update Default Values

**File:** `apps/tanstack/src/lib/settings-defaults.ts`

**REPLACE** `defaultLayoutSettings` card section:

```typescript
// REPLACE this:
card: {
  borderSize: 1,
},
cardCover: {
  height: 200,
  radius: 10,
  paddingX: 0,
  paddingY: 0,
  marginX: 0,
  marginY: 0,
},
cardBody: {
  paddingX: 12,
  paddingY: 12,
  marginX: 0,
  marginY: 0,
},

// WITH this:
card: {
  borderSize: 1,
  paddingX: 0,
  paddingY: 0,
  cover: {
    height: 200,
    radius: 10,
    paddingX: 0,
    paddingY: 0,
    marginX: 0,
    marginY: 0,
  },
  body: {
    paddingX: 12,
    paddingY: 12,
    marginX: 0,
    marginY: 0,
  },
},

// ADD tabs defaults:
tabs: {
  display: "flex",
  backgroundColor: "transparent",
  activeBackgroundColor: "var(--accent)",
},
```

#### 1.5 Update Compute Logic

**File:** `apps/tanstack/src/stores/notion-settings.ts`

**REPLACE** `computeLayout` function card section (around line 243):

```typescript
// Card Border Size
if (layout?.card?.borderSize !== undefined) {
  styles["--notion-collection-card-border-size"] =
    layout.card.borderSize + "px";
}

// NEW: Card Padding
if (layout?.card?.paddingX !== undefined) {
  styles["--notion-collection-card-padding-x"] = layout.card.paddingX + "px";
}
if (layout?.card?.paddingY !== undefined) {
  styles["--notion-collection-card-padding-y"] = layout.card.paddingY + "px";
}

// Card Cover (NOW NESTED under card.cover)
if (layout?.card?.cover) {
  const cover = layout.card.cover;
  if (cover.height !== undefined) {
    styles["--notion-collection-card-cover-height"] = cover.height + "px";
  }
  if (cover.radius !== undefined) {
    styles["--notion-collection-card-cover-radius"] = cover.radius + "px";
  }
  if (cover.paddingX !== undefined) {
    styles["--notion-collection-card-cover-padding-x"] = cover.paddingX + "px";
  }
  if (cover.paddingY !== undefined) {
    styles["--notion-collection-card-cover-padding-y"] = cover.paddingY + "px";
  }
  if (cover.marginX !== undefined) {
    styles["--notion-collection-card-cover-margin-x"] = cover.marginX + "px";
  }
  if (cover.marginY !== undefined) {
    styles["--notion-collection-card-cover-margin-y"] = cover.marginY + "px";
  }
}

// Card Body (NOW NESTED under card.body)
if (layout?.card?.body) {
  const body = layout.card.body;
  if (body.paddingX !== undefined) {
    styles["--notion-collection-card-body-padding-x"] = body.paddingX + "px";
  }
  if (body.paddingY !== undefined) {
    styles["--notion-collection-card-body-padding-y"] = body.paddingY + "px";
  }
  if (body.marginX !== undefined) {
    styles["--notion-collection-card-body-margin-x"] = body.marginX + "px";
  }
  if (body.marginY !== undefined) {
    styles["--notion-collection-card-body-margin-y"] = body.marginY + "px";
  }
}

// NEW: Tabs
if (layout?.tabs?.display !== undefined) {
  styles["--notion-collection-tab-row-display"] = layout.tabs.display;
}
if (layout?.tabs?.backgroundColor !== undefined) {
  styles["--notion-collection-tab-bg"] = layout.tabs.backgroundColor;
}
if (layout?.tabs?.activeBackgroundColor !== undefined) {
  styles["--notion-collection-tab-active-bg"] =
    layout.tabs.activeBackgroundColor;
}
```

#### 1.6 Update Settings UI

**File:** `apps/tanstack/src/components/site/settings/tabs/tab-layout.tsx`

**REPLACE** the layoutSections array with restructured card section:

```typescript
export const layoutSections: TabLayoutProps["sections"] = [
  // ... header, footer, sidebar sections remain ...

  {
    id: "gallery",
    label: "Gallery Grid",
    fields: [
      {
        key: "gridGap",
        label: "Grid Gap (px)",
        type: "number",
        min: 0,
        max: 50,
        step: 1,
      },
    ],
  },

  // REPLACE card, cardCover, cardBody sections WITH this unified card section:
  {
    id: "card",
    label: "Card",
    fields: [
      // Card Container
      {
        key: "borderSize",
        label: "Border Size (px)",
        type: "number",
        min: 0,
        max: 10,
        step: 1,
      },
      {
        key: "paddingX",
        label: "Container Padding X (px)",
        type: "number",
        min: 0,
        max: 50,
        step: 1,
      },
      {
        key: "paddingY",
        label: "Container Padding Y (px)",
        type: "number",
        min: 0,
        max: 50,
        step: 1,
      },
      // Card Cover
      {
        key: "cover.height",
        label: "Cover Height (px)",
        type: "number",
        min: 50,
        max: 500,
        step: 10,
      },
      {
        key: "cover.radius",
        label: "Cover Radius (px)",
        type: "number",
        min: 0,
        max: 50,
        step: 1,
      },
      {
        key: "cover.paddingX",
        label: "Cover Padding X (px)",
        type: "number",
        min: 0,
        max: 50,
        step: 1,
      },
      {
        key: "cover.paddingY",
        label: "Cover Padding Y (px)",
        type: "number",
        min: 0,
        max: 50,
        step: 1,
      },
      {
        key: "cover.marginX",
        label: "Cover Margin X (px)",
        type: "number",
        min: 0,
        max: 50,
        step: 1,
      },
      {
        key: "cover.marginY",
        label: "Cover Margin Y (px)",
        type: "number",
        min: 0,
        max: 50,
        step: 1,
      },
      // Card Body
      {
        key: "body.paddingX",
        label: "Body Padding X (px)",
        type: "number",
        min: 0,
        max: 50,
        step: 1,
      },
      {
        key: "body.paddingY",
        label: "Body Padding Y (px)",
        type: "number",
        min: 0,
        max: 50,
        step: 1,
      },
      {
        key: "body.marginX",
        label: "Body Margin X (px)",
        type: "number",
        min: 0,
        max: 50,
        step: 1,
      },
      {
        key: "body.marginY",
        label: "Body Margin Y (px)",
        type: "number",
        min: 0,
        max: 50,
        step: 1,
      },
    ],
  },

  // NEW: Simple Tabs Section
  {
    id: "tabs",
    label: "Tabs",
    fields: [
      {
        key: "display",
        label: "Display",
        type: "select", // Use select for flex/none
        options: [
          { label: "Show", value: "flex" },
          { label: "Hide", value: "none" },
        ],
      },
      {
        key: "backgroundColor",
        label: "Background Color",
        type: "color", // Use color picker
      },
      {
        key: "activeBackgroundColor",
        label: "Active Background",
        type: "color", // Use color picker
      },
    ],
  },
];
```

**UPDATE** the field change handler to support nested keys:

```typescript
const handleFieldChange = (
  sectionId: keyof LayoutSettingsUI,
  fieldKey: string, // Can be "paddingX" or "cover.height" or "body.paddingX"
  fieldValue: string | number | undefined,
) => {
  const currentLayoutSettings = settings?.layout;
  const currentSection = currentLayoutSettings?.[sectionId] as
    | Record<string, unknown>
    | undefined;

  // Handle nested keys like "cover.height" or "body.paddingX"
  if (fieldKey.includes(".")) {
    const [parentKey, childKey] = fieldKey.split(".");
    const parentObj =
      (currentSection?.[parentKey] as Record<string, unknown>) || {};

    updateSettings({
      ...settings,
      layout: {
        ...currentLayoutSettings,
        [sectionId]: {
          ...currentSection,
          [parentKey]: {
            ...parentObj,
            [childKey]: fieldValue,
          },
        },
      },
    });
  } else {
    // Simple key
    updateSettings({
      ...settings,
      layout: {
        ...currentLayoutSettings,
        [sectionId]: {
          ...currentSection,
          [fieldKey]: fieldValue,
        },
      },
    });
  }
};
```

**UPDATE** the value lookup in the render:

```typescript
// In the render section where it gets currentValue:
const getFieldValue = (sectionData: any, key: string) => {
  if (key.includes(".")) {
    const [parentKey, childKey] = key.split(".");
    return sectionData?.[parentKey]?.[childKey];
  }
  return sectionData?.[key];
};

// Usage:
const currentValue = getFieldValue(sectionData, field.key);
```

#### 1.7 Update CSS Styles

**File:** `apps/tanstack/src/styles/notion.css`

Update `.notion-collection-card` (around line 146):

```css
.notion-collection-card {
  background-color: var(--notion-collection-card) !important;
  border: var(--notion-collection-card-border-size) solid
    var(--notion-collection-card-border) !important;
  border-radius: var(--radius) !important; /* Keep using global radius */
  color: var(--notion-collection-card-text);
  box-shadow: none !important;
  padding-inline: var(--notion-collection-card-padding-x);
  padding-block: var(--notion-collection-card-padding-y);
}
```

Update tabs CSS (around line 177):

```css
.notion-collection-view-tabs-row {
  gap: 4px;
  display: var(--notion-collection-tab-row-display);
  margin-bottom: 16px;

  .notion-collection-view-type-icon {
    display: none;
  }

  .notion-collection-view-tabs-content-item {
    line-height: normal;
    border-radius: var(--radius);
    display: grid;
    padding: 10px;
    height: 14px;
    background-color: var(--notion-collection-tab-bg);
    transition: background-color 350ms ease-in-out;

    .notion-collection-view-type {
      width: 100%;
      opacity: 70%;

      .notion-collection-view-type-title {
        width: 100%;
        font-family: var(--font-sans);
        overflow: visible;
        color: var(--fg-color);
      }
    }
  }

  .notion-collection-view-tabs-content-item:hover {
    background-color: var(--accent);
    border-radius: var(--radius);
  }

  .notion-collection-view-tabs-content-item-active {
    border-bottom: 0;
    background-color: var(--notion-collection-tab-active-bg);
    border-radius: var(--radius);
    font-weight: 500;
  }
}
```

#### 1.8 Update Global CSS Defaults

**File:** `apps/tanstack/src/styles/global.css`

Update card defaults (around line 93):

```css
/* notion-card */
--notion-collection-card: oklch(1 0 0);
--notion-collection-card-border: oklch(0.922 0 0);
--notion-collection-card-border-size: 1px;
--notion-collection-card-text: oklch(0.145 0 0);
--notion-collection-card-hover: oklch(0.97 0 0);

/* Card container padding (NEW) */
--notion-collection-card-padding-x: 0px;
--notion-collection-card-padding-y: 0px;

/* Card cover */
--notion-collection-card-cover-height: 200px;
--notion-collection-card-cover-radius: 0.625rem;
--notion-collection-card-cover-padding-x: 0px;
--notion-collection-card-cover-padding-y: 0px;
--notion-collection-card-cover-margin-x: 0px;
--notion-collection-card-cover-margin-y: 0px;

/* Card body */
--notion-collection-card-body-padding-x: 12px;
--notion-collection-card-body-padding-y: 12px;
--notion-collection-card-body-margin-x: 0px;
--notion-collection-card-body-margin-y: 0px;

/* Tabs (NEW) */
--notion-collection-tab-row-display: flex;
--notion-collection-tab-bg: transparent;
--notion-collection-tab-active-bg: var(--accent);
```

#### 1.9 Update getDefaultSettings

**File:** `apps/tanstack/src/lib/settings-defaults.ts`

**REPLACE** the layout merging in `getDefaultSettings`:

```typescript
layout: {
  ...defaultLayoutSettings(seo?.title, seo?.pageIcon),
  ...existingSettings?.layout,
  header: {
    ...defaultLayoutSettings(seo?.title, seo?.pageIcon)?.header,
    ...existingSettings?.layout?.header,
  },
  footer: {
    ...defaultLayoutSettings(seo?.title, seo?.pageIcon)?.footer,
    ...existingSettings?.layout?.footer,
  },
  gallery: {
    ...defaultLayoutSettings(seo?.title, seo?.pageIcon)?.gallery,
    ...existingSettings?.layout?.gallery,
  },
  // REPLACE card, cardCover, cardBody with unified card:
  card: {
    ...defaultLayoutSettings(seo?.title, seo?.pageIcon)?.card,
    ...existingSettings?.layout?.card,
    cover: {
      ...defaultLayoutSettings(seo?.title, seo?.pageIcon)?.card?.cover,
      ...existingSettings?.layout?.card?.cover,
    },
    body: {
      ...defaultLayoutSettings(seo?.title, seo?.pageIcon)?.card?.body,
      ...existingSettings?.layout?.card?.body,
    },
  },
  // REMOVE cardCover and cardBody
  // ADD tabs:
  tabs: {
    ...defaultLayoutSettings(seo?.title, seo?.pageIcon)?.tabs,
    ...existingSettings?.layout?.tabs,
  },
},
```

Also update `defaultNotionSettings` similarly.

---

## Phase 2: Migration Considerations

### Backward Compatibility

Since we're restructuring `cardCover` and `cardBody` into nested `card.cover` and `card.body`, we need to handle existing data:

**Option A: Migration Function (Recommended)**
Add a migration function in `lib/settings-defaults.ts`:

```typescript
const migrateLayoutSettings = (layout: any): LayoutSettingsUI => {
  if (!layout) return {};

  // Migrate old flat structure to new nested structure
  const migrated = { ...layout };

  if (layout.cardCover || layout.cardBody) {
    migrated.card = {
      ...layout.card,
      cover: layout.cardCover,
      body: layout.cardBody,
    };
    delete migrated.cardCover;
    delete migrated.cardBody;
  }

  return migrated;
};
```

Use it in `getDefaultSettings`:

```typescript
const migratedLayout = migrateLayoutSettings(existingSettings?.layout);
```

---

## Files Modified Summary

### Core Type Changes:

1. `apps/tanstack/src/types/notion-page-settings.ts`
   - Update `LayoutCardUI` with nested `cover` and `body`
   - Add `LayoutTabsUI` type
   - Update `LayoutSettingsUI` (remove cardCover/cardBody, add tabs)

2. `apps/tanstack/src/types/notion-page-styles.ts`
   - Add tabs CSS var types

### Logic Changes:

3. `apps/tanstack/src/lib/settings-defaults.ts`
   - Update `defaultLayoutSettings` with nested structure
   - Update `getDefaultSettings` merging logic
   - Update `defaultNotionSettings`
   - Add migration function

4. `apps/tanstack/src/stores/notion-settings.ts`
   - Update `computeLayout` for nested card structure
   - Add tabs compute logic

### UI Changes:

5. `apps/tanstack/src/components/site/settings/tabs/tab-layout.tsx`
   - Restructure layoutSections with unified card section
   - Add tabs section
   - Update field change handler for nested keys
   - Update value lookup for nested keys

### Style Changes:

6. `apps/tanstack/src/styles/notion.css`
   - Update card CSS with new padding vars
   - Update tabs CSS with new vars

7. `apps/tanstack/src/styles/global.css`
   - Add card padding defaults
   - Add tabs defaults

---

## Testing Checklist

**Card Restructure:**

- [ ] Existing sites with old `cardCover`/`cardBody` migrate correctly
- [ ] Card border size slider works
- [ ] Card padding X/Y sliders work
- [ ] Cover settings (height, radius, padding, margin) work
- [ ] Body settings (padding, margin) work
- [ ] All values persist after save
- [ ] Dark mode works correctly

**Tabs:**

- [ ] Display toggle (show/hide) works
- [ ] Background color picker works
- [ ] Active background color picker works
- [ ] Values persist after save
- [ ] CSS variables applied correctly

**Type Safety:**

- [ ] `pnpm check-types` passes
- [ ] No TypeScript errors in settings components
- [ ] Store updates correctly typed

---

## Architecture Pattern Reminder

```
1. types/notion-page-settings.ts → Define structure (NESTED card with cover/body)
2. types/notion-page-styles.ts → Define CSS var names
3. lib/settings-defaults.ts → Set defaults + migration
4. stores/notion-settings.ts → Compute to CSS values
5. components/site/settings/tabs/tab-layout.tsx → UI controls (handle nested keys)
6. styles/*.css → Apply CSS variables
```

**Key Difference from Original:**

- Card settings are now NESTED: `card.cover.height` instead of `cardCover.height`
- Tabs are SIMPLE: Just 3 fields (display, bg, active-bg)
- NO card radius - uses global `--radius` instead
