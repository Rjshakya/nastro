# Dark Mode Implementation Plan (Revised v2)

## Overview

Implement per-site dark mode settings that allow users to customize their Notion page appearance separately for light and dark themes. Store dark mode preference in `general.isDark` for SSR support and user preference.

## Goals

- Store `isDark` preference in `general.isDark` (saved to DB)
- Allow separate theme customization for light and dark modes
- Use hex color values for theme defaults
- Minimal changes to existing codebase
- Non-breaking: existing sites continue to work

## Architecture

### 1. Type Definitions (`types/customization.ts`)

**Update `GeneralSettingsUI` interface:**

```typescript
export interface GeneralSettingsUI {
  siteName?: string;
  pageWidth?: number;
  header?: boolean;
  footer?: boolean;
  isDark?: boolean; // NEW: Dark mode preference (stored in DB)
}
```

**Update `NotionPageSettings` interface:**

```typescript
export interface NotionPageSettings {
  general?: GeneralSettingsUI;
  theme?: ThemeSettingsUI;
  darkTheme?: ThemeSettingsUI; // NEW: Dark mode theme settings
  typography?: TypoSettingsUI;
  layout?: LayoutSettingsUI;
  seo?: SEO;
  // Note: isDark moved to general.isDark
}
```

**Note:** `isDark` is now stored in `general.isDark` for persistence. Only `theme` needs a dark variant since colors change between modes.

---

### 2. Store Updates (`stores/notion-settings.ts`)

**Update `NotionSettingsStore` interface:**

```typescript
interface NotionSettingsStore {
  styles?: CustomStyles;
  settings: NotionPageSettings;
  updateSettings: (settings: NotionPageSettings) => void;
  isPanelOpen: boolean;
  togglePanel: (v: boolean) => void;
  isDark: boolean; // Current editor theme mode (from settings.general.isDark)
  setIsDark: (isDark: boolean) => void;
}
```

**Update store implementation:**

```typescript
export const useNotionSettingsStore = create<NotionSettingsStore>(
  (set, get) => ({
    settings: {},
    isDark: false,

    updateSettings(settings) {
      // isDark comes from settings.general.isDark
      const isDark = settings.general?.isDark ?? false;
      const styles = computeCustomStyles(settings, isDark);
      set({ settings, styles, isDark });
    },

    setIsDark(isDark) {
      const { settings } = get();
      // Update settings.general.isDark when changing mode
      const updatedSettings = {
        ...settings,
        general: {
          ...settings.general,
          isDark,
        },
      };
      const styles = computeCustomStyles(updatedSettings, isDark);
      set({ settings: updatedSettings, isDark, styles });
    },

    // ... rest of store
  }),
);
```

**Update `computeCustomStyles` function:**

```typescript
export const computeCustomStyles = (
  settings: NotionPageSettings | null,
  isDark: boolean = false,
): CustomStyles => {
  const styles: CustomStyles = {};

  // Use darkTheme when in dark mode, otherwise use theme
  const themeSettings = isDark ? settings?.darkTheme : settings?.theme;

  const theme = computeTheme(themeSettings);
  const typography = computeTypography(settings?.typography);
  const layout = computeLayout(settings?.layout);
  const general = computeGeneral(settings?.general);

  return { ...styles, ...theme, ...typography, ...layout, ...general };
};
```

---

### 3. Default Settings (`lib/settings-defaults.ts`)

**Add dark theme defaults (hex values converted from global.css .dark):**

