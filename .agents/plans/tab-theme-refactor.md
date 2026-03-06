# TabTheme Refactoring Plan

## Overview

Refactor `TabTheme` component to use collapsible sections based on `ThemeSettingsUI` type structure. Each top-level key becomes a collapsible trigger, and nested color properties (all strings) become color pickers in the content.

## Current Types

### ThemeSettingsUI (from customization.ts)

```typescript
export type ThemeSettingsUI = {
  main?: ThemeSettingsMainSection; // pageBackground, textColor, checkboxBackground (all strings)
  header?: ThemeSettingsHeaderSection; // textColor, background, buttonText, buttonBackground (all strings)
  footer?: ThemeSettingsFooterSection; // textColor, background, buttonText, buttonBackground (all strings)
  notion?: ThemeSettingsNotionSection; // gray, brown, orange, yellow, teal, blue, purple, pink, red (all strings)
  card?: ThemeSettingsCardSection; // cardBackground, cardHover, cardText, cardBorder (all strings)
  buttons?: ThemeSettingsButtonsSection; // gray, brown, orange, yellow, teal, blue, purple, pink, red (all strings)
  defaultButton?: ThemeSettingsDefaultButtonSection; // background, textColor, borderColor, hoverBackground (all strings)
};
```

### NotionCustomization (from customization.ts lines 68-98)

```typescript
export interface NotionCustomization {
  main?: NotionMainColors; // Same structure as ThemeSettingsMainSection
  header?: NotionNavbarColors; // Same structure as ThemeSettingsHeaderSection
  footer?: NotionFooterColors; // Same structure as ThemeSettingsFooterSection
  notion?: {
    // Same as ThemeSettingsNotionSection
    gray?: NotionTagColor; // But NotionTagColor has { background: string }
    brown?: NotionTagColor;
    // ... other colors
  };
  card?: NotionCardColors;
  buttons?: {
    // Same as ThemeSettingsButtonsSection
    gray?: NotionButtonColor; // But NotionButtonColor has { background: string }
    brown?: NotionButtonColor;
    // ... other colors
  };
  defaultButton?: NotionDefaultButton;
  sizes?: NotionSizes;
  fonts?: NotionFonts;
}
```

**Key Point**: In `ThemeSettingsUI`, all color values are **strings**, not nested objects. This simplifies the implementation - no special handling needed for `notion` and `buttons` sections.

## Implementation Plan

### Step 1: Create Section Configuration (Keep It Simple)

Create a minimal configuration array based directly on `ThemeSettingsUI` keys. No unnecessary complexity - just id, label, and fields.

**Important**: Define the `themeSections` array in the same file where props are passed (e.g., in `settings-v2.tsx` or the parent component). This makes it immediately visible what sections will render in the UI without jumping between files.

```typescript
const themeSections = [
  {
    id: "main",
    label: "Main Colors",
    fields: [
      { key: "pageBackground", label: "Page Background" },
      { key: "textColor", label: "Text Color" },
      { key: "checkboxBackground", label: "Checkbox Background" },
    ],
  },
  {
    id: "header",
    label: "Header Colors",
    fields: [
      { key: "background", label: "Background" },
      { key: "textColor", label: "Text Color" },
      { key: "buttonText", label: "Button Text" },
      { key: "buttonBackground", label: "Button Background" },
    ],
  },
  {
    id: "footer",
    label: "Footer Colors",
    fields: [
      { key: "background", label: "Background" },
      { key: "textColor", label: "Text Color" },
      { key: "buttonText", label: "Button Text" },
      { key: "buttonBackground", label: "Button Background" },
    ],
  },
  {
    id: "notion",
    label: "Notion Colors",
    fields: [
      { key: "gray", label: "Gray" },
      { key: "brown", label: "Brown" },
      { key: "orange", label: "Orange" },
      { key: "yellow", label: "Yellow" },
      { key: "teal", label: "Teal" },
      { key: "blue", label: "Blue" },
      { key: "purple", label: "Purple" },
      { key: "pink", label: "Pink" },
      { key: "red", label: "Red" },
    ],
  },
  {
    id: "card",
    label: "Card Colors",
    fields: [
      { key: "cardBackground", label: "Card Background" },
      { key: "cardHover", label: "Card Hover" },
      { key: "cardText", label: "Card Text" },
      { key: "cardBorder", label: "Card Border" },
    ],
  },
  {
    id: "buttons",
    label: "Button Colors",
    fields: [
      { key: "gray", label: "Gray" },
      { key: "brown", label: "Brown" },
      { key: "orange", label: "Orange" },
      { key: "yellow", label: "Yellow" },
      { key: "teal", label: "Teal" },
      { key: "blue", label: "Blue" },
      { key: "purple", label: "Purple" },
      { key: "pink", label: "Pink" },
      { key: "red", label: "Red" },
    ],
  },
  {
    id: "defaultButton",
    label: "Default Button",
    fields: [
      { key: "background", label: "Background" },
      { key: "textColor", label: "Text Color" },
      { key: "borderColor", label: "Border Color" },
      { key: "hoverBackground", label: "Hover Background" },
    ],
  },
];
```

