# Default Settings Population Plan (Revised)

## Overview

Create a simple, clean default values system for all NotionPageSettings sections. Convert CSS oklch values to proper hex representation.

## Current State Analysis

### What's Currently Working ($siteId.tsx lines 35-56)

- ✅ `general.pageWidth` - defaults to 65
- ✅ `layout.header/footer` - defaults with text, logo, width
- ❌ `theme` - NOT filled (all sections empty)
- ❌ `typo` - Partially filled in store (only sizes)
- ❌ `general.header/footer` booleans - NOT filled

## Implementation Plan

### Step 1: Create Simple Defaults File

Create `apps/tanstack/src/lib/settings-defaults.ts`:

```typescript
import type { NotionPageSettings } from "#/types/customization";

// Theme defaults - converted from global.css oklch values
export const defaultThemeSettings: NotionPageSettings["theme"] = {
  main: {
    pageBackground: "#ffffff", // oklch(1 0 0)
    textColor: "#242424", // oklch(0.145 0 0)
    checkboxBackground: "#2eaadc", // oklch(0.685 0.169 237.323)
  },
  header: {
    background: "#ffffff", // oklch(1 0 0)
    textColor: "#242424", // oklch(0.145 0 0)
    buttonText: "#ffffff", // oklch(1 0 0)
    buttonBackground: "#242424", // oklch(0.145 0 0)
  },
  footer: {
    background: "#ffffff", // oklch(1 0 0)
    textColor: "#242424", // oklch(0.145 0 0)
    buttonText: "#ffffff", // oklch(1 0 0)
    buttonBackground: "#242424", // oklch(0.145 0 0)
  },
  notion: {
    gray: "#9b9a97", // oklch(66.83% 0.005 70.4)
    brown: "#64473a", // oklch(39.73% 0.046 48.7)
    orange: "#d9730d", // oklch(61.54% 0.176 56.2)
    yellow: "#dfab01", // oklch(72.82% 0.166 82.5)
    teal: "#0f7b6c", // oklch(44.51% 0.016 184.2)
    blue: "#0073e6", // oklch(47.92% 0.101 240.2)
    purple: "#9065b0", // oklch(45.61% 0.146 298.6)
    pink: "#c44c7d", // oklch(45.42% 0.166 344.4)
    red: "#e03e3e", // oklch(56.62% 0.177 25.8)
  },
  card: {
    cardBackground: "#ffffff", // oklch(1 0 0)
    cardHover: "#f7f6f3", // oklch(0.97 0 0)
    cardText: "#242424", // oklch(0.145 0 0)
    cardBorder: "#ebebeb", // oklch(0.922 0 0)
  },
  buttons: {
    gray: "#e3e2e0", // oklch(90.34% 0.001 71.43)
    brown: "#eee0db", // oklch(90.17% 0.018 45.42)
    orange: "#faddcd", // oklch(90.67% 0.041 68.61)
    yellow: "#fdecc8", // oklch(93.63% 0.045 83.33)
    teal: "#dbf1f1", // oklch(91.75% 0.021 144.35)
    blue: "#d3e5ef", // oklch(89.47% 0.023 233.2)
    purple: "#e8e0f0", // oklch(90.03% 0.022 301.88)
    pink: "#f5e0eb", // oklch(90.9% 0.023 3.65)
    red: "#ffe2dd", // oklch(91.86% 0.034 23.3)
  },
  defaultButton: {
    background: "#242424", // oklch(0.145 0 0)
    textColor: "#ffffff", // oklch(1 0 0)
    borderColor: "#373737", // oklch(0.552 0.016 285.938)
    hoverBackground: "#000000", // oklch(0.145 0 0)
  },
};

// Typography defaults - sizes only (fonts loaded separately)
export const defaultTypoSettings: NotionPageSettings["typo"] = {
  sizes: {
    pageTitle: 41, // ~2.6rem
    heading1: 28, // ~1.8rem
    heading2: 24, // ~1.5rem
    heading3: 20, // ~1.25rem
    base: 16,
  },
};

// Layout defaults - dynamic based on page
export const defaultLayoutSettings = (
  pageTitle: string,
  pageIcon: string,
): NotionPageSettings["layout"] => ({
  header: {
    text: pageTitle,
    logo: pageIcon,
    width: 100,
    height: 60,
  },
  footer: {
    text: pageTitle,
    logo: pageIcon,
    width: 100,
    height: 45,
  },
});

// General defaults
export const defaultGeneralSettings: NotionPageSettings["general"] = {
  siteName: "",
  pageWidth: 65,
  header: true,
  footer: true,
};

// Simple function to apply defaults
export const getDefaultSettings = (
  existingSettings: Partial<NotionPageSettings> | null | undefined,
  pageTitle: string,
  pageIcon: string,
): NotionPageSettings => {
  return {
    theme: existingSettings?.theme || defaultThemeSettings,
    typo: existingSettings?.typo || defaultTypoSettings,
    layout:
      existingSettings?.layout || defaultLayoutSettings(pageTitle, pageIcon),
    general: existingSettings?.general || defaultGeneralSettings,
  };
};
```

