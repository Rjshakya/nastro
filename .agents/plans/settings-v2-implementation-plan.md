# Settings V2 - Full Implementation Plan

## Executive Summary

Settings V2 is a dynamically-generated settings UI for the Notion-based website builder. It replaces the hardcoded V1 implementation with a type-driven, maintainable architecture where tabs are generated automatically from the `NotionPageSettings` TypeScript type.

**Current Status**: Partially implemented - V2 is active in production but missing critical functionality.

---

## Architecture Overview

### Type-Driven Design

Settings V2 uses TypeScript types as the single source of truth:

```typescript
interface NotionPageSettings {
  general?: GeneralSettingsUI; // ✓ Implemented
  theme?: ThemeSettingsUI; // ✓ Implemented
  darkTheme?: ThemeSettingsUI; // ✓ Supported (conditional)
  typography?: TypoSettingsUI; // ✗ Missing - placeholder
  layout?: LayoutSettingsUI; // ✗ Missing - placeholder
  seo?: SeoSettingsUI; // ✗ Missing - placeholder
}
```

Each type has a `type` discriminator field that allows dynamic rendering.

### State Management

- **Store**: `useNotionSettingsStore` (Zustand) in `apps/tanstack/src/stores/notion-settings.ts`
- **Settings Shape**: `NotionPageSettings` interface
- **Style Computation**: `computeCustomStyles()` transforms settings → CSS custom properties
- **Persistence**: Settings saved to `sites.site_setting` JSONB column

### Component Pattern

```
SettingsV2 (main)
├── Tabs (dynamically generated from NotionPageSettings keys)
│   ├── TabGeneral    → renders GeneralSettingsUI
│   ├── TabTheme      → renders ThemeSettingsUI (with dark mode support)
│   ├── TabLayout     → renders LayoutSettingsUI
│   ├── TabTypo       → renders TypoSettingsUI
│   └── TabSeo        → renders SeoSettingsUI
└── SheetFooter
    ├── Save Button   → persists to database
    └── Cancel Button → closes panel
```

---

## Current Implementation Status

### ✅ Completed

1. **TabGeneral** (`tabs/tab-general.tsx`)
   - Dynamic field rendering based on value type
   - Checkbox for booleans (`header`, `footer`, `isDark`)
   - Input for strings (`siteName`, `slug`)
   - SliderInput for numbers (`pageWidth`)

2. **TabTheme** (`tabs/tab-theme.tsx`)
   - Collapsible sections for each theme area
   - ColorPicker for all color values
   - Dark mode support (switches between `theme` and `darkTheme`)
   - 8 sections: main, header, footer, notion, notionBackground, card, buttons, defaultButton

3. **Store Integration**
   - Full Zustand store with `updateSettings()`
   - Automatic CSS custom property computation
   - Dark mode toggle support

### ❌ Missing / Incomplete

1. **Save Functionality** (`settings.tsx` line 73)
   - Save button has empty `onClick={() => {}}`
   - No integration with `useUpdateSite` hook
   - No loading states or error handling

2. **TabLayout** (`tabs/tab-layout.tsx` line 24)
   - Only returns `<div></div>`
   - Missing: header, footer, sidebar, gallery, card, tabs sections
   - LinksComponent partially started but incomplete
   - ListsComponent is empty function

3. **TabTypo** - File doesn't exist
   - Needs: sizes (sliders), fonts (inputs), spacing (sliders)

4. **TabSeo** - File doesn't exist
   - Needs: title, description, ogImage, pageUrl, pageIcon inputs

---

## Detailed Implementation Roadmap

### Phase 1: Fix Save Functionality (Critical)

**Priority**: HIGH - Currently settings don't persist!

**Files to Modify**:

- `apps/tanstack/src/components/site/settings-v2/settings.tsx`

**Implementation**:

```typescript
// Add to imports
import { useUpdateSite } from "#/hooks/use-sites";

// In component
export const SettingsV2 = ({ pageSettings, onOpenChange, open, siteId }: {
  pageSettings: NotionPageSettings;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  siteId: string; // Need to pass this from parent
}) => {
  const { updateSite, isLoading } = useUpdateSite();
  const { settings } = useNotionSettingsStore();

  const handleSave = async () => {
    try {
      await updateSite({
        siteId,
        siteSetting: settings, // Send entire settings object
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to save settings:", error);
      // Show toast error
    }
  };

  return (
    // ... existing JSX ...
    <Button size="sm" onClick={handleSave} disabled={isLoading}>
      {isLoading ? "Saving..." : "Save Changes"}
    </Button>
    // ...
  );
};
```

