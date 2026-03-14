# Card/Collection Layout Customization Plan (Revised)

## Overview

Add customizable controls for Notion collection cards and gallery grids to the Layout settings tab. This includes:

- Gallery grid gap spacing
- Card border size
- Card cover (image) dimensions, padding, margin, and border radius
- Card body (content area) padding and margin

## Current State

✅ **CSS Variables Already in Place** (global.css)

```css
--notion-gallery-grid-gap: 16px;
--notion-collection-card-border-size: 1px;

--notion-collection-card-cover-height: 200px;
--notion-collection-card-cover-radius: 0.625rem;
--notion-collection-card-cover-padding-x: 0px;
--notion-collection-card-cover-padding-y: 0px;
--notion-collection-card-cover-margin-x: 0px;
--notion-collection-card-cover-margin-y: 0px;

--notion-collection-card-body-padding-x: 12px;
--notion-collection-card-body-padding-y: 12px;
--notion-collection-card-body-margin-x: 0px;
--notion-collection-card-body-margin-y: 0px;
```

✅ **CSS Already Applied** (notion.css)
All variables are actively used in the Notion renderer styling.

✅ **LayoutField Type Already Updated**

```typescript
interface LayoutField {
  key: string;
  label: string;
  type: "text" | "number";
  max?: number;
  min?: number;
  step?: number;
}
```

---

## Implementation Plan

### Phase 1: Type Definitions (types/customization.ts)

#### Add New Layout Types

```typescript
// Gallery Grid Settings
export type LayoutGalleryUI = {
  gridGap?: number; // px
};

// Card Border Settings
export type LayoutCardUI = {
  borderSize?: number; // px
};

// Card Cover (Image) Settings
export type LayoutCardCoverUI = {
  height?: number; // px
  radius?: number; // px
  paddingX?: number; // px
  paddingY?: number; // px
  marginX?: number; // px
  marginY?: number; // px
};

// Card Body (Content) Settings
export type LayoutCardBodyUI = {
  paddingX?: number; // px
  paddingY?: number; // px
  marginX?: number; // px
  marginY?: number; // px
};
```

#### Update LayoutSettingsUI Interface

```typescript
export interface LayoutSettingsUI {
  header?: LayoutHeaderUI;
  footer?: LayoutFooterUI;
  sidebar?: LayoutHeaderUI;
  // NEW SECTIONS:
  gallery?: LayoutGalleryUI;
  card?: LayoutCardUI;
  cardCover?: LayoutCardCoverUI;
  cardBody?: LayoutCardBodyUI;
}
```

#### Add CSS Variables to CustomStyles

```typescript
export interface CustomStyles {
  // ... existing properties

  // Gallery
  "--notion-gallery-grid-gap"?: string;

  // Card Border
  "--notion-collection-card-border-size"?: string;

  // Card Cover
  "--notion-collection-card-cover-height"?: string;
  "--notion-collection-card-cover-radius"?: string;
  "--notion-collection-card-cover-padding-x"?: string;
  "--notion-collection-card-cover-padding-y"?: string;
  "--notion-collection-card-cover-margin-x"?: string;
  "--notion-collection-card-cover-margin-y"?: string;

  // Card Body
  "--notion-collection-card-body-padding-x"?: string;
  "--notion-collection-card-body-padding-y"?: string;
  "--notion-collection-card-body-margin-x"?: string;
  "--notion-collection-card-body-margin-y"?: string;
}
```

---

### Phase 2: UI Configuration (settings.tsx)

Add 4 new sections to `layoutSections` array using the existing `fields` array with `type: "number"`:

#### 1. Gallery Grid Section

```typescript
{
  id: "gallery",
  label: "Gallery Grid",
  fields: [
    { key: "gridGap", label: "Grid Gap (px)", type: "number", min: 0, max: 50, step: 1 },
  ],
}
```

#### 2. Card Border Section

```typescript
{
  id: "card",
  label: "Card Border",
  fields: [
    { key: "borderSize", label: "Border Size (px)", type: "number", min: 0, max: 10, step: 1 },
  ],
}
```

#### 3. Card Cover Section

