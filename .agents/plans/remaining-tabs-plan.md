# Remaining Tabs Implementation Plan

## Overview

Complete the implementation of General, Typo, and Layout tabs based on their types in `NotionPageSettings`. Follow the same pattern as TabTheme - define config in parent, pass as props, use collapsibles for complex types.

## Type Analysis

### NotionPageSettings Structure

```typescript
interface NotionPageSettings {
  general?: { siteName?: string }; // Simple string - NO collapsible
  theme?: ThemeSettingsUI; // Complex - DONE
  typo?: TypoSettingsUI; // Complex - needs collapsible
  layout?: LayoutSettingsUI; // Complex - needs collapsible
}
```

---

## 1. General Tab

### Type

```typescript
{ siteName?: string }
```

### Analysis

- Single string field
- **NO collapsible needed** - just direct input

### Implementation

- Simple form with one shadcn Input field
- No config array needed
- Direct prop access: `settings.general?.siteName`

### Fields

| Key      | Label     | Component |
| -------- | --------- | --------- |
| siteName | Site Name | Input     |

---

## 2. Typo Tab (TypoSettingsUI)

### Type

```typescript
interface TypoSettingsUI {
  sizes?: TypoSizesUI; // { pageTitle?: number; heading1?: number; heading2?: number; heading3?: number; base?: number }
  fonts?: TypoFontsUI; // { primary?: string; secondary?: string }
}
```

### Analysis

- Two sections: sizes, fonts
- Each section has multiple fields
- **Use collapsible** for each section
- **Note**: `TypoSizesUI` uses direct `number` values (not `{ value: number }`). SliderInput returns number directly.

### Config Structure (in settings-v2.tsx)

```typescript
const typoSections = [
  {
    id: "sizes",
    label: "Font Sizes",
    fields: [
      {
        key: "pageTitle",
        label: "Page Title",
        type: "number",
        min: 10,
        max: 80,
      },
      { key: "heading1", label: "Heading 1", type: "number", min: 10, max: 60 },
      { key: "heading2", label: "Heading 2", type: "number", min: 10, max: 50 },
      { key: "heading3", label: "Heading 3", type: "number", min: 10, max: 40 },
      { key: "base", label: "Base Text", type: "number", min: 10, max: 30 },
    ],
  },
  {
    id: "fonts",
    label: "Fonts",
    fields: [
      { key: "primary", label: "Primary Font", type: "font" },
      { key: "secondary", label: "Secondary Font", type: "font" },
    ],
  },
];
```

### Components

- `type: "number"` → SliderInput component (from `@/components/ui/slider-input`)
  - Pass `min` and `max` from field config
  - Use shadcn Slider internally (default styling)
- `type: "font"` → FontPicker component

---

## 3. Layout Tab (LayoutSettingsUI)

### Type

```typescript
interface LayoutSettingsUI {
  header?: LayoutHeaderUI;
  footer?: LayoutFooterUI;
  sidebar?: LayoutHeaderUI;
}

type LayoutHeaderUI = {
  text?: string;
  logo?: string;
  links?: HeaderLink[]; // Array of links
  list?: {
    text?: string;
    links?: HeaderLink[];
  };
};

type LayoutFooterUI = {
  text?: string;
  logo?: string;
  links?: HeaderLink[];
};

type HeaderLink = { text?: string; url?: string };
```

### Analysis

- Three sections: header, footer, sidebar
- Each section has:
  - Basic text fields (`text`, `logo`)
  - Optional `links` array (array of HeaderLink objects)
  - Optional `list` with text and links
- **Use collapsible** for each section

### Config Structure (in settings-v2.tsx)

