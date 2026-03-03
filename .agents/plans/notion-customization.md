# Notion Page Customization Plan

## Overview

Implement a comprehensive theming engine for Notion pages rendered with react-notion-x. Users will be able to customize colors for page elements, navbar, footer, Notion tag colors, database components, and buttons.

## Architecture

### Stack

- **State Management**: Zustand (for UI panel state)
- **Persistence**: Site settings API via existing SWR hooks
- **Styling**: CSS custom properties with variable mapping
- **UI**: React color pickers in site-settings panel

### Files to Modify/Create

| File                                                 | Action                       |
| ---------------------------------------------------- | ---------------------------- |
| `apps/web/src/hooks/use-sites.ts`                    | Extend SiteSetting interface |
| `apps/web/src/styles/notion.css`                     | Add CSS variable mappings    |
| `apps/web/src/stores/notion-customization-store.ts`  | Create Zustand store         |
| `apps/web/src/components/site-settings.tsx`          | Add customization UI         |
| `apps/web/src/components/notion/notion-renderer.tsx` | Apply custom styles          |

---

## Phase 1: Database Schema Extension

### File: `apps/web/src/hooks/use-sites.ts`

Extend the `SiteSetting` interface with **grouped** `notionCustomization` object:

```typescript
export interface NotionMainColors {
  pageBackground?: string;
  textColor?: string;
  textLightColor?: string;
  borderColor?: string;
  hoverBackground?: string;
  checkboxBackground?: string;
}

export interface NotionNavbarColors {
  textColor?: string;
  background?: string;
  buttonText?: string;
  buttonBackground?: string;
}

export interface NotionFooterColors {
  textColor?: string;
  background?: string;
}

export interface NotionTagColor {
  text: string;
  background: string;
}

export interface NotionButtonColor {
  background: string;
}

export interface NotionCardColors {
  cardBackground?: string;
  cardHover?: string;
  weekendBackground?: string;
}

export interface NotionCustomization {
  main?: NotionMainColors;
  navbar?: NotionNavbarColors;
  footer?: NotionFooterColors;

  // Notion tag colors - grouped by color name
  notion?: {
    gray?: NotionTagColor;
    brown?: NotionTagColor;
    orange?: NotionTagColor;
    yellow?: NotionTagColor;
    green?: NotionTagColor;
    blue?: NotionTagColor;
    purple?: NotionTagColor;
    pink?: NotionTagColor;
    red?: NotionTagColor;
  };

  database?: NotionCardColors;

  // Button colors
  buttons?: {
    default?: NotionButtonColor;
    gray?: NotionButtonColor;
    brown?: NotionButtonColor;
    orange?: NotionButtonColor;
    yellow?: NotionButtonColor;
    green?: NotionButtonColor;
    blue?: NotionButtonColor;
    purple?: NotionButtonColor;
    pink?: NotionButtonColor;
    red?: NotionButtonColor;
  };
}

export interface SiteSetting {
  // ... existing fields
  notionCustomization?: NotionCustomization;
}
```

---

## Phase 2: CSS Variable Mapping System

### File: `apps/web/src/styles/notion.css`

Add comprehensive CSS variable mappings that bridge user-customizable properties to react-notion-x's internal variables.

#### Default Values (from global.css light mode)