```typescript
{
  id: "cardCover",
  label: "Card Cover",
  fields: [
    { key: "height", label: "Height (px)", type: "number", min: 50, max: 500, step: 10 },
    { key: "radius", label: "Border Radius (px)", type: "number", min: 0, max: 50, step: 1 },
    { key: "paddingX", label: "Padding X (px)", type: "number", min: 0, max: 50, step: 1 },
    { key: "paddingY", label: "Padding Y (px)", type: "number", min: 0, max: 50, step: 1 },
    { key: "marginX", label: "Margin X (px)", type: "number", min: 0, max: 50, step: 1 },
    { key: "marginY", label: "Margin Y (px)", type: "number", min: 0, max: 50, step: 1 },
  ],
}
```

#### 4. Card Body Section

```typescript
{
  id: "cardBody",
  label: "Card Body",
  fields: [
    { key: "paddingX", label: "Padding X (px)", type: "number", min: 0, max: 50, step: 1 },
    { key: "paddingY", label: "Padding Y (px)", type: "number", min: 0, max: 50, step: 1 },
    { key: "marginX", label: "Margin X (px)", type: "number", min: 0, max: 50, step: 1 },
    { key: "marginY", label: "Margin Y (px)", type: "number", min: 0, max: 50, step: 1 },
  ],
}
```

---

### Phase 3: Update TabLayout Component (tab-layout.tsx)

Update the fields rendering logic to handle `type: "number"` by rendering `SliderInput`:

#### Update handleTextChange to handle numbers

Rename or extend the handler to support both text and number:

```typescript
const handleFieldChange = (
  sectionId: keyof LayoutSettingsUI,
  fieldKey: string,
  value: string | number | undefined,
) => {
  const sectionData = settings?.layout?.[sectionId] as any;
  updateSettings({
    ...settings,
    layout: {
      ...settings?.layout,
      [sectionId]: { ...sectionData, [fieldKey]: value },
    },
  });
};
```

#### Update field rendering to support number type

In the render section where fields are mapped, add:

```typescript
{section.fields?.map((field) => {
  const sectionData = settings?.layout?.[section.id] as any;
  const value = sectionData?.[field.key];

  // Handle number fields with SliderInput
  if (field.type === "number") {
    return (
      <SliderInput
        key={field.key}
        label={field.label}
        value={value || field.min || 0}
        onChange={(val) => handleFieldChange(section.id, field.key, val)}
        min={field.min ?? 0}
        max={field.max ?? 100}
        step={field.step ?? 1}
      />
    );
  }

  // Handle text fields with Input (existing logic)
  return (
    <div key={field.key} className="space-y-2">
      <Label htmlFor={field.key}>{field.label}</Label>
      <Input
        id={field.key}
        value={(value as string) || ""}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          handleFieldChange(section.id, field.key, e.target.value)
        }
      />
    </div>
  );
})}
```

---

### Phase 4: Style Computation (notion-settings.ts)

Extend `computeLayout` function:

```typescript
export const computeLayout = (layout: NotionPageSettings["layout"]) => {
  const styles: CustomStyles = {};

  // ... existing header, footer, sidebar logic ...

  // Gallery Grid Gap
  if (layout?.gallery?.gridGap !== undefined) {
    styles["--notion-gallery-grid-gap"] = layout.gallery.gridGap + "px";
  }

  // Card Border Size
  if (layout?.card?.borderSize !== undefined) {
    styles["--notion-collection-card-border-size"] =
      layout.card.borderSize + "px";
  }

  // Card Cover Settings
  if (layout?.cardCover) {
    const cover = layout.cardCover;
    if (cover.height !== undefined) {
      styles["--notion-collection-card-cover-height"] = cover.height + "px";
    }
    if (cover.radius !== undefined) {
      styles["--notion-collection-card-cover-radius"] = cover.radius + "px";
    }
    if (cover.paddingX !== undefined) {
      styles["--notion-collection-card-cover-padding-x"] =
        cover.paddingX + "px";
    }
    if (cover.paddingY !== undefined) {
      styles["--notion-collection-card-cover-padding-y"] =
        cover.paddingY + "px";
    }
    if (cover.marginX !== undefined) {
      styles["--notion-collection-card-cover-margin-x"] = cover.marginX + "px";
    }
    if (cover.marginY !== undefined) {
      styles["--notion-collection-card-cover-margin-y"] = cover.marginY + "px";
    }
  }

  // Card Body Settings
  if (layout?.cardBody) {
    const body = layout.cardBody;
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

  return styles;
};
```

---

### Phase 5: Default Values (settings-defaults.ts)

Add default layout settings:

```typescript
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
  // NEW DEFAULTS:
  gallery: {
    gridGap: 16,
  },
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
});
```