```typescript
export const defaultDarkThemeSettings = (
  darkThemeSettings: NotionPageSettings["darkTheme"],
) => {
  return {
    main: {
      pageBackground: "#0a0a0a", // oklch(0.145 0 0)
      textColor: "#f5f5f5", // oklch(0.985 0 0)
      checkboxBackground: "#2eaadc", // oklch(0.685 0.169 237.323)
      ...darkThemeSettings?.main,
    },
    header: {
      background: "#0f0f10", // oklch(0.141 0.005 285.823)
      textColor: "#f5f5f5", // oklch(0.985 0 0)
      buttonText: "#a1a1aa", // oklch(0.705 0.015 286.067)
      buttonBackground: "#f4f4f5", // oklch(0.967 0.001 286.375)
      ...darkThemeSettings?.header,
    },
    footer: {
      background: "#0f0f10", // Match header
      textColor: "#f5f5f5",
      buttonText: "#a1a1aa",
      buttonBackground: "#f4f4f5",
      ...darkThemeSettings?.footer,
    },
    notion: {
      // Darker, more saturated colors for dark mode
      gray: "#9ca3af", // oklch(75% 0.005 70.4)
      brown: "#8b7355", // oklch(60% 0.04 48.7)
      orange: "#f97316", // oklch(78% 0.14 56.2)
      yellow: "#eab308", // oklch(85% 0.13 82.5)
      teal: "#14b8a6", // oklch(65% 0.02 184.2)
      blue: "#3b82f6", // oklch(70% 0.08 240.2)
      purple: "#a855f7", // oklch(68% 0.11 298.6)
      pink: "#ec4899", // oklch(68% 0.13 344.4)
      red: "#ef4444", // oklch(72% 0.14 25.8)
      ...darkThemeSettings?.notion,
    },
    notionBackground: {
      // Dark background variants
      gray: "#27272a", // oklch(28% 0.005 70.4)
      brown: "#451a03", // oklch(30% 0.02 48.7)
      orange: "#7c2d12", // oklch(35% 0.05 56.2)
      yellow: "#713f12", // oklch(38% 0.05 82.5)
      teal: "#134e4a", // oklch(32% 0.02 184.2)
      blue: "#1e3a8a", // oklch(33% 0.04 240.2)
      purple: "#581c87", // oklch(31% 0.04 298.6)
      pink: "#831843", // oklch(30% 0.05 344.4)
      red: "#7f1d1d", // oklch(32% 0.05 25.8)
      ...darkThemeSettings?.notionBackground,
    },
    card: {
      cardBackground: "#18181b", // oklch(0.21 0.006 285.885)
      cardHover: "#27272a", // oklch(0.274 0.006 286.033)
      cardText: "#f5f5f5", // oklch(0.985 0 0)
      cardBorder: "#27272a", // oklch(0.274 0.006 286.033)
      ...darkThemeSettings?.card,
    },
    buttons: {
      // Dark button variants
      gray: "#3f3f46", // oklch(33.5% 0.005 240.5)
      brown: "#57534e", // oklch(32.4% 0.027 46.2)
      orange: "#9a3412", // oklch(34.8% 0.047 55.4)
      yellow: "#854d0e", // oklch(38.2% 0.044 76.5)
      teal: "#115e59", // oklch(34.6% 0.028 152.1)
      blue: "#1e40af", // oklch(34.1% 0.031 234.3)
      purple: "#6b21a8", // oklch(31.8% 0.046 295.5)
      pink: "#9d174d", // oklch(31.2% 0.043 355.2)
      red: "#991b1b", // oklch(32.1% 0.054 26.3)
      ...darkThemeSettings?.buttons,
    },
    defaultButton: {
      background: "#ffffff", // oklch(1 0 0)
      textColor: "#0a0a0a", // oklch(0.145 0 0)
      borderColor: "#71717a", // oklch(0.552 0.016 285.938)
      hoverBackground: "#ffffff", // oklch(1 0 0)
      ...darkThemeSettings?.defaultButton,
    },
  };
};
```

**Update `applyDefaultSettings`:**

```typescript
export const applyDefaultSettings = ({
  existingSettings,
  page,
  site,
  pageId,
}: {
  existingSettings: NotionPageSettings | null | undefined;
  page: ExtendedRecordMap;
  site: Site;
  pageId: string;
}): NotionPageSettings => {
  const seo = getNotionPageSeo({ page, pageId, site });

  return {
    theme: {
      ...defaultThemeSettings(existingSettings?.theme),
    },
    darkTheme: {
      ...defaultDarkThemeSettings(existingSettings?.darkTheme),
    },
    typography: {
      ...defaultTypographySettings,
      ...existingSettings?.typography,
      sizes: {
        ...defaultTypographySettings.sizes,
        ...existingSettings?.typography?.sizes,
      },
    },
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
    },
    general: {
      ...defaultGeneralSettings,
      ...existingSettings?.general,
      // Preserve isDark preference
      isDark: existingSettings?.general?.isDark ?? false,
    },
    seo,
  };
};
```