**Site Editor Changes**:

- Pass `siteId` from `site.id` to `SettingsV2`

---

### Phase 2: Implement TabLayout

**Priority**: HIGH - Layout settings are core functionality

**File**: `apps/tanstack/src/components/site/settings-v2/tabs/tab-layout.tsx`

**LayoutSettingsUI Structure**:

```typescript
interface LayoutSettingsUI {
  type: "layout";
  header?: LayoutHeaderUI; // text, logo, links[], lists[], height, width
  footer?: LayoutFooterUI; // text, logo, links[], height, width
  sidebar?: LayoutHeaderUI; // Same as header
  gallery?: LayoutGalleryUI; // gridGap
  card?: LayoutCardUI; // borderSize, paddingX/Y, cover{}, body{}
  tabs?: LayoutTabsUI; // display, backgroundColor, activeBackgroundColor
}
```

**Implementation Plan**:

#### 2.1 Layout Section Component (Reusable)

Create a component that handles header/footer/sidebar (they share the same structure):

```typescript
interface LayoutSectionProps {
  sectionKey: "header" | "footer" | "sidebar";
  section: LayoutHeaderUI | LayoutFooterUI;
}

const LayoutSection = ({ sectionKey, section }: LayoutSectionProps) => {
  // Collapsible section with:
  // - text: Input
  // - logo: Input
  // - height: SliderInput (0-200)
  // - width: SliderInput (0-100%)
  // - links: LinksComponent
  // - lists: ListsComponent (for header/sidebar only)
};
```

#### 2.2 LinksComponent

Already partially implemented, needs completion:

```typescript
interface LinksComponentProps {
  links?: HeaderLink[];
  onChange: (links: HeaderLink[]) => void;
}

// Features:
// - Display current links as chips/tags
// - Add button opens Popover with form:
//   - text: Input
//   - url: Input
//   - variant: Select (default, outline, secondary, ghost, destructive, link)
// - Remove individual links
// - Edit existing links
```

#### 2.3 ListsComponent

For header/sidebar dropdown lists:

```typescript
interface ListsComponentProps {
  lists?: HeaderList[];
  onChange: (lists: HeaderList[]) => void;
}

// Features:
// - Each list has:
//   - text: Input (list title)
//   - links: LinksComponent (nested)
// - Add/remove lists
```

#### 2.4 Gallery Section

Simple section:

```typescript
// Collapsible: "Gallery"
// Fields:
// - gridGap: SliderInput (0-50px)
```

#### 2.5 Card Section

Complex nested structure:

```typescript
// Collapsible: "Card"
// Fields:
// - borderSize: SliderInput (0-10px)
// - paddingX: SliderInput (0-50px)
// - paddingY: SliderInput (0-50px)
//
// Nested Collapsible: "Cover"
// - height: SliderInput (50-400px)
// - radius: SliderInput (0-30px)
// - paddingX: SliderInput (0-50px)
// - paddingY: SliderInput (0-50px)
// - marginX: SliderInput (0-50px)
// - marginY: SliderInput (0-50px)
//
// Nested Collapsible: "Body"
// - paddingX: SliderInput (0-50px)
// - paddingY: SliderInput (0-50px)
// - marginX: SliderInput (0-50px)
// - marginY: SliderInput (0-50px)
```

#### 2.6 Tabs Section

```typescript
// Collapsible: "Tabs"
// Fields:
// - display: Select ("flex" | "none")
// - backgroundColor: ColorPicker
// - activeBackgroundColor: ColorPicker
```

---

### Phase 3: Implement TabTypo

**Priority**: MEDIUM

**File**: `apps/tanstack/src/components/site/settings-v2/tabs/tab-typo.tsx` (NEW)

**TypoSettingsUI Structure**:

```typescript
interface TypoSettingsUI {
  type: "typography";
  sizes?: TypoSizesUI; // pageTitle, heading1-3, base
  fonts?: TypoFontsUI; // primary, secondary
  spacing?: TypoSpacingUI; // lineHeight, letterSpacing, headingLetterSpacing, fontWeight
}
```

**Implementation**:

```typescript
export const TabTypo = ({ typography }: { typography: TypoSettingsUI }) => {
  return (
    <div className="grid gap-4">
      {/* Sizes Section */}
      <Collapsible>
        <CollapsibleTrigger>Font Sizes</CollapsibleTrigger>
        <CollapsibleContent>
          <SliderInput label="Page Title" min={20} max={80} />
          <SliderInput label="Heading 1" min={20} max={60} />
          <SliderInput label="Heading 2" min={16} max={48} />
          <SliderInput label="Heading 3" min={14} max={36} />
          <SliderInput label="Base Text" min={12} max={24} />
        </CollapsibleContent>
      </Collapsible>

      {/* Fonts Section */}
      <Collapsible>
        <CollapsibleTrigger>Fonts</CollapsibleTrigger>
        <CollapsibleContent>
          <Input label="Primary Font" placeholder="Inter, sans-serif" />
          <Input label="Secondary Font" placeholder="Georgia, serif" />
        </CollapsibleContent>
      </Collapsible>

      {/* Spacing Section */}
      <Collapsible>
        <CollapsibleTrigger>Spacing</CollapsibleTrigger>
        <CollapsibleContent>
          <SliderInput label="Line Height" min={1} max={2.5} step={0.1} />
          <SliderInput label="Letter Spacing" min={-2} max={5} step={0.1} />
          <SliderInput label="Heading Letter Spacing" min={-2} max={5} step={0.1} />
          <SliderInput label="Font Weight" min={100} max={900} step={100} />
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
```

---

### Phase 4: Implement TabSeo

**Priority**: MEDIUM

**File**: `apps/tanstack/src/components/site/settings-v2/tabs/tab-seo.tsx` (NEW)

**SeoSettingsUI Structure**:

```typescript
interface SeoSettingsUI {
  type: "seo";
  title?: string;
  description?: string;
  ogImage?: string;
  pageUrl?: string;
  pageIcon?: string;
}
```

**Implementation**:

Dynamic implementation using `getEntries` like TabGeneral:

```typescript
export const TabSeo = ({ seo }: { seo: SeoSettingsUI }) => {
  const { settings, updateSettings } = useNotionSettingsStore();

  return (
    <div className="grid gap-4 py-4">
      {getEntries(seo).map(([key, value]) => {
        if (!key || key === "type") return null;

        return (
          <div key={key} className="w-full grid gap-2">
            <Label className="capitalize">{key}</Label>
            <Input
              value={settings?.seo?.[key as keyof SeoSettingsUI] || ""}
              onChange={(e) =>
                updateSettings({
                  ...settings,
                  seo: { ...settings?.seo, [key]: e.target.value, type: "seo" },
                })
              }
              placeholder={key}
            />
          </div>
        );
      })}
    </div>
  );
};
```

---

### Phase 5: Integration & Testing

**Update Main Settings Component**:

In `settings.tsx`, update `RenderSettingSection`:

```typescript
export const RenderSettingSection = ({
  section,
}: {
  section: NotionPageSettings[keyof NotionPageSettings];
}) => {
  if (!section) return null;

  switch (section.type) {
    case "general":
      return <TabGeneral general={section} />;
    case "theme":
      return <TabTheme theme={section} />;
    case "layout":
      return <TabLayout layout={section} />;  // IMPLEMENTED
    case "typography":
      return <TabTypo typography={section} />; // IMPLEMENTED
    case "seo":
      return <TabSeo seo={section} />;        // IMPLEMENTED
    default:
      return null;
  }
};
```

**Update Site Editor**:

Pass `siteId` to `SettingsV2`:

```typescript
<SettingsV2
  open={isPanelOpen}
  onOpenChange={togglePanel}
  pageSettings={{ ...settings }}
  siteId={site.id}  // ADD THIS
/>
```

---

## Component Library Reference

### Shadcn/ui Components (Available)

- `Button` - Actions, collapsible triggers
- `Input` - Text inputs
- `Label` - Form labels
- `Checkbox` - Boolean toggles
- `Select/SelectContent/SelectItem` - Dropdowns
- `Collapsible/CollapsibleContent/CollapsibleTrigger` - Expandable sections
- `Sheet/SheetContent/SheetHeader/SheetFooter` - Modal panel
- `Tabs/TabsContent/TabsList/TabsTrigger` - Tab navigation
- `Popover/PopoverContent/PopoverTrigger` - Link add form

### Custom Components (Available)

- `ColorPicker` - Color selection with preset colors
- `SliderInput` - Number input with slider + text field

### Icons

- `@tabler/icons-react` - `IconChevronDown`, `IconPlus`, `IconTrash`, etc. (use ONLY Tabler icons)

---

## Type Safety Strategy

1. **Discriminated Unions**: Each settings section has a `type` field
2. **Exhaustive Switch**: Use switch statements in `RenderSettingSection` for compile-time checking
3. **Store Types**: `useNotionSettingsStore` is fully typed
4. **No `any`**: All settings paths are type-safe