Update `applyDefaultSettings` to merge new layout sections:

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
  // NEW: Merge card/gallery defaults
  gallery: {
    ...defaultLayoutSettings(seo?.title, seo?.pageIcon)?.gallery,
    ...existingSettings?.layout?.gallery,
  },
  card: {
    ...defaultLayoutSettings(seo?.title, seo?.pageIcon)?.card,
    ...existingSettings?.layout?.card,
  },
  cardCover: {
    ...defaultLayoutSettings(seo?.title, seo?.pageIcon)?.cardCover,
    ...existingSettings?.layout?.cardCover,
  },
  cardBody: {
    ...defaultLayoutSettings(seo?.title, seo?.pageIcon)?.cardBody,
    ...existingSettings?.layout?.cardBody,
  },
},
```

---

## UI Specifications

### Gallery Grid Section

- **Grid Gap**: 0-50px, step 1 (default: 16px)
- Controls spacing between cards in gallery view

### Card Border Section

- **Border Size**: 0-10px, step 1 (default: 1px)
- Controls card border thickness

### Card Cover Section (6 controls)

- **Height**: 50-500px, step 10 (default: 200px)
- **Border Radius**: 0-50px, step 1 (default: 10px)
- **Padding X**: 0-50px, step 1 (default: 0px)
- **Padding Y**: 0-50px, step 1 (default: 0px)
- **Margin X**: 0-50px, step 1 (default: 0px)
- **Margin Y**: 0-50px, step 1 (default: 0px)

### Card Body Section (4 controls)

- **Padding X**: 0-50px, step 1 (default: 12px)
- **Padding Y**: 0-50px, step 1 (default: 12px)
- **Margin X**: 0-50px, step 1 (default: 0px)
- **Margin Y**: 0-50px, step 1 (default: 0px)

---

## Files to Modify

1. **apps/tanstack/src/types/customization.ts**
   - Add 4 new layout types (`LayoutGalleryUI`, `LayoutCardUI`, `LayoutCardCoverUI`, `LayoutCardBodyUI`)
   - Update `LayoutSettingsUI` interface
   - Add CSS variable declarations to `CustomStyles`

2. **apps/tanstack/src/components/site/settings/settings.tsx**
   - Add 4 new sections to `layoutSections` array using `fields` with `type: "number"`

3. **apps/tanstack/src/components/site/settings/tabs/tab-layout.tsx**
   - Update field rendering to check `field.type === "number"` and render `SliderInput`
   - Update handler to support both string and number values

4. **apps/tanstack/src/stores/notion-settings.ts**
   - Extend `computeLayout` function to handle gallery, card, cardCover, cardBody

5. **apps/tanstack/src/lib/settings-defaults.ts**
   - Add defaults to `defaultLayoutSettings`
   - Update `applyDefaultSettings` merging logic for new sections

---

## Backward Compatibility

- All new fields are optional (`?:`)
- Existing sites without card/gallery data use sensible defaults
- No breaking changes to existing functionality
- Defaults match current CSS values for seamless transition
- Existing `type: "text"` fields continue to work unchanged

---

## Data Flow

```
settings.tsx (layoutSections with fields array)
         |
         v
tab-layout.tsx (checks field.type, renders SliderInput for "number")
         |
         v
handleFieldChange() updates store with number value
         |
         v
computeLayout() converts to CSS variables
         |
         v
notion.css applies styles (already configured)
```

---

## Testing Checklist

- [ ] Gallery Grid section appears in Layout tab with 1 slider
- [ ] Card Border section appears in Layout tab with 1 slider
- [ ] Card Cover section appears with 6 sliders
- [ ] Card Body section appears with 4 sliders
- [ ] Adjusting sliders updates preview immediately
- [ ] Step values work correctly (1px for most, 10px for height)
- [ ] Values save to database correctly
- [ ] Values load from database correctly
- [ ] Defaults match current CSS values
- [ ] Existing sites load without errors
- [ ] All layout sections collapse/expand properly
- [ ] Existing text fields in header/footer/sidebar still work

---

## Summary

**Total New Controls**: 15 sliders across 4 sections
**Files Modified**: 5 files
**Breaking Changes**: None
**CSS Changes Required**: None (already implemented)
**Approach**: Reuse existing `fields` array with `type: "number"` - no extra numericFields needed

This simplified approach leverages the already-updated `LayoutField` type to handle both text and number inputs cleanly within the existing structure.