---

### 4. Theme Toggle Integration (`components/ThemeToggle.tsx`)

**Update ThemeToggle to use newTheme variable:**

```typescript
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { useNotionSettingsStore } from "#/stores/notion-settings";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { setIsDark } = useNotionSettingsStore();

  function toggleTheme() {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);

    // Use newTheme directly to set isDark (no need for classList check)
    setIsDark(newTheme === "dark");
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Moon className="h-4 w-4" />
      ) : (
        <Sun className="h-4 w-4" />
      )}
    </Button>
  );
}
```

---

### 5. Site Route SSR Support (`routes/site/$siteId.tsx`)

**Update loader to use isDark from general settings:**

```typescript
loader: async ({ params, deps }) => {
  const { siteId } = params;
  const { pageId } = deps;
  const { data } = await getSite({ siteId, pageId });
  const site = data?.site as Site;
  const page = data?.page as ExtendedRecordMap;
  const settings = site?.siteSetting;

  // Use isDark from general settings for SSR (stored in DB)
  const isDark = settings?.general?.isDark ?? false;

  const defaultSettings = applyDefaultSettings({
    existingSettings: settings,
    page,
    pageId,
    site,
  });

  // Initialize store with settings
  useNotionSettingsStore.getState().updateSettings(defaultSettings);

  if (settings?.typography?.fonts) {
    Promise.all([
      loadFont(settings?.typography?.fonts?.primary as string),
      loadFont(settings?.typography?.fonts?.secondary as string),
    ]);
  }

  return { site, page, seo: defaultSettings.seo, isDark };
},
```

---

### 6. General Settings UI Tab (`components/site/settings/tabs/tab-general.tsx`)

**Add shadcn Switch component for isDark:**

```typescript
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

// In the component render:
<div className="flex items-center justify-between space-x-2">
  <Label htmlFor="dark-mode" className="flex flex-col space-y-1">
    <span>Dark Mode</span>
    <span className="text-muted-foreground text-sm">
      Enable dark mode for this site
    </span>
  </Label>
  <Switch
    id="dark-mode"
    checked={settings.general?.isDark ?? false}
    onCheckedChange={(checked) => {
      updateSettings({
        ...settings,
        general: {
          ...settings.general,
          isDark: checked,
        },
      });
    }}
  />
</div>
```

---

### 7. Settings Panel Theme Editing

**Update Theme Tab to Edit Correct Theme Section:**

```typescript
// In tab-theme.tsx
const { settings, updateSettings, isDark } = useNotionSettingsStore();

const handleColorChange = (
  sectionId: string,
  fieldKey: string,
  color: string,
) => {
  const themeKey = isDark ? "darkTheme" : "theme";

  updateSettings({
    ...settings,
    [themeKey]: {
      ...settings[themeKey],
      [sectionId]: {
        ...settings[themeKey]?.[sectionId],
        [fieldKey]: color,
      },
    },
  });
};

// Note: Visual indicator is already present, no need to add another
```

---

### 8. Settings Persistence

**Update save logic in `settings.tsx`:**

```typescript
const handleSave = async () => {
  await updateSite({
    siteId,
    data: {
      siteSetting: {
        general: settings.general, // includes isDark
        theme: settings.theme,
        darkTheme: settings.darkTheme,
        typography: settings.typography,
        layout: settings.layout,
        seo: settings.seo,
      },
    },
  });
};
```

---

## Implementation Order

### Phase 1: Core Types & Store

1. Add `isDark` to `GeneralSettingsUI` interface
2. Add `darkTheme` to `NotionPageSettings` interface (remove separate isDark field)
3. Update store to read isDark from `settings.general.isDark`
4. Update `computeCustomStyles` to accept isDark parameter
5. Create `defaultDarkThemeSettings` with hex color values
6. Update `applyDefaultSettings` to include dark theme and isDark in general