### Step 2: Update $siteId.tsx

Replace the settings initialization (lines 35-56) with:

```typescript
import { getDefaultSettings } from "#/lib/settings-defaults";

// ... in loader:
const defaultSettings = getDefaultSettings(
  settings,
  defaultPageTitle || "",
  defaultPageIcon || "",
);

useNotionSettingsStore.getState().updateSettings({
  ...defaultSettings,
  seo,
});
```

### Step 3: Update notion-settings.ts

Remove the default initialization from store (lines 17-27):

```typescript
// Change from:
settings: {
  typography: {
    sizes: { ... }
  }
}

// To:
settings: {}
```

## Color Mapping (oklch → hex)

| CSS Variable                    | oklch Value                | Hex Value |
| ------------------------------- | -------------------------- | --------- |
| --notion-custom-page-bg         | oklch(1 0 0)               | #ffffff   |
| --notion-custom-text            | oklch(0.145 0 0)           | #242424   |
| --custom-notion-select-color-0  | oklch(0.685 0.169 237.323) | #2eaadc   |
| --custom-notion-gray            | oklch(66.83% 0.005 70.4)   | #9b9a97   |
| --custom-notion-brown           | oklch(39.73% 0.046 48.7)   | #64473a   |
| --custom-notion-orange          | oklch(61.54% 0.176 56.2)   | #d9730d   |
| --custom-notion-yellow          | oklch(72.82% 0.166 82.5)   | #dfab01   |
| --custom-notion-teal            | oklch(44.51% 0.016 184.2)  | #0f7b6c   |
| --custom-notion-blue            | oklch(47.92% 0.101 240.2)  | #0073e6   |
| --custom-notion-purple          | oklch(45.61% 0.146 298.6)  | #9065b0   |
| --custom-notion-pink            | oklch(45.42% 0.166 344.4)  | #c44c7d   |
| --custom-notion-red             | oklch(56.62% 0.177 25.8)   | #e03e3e   |
| --notion-collection-card        | oklch(1 0 0)               | #ffffff   |
| --notion-collection-card-hover  | oklch(0.97 0 0)            | #f7f6f3   |
| --notion-collection-card-text   | oklch(0.145 0 0)           | #242424   |
| --notion-collection-card-border | oklch(0.922 0 0)           | #ebebeb   |
| --custom-notion-item-gray       | oklch(90.34% 0.001 71.43)  | #e3e2e0   |
| --custom-notion-item-brown      | oklch(90.17% 0.018 45.42)  | #eee0db   |
| --custom-notion-item-orange     | oklch(90.67% 0.041 68.61)  | #faddcd   |
| --custom-notion-item-yellow     | oklch(93.63% 0.045 83.33)  | #fdecc8   |
| --custom-notion-item-teal       | oklch(91.75% 0.021 144.35) | #dbf1f1   |
| --custom-notion-item-blue       | oklch(89.47% 0.023 233.2)  | #d3e5ef   |
| --custom-notion-item-purple     | oklch(90.03% 0.022 301.88) | #e8e0f0   |
| --custom-notion-item-pink       | oklch(90.9% 0.023 3.65)    | #f5e0eb   |
| --custom-notion-item-red        | oklch(91.86% 0.034 23.3)   | #ffe2dd   |
| --notion-default-btn-bg         | oklch(0.145 0 0)           | #242424   |
| --notion-default-btn-text       | oklch(1 0 0)               | #ffffff   |
| --notion-default-btn-border     | oklch(0.552 0.016 285.938) | #373737   |
| --notion-default-btn-hover      | oklch(0.145 0 0)           | #242424   |

## File Changes

1. **NEW**: `apps/tanstack/src/lib/settings-defaults.ts` - Simple defaults + apply function
2. **MODIFY**: `apps/tanstack/src/routes/site/$siteId.tsx` - Use getDefaultSettings
3. **MODIFY**: `apps/tanstack/src/stores/notion-settings.ts` - Remove default init

## Success Criteria

- [ ] All theme sections have proper hex defaults matching oklch CSS values
- [ ] Typography has only sizes defaults (no fonts)
- [ ] Layout defaults use dynamic pageTitle/logo
- [ ] General has all field defaults
- [ ] Simple getDefaultSettings function (no complex merging)
- [ ] Store initialization is empty
- [ ] Clean, minimal code
