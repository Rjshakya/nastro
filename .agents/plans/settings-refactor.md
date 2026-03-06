# Settings Refactoring Plan

## Overview

Refactor the settings component to be dynamically generated based on the `NotionPageSettings` type. Each key in the type becomes a tab, with separate content components for each section.

## Current State

- **File**: `apps/tanstack/src/components/site/settings/settings.tsx`
- Current implementation has hardcoded tabs: general, theme, layout, font, seo
- Tab triggers and content are manually defined
- **Store**: `useNotionSettingsStore` in `apps/tanstack/src/stores/notion-settings.ts`

## Target Type Structure

```typescript
interface NotionPageSettings {
  general?: {};
  theme?: ThemeSettingsUI;
  typo?: TypoSettingsUI;
  layout?: LayoutSettingsUI;
}
```

## Implementation Plan

### Phase 1: Create Settings V2 Component

1. **Create Settings V2 File**
   - File: `apps/tanstack/src/components/site/settings/settings-v2.tsx`
   - Main component that renders tabs based on `NotionPageSettings` keys
   - Use TypeScript mapped types to ensure type safety

2. **State Management Integration**
   - Use `useNotionSettingsStore` for all settings state
   - Do not modify existing stores or files
   - Tab components will read from and update the store directly

### Phase 2: Create Tab Components with Tab Prefix

Create separate files for each tab content component in `tabs/` directory with `Tab` prefix:

1. **TabGeneral**
   - File: `apps/tanstack/src/components/site/settings/tabs/tab-general.tsx`
   - Uses `settings.general` from store
   - Handles: Site name, basic settings

2. **TabTheme**
   - File: `apps/tanstack/src/components/site/settings/tabs/tab-theme.tsx`
   - Uses `settings.theme` from store
   - Handles: Colors, main colors, navbar, footer, notion colors, cards, buttons

3. **TabTypo**
   - File: `apps/tanstack/src/components/site/settings/tabs/tab-typo.tsx`
   - Uses `settings.typo` from store
   - Handles: Font sizes, font families

4. **TabLayout**
   - File: `apps/tanstack/src/components/site/settings/tabs/tab-layout.tsx`
   - Uses `settings.layout` from store
   - Handles: Header, footer, sidebar configuration

### Phase 3: Dynamic Tab Generation

1. **Extract Keys from Type**
   - Use `keyof NotionPageSettings` to get all tab names
   - Generate `TabsTrigger` components dynamically from keys
   - Capitalize and format keys for display (e.g., "typo" → "Typo")

2. **Component Registry**
   - Create a registry object: `Record<keyof NotionPageSettings, ComponentType>`
   - Maps each key to its corresponding `Tab*` component
   - Example: `general` → `TabGeneral`, `theme` → `TabTheme`

3. **Render Tab Content Dynamically**
   - Use the registry to render the correct component for each tab
   - Wrap each in `TabsContent` with value matching the key
   - Each tab component reads its settings from `useNotionSettingsStore`

### Phase 4: Integration

1. **No File Movements**
   - Keep all existing files in place (`settings.tsx`, `theme-settings.tsx`, `font-settings.tsx`)
   - New files are appended only
   - Existing functionality remains untouched

2. **Store Integration**
   - Each tab component imports `useNotionSettingsStore`
   - Read: `const { settings } = useNotionSettingsStore()`
   - Update: `updateSettings({ ...settings, [key]: newValue })`

3. **Save Functionality**
   - Save button in `settings-v2.tsx` uses store data
   - Convert settings to API format on save
   - Call existing mutation hooks for persistence

### File Structure

```
apps/tanstack/src/components/site/settings/
├── settings.tsx                      # Existing (keep as-is)
├── settings-v2.tsx                   # NEW - Main V2 component
├── theme-settings.tsx                # Existing (keep as-is)
├── font-settings.tsx                 # Existing (keep as-is)
└── tabs/                             # NEW DIRECTORY
    ├── tab-general.tsx               # General settings
    ├── tab-theme.tsx                 # Theme/colors settings
    ├── tab-typo.tsx                  # Typography settings
    └── tab-layout.tsx                # Layout settings
```

### Component Pattern

Each tab component follows this pattern:

```typescript
// apps/tanstack/src/components/site/settings/tabs/tab-theme.tsx
import { useNotionSettingsStore } from "#/stores/notion-settings";

export function TabTheme() {
  const { settings, updateSettings } = useNotionSettingsStore();
  const themeSettings = settings.theme;

  const handleUpdate = (newTheme: ThemeSettingsUI) => {
    updateSettings({ ...settings, theme: newTheme });
  };

  return (
    // Theme settings UI here
  );
}
```

### Type Safety Strategy

1. Use mapped types to ensure all `NotionPageSettings` keys have corresponding `Tab*` components
2. Create registry type: `type TabRegistry = Record<keyof NotionPageSettings, FC>`
3. Compile-time errors if a key is added to the type but no `Tab*` component exists
4. Each tab component has access to properly typed settings via the store

### Migration Strategy

1. Build `settings-v2.tsx` alongside existing `settings.tsx`
2. Build `tabs/` directory with all `Tab*` components
3. No modifications to existing files
4. Test thoroughly with all tab types
5. Switch import in `site-editor.tsx` when ready
6. Remove old `settings.tsx` only after full validation

## Success Criteria

- [ ] All `NotionPageSettings` keys render as tabs automatically
- [ ] Each tab has its own file with `Tab` prefix (e.g., `TabGeneral`)
- [ ] Uses `useNotionSettingsStore` for state management
- [ ] No existing files are moved or modified
- [ ] Type safety enforced at compile time
- [ ] Settings changes persist correctly via store