### Step 2: State Management

- Use `useState<string[]>` to track open section IDs
- Create toggle function to add/remove section IDs from array

### Step 3: Render Collapsible Sections

Each section renders:

1. **CollapsibleTrigger** (as Button)
   - Display section label
   - ChevronDown icon with rotation animation
   - Full width, justify-between

2. **CollapsibleContent**
   - Styled container: `bg-muted`, `px-4`, `rounded-md`, `divide-y divide-border`
   - Map through fields and render `ColorPicker` for each
   - Get value directly: `themeSettings[section.id]?.[field.key]` (it's a string!)
   - Update handler: updates the specific key in the section

### Step 4: Update Handler

```typescript
const handleColorChange = (
  sectionId: keyof ThemeSettingsUI,
  fieldKey: string,
  color: string,
) => {
  updateSettings({
    ...settings,
    theme: {
      ...themeSettings,
      [sectionId]: {
        ...themeSettings[sectionId],
        [fieldKey]: color,
      },
    },
  });
};
```

### Step 5: Optional Reset Functionality

Add a "Reset" button at the top (like in theme-settings.tsx) that resets all theme settings to defaults.

## Component Structure

```
TabTheme
├── Header Row
│   ├── Title "Theme"
│   └── Reset Button (optional)
└── Sections (Collapsible)
    ├── main
    ├── header
    ├── footer
    ├── notion
    ├── card
    ├── buttons
    └── defaultButton
```

## File Structure

**Modify**: `apps/tanstack/src/components/site/settings/tabs/tab-theme.tsx`

## Imports Needed

```typescript
import { useState } from "react";
import { useNotionSettingsStore } from "#/stores/notion-settings";
import type { ThemeSettingsUI } from "#/types/customization";
import { ColorPicker } from "@/components/ui/color-picker";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
```

## Configuration Placement

The `themeSections` array should be defined **in the parent component** (where props are defined/passed), not inside `tab-theme.tsx`. This provides:

- Clear visibility of what will render
- Easy modification without touching the tab component
- Single source of truth for section configuration

**Example in parent component:**

```typescript
// In settings-v2.tsx or parent component
const themeSections = [
  { id: "main", label: "Main Colors", fields: [...] },
  { id: "header", label: "Header Colors", fields: [...] },
  // ... etc
];

// Pass to TabTheme
<TabTheme sections={themeSections} />
```

## Section ID Management

The `id` in each theme section config comes directly from `ThemeSettingsUI` keys:

- `id: "main"` → corresponds to `themeSettings.main`
- `id: "header"` → corresponds to `themeSettings.header`
- etc.

This ensures type safety and direct mapping between the config and the settings object.

## Code Simplicity Guidelines

**DO:**

- Keep configuration arrays minimal (only id, label, fields)
- Use direct property access: `themeSettings[section.id]?.[field.key]`
- Single responsibility functions
- Reuse existing components (ColorPicker, Collapsible)

**DON'T:**

- Create unnecessary wrapper functions
- Add complex state management
- Duplicate type definitions
- Add features not in the plan
- Use complex conditional logic

## Type Integration

The `ThemeSettingsUI` type is the single source of truth for the tab structure. Each key:

- Maps to one collapsible section
- Contains string values that map directly to ColorPicker values
- No special handling needed for nested objects (all are strings)

## Success Criteria

- [ ] All 7 ThemeSettingsUI sections render as collapsible
- [ ] Each section expands/collapses independently
- [ ] Section IDs come directly from ThemeSettingsUI keys
- [ ] Chevron icon rotates 180° when section is open
- [ ] Color pickers render for every field in every section
- [ ] All color values are strings (no object destructuring needed)
- [ ] Color changes update store correctly
- [ ] Styling matches theme-settings.tsx (bg-muted, dividers, etc.)
- [ ] Code is minimal - no unnecessary functions or complexity