| User Request        | Custom Variable                                            | Maps To                                         | Default                                    |
| ------------------- | ---------------------------------------------------------- | ----------------------------------------------- | ------------------------------------------ |
| **MAIN**            |                                                            |                                                 |                                            |
| Page background     | `--notion-custom-page-bg`                                  | `--bg-color`                                    | `oklch(1 0 0)`                             |
| Text                | `--notion-custom-text`                                     | `--fg-color`                                    | `oklch(0.145 0 0)`                         |
| Light Text          | `--notion-custom-text-light`                               | `--fg-color-3`                                  | `rgba(55, 53, 47, 0.6)`                    |
| Border Color        | `--notion-custom-border`                                   | `--fg-color-0`, `--fg-color-1`                  | `rgba(55, 53, 47, 0.09)`                   |
| Hover background    | `--notion-custom-hover-bg`                                 | `--bg-color-0`                                  | `rgba(135, 131, 120, 0.15)`                |
| Checkbox Background | `--notion-custom-checkbox-bg`                              | `--select-color-0`                              | `rgb(46, 170, 220)`                        |
| **NAVBAR**          |                                                            |                                                 |                                            |
| Text                | `--notion-custom-navbar-text`                              | Header text                                     | `--fg-color`                               |
| Background          | `--notion-custom-navbar-bg`                                | Header bg                                       | `--bg-color`                               |
| Button Text         | `--notion-custom-navbar-btn-text`                          | Header btn text                                 | `--bg-color`                               |
| Button Background   | `--notion-custom-navbar-btn-bg`                            | Header btn bg                                   | `--fg-color`                               |
| **FOOTER**          |                                                            |                                                 |                                            |
| Text                | `--notion-custom-footer-text`                              | Footer text                                     | `--fg-color`                               |
| Background          | `--notion-custom-footer-bg`                                | Footer bg                                       | `--bg-color`                               |
| **NOTION COLORS**   |                                                            |                                                 |                                            |
| Gray                | `--notion-custom-gray-text`, `--notion-custom-gray-bg`     | `--notion-gray`, `--notion-gray_background`     | `rgb(155, 154, 151)`, `rgb(235, 236, 237)` |
| Brown               | `--notion-custom-brown-text`, `--notion-custom-brown-bg`   | `--notion-brown`, `--notion-brown_background`   | `rgb(100, 71, 58)`, `rgb(233, 229, 227)`   |
| Orange              | `--notion-custom-orange-text`, `--notion-custom-orange-bg` | `--notion-orange`, `--notion-orange_background` | `rgb(217, 115, 13)`, `rgb(250, 235, 221)`  |
| Yellow              | `--notion-custom-yellow-text`, `--notion-custom-yellow-bg` | `--notion-yellow`, `--notion-yellow_background` | `rgb(223, 171, 1)`, `rgb(251, 243, 219)`   |
| Green               | `--notion-custom-green-text`, `--notion-custom-green-bg`   | `--notion-teal`, `--notion-teal_background`     | `rgb(77, 100, 97)`, `rgb(221, 237, 234)`   |
| Blue                | `--notion-custom-blue-text`, `--notion-custom-blue-bg`     | `--notion-blue`, `--notion-blue_background`     | `rgb(11, 110, 153)`, `rgb(221, 235, 241)`  |
| Purple              | `--notion-custom-purple-text`, `--notion-custom-purple-bg` | `--notion-purple`, `--notion-purple_background` | `rgb(105, 64, 165)`, `rgb(234, 228, 242)`  |
| Pink                | `--notion-custom-pink-text`, `--notion-custom-pink-bg`     | `--notion-pink`, `--notion-pink_background`     | `rgb(173, 26, 114)`, `rgb(244, 223, 235)`  |
| Red                 | `--notion-custom-red-text`, `--notion-custom-red-bg`       | `--notion-red`, `--notion-red_background`       | `rgb(224, 62, 62)`, `rgb(251, 228, 228)`   |
| **DATABASE**        |                                                            |                                                 |                                            |
| Card Background     | `--notion-custom-db-card-bg`                               | `.notion-collection-card`                       | `--bg-color`                               |
| Card Hover          | `--notion-custom-db-card-hover`                            | `.notion-collection-card:hover`                 | `--bg-color-0`                             |
| Weekend Background  | `--notion-custom-db-weekend-bg`                            | Calendar weekend                                | `--bg-color-1`                             |
| **BUTTONS**         |                                                            |                                                 |                                            |
| Default             | `--notion-custom-btn-default`                              | `--notion-item-default`                         | `rgba(227, 226, 224, 0.5)`                 |
| Gray                | `--notion-custom-btn-gray`                                 | `--notion-item-gray`                            | `rgb(227, 226, 224)`                       |
| Brown               | `--notion-custom-btn-brown`                                | `--notion-item-brown`                           | `rgb(238, 224, 218)`                       |
| Orange              | `--notion-custom-btn-orange`                               | `--notion-item-orange`                          | `rgb(250, 222, 201)`                       |
| Yellow              | `--notion-custom-btn-yellow`                               | `--notion-item-yellow`                          | `rgb(253, 236, 200)`                       |
| Green               | `--notion-custom-btn-green`                                | `--notion-item-green`                           | `rgb(219, 237, 219)`                       |
| Blue                | `--notion-custom-btn-blue`                                 | `--notion-item-blue`                            | `rgb(211, 229, 239)`                       |
| Purple              | `--notion-custom-btn-purple`                               | `--notion-item-purple`                          | `rgb(232, 222, 238)`                       |
| Pink                | `--notion-custom-btn-pink`                                 | `--notion-item-pink`                            | `rgb(245, 224, 233)`                       |
| Red                 | `--notion-custom-btn-red`                                  | `--notion-item-red`                             | `rgb(255, 226, 221)`                       |