```typescript
const layoutSections = [
  {
    id: "header",
    label: "Header",
    fields: [
      { key: "text", label: "Header Text", type: "text" },
      { key: "logo", label: "Logo URL", type: "text" },
    ],
    links: {
      key: "links",
      label: "Navigation Links",
      itemFields: [
        { key: "text", label: "Link Text", type: "text" },
        { key: "url", label: "URL", type: "text" },
      ],
    },
    list: {
      key: "list",
      label: "List",
      itemFields: [
        { key: "text", label: "List Text", type: "text" },
        { key: "links", label: "List Links", type: "links" },
      ],
    },
  },
  {
    id: "footer",
    label: "Footer",
    fields: [
      { key: "text", label: "Footer Text", type: "text" },
      { key: "logo", label: "Logo URL", type: "text" },
    ],
    links: {
      key: "links",
      label: "Footer Links",
      itemFields: [
        { key: "text", label: "Link Text", type: "text" },
        { key: "url", label: "URL", type: "text" },
      ],
    },
  },
  {
    id: "sidebar",
    label: "Sidebar",
    fields: [
      { key: "text", label: "Sidebar Text", type: "text" },
      { key: "logo", label: "Logo URL", type: "text" },
    ],
    links: {
      key: "links",
      label: "Sidebar Links",
      itemFields: [
        { key: "text", label: "Link Text", type: "text" },
        { key: "url", label: "URL", type: "text" },
      ],
    },
    list: {
      key: "list",
      label: "List",
      itemFields: [
        { key: "text", label: "List Text", type: "text" },
        { key: "links", label: "List Links", type: "links" },
      ],
    },
  },
];
```

### Component Behavior

#### 1. `type: "text"` → Input (shadcn)

- Standard shadcn Input component
- No custom styling

#### 2. `links` key → LinksComponent

**Structure:**

```
LinksComponent
├── Div (displays current links - text representation)
└── Popover (Add button)
    └── PopoverContent
        └── ItemForm (renders itemFields)
            ├── Input (for "text")
            ├── Input (for "url")
            └── Button ("Add Link")
```

**Behavior:**

- Shows current links in a div
- "Add" button opens shadcn Popover
- Inside Popover: form with itemFields inputs
- Add button appends new item to array

#### 3. `list` key → ListComponent

**Structure:**

```
ListComponent
├── Input (for list.text)
└── LinksComponent (for list.links)
    ├── Div (displays links)
    └── Popover (Add button with itemFields)
```

**Behavior:**

- Input field for `list.text`
- LinksComponent for `list.links` (same as above)

### Components (All shadcn, no custom styling)

- `type: "text"` → shadcn Input
- `links` key → LinksComponent with:
  - shadcn Popover for Add button
  - shadcn Input for itemFields
  - shadcn Button for Add action
- `list` key → ListComponent with:
  - shadcn Input for text
  - LinksComponent (as above)

---

## Implementation Order

### Step 1: Update TabGeneral

- File: `tabs/tab-general.tsx`
- Simple shadcn Input for siteName
- No config array needed

### Step 2: Create TabTypo with collapsibles

- File: `tabs/tab-typo.tsx`
- Props: `{ sections: TypoSection[] }`
- Use shadcn Collapsible for sizes/fonts
- SliderInput for number fields (with min/max)
- FontPicker for fonts

### Step 3: Create TabLayout with collapsibles

- File: `tabs/tab-layout.tsx`
- Props: `{ sections: LayoutSection[] }`
- Use shadcn Collapsible for header/footer/sidebar
- Render fields based on type
- For `links` key: render LinksComponent
- For `list` key: render ListComponent
- **Important**: Use shadcn components only, no custom styling

### Step 4: Update settings-v2.tsx

- Add `typoSections` config
- Add `layoutSections` config
- Pass configs to respective tabs

---

## File Changes

### settings-v2.tsx

Add configs:

- `typoSections` array
- `layoutSections` array with links and list structures

### tabs/tab-general.tsx

Rewrite to use store directly, single shadcn Input

### tabs/tab-typo.tsx

Rewrite with shadcn Collapsible, accept `sections` prop

### tabs/tab-layout.tsx

Rewrite with:

- shadcn Collapsible for sections
- LinksComponent for `links` key (with shadcn Popover)
- ListComponent for `list` key
- shadcn Input for text fields

---

## Success Criteria

- [ ] General tab: single shadcn Input, no collapsible
- [ ] Typo tab: 2 collapsible sections (sizes, fonts)
- [ ] Typo tab: SliderInput for number fields with min/max
- [ ] Layout tab: 3 collapsible sections (header, footer, sidebar)
- [ ] Layout tab: shadcn Input for `type: "text"`
- [ ] Layout tab: LinksComponent with shadcn Popover for Add button
- [ ] Layout tab: ListComponent with Input + LinksComponent
- [ ] All shadcn components use default styling (no custom styles)
- [ ] All configs defined in settings-v2.tsx
- [ ] Minimal code, no unnecessary complexity
