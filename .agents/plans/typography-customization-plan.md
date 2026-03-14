# Typography Customization Plan: Line Height, Letter Spacing, Font Weight

## Overview

Add three new typography controls to the existing Typography settings tab:

1. **Line Height** - Control text line height for better readability
2. **Letter Spacing** - Adjust spacing between characters
3. **Font Weight** - Control the boldness of text

## Current State Analysis

### ✅ Already Exists (No Changes Needed)

- **CSS Variables** in `global.css`:

  ```css
  --notion-letter-spacing: -0.05rem;
  --notion-heading-letter-spacing: -0.08rem;
  --notion-text-line-height: 1.8rem;
  --notion-font-weight: 400;
  ```

- **CSS Usage** in `notion.css`:

  ```css
  .notion {
    letter-spacing: var(--notion-letter-spacing);
    line-height: var(--notion-text-line-height);
    font-weight: var(--notion-font-weight);
  }

  .notion-title,
  .notion-h1,
  .notion-h2,
  .notion-h3 {
    letter-spacing: var(--notion-heading-letter-spacing);
  }
  ```

- **UI Framework**: `tab-typo.tsx` already supports dynamic section rendering with `SliderInput`

---

## Implementation Steps

### Step 1: Update Type Definitions (`types/customization.ts`)

**Add new interface for spacing/weight settings:**

```typescript
// Add after TypoFontsUI (around line 280)
export type TypoSpacingUI = {
  lineHeight?: number; // Range: 1.0 - 2.5 (unitless)
  letterSpacing?: number; // Range: -2 - 5 (px)
  headingLetterSpacing?: number; // Range: -2 - 5 (px)
  fontWeight?: number; // Range: 100 - 900
};
```

**Update TypoSettingsUI to include spacing:**

```typescript
// Update existing interface (around line 290)
export interface TypoSettingsUI {
  sizes?: TypoSizesUI;
  fonts?: TypoFontsUI;
  spacing?: TypoSpacingUI; // NEW
}
```

**Add CSS variable keys to CustomStyles:**

```typescript
// In CustomStyles interface (around line 148), add:
"--notion-letter-spacing"?: string;
"--notion-heading-letter-spacing"?: string;
"--notion-text-line-height"?: string;
"--notion-font-weight"?: string;
```

---

### Step 2: Update Settings Sections (`components/site/settings/settings.tsx`)

**Add new spacing section to `typoSections`:**

```typescript
// Find typoSections array (around line 145), add new section:
const typoSections: TabTypoProps["sections"] = [
  // ... existing sizes and fonts sections ...

  // NEW: Spacing Section
  {
    id: "spacing",
    label: "Spacing & Weight",
    fields: [
      {
        key: "lineHeight",
        label: "Line Height",
        type: "number",
        min: 1.0,
        max: 2.5,
      },
      {
        key: "letterSpacing",
        label: "Letter Spacing",
        type: "number",
        min: -2,
        max: 5,
      },
      {
        key: "headingLetterSpacing",
        label: "Heading Letter Spacing",
        type: "number",
        min: -2,
        max: 5,
      },
      {
        key: "fontWeight",
        label: "Font Weight",
        type: "number",
        min: 100,
        max: 900,
      },
    ],
  },
];
```

---

### Step 3: Update Style Computation (`stores/notion-settings.ts`)

**Extend `computeTypography` function:**

```typescript
export const computeTypography = (
  typography: NotionPageSettings["typography"],
) => {
  const styles: CustomStyles = {};
  if (!typography) return {};

  // Existing sizes handling
  if (typography.sizes) {
    styles["--notion-page-title"] = typography.sizes?.pageTitle + "px";
    styles["--notion-h1"] = typography.sizes?.heading1 + "px";
    styles["--notion-h2"] = typography.sizes?.heading2 + "px";
    styles["--notion-h3"] = typography.sizes?.heading3 + "px";
    styles["--base-font-size"] = typography.sizes?.base + "px";
  }

  // Existing fonts handling
  if (typography.fonts) {
    styles["--notion-primary-font"] = typography.fonts?.primary;
    styles["--notion-secondary-font"] = typography.fonts?.secondary;
  }

  // NEW: Spacing handling
  if (typography.spacing) {
    if (typography.spacing.lineHeight) {
      styles["--notion-text-line-height"] =
        typography.spacing.lineHeight.toString();
    }
    if (typography.spacing.letterSpacing) {
      styles["--notion-letter-spacing"] =
        typography.spacing.letterSpacing + "px";
    }
    if (typography.spacing.headingLetterSpacing) {
      styles["--notion-heading-letter-spacing"] =
        typography.spacing.headingLetterSpacing + "px";
    }
    if (typography.spacing.fontWeight) {
      styles["--notion-font-weight"] = typography.spacing.fontWeight.toString();
    }
  }

  return styles;
};
```