---

## Phase 3: Zustand Store

### File: `apps/web/src/stores/notion-customization-store.ts` (NEW)

Store holds both UI state AND computed CSS custom properties. The store syncs with site settings and provides styles to components.

```typescript
import { create } from "zustand";
import type { NotionCustomization } from "@/hooks/use-sites";

export type NotionCustomizationTab =
  | "main"
  | "navbar"
  | "footer"
  | "notion"
  | "database"
  | "buttons";

interface CustomStyles {
  // Main
  "--notion-custom-page-bg"?: string;
  "--notion-custom-text"?: string;
  "--notion-custom-text-light"?: string;
  "--notion-custom-border"?: string;
  "--notion-custom-hover-bg"?: string;
  "--notion-custom-checkbox-bg"?: string;

  // Navbar
  "--notion-custom-navbar-text"?: string;
  "--notion-custom-navbar-bg"?: string;
  "--notion-custom-navbar-btn-text"?: string;
  "--notion-custom-navbar-btn-bg"?: string;

  // Footer
  "--notion-custom-footer-text"?: string;
  "--notion-custom-footer-bg"?: string;

  // Notion colors
  "--notion-custom-gray-text"?: string;
  "--notion-custom-gray-bg"?: string;
  "--notion-custom-brown-text"?: string;
  "--notion-custom-brown-bg"?: string;
  "--notion-custom-orange-text"?: string;
  "--notion-custom-orange-bg"?: string;
  "--notion-custom-yellow-text"?: string;
  "--notion-custom-yellow-bg"?: string;
  "--notion-custom-green-text"?: string;
  "--notion-custom-green-bg"?: string;
  "--notion-custom-blue-text"?: string;
  "--notion-custom-blue-bg"?: string;
  "--notion-custom-purple-text"?: string;
  "--notion-custom-purple-bg"?: string;
  "--notion-custom-pink-text"?: string;
  "--notion-custom-pink-bg"?: string;
  "--notion-custom-red-text"?: string;
  "--notion-custom-red-bg"?: string;

  // Database
  "--notion-custom-db-card-bg"?: string;
  "--notion-custom-db-card-hover"?: string;
  "--notion-custom-db-weekend-bg"?: string;

  // Buttons
  "--notion-custom-btn-default"?: string;
  "--notion-custom-btn-gray"?: string;
  "--notion-custom-btn-brown"?: string;
  "--notion-custom-btn-orange"?: string;
  "--notion-custom-btn-yellow"?: string;
  "--notion-custom-btn-green"?: string;
  "--notion-custom-btn-blue"?: string;
  "--notion-custom-btn-purple"?: string;
  "--notion-custom-btn-pink"?: string;
  "--notion-custom-btn-red"?: string;
}

interface NotionCustomizationState {
  // UI State
  isPanelOpen: boolean;
  activeTab: NotionCustomizationTab;
  previewEnabled: boolean;

  // Computed CSS styles (applied to components)
  customStyles: CustomStyles;

  // Actions
  togglePanel: () => void;
  setActiveTab: (tab: NotionCustomizationTab) => void;
  togglePreview: () => void;

  // Compute styles from customization
  computeStyles: () => void;
}

// Helper to convert grouped customization to flat CSS custom properties
const computeCustomStyles = (
  customization: NotionCustomization | null,
): CustomStyles => {
  if (!customization) return {};

  const styles: CustomStyles = {};

  // Main colors
  if (customization.main) {
    styles["--notion-custom-page-bg"] = customization.main.pageBackground;
    styles["--notion-custom-text"] = customization.main.textColor;
    styles["--notion-custom-text-light"] = customization.main.textLightColor;
    styles["--notion-custom-border"] = customization.main.borderColor;
    styles["--notion-custom-hover-bg"] = customization.main.hoverBackground;
    styles["--notion-custom-checkbox-bg"] =
      customization.main.checkboxBackground;
  }

  // Navbar
  if (customization.navbar) {
    styles["--notion-custom-navbar-text"] = customization.navbar.textColor;
    styles["--notion-custom-navbar-bg"] = customization.navbar.background;
    styles["--notion-custom-navbar-btn-text"] = customization.navbar.buttonText;
    styles["--notion-custom-navbar-btn-bg"] =
      customization.navbar.buttonBackground;
  }

  // Footer
  if (customization.footer) {
    styles["--notion-custom-footer-text"] = customization.footer.textColor;
    styles["--notion-custom-footer-bg"] = customization.footer.background;
  }

  // Notion colors
  if (customization.notion) {
    const colors = [
      "gray",
      "brown",
      "orange",
      "yellow",
      "green",
      "blue",
      "purple",
      "pink",
      "red",
    ] as const;
    colors.forEach((color) => {
      const colorData = customization.notion?.[color];
      if (colorData) {
        styles[`--notion-custom-${color}-text`] = colorData.text;
        styles[`--notion-custom-${color}-bg`] = colorData.background;
      }
    });
  }

  // Database
  if (customization.database) {
    styles["--notion-custom-db-card-bg"] =
      customization.database.cardBackground;
    styles["--notion-custom-db-card-hover"] = customization.database.cardHover;
    styles["--notion-custom-db-weekend-bg"] =
      customization.database.weekendBackground;
  }

  // Buttons
  if (customization.buttons) {
    const buttons = [
      "default",
      "gray",
      "brown",
      "orange",
      "yellow",
      "green",
      "blue",
      "purple",
      "pink",
      "red",
    ] as const;
    buttons.forEach((btn) => {
      const btnData = customization.buttons?.[btn];
      if (btnData) {
        styles[`--notion-custom-btn-${btn}`] = btnData.background;
      }
    });
  }

  return styles;
};

export const useNotionCustomization = create<NotionCustomizationState>(
  (set, get) => ({
    // Initial UI State
    isPanelOpen: false,
    activeTab: "main",
    previewEnabled: false,

    customStyles: {},

    // UI Actions
    togglePanel: () => set((state) => ({ isPanelOpen: !state.isPanelOpen })),
    setActiveTab: (tab) => set({ activeTab: tab }),
    togglePreview: () =>
      set((state) => ({ previewEnabled: !state.previewEnabled })),

    // Set full customization from site settings
    setCustomization: (customization) => {
      const customStyles = computeCustomStyles(customization);
      set({ customization, customStyles });
    },

    // Update individual groups
    updateMain: (values) => {
      const current = get().customization?.main || {};
      const updated = { ...current, ...values };
      const newCustomization = {
        ...get().customization,
        main: updated,
      };
      set({
        customization: newCustomization,
        customStyles: computeCustomStyles(newCustomization),
      });
    },

    updateNavbar: (values) => {
      const current = get().customization?.navbar || {};
      const updated = { ...current, ...values };
      const newCustomization = {
        ...get().customization,
        navbar: updated,
      };
      set({
        customization: newCustomization,
        customStyles: computeCustomStyles(newCustomization),
      });
    },

    updateFooter: (values) => {
      const current = get().customization?.footer || {};
      const updated = { ...current, ...values };
      const newCustomization = {
        ...get().customization,
        footer: updated,
      };
      set({
        customization: newCustomization,
        customStyles: computeCustomStyles(newCustomization),
      });
    },

    updateNotionColor: (color, value) => {
      const current = get().customization?.notion || {};
      const updated = { ...current, [color]: value };
      const newCustomization = {
        ...get().customization,
        notion: updated,
      };
      set({
        customization: newCustomization,
        customStyles: computeCustomStyles(newCustomization),
      });
    },

    updateDatabase: (values) => {
      const current = get().customization?.database || {};
      const updated = { ...current, ...values };
      const newCustomization = {
        ...get().customization,
        database: updated,
      };
      set({
        customization: newCustomization,
        customStyles: computeCustomStyles(newCustomization),
      });
    },

    updateButton: (button, value) => {
      const current = get().customization?.buttons || {};
      const updated = { ...current, [button]: value };
      const newCustomization = {
        ...get().customization,
        buttons: updated,
      };
      set({
        customization: newCustomization,
        customStyles: computeCustomStyles(newCustomization),
      });
    },

    computeStyles: () => {
      const styles = computeCustomStyles(get().customization);
      set({ customStyles: styles });
    },
  }),
);
```