---

## Data Flow

```
User Action (e.g., change color)
    ↓
Tab Component (e.g., TabTheme)
    ↓
updateSettings() - Zustand store
    ↓
Store updates settings + recomputes CSS variables
    ↓
NotionRenderer receives new styles via CSS custom properties
    ↓
UI updates instantly (optimistic)
    ↓
User clicks Save
    ↓
useUpdateSite mutation
    ↓
API call to update sites.site_setting JSONB
    ↓
Database updated
```

---

## Testing Checklist

### Functionality

- [ ] General tab: All fields update store correctly
- [ ] Theme tab: All color pickers work
- [ ] Theme tab: Dark mode toggle switches between theme/darkTheme
- [ ] Layout tab: Header section works (text, logo, height, width, links, lists)
- [ ] Layout tab: Footer section works (text, logo, height, width, links)
- [ ] Layout tab: Sidebar section works
- [ ] Layout tab: Gallery grid gap slider works
- [ ] Layout tab: Card settings work (border, padding, nested cover/body)
- [ ] Layout tab: Tabs settings work
- [ ] Typo tab: All font size sliders work
- [ ] Typo tab: Font inputs work
- [ ] Typo tab: Spacing sliders work
- [ ] SEO tab: All text inputs work
- [ ] Save button: Persists to database
- [ ] Save button: Shows loading state
- [ ] Save button: Handles errors gracefully

### Visual

- [ ] All tabs render correctly
- [ ] Collapsible sections expand/collapse smoothly
- [ ] Color pickers show selected color
- [ ] Sliders show current value
- [ ] Links display as chips/tags
- [ ] Dark mode styles apply correctly

### Edge Cases

- [ ] Empty settings handled gracefully
- [ ] Legacy layout settings migrated correctly
- [ ] Rapid saves don't cause race conditions
- [ ] Cancel button doesn't save changes

---

## Migration Notes

### From V1 to V2

V1 files remain untouched:

- `apps/tanstack/src/components/site/settings/settings.tsx`
- `apps/tanstack/src/components/site/settings/tabs/*.tsx`

V2 is additive:

- `apps/tanstack/src/components/site/settings-v2/` (new directory)
- All new files use `Tab` prefix convention

### Data Migration

`getDefaultSettings()` in `settings-defaults.ts` handles:

- Merging existing settings with defaults
- Migrating old `cardCover`/`cardBody` to new nested `card.cover`/`card.body`
- Backward compatibility maintained

---

## Success Criteria

1. **All tabs functional**: General, Theme, Layout, Typo, SEO
2. **Settings persist**: Save button works end-to-end
3. **Type safe**: No TypeScript errors, no `any` types
4. **Dark mode**: Toggle works, separate dark theme settings save correctly
5. **UX smooth**: Instant preview, loading states, error handling
6. **Code quality**: Consistent patterns, minimal duplication, well-commented

---

## Estimated Timeline

| Phase     | Task                  | Estimated Time  |
| --------- | --------------------- | --------------- |
| 1         | Save functionality    | 2 hours         |
| 2         | TabLayout (complex)   | 8-10 hours      |
| 3         | TabTypo               | 2-3 hours       |
| 4         | TabSeo                | 1-2 hours       |
| 5         | Integration & testing | 2-3 hours       |
| **Total** |                       | **15-20 hours** |

---

## Open Questions

1. Should we add a "Reset to Defaults" button per tab or globally?
2. Do we need validation on save (e.g., URL format checking)?
3. Should changes auto-save or require explicit save?
4. Do we need undo/redo functionality?
5. Should we add keyboard shortcuts (e.g., Ctrl+S to save)?

---

## Appendix: File Structure

```
apps/tanstack/src/components/site/settings-v2/
├── settings.tsx                    # Main V2 component - needs save functionality
└── tabs/
    ├── tab-general.tsx             # ✓ Complete
    ├── tab-theme.tsx               # ✓ Complete
    ├── tab-layout.tsx              # ✗ Empty - needs full implementation
    ├── tab-typo.tsx                # ✗ Missing - needs creation
    └── tab-seo.tsx                 # ✗ Missing - needs creation

apps/tanstack/src/components/site/editor/
├── site-editor.tsx                 # Need to pass siteId to SettingsV2

apps/tanstack/src/stores/
├── notion-settings.ts              # ✓ Complete

apps/tanstack/src/lib/
├── settings-defaults.ts            # ✓ Complete

apps/tanstack/src/types/
├── notion-page-settings.ts         # ✓ Complete
```