---

### Step 4: Add Default Values (`lib/settings-defaults.ts`)

**Update `defaultTypographySettings`:**

```typescript
export const defaultTypographySettings: NotionPageSettings["typography"] = {
  sizes: {
    pageTitle: 41,
    heading1: 28,
    heading2: 24,
    heading3: 20,
    base: 16,
  },
  // NEW: Default spacing values
  spacing: {
    lineHeight: 1.8,
    letterSpacing: -0.8, // -0.05rem ≈ -0.8px
    headingLetterSpacing: -1.3, // -0.08rem ≈ -1.3px
    fontWeight: 400,
  },
};
```

---

### Step 5: Handle Existing Data (`lib/settings-defaults.ts`)

**Update `applyDefaultSettings` to merge spacing:**

```typescript
// In applyDefaultSettings, update the typography section:
typography: {
  ...defaultTypographySettings,
  ...existingSettings?.typography,
  sizes: {
    ...defaultTypographySettings.sizes,
    ...existingSettings?.typography?.sizes,
  },
  // NEW: Merge spacing defaults
  spacing: {
    ...defaultTypographySettings.spacing,
    ...existingSettings?.typography?.spacing,
  },
},
```

---

## Default Value Mapping

Match the CSS variables in `global.css`:

| Setting                | CSS Variable                      | Current CSS Value       | Recommended Default |
| ---------------------- | --------------------------------- | ----------------------- | ------------------- |
| Line Height            | `--notion-text-line-height`       | `1.8rem` (unitless 1.8) | `1.8`               |
| Letter Spacing         | `--notion-letter-spacing`         | `-0.05rem` (~-0.8px)    | `-0.8`              |
| Heading Letter Spacing | `--notion-heading-letter-spacing` | `-0.08rem` (~-1.3px)    | `-1.3`              |
| Font Weight            | `--notion-font-weight`            | `400`                   | `400`               |

---

## UI Specifications

### Line Height Slider

- **Label**: "Line Height"
- **Range**: 1.0 - 2.5
- **Step**: 0.1
- **Default**: 1.8
- **Description**: Controls space between lines of text

### Letter Spacing Slider (Body)

- **Label**: "Letter Spacing"
- **Range**: -2 to 5 (px)
- **Step**: 0.1
- **Default**: -0.8
- **Description**: Space between characters in body text

### Letter Spacing Slider (Headings)

- **Label**: "Heading Letter Spacing"
- **Range**: -2 to 5 (px)
- **Step**: 0.1
- **Default**: -1.3
- **Description**: Space between characters in headings

### Font Weight Slider

- **Label**: "Font Weight"
- **Range**: 100 - 900
- **Step**: 100
- **Default**: 400
- **Description**: Boldness of text (400 = normal, 700 = bold)

---

## Data Flow

```
User adjusts slider in UI
         ↓
tab-typo.tsx calls handleNumberChange()
         ↓
updateSettings() updates store state
         ↓
computeCustomStyles() called with isDark
         ↓
computeTypography() converts values to CSS
         ↓
CSS variables applied to document
         ↓
notion.css uses variables to style content
```

---

## Files to Modify

1. `apps/tanstack/src/types/customization.ts` - Add types
2. `apps/tanstack/src/components/site/settings/settings.tsx` - Add UI sections
3. `apps/tanstack/src/stores/notion-settings.ts` - Add computation logic
4. `apps/tanstack/src/lib/settings-defaults.ts` - Add defaults and merging

---

## Backward Compatibility

- Existing sites without `spacing` field will use defaults
- No breaking changes to existing functionality
- New fields are optional (`?:`)
- Defaults match current CSS values for seamless transition

---

## Testing Checklist

- [ ] Line height slider appears in Typography tab
- [ ] Letter spacing sliders appear in Typography tab
- [ ] Font weight slider appears in Typography tab
- [ ] Adjusting sliders updates preview immediately
- [ ] Values save to database correctly
- [ ] Values load from database correctly
- [ ] Default values match current CSS
- [ ] Changes reflect in both light and dark modes
- [ ] Existing sites load without errors
- [ ] Typography tab sections collapse/expand properly

---

## Summary

This plan adds three new typography controls with minimal code changes:

- **4 files modified**
- **~50 lines of code added**
- **No breaking changes**
- **Leverages existing infrastructure**
- **CSS variables already in place**

The implementation follows the exact same pattern as existing typography controls (sizes and fonts), ensuring consistency and maintainability.