---

## Phase 4: Customization UI Panel

### File: `apps/web/src/components/site-settings.tsx`

Add new "Notion Theme" tab. Use grouped store access pattern:

```tsx
import { useNotionCustomization } from "@/stores/notion-customization-store";
import type { NotionCustomization } from "@/hooks/use-sites";

// In the component:
const {
  customization,
  customStyles,
  updateMain,
  updateNavbar,
  updateFooter,
  updateNotionColor,
  updateDatabase,
  updateButton,
} = useNotionCustomization();

// Color picker component
const ColorPicker = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: string;
  onChange: (value: string) => void;
}) => (
  <div className="space-y-2">
    <Label>{label}</Label>
    <div className="flex gap-2">
      <Input
        type="color"
        value={value ?? "#000000"}
        onChange={(e) => onChange(e.target.value)}
        className="w-12 h-10 p-1"
      />
      <Input
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder="#000000"
      />
    </div>
  </div>
);

// Tag color picker (text + background together)
const TagColorPicker = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: { text: string; background: string };
  onChange: (value: { text: string; background: string }) => void;
}) => (
  <div className="space-y-2">
    <Label>{label}</Label>
    <div className="flex gap-2 items-center">
      <div className="flex items-center gap-1">
        <span className="text-xs">Text</span>
        <Input
          type="color"
          value={value?.text ?? "#000000"}
          onChange={(e) => onChange({ ...value!, text: e.target.value })}
          className="w-8 h-8 p-0.5"
        />
      </div>
      <div className="flex items-center gap-1">
        <span className="text-xs">Bg</span>
        <Input
          type="color"
          value={value?.background ?? "#ffffff"}
          onChange={(e) => onChange({ ...value!, background: e.target.value })}
          className="w-8 h-8 p-0.5"
        />
      </div>
    </div>
  </div>
);
```