### Phase 2: Theme Toggle Integration

1. Update `ThemeToggle` to use `newTheme` variable for `setIsDark`
2. Update site route loader to read `isDark` from `settings.general.isDark`

### Phase 3: Settings UI

1. Add shadcn Switch component to general settings tab for `isDark`
2. Update theme tabs to edit `darkTheme` when `isDark` is true

### Phase 4: Testing & Polish

1. Test toggling between modes in editor
2. Test saving/loading both theme variants
3. Test SSR with different `isDark` values from DB
4. Verify existing sites work without `darkTheme`
5. Verify hex color values are correct

---

## Edge Cases & Considerations

### 1. Backward Compatibility

- Existing sites without `darkTheme` use light theme as fallback
- When `darkTheme` missing, generate from `defaultDarkThemeSettings`
- Existing sites without `general.isDark` default to `false`

### 2. SSR Support

- `general.isDark` is stored in database and loaded during SSR
- `$siteId.tsx` loader uses `settings.general.isDark` for initial render
- Client-side theme toggle updates both DOM class and store

### 3. Color Values

- All dark theme defaults use hex format for consistency
- Values converted from global.css `.dark` selector oklch values
- Approximate hex values provided (exact conversion may vary)

### 4. User Experience

- Single `isDark` switch in general settings controls both editor and site
- Theme tab shows current mode (already has indicator)
- Separate color configurations for light and dark modes

---

## Files to Modify

1. `apps/tanstack/src/types/customization.ts`
   - Add `isDark` to GeneralSettingsUI
   - Add `darkTheme` to NotionPageSettings

2. `apps/tanstack/src/stores/notion-settings.ts`
   - Update to read isDark from `settings.general.isDark`
   - Update `setIsDark` to update `settings.general.isDark`
   - Update `computeCustomStyles`

3. `apps/tanstack/src/lib/settings-defaults.ts`
   - Add `defaultDarkThemeSettings` with hex values
   - Update `applyDefaultSettings`

4. `apps/tanstack/src/components/ThemeToggle.tsx`
   - Use `newTheme` variable instead of classList check
   - Call `setIsDark(newTheme === "dark")`

5. `apps/tanstack/src/routes/site/$siteId.tsx`
   - Read `isDark` from `settings.general.isDark`
   - Initialize store with correct mode

6. `apps/tanstack/src/components/site/settings/tabs/tab-general.tsx`
   - Add shadcn Switch for `isDark`

7. `apps/tanstack/src/components/site/settings/tabs/tab-theme.tsx`
   - Update to edit `darkTheme` when `isDark` is true

8. `apps/tanstack/src/components/site/settings/settings.tsx`
   - Update save to include `darkTheme`

---

## Migration Strategy

For existing sites:

```typescript
// In applyDefaultSettings
const darkTheme = existingSettings?.darkTheme
  ? existingSettings.darkTheme
  : defaultDarkThemeSettings(undefined);

const isDark = existingSettings?.general?.isDark ?? false;
```

Dark theme and isDark preference will be generated from defaults on first load.

---

## Testing Checklist

- [ ] `isDark` stored in `general.isDark` and persisted to DB
- [ ] Toggle theme updates preview immediately
- [ ] Light theme settings persist correctly
- [ ] Dark theme settings persist correctly
- [ ] SSR renders correct theme based on `general.isDark` from DB
- [ ] Existing sites load without errors
- [ ] Settings save includes both theme and darkTheme
- [ ] Settings save includes isDark in general
- [ ] Hex color values correct in dark theme defaults
- [ ] ThemeToggle uses newTheme variable correctly
- [ ] Visual indicator (existing) shows correct mode

---

## Summary

This implementation:

- Stores `isDark` in `settings.general.isDark` for persistence and SSR
- Uses hex color values for all dark theme defaults
- ThemeToggle uses `newTheme` variable directly (no classList check needed)
- Relies on existing visual indicator in settings panel
- Maintains backward compatibility with existing sites
- Provides separate light and dark theme configurations

Key insight: `general.isDark` is the single source of truth for dark mode preference, used by both editor and SSR.
