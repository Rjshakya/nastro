# Add Notion-Background to ThemeSettingsUI Plan

## Overview

Add a new `notionBackground` section to `ThemeSettingsUI` type to allow customization of Notion background fill colors. These are distinct from the regular notion colors (which are for text/badges) and are used for background highlights.

## Current State Analysis

### Existing ThemeSettingsUI Structure

```typescript
export interface ThemeSettingsUI {
  main?: ThemeSettingsMainSection;
  header?: ThemeSettingsHeaderSection;
  footer?: ThemeSettingsFooterSection;
  notion?: ThemeSettingsNotionSection; // Text/badge colors
  card?: ThemeSettingsCardSection;
  buttons?: ThemeSettingsButtonsSection;
  defaultButton?: ThemeSettingsDefaultButtonSection;
}
```

### CSS Background Colors (global.css lines 96-105)

```css
--custom-notion-red_background: oklch(92.48% 0.024 24.3);
--custom-notion-pink_background: oklch(91.24% 0.025 354.5);
--custom-notion-blue_background: oklch(92.83% 0.018 232.1);
--custom-notion-purple_background: oklch(91.52% 0.02 294.6);
--custom-notion-teal_background: oklch(92.81% 0.015 172.5);
--custom-notion-yellow_background: oklch(96.11% 0.031 88.3);
--custom-notion-orange_background: oklch(94.13% 0.025 65.5);
--custom-notion-brown_background: oklch(91.64% 0.006 58.7);
--custom-notion-gray_background: oklch(93.3% 0.002 241.6);
```

### Where ThemeSettingsUI is Used

1. **customization.ts** - Type definition
2. **notion-settings.ts** - computeTheme function processes theme settings
3. **settings-defaults.ts** - Default values for theme
4. **tab-theme.tsx** - UI component for theme editing
5. **settings.tsx** - Configuration for theme sections

## Implementation Plan

### Step 1: Add Type Definition

**File**: `apps/tanstack/src/types/customization.ts`

Add new type after `ThemeSettingsNotionSection` (around line 207):

```typescript
export type ThemeSettingsNotionBackgroundSection = {
  gray?: string;
  brown?: string;
  orange?: string;
  yellow?: string;
  teal?: string;
  blue?: string;
  purple?: string;
  pink?: string;
  red?: string;
};
```

Update `ThemeSettingsUI` interface (line 235):

```typescript
export interface ThemeSettingsUI {
  main?: ThemeSettingsMainSection;
  header?: ThemeSettingsHeaderSection;
  footer?: ThemeSettingsFooterSection;
  notion?: ThemeSettingsNotionSection;
  notionBackground?: ThemeSettingsNotionBackgroundSection; // NEW
  card?: ThemeSettingsCardSection;
  buttons?: ThemeSettingsButtonsSection;
  defaultButton?: ThemeSettingsDefaultButtonSection;
}
```

### Step 2: Add CSS Variable Mapping

**File**: `apps/tanstack/src/stores/notion-settings.ts`

Add in `computeTheme` function (after notion section, around line 82):

```typescript
if (customization.notionBackground) {
  const bgColorMap = [
    "gray",
    "brown",
    "orange",
    "yellow",
    "teal",
    "blue",
    "purple",
    "pink",
    "red",
  ] as const;

  bgColorMap.forEach((color) => {
    const colorData = customization.notionBackground?.[color];
    if (colorData) {
      styles[`--custom-notion-${color}_background`] = colorData;
    }
  });
}
```

### Step 3: Add Default Values

**File**: `apps/tanstack/src/lib/settings-defaults.ts`

Add in `defaultThemeSettings` function (after notion, around line 41):

```typescript
notionBackground: {
  gray: "#eeedec",
  brown: "#eeebe9",
  orange: "#faebe0",
  yellow: "#fbf3db",
  teal: "#ddf2f0",
  blue: "#ddebf3",
  purple: "#ece9f2",
  pink: "#f5e0eb",
  red: "#ffe2dd",
  ...themeSettings?.notionBackground,
},
```

### Step 4: Add Theme Section Config

**File**: `apps/tanstack/src/components/site/settings/settings.tsx`

Add to `themeSections` array (after buttons section, around line 115):

```typescript
{
  id: "notionBackground",
  label: "Notion Background",
  fields: [
    { key: "gray", label: "Gray Background" },
    { key: "brown", label: "Brown Background" },
    { key: "orange", label: "Orange Background" },
    { key: "yellow", label: "Yellow Background" },
    { key: "teal", label: "Teal Background" },
    { key: "blue", label: "Blue Background" },
    { key: "purple", label: "Purple Background" },
    { key: "pink", label: "Pink Background" },
    { key: "red", label: "Red Background" },
  ],
},
```

## Color Values (oklch → hex)

| Color  | oklch Value               | Hex Value |
| ------ | ------------------------- | --------- |
| gray   | oklch(93.3% 0.002 241.6)  | #eeedec   |
| brown  | oklch(91.64% 0.006 58.7)  | #eeebe9   |
| orange | oklch(94.13% 0.025 65.5)  | #faebe0   |
| yellow | oklch(96.11% 0.031 88.3)  | #fbf3db   |
| teal   | oklch(92.81% 0.015 172.5) | #ddf2f0   |
| blue   | oklch(92.83% 0.018 232.1) | #ddebf3   |
| purple | oklch(91.52% 0.02 294.6)  | #ece9f2   |
| pink   | oklch(91.24% 0.025 354.5) | #f5e0eb   |
| red    | oklch(92.48% 0.024 24.3)  | #ffe2dd   |

## File Changes Summary

1. **customization.ts**
   - Add `ThemeSettingsNotionBackgroundSection` type
   - Add `notionBackground` to `ThemeSettingsUI`

2. **notion-settings.ts**
   - Add `notionBackground` processing in `computeTheme`

3. **settings-defaults.ts**
   - Add default values for `notionBackground`

4. **settings.tsx**
   - Add theme section config for `notionBackground`

## Success Criteria

- [ ] Type definition added for `ThemeSettingsNotionBackgroundSection`
- [ ] `notionBackground` added to `ThemeSettingsUI` interface
- [ ] CSS variables mapped in `computeTheme` function
- [ ] Default values set with correct hex colors
- [ ] Theme section appears in UI with all 9 color fields
- [ ] Color changes persist and apply to notion background fills
- [ ] No TypeScript errors
- [ ] Minimal, clean implementation