#### Tab Content Structure

**Main Tab:**

```tsx
<div className="space-y-4">
  <ColorPicker
    label="Page Background"
    value={customization?.main?.pageBackground}
    onChange={(v) => updateMain({ pageBackground: v })}
  />
  <ColorPicker
    label="Text Color"
    value={customization?.main?.textColor}
    onChange={(v) => updateMain({ textColor: v })}
  />
  <ColorPicker
    label="Light Text"
    value={customization?.main?.textLightColor}
    onChange={(v) => updateMain({ textLightColor: v })}
  />
  <ColorPicker
    label="Border Color"
    value={customization?.main?.borderColor}
    onChange={(v) => updateMain({ borderColor: v })}
  />
  <ColorPicker
    label="Hover Background"
    value={customization?.main?.hoverBackground}
    onChange={(v) => updateMain({ hoverBackground: v })}
  />
  <ColorPicker
    label="Checkbox Background"
    value={customization?.main?.checkboxBackground}
    onChange={(v) => updateMain({ checkboxBackground: v })}
  />
</div>
```

**Navbar Tab:**

```tsx
<div className="space-y-4">
  <ColorPicker
    label="Text Color"
    value={customization?.navbar?.textColor}
    onChange={(v) => updateNavbar({ textColor: v })}
  />
  <ColorPicker
    label="Background"
    value={customization?.navbar?.background}
    onChange={(v) => updateNavbar({ background: v })}
  />
  <ColorPicker
    label="Button Text"
    value={customization?.navbar?.buttonText}
    onChange={(v) => updateNavbar({ buttonText: v })}
  />
  <ColorPicker
    label="Button Background"
    value={customization?.navbar?.buttonBackground}
    onChange={(v) => updateNavbar({ buttonBackground: v })}
  />
</div>
```

**Footer Tab:**

```tsx
<div className="space-y-4">
  <ColorPicker
    label="Text Color"
    value={customization?.footer?.textColor}
    onChange={(v) => updateFooter({ textColor: v })}
  />
  <ColorPicker
    label="Background"
    value={customization?.footer?.background}
    onChange={(v) => updateFooter({ background: v })}
  />
</div>
```

**Notion Colors Tab:**

```tsx
<div className="space-y-4">
  <TagColorPicker
    label="Gray"
    value={customization?.notion?.gray}
    onChange={(v) => updateNotionColor("gray", v)}
  />
  <TagColorPicker
    label="Brown"
    value={customization?.notion?.brown}
    onChange={(v) => updateNotionColor("brown", v)}
  />
  {/* ... all 9 colors */}
</div>
```

**Database Tab:**

```tsx
<div className="space-y-4">
  <ColorPicker
    label="Card Background"
    value={customization?.database?.cardBackground}
    onChange={(v) => updateDatabase({ cardBackground: v })}
  />
  <ColorPicker
    label="Card Hover"
    value={customization?.database?.cardHover}
    onChange={(v) => updateDatabase({ cardHover: v })}
  />
  <ColorPicker
    label="Weekend Background"
    value={customization?.database?.weekendBackground}
    onChange={(v) => updateDatabase({ weekendBackground: v })}
  />
</div>
```

**Buttons Tab:**

```tsx
<div className="space-y-4">
  <ColorPicker
    label="Default"
    value={customization?.buttons?.default?.background}
    onChange={(v) => updateButton("default", { background: v })}
  />
  <ColorPicker
    label="Gray"
    value={customization?.buttons?.gray?.background}
    onChange={(v) => updateButton("gray", { background: v })}
  />
  {/* ... all 10 buttons */}
</div>
```

#### Update Function Pattern

```tsx
const updateNotionSetting = <K extends keyof NotionCustomization>(
  key: K,
  value: NotionCustomization[K],
) => {
  updateSiteSetting({
    notionCustomization: {
      ...settings.notionCustomization,
      [key]: value,
    },
  });
};
```

---

## Phase 5: Apply Customization to Components

### Pattern: Spread store styles to components

The store's `customStyles` object contains all CSS custom properties. Apply them by spreading onto components.

### File: `apps/web/src/components/notion/notion-renderer.tsx`

```tsx
import { useNotionCustomization } from "@/stores/notion-customization-store";

export function NotionRenderer({ siteId, ...props }: NotionRendererProps) {
  const { customStyles } = useNotionCustomization();

  return (
    <div
      style={customStyles as React.CSSProperties}
      className="notion-customized"
    >
      <NotionRendererInner {...props} />
    </div>
  );
}
```

### File: `apps/web/src/components/site-header.tsx` (Navbar)

```tsx
import { useNotionCustomization } from "@/stores/notion-customization-store";

export function SiteHeader() {
  const { customStyles } = useNotionCustomization();

  const navbarStyle: React.CSSProperties = {
    color: customStyles["--notion-custom-navbar-text"],
    backgroundColor: customStyles["--notion-custom-navbar-bg"],
  };

  const buttonStyle: React.CSSProperties = {
    color: customStyles["--notion-custom-navbar-btn-text"],
    backgroundColor: customStyles["--notion-custom-navbar-btn-bg"],
  };

  return (
    <header style={navbarStyle} className="...">
      <h1 style={navbarStyle}>Nastro</h1>
      <Button style={buttonStyle}>Action</Button>
    </header>
  );
}
```

### File: `apps/web/src/components/site-footer.tsx` (Footer - create if needed)

```tsx
import { useNotionCustomization } from "@/stores/notion-customization-store";

export function SiteFooter() {
  const { customStyles } = useNotionCustomization();

  const footerStyle: React.CSSProperties = {
    color: customStyles["--notion-custom-footer-text"],
    backgroundColor: customStyles["--notion-custom-footer-bg"],
  };

  return (
    <footer style={footerStyle} className="...">
      {/* footer content */}
    </footer>
  );
}
```

### Initialization Pattern

When site settings load, initialize the store:

```tsx
// In site-settings.tsx or a parent component
const { setCustomization } = useNotionCustomization();

// When site data loads:
useEffect(() => {
  if (site?.siteSetting?.notionCustomization) {
    setCustomization(site.siteSetting.notionCustomization);
  }
}, [site]);
```

### Save to Server

When user saves settings, persist to server:

```tsx
const { customization } = useNotionCustomization();

const handleSave = async () => {
  await updateSiteSetting({
    notionCustomization: customization,
  });
};
```

---

## Implementation Order

1. **Phase 1**: Extend SiteSetting type in `use-sites.ts`
2. **Phase 2**: Add CSS variable mappings in `notion.css`
3. **Phase 3**: Create Zustand store
4. **Phase 4**: Add UI controls to `site-settings.tsx`
5. **Phase 5**: Apply styles in `notion-renderer.tsx`
6. **Test**: Verify all mappings work correctly

---

## Open Questions

1. **Dark mode**: Should custom colors apply to both light and dark modes? (react-notion-x has separate dark mode variables)

2. **Calendar weekend**: Need to verify exact CSS selector for calendar weekend cells in react-notion-x

3. **Real-time preview**: Should changes preview instantly or require "Save" button?

4. **Color opacity**: Some notion colors have transparent variants - should users customize opacity separately?
