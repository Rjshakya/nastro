# Color Picker Migration Plan: Custom → react-color-palette

## Executive Summary

**Goal:** Migrate the custom ColorPicker component in `site-theme.tsx` to use `react-color-palette` library while maintaining full backward compatibility and handling all edge cases.

**Risk Level:** Medium - Direct UI component replacement with potential data format edge cases

**Estimated Effort:** 1-2 hours

**Current State:** Custom ColorPicker using HTML5 color input (lines 18-44 of site-theme.tsx)

**Target State:** `react-color-palette` ColorPicker with wrapper for compatibility

---

## 1. Architecture Analysis

### 1.1 Current Custom ColorPicker (Lines 18-44)

```tsx
interface ColorPickerProps {
  label: string;
  value?: string;
  onChange: (value: string) => void;
}

function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="flex gap-2">
        <Input
          type="color"
          value={value ?? "#000000"}
          onChange={(e) => onChange(e.target.value)}
          className="w-12 h-10 p-1 shrink-0"
        />
        <Input
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className="flex-1"
        />
      </div>
    </div>
  );
}
```

**Features:**

- Visual color picker (HTML5 native)
- Hex input field
- Fallback to #000000 for undefined values
- Label support

**Supported Color Formats:**

- Hex: `#ffffff`, `#fff`
- RGB: `rgb(55, 53, 47)`
- RGBA: `rgba(55, 53, 47, 0.6)`

### 1.2 Data Structure Analysis

#### Color Value Types in Store

**Simple String Colors:**

- `main.pageBackground`: `"#ffffff"`
- `main.textColor`: `"rgb(55, 53, 47)"`
- `navbar.background`: `"#ffffff"`
- `card.cardBackground`: `"#ffffff"`
- `defaultButton.background`: `"#ffffff"`

**Object Colors (with `.background` property):**

- `notion.gray`: `{ background: "rgb(235, 236, 237)" }`
- `notion.brown`: `{ background: "rgb(233, 229, 227)" }`
- `buttons.gray`: `{ background: "rgb(227, 226, 224)" }`
- `buttons.blue`: `{ background: "rgb(211, 229, 239)" }`

#### Color Retrieval Pattern (Lines 191-199)

```tsx
const section = customization?.[comp?.id] as any;
const value = section?.[field.key];

<ColorPicker
  label={field.label}
  value={value?.background || value || undefined}
  onChange={(v) => handleChange(v, { field, comp })}
/>;
```

**Key Logic:**

- `value?.background || value || undefined` - Tries object property first, then string, then undefined
- Handles both object and string color formats seamlessly

#### Data Update Pattern (Lines 69-98)

```tsx
const handleChange = (v: string, { field, comp }) => {
  const section = customization?.[comp?.id] as any;
  const value = section?.[field.key];

  let change: any;
  if (comp?.id === "main") {
    change = updateMain;
  } else if (comp?.id === "notion") {
    change = updateNotionColor(value?.key, { background: v });
  } else if (comp?.id === "buttons") {
    change = updateButton(field?.key as any, { background: v });
  }
  // ...
  change?.({ [field.key]: v });
};
```

**Critical Point:** Updates always expect the NEW color value `v`, but for `notion` and `buttons` sections, they wrap it as `{ background: v }`.

### 1.3 Default Values (Lines 101-147)

```typescript
handleReset = () => {
  setCustomization({
    main: {
      pageBackground: "#ffffff",
      textColor: "rgb(55, 53, 47)",
      textLightColor: "rgba(55, 53, 47, 0.6)",
      // ...
    },
    notion: {
      gray: { background: "rgb(235, 236, 237)" },
      // ...
    },
  });
};
```

**Color Formats Used:**

- Hex: `#ffffff`
- RGB: `rgb(235, 236, 237)`
- RGBA: `rgba(55, 53, 47, 0.6)`

### 1.4 Store Types

```typescript
// From customization.ts
export interface NotionTagColor {
  background: string;
}

export interface NotionCustomization {
  main?: NotionMainColors;
  notion?: {
    gray?: NotionTagColor;
    brown?: NotionTagColor;
    // ...
  };
  buttons?: {
    gray?: NotionButtonColor;
    // ...
  };
}
```

---

## 2. react-color-palette Library Analysis

### 2.1 Basic Usage

```tsx
import { ColorPicker, useColor } from "react-color-palette";
import "react-color-palette/css";

export function App() {
  const [color, setColor] = useColor("#561ecb");
  return <ColorPicker color={color} onChange={setColor} />;
}
```

### 2.2 Color Object Structure (IColor)

```typescript
interface IColor {
  hex: string; // "#561ecb"
  rgb: { r: number; g: number; b: number; a: number };
  hsv: { h: number; s: number; v: number; a: number };
}
```

### 2.3 Supported Input Formats (TColor)

- Hex: `#561ecb`, `#561ecbff`
- RGB: `rgb(86, 30, 203)`
- RGBA: `rgba(86, 30, 203, 0.5)`
- HSL: `hsl(260 100% 50%)`
- HWB: `hwb(260 20% 20%)`
- Named colors: `cyan`, `red`, `blue`

### 2.4 Component Props

| Prop             | Type     | Default  | Description                            |
| ---------------- | -------- | -------- | -------------------------------------- |
| height           | number   | 200      | Saturation picker height               |
| hideAlpha        | boolean  | false    | Hide alpha slider                      |
| hideInput        | string[] | false    | Hide specific inputs: `["rgb", "hsv"]` |
| color            | IColor   | required | Current color object                   |
| onChange         | Function | required | Callback on color change               |
| onChangeComplete | Function | -        | Callback on interaction end            |

---

## 3. Migration Strategy

### 3.1 Wrapper Component Approach

**Rationale:** Create a wrapper component that:

1. Accepts the same props as the current custom ColorPicker
2. Internally uses `react-color-palette`
3. Converts between string colors and IColor objects
4. Maintains the same `onChange` signature

**Benefits:**

- ✅ Minimal changes to `site-theme.tsx` (just import change)
- ✅ Preserves existing data flow
- ✅ Easy to test in isolation
- ✅ Simple rollback if issues

### 3.2 File Structure Changes

```
apps/web/src/
├── components/
│   └── site/
│       └── settings/
│           └── site-theme.tsx          (Modify: update import, remove local ColorPicker)
└── components/
    └── ui/
        └── color-picker.tsx            (NEW: wrapper component)
```

---

## 4. Implementation Steps

### Step 1: Create Wrapper Component

**File:** `apps/web/src/components/ui/color-picker.tsx`

```tsx
import {
  ColorPicker as ReactColorPicker,
  useColor,
  type IColor,
} from "react-color-palette";
import "react-color-palette/css";
import { Label } from "@/components/ui/label";
import { useMemo } from "react";

interface ColorPickerProps {
  label: string;
  value?: string;
  onChange: (value: string) => void;
}

// Helper to determine if string is hex format
function isHex(str: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3}|[A-Fa-f0-9]{8})$/.test(str);
}

// Helper to normalize color for useColor hook
function normalizeColorValue(value: string | undefined): string {
  if (!value) return "#000000";

  // Already hex
  if (isHex(value)) return value;

  // RGB format
  if (value.startsWith("rgb")) return value;

  // Named colors are also supported
  return value;
}

export function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  // Memoize color initialization to prevent unnecessary re-renders
  const color = useMemo(() => {
    const normalizedValue = normalizeColorValue(value);
    // We need to create the color object manually since we can't use hooks conditionally
    // We'll use the library's color parsing logic
    return normalizedValue;
  }, []);

  // Use useColor hook with normalized value
  const [colorObj, setColorObj] = useColor(color);

  // Handle color change - convert IColor.hex back to string
  const handleChange = (newColor: IColor) => {
    setColorObj(newColor);

    // Check if original value had alpha (rgba) to determine output format
    const hasAlpha = value?.startsWith("rgba");

    if (hasAlpha && newColor.rgb.a < 1) {
      // Return rgba format to preserve alpha
      onChange(
        `rgba(${newColor.rgb.r}, ${newColor.rgb.g}, ${newColor.rgb.b}, ${newColor.rgb.a})`,
      );
    } else {
      // Return hex format (simpler, more common)
      onChange(newColor.hex);
    }
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="rcp-root">
        <ReactColorPicker
          color={colorObj}
          onChange={handleChange}
          hideAlpha={!value?.startsWith("rgba")}
          hideInput={["hsv"]}
        />
      </div>
    </div>
  );
}
```

### Step 2: Update site-theme.tsx

**Changes needed:**

1. Remove local ColorPicker function (lines 18-44)
2. Import new ColorPicker from `@/components/ui/color-picker`
3. Import CSS in main entry or layout

**Modified site-theme.tsx:**

```tsx
import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronDown, RotateCcw } from "lucide-react";
import {
  notionCustomizationComps,
  useNotionCustomizationStore,
  type ColorFieldConfig,
  type SectionConfig,
} from "@/stores/notion-customization-store";
import { ColorPicker } from "@/components/ui/color-picker"; // NEW IMPORT

// Remove: local ColorPicker function definition (lines 18-44)

export function SiteTheme() {
  // ... rest of component remains unchanged
}
```

### Step 3: Import CSS Globally (Alternative Approaches)

**Option A: Import in the component itself**
Already done in Step 1 - imports in the wrapper component file.

**Option B: Import in layout or global styles**
Add to `apps/web/src/layouts/Layout.astro` or create a CSS file:

```typescript
// In a .ts file that's imported globally
import "react-color-palette/css";
```

**Recommendation:** Use Option A (import in component) for better tree-shaking and clarity.

### Step 4: Update Tailwind Configuration (If Needed)

Check if any custom styles are needed for the color picker container.

Current styling in line 186:

```tsx
<CollapsibleContent className="space-y-4 ">
  <div className=" bg-muted px-4 py-4 mt-2 rounded-md">
```

The react-color-palette may need additional styling to fit properly. Add custom CSS if needed:

```css
/* In global CSS or styled component */
.rcp-root {
  width: 100%;
}

.rcp-fields {
  display: flex;
  gap: 0.5rem;
}
```

---

## 5. Edge Cases & Solutions

### 5.1 Undefined/Null Values

**Problem:** `value` prop can be `undefined`

**Current Handling:** Falls back to `#000000`

**Solution:**

```tsx
function normalizeColorValue(value: string | undefined): string {
  if (!value) return "#000000";
  // ...
}
```

### 5.2 RGB Format Preservation

**Problem:** Values stored as `rgb(55, 53, 47)` need to remain compatible

**Solution:** `react-color-palette` supports RGB input, output can be hex:

- Input: `rgb(55, 53, 47)` ✓
- Output: `#37352f` (acceptable conversion)

**Decision:** Allow conversion to hex on save - it's more standard and the color is identical.

### 5.3 RGBA Format Preservation

**Problem:** Values like `rgba(55, 53, 47, 0.6)` have alpha channel

**Solution:**

- Detect if original value has alpha: `value?.startsWith("rgba")`
- Show alpha slider conditionally
- Return rgba format if alpha < 1

```tsx
const hasAlpha = value?.startsWith("rgba");
if (hasAlpha && newColor.rgb.a < 1) {
  onChange(
    `rgba(${newColor.rgb.r}, ${newColor.rgb.g}, ${newColor.rgb.b}, ${newColor.rgb.a})`,
  );
} else {
  onChange(newColor.hex);
}
```

### 5.4 Object vs String Color Values

**Problem:** Some values are objects `{ background: string }`, others are strings

**Current Handling:** `value={value?.background || value || undefined}`

**Solution:** Wrapper component receives the already-resolved string value. No change needed to this logic in site-theme.tsx.

### 5.5 Color Format Validation

**Problem:** User might enter invalid hex in the text input

**Solution:** `react-color-palette` has built-in validation and parsing. Invalid colors will show as #000000 or last valid color.

### 5.6 Multiple Color Pickers Performance

**Problem:** Multiple ColorPicker instances (30+ fields) might cause performance issues

**Solution:** Use `useMemo` for color initialization to prevent unnecessary recalculations.

### 5.7 Server-Side Rendering (SSR)

**Problem:** Astro SSR with React components

**Solution:** The wrapper component should be marked with `client:only` or ensure it doesn't cause hydration issues.

**In site-theme.tsx:**

```tsx
// If needed, wrap with client:only directive
<div className=" bg-muted px-4 py-4 mt-2 rounded-md">
  {comp?.fields
    ?.filter((field) => field.type === "color")
    .map((field) => {
      const section = customization?.[comp?.id] as any;
      const value = section?.[field.key];

      return (
        <ColorPicker
          key={field.key} // ADD KEY FOR REACT
          label={field.label}
          value={value?.background || value || undefined}
          onChange={(v) => handleChange(v, { field, comp })}
        />
      );
    })}
</div>
```

**Note:** Add `key` prop which is missing in current implementation!

### 5.8 Reset Functionality

**Problem:** Reset must restore default colors exactly as before

**Solution:** Reset sets the entire customization object. Since the new ColorPicker just displays what it receives, this will work automatically.

### 5.9 Custom Color Classes

**Problem:** Tailwind classes like `w-12 h-10 p-1 shrink-0` from current implementation

**Solution:** The new color picker has its own styling. We'll use a container div with appropriate classes if needed for sizing.

---

## 6. Testing Strategy

### 6.1 Unit Tests (If test suite exists)

```typescript
// Test cases for ColorPicker wrapper

describe("ColorPicker", () => {
  it("renders with hex value", () => {
    render(<ColorPicker label="Test" value="#ff0000" onChange={jest.fn()} />);
    expect(screen.getByLabelText("Test")).toBeInTheDocument();
  });

  it("renders with rgb value", () => {
    render(<ColorPicker label="Test" value="rgb(255, 0, 0)" onChange={jest.fn()} />);
    // Should convert and display correctly
  });

  it("handles undefined value", () => {
    render(<ColorPicker label="Test" value={undefined} onChange={jest.fn()} />);
    // Should default to #000000
  });

  it("returns hex on change", () => {
    const onChange = jest.fn();
    render(<ColorPicker label="Test" value="#ff0000" onChange={onChange} />);
    // Simulate color change
    expect(onChange).toHaveBeenCalledWith(expect.stringMatching(/^#[0-9a-f]{6}$/i));
  });

  it("returns rgba for alpha colors", () => {
    const onChange = jest.fn();
    render(<ColorPicker label="Test" value="rgba(255, 0, 0, 0.5)" onChange={onChange} />);
    // Should return rgba format
  });
});
```

### 6.2 Manual Testing Checklist

- [ ] All collapsible sections open/close correctly
- [ ] Each color picker displays current value
- [ ] Changing color updates the preview
- [ ] Hex colors work (main.pageBackground, navbar.background)
- [ ] RGB colors work (main.textColor)
- [ ] RGBA colors work (main.textLightColor, borders)
- [ ] Object colors work (notion._, buttons._)
- [ ] Reset button restores all defaults
- [ ] Colors persist on page refresh (if persisted in store)
- [ ] No console errors or warnings
- [ ] Mobile responsive design

### 6.3 Visual Regression Testing

Take screenshots before and after:

1. All sections collapsed
2. All sections expanded
3. Individual color picker interaction
4. Mobile view

---

## 7. Rollback Plan

### 7.1 Immediate Rollback (If Critical Issues)

```bash
# Revert changes
git checkout -- apps/web/src/components/site/settings/site-theme.tsx
git checkout -- apps/web/src/components/ui/color-picker.tsx

# Remove new file if created
rm apps/web/src/components/ui/color-picker.tsx
```

### 7.2 Feature Flag Approach (Optional Enhancement)

Add feature flag for gradual rollout:

```tsx
const USE_NEW_COLOR_PICKER = import.meta.env.VITE_USE_NEW_COLOR_PICKER === "true";

// In render
{USE_NEW_COLOR_PICKER ? (
  <ColorPickerV2 label={field.label} ... />
) : (
  <ColorPicker label={field.label} ... />
)}
```

### 7.3 Backup Branch

Before migration:

```bash
git checkout -b backup/color-picker-migration-$(date +%Y%m%d)
git push origin backup/color-picker-migration-$(date +%Y%m%d)
```

---

## 8. Detailed Code Changes

### 8.1 New File: `apps/web/src/components/ui/color-picker.tsx`

```typescript
import {
  ColorPicker as ReactColorPicker,
  useColor,
  type IColor
} from "react-color-palette";
import "react-color-palette/css";
import { Label } from "@/components/ui/label";

interface ColorPickerProps {
  label: string;
  value?: string;
  onChange: (value: string) => void;
}

/**
 * Normalizes various color formats to a string that react-color-palette can parse.
 * Supported inputs: hex, rgb, rgba, hsl, named colors
 */
function normalizeColor(value: string | undefined): string {
  if (!value) return "#000000";

  // react-color-palette handles most formats natively
  // We just need to ensure it's not undefined
  return value;
}

/**
 * Determines if the color value has an alpha channel.
 */
function hasAlphaChannel(value: string | undefined): boolean {
  if (!value) return false;
  return value.startsWith("rgba") || value.startsWith("hsla");
}

export function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  // Initialize color picker with current value
  const [color, setColor] = useColor(normalizeColor(value));

  // Handle color changes from the picker
  const handleChange = (newColor: IColor) => {
    setColor(newColor);

    // Determine output format based on original value
    const originalHadAlpha = hasAlphaChannel(value);
    const currentHasAlpha = newColor.rgb.a < 1;

    if (originalHadAlpha || currentHasAlpha) {
      // Preserve or add alpha channel
      const alpha = Math.round(newColor.rgb.a * 100) / 100; // Round to 2 decimals
      onChange(`rgba(${newColor.rgb.r}, ${newColor.rgb.g}, ${newColor.rgb.b}, ${alpha})`);
    } else {
      // Use hex for non-alpha colors
      onChange(newColor.hex);
    }
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="color-picker-wrapper">
        <ReactColorPicker
          color={color}
          onChange={handleChange}
          hideAlpha={!hasAlphaChannel(value)}
          hideInput={["hsv"]}
        />
      </div>
    </div>
  );
}
```

### 8.2 Modified File: `apps/web/src/components/site/settings/site-theme.tsx`

**Lines to remove (18-44):**

```typescript
// REMOVE THIS ENTIRE SECTION
interface ColorPickerProps {
  label: string;
  value?: string;
  onChange: (value: string) => void;
}

function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="flex gap-2">
        <Input
          type="color"
          value={value ?? "#000000"}
          onChange={(e) => onChange(e.target.value)}
          className="w-12 h-10 p-1 shrink-0"
        />
        <Input
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className="flex-1"
        />
      </div>
    </div>
  );
}
```

**Lines to add (after line 16, imports section):**

```typescript
import { ColorPicker } from "@/components/ui/color-picker";
```

**Lines to modify (191-200):**

```typescript
// ADD key PROP (currently missing!)
return (
  <ColorPicker
    key={field.key} // ADD THIS
    label={field.label}
    value={value?.background || value || undefined}
    onChange={(v) => handleChange(v, { field, comp })}
  />
);
```

---

## 9. Additional CSS Styling

### 9.1 Custom Styles for react-color-palette

Add to `apps/web/src/styles/globals.css` or create `color-picker.css`:

```css
/* react-color-palette custom styling */
.rcp-root {
  width: 100%;
  background: transparent;
  border: none;
}

.rcp-saturation {
  border-radius: 0.375rem;
  margin-bottom: 0.5rem;
}

.rcp-hue {
  margin-bottom: 0.5rem;
}

.rcp-fields {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 0.5rem;
}

.rcp-fields-element {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.rcp-fields-element-label {
  font-size: 0.75rem;
  color: hsl(var(--muted-foreground));
  text-transform: uppercase;
}

.rcp-fields-element-input {
  padding: 0.375rem 0.5rem;
  border: 1px solid hsl(var(--border));
  border-radius: 0.25rem;
  background: hsl(var(--background));
  color: hsl(var(--foreground));
  font-size: 0.875rem;
}

.rcp-fields-element-input:focus {
  outline: none;
  border-color: hsl(var(--ring));
  ring: 2px solid hsl(var(--ring));
}
```

### 9.2 Tailwind Dark Mode Support

Ensure color picker works with dark mode:

```css
.dark .rcp-fields-element-input {
  background: hsl(var(--background));
  color: hsl(var(--foreground));
  border-color: hsl(var(--border));
}
```

---

## 10. Performance Considerations

### 10.1 Bundle Size Impact

- `react-color-palette`: ~57KB (uncompressed)
- CSS: ~5KB
- **Total increase:** ~62KB

**Mitigation:** Tree-shaking should remove unused components. Only importing what we need:

```typescript
import { ColorPicker, useColor } from "react-color-palette";
```

### 10.2 Render Performance

**Issue:** 30+ color pickers rendering simultaneously

**Optimizations:**

1. Use `React.memo` if needed
2. Virtualize list if performance issues (unlikely for 30 items)
3. Lazy load CollapsibleContent (already implemented)

### 10.3 Memory Usage

Each `useColor` hook maintains state. For 30 pickers:

- Each color object: ~100 bytes
- Total: ~3KB (negligible)

---

## 11. Accessibility Considerations

### 11.1 Current Accessibility

- Native HTML5 color input is generally accessible
- Labels are properly associated

### 11.2 New Component Accessibility

Check if `react-color-palette` provides:

- [ ] ARIA labels on color picker elements
- [ ] Keyboard navigation support
- [ ] Screen reader announcements
- [ ] Focus management

**If lacking:** Add wrapper with proper ARIA attributes

```tsx
<div
  role="region"
  aria-label={`${label} color picker`}
  className="color-picker-wrapper"
>
  <ReactColorPicker ... />
</div>
```

---

## 12. Browser Compatibility

### 12.1 react-color-palette Requirements

From documentation:

- React 16.8+ (hooks)
- Modern browsers (ES6+)
- CSS Grid support

### 12.2 Testing Matrix

- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Chrome (iOS/Android)
- [ ] Mobile Safari (iOS)

---

## 13. Post-Migration Verification

### 13.1 Data Integrity Check

Verify no data loss or corruption:

```typescript
// Check store values before and after migration
const before = {
  main: { pageBackground: "#ffffff", textColor: "rgb(55, 53, 47)" },
  notion: { gray: { background: "rgb(235, 236, 237)" } },
};

const after = {
  main: { pageBackground: "#ffffff", textColor: "#37352f" }, // Converted to hex
  notion: { gray: { background: "#ebeced" } }, // Converted to hex
};
```

### 13.2 User Acceptance Criteria

- [ ] Colors visually identical before/after
- [ ] All sections functional
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Performance acceptable

---

## 14. Timeline

| Phase     | Task                     | Duration     | Dependencies |
| --------- | ------------------------ | ------------ | ------------ |
| 1         | Create wrapper component | 30 min       | None         |
| 2         | Update site-theme.tsx    | 15 min       | Phase 1      |
| 3         | Add custom CSS styling   | 20 min       | Phase 1      |
| 4         | Manual testing           | 30 min       | Phase 2, 3   |
| 5         | Bug fixes (if any)       | 15 min       | Phase 4      |
| 6         | Code review              | 15 min       | Phase 5      |
| **Total** |                          | **~2 hours** |              |

---

## 15. Summary

### What Will Change

1. **Visual Enhancement:** Richer color picker with saturation/hue selection
2. **User Experience:** More intuitive color selection
3. **Code Quality:** Separated component, reusable
4. **Maintainability:** Standard library instead of custom implementation

### What Stays the Same

1. **Data Structure:** No changes to store or types
2. **API Interface:** Same props (label, value, onChange)
3. **Data Flow:** Same update handlers
4. **Default Values:** Same reset behavior

### Risk Mitigation

- ✅ Comprehensive edge case handling
- ✅ Wrapper pattern minimizes changes
- ✅ Easy rollback if issues
- ✅ No breaking changes to data
- ✅ Incremental migration possible with feature flags

---

## Appendix A: Current Implementation Code

**File:** `apps/web/src/components/site/settings/site-theme.tsx`

**Current ColorPicker (lines 18-44):**

```tsx
interface ColorPickerProps {
  label: string;
  value?: string;
  onChange: (value: string) => void;
}

function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="flex gap-2">
        <Input
          type="color"
          value={value ?? "#000000"}
          onChange={(e) => onChange(e.target.value)}
          className="w-12 h-10 p-1 shrink-0"
        />
        <Input
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className="flex-1"
        />
      </div>
    </div>
  );
}
```

---

## Appendix B: Target Implementation Code

**New File:** `apps/web/src/components/ui/color-picker.tsx`

```tsx
import {
  ColorPicker as ReactColorPicker,
  useColor,
  type IColor,
} from "react-color-palette";
import "react-color-palette/css";
import { Label } from "@/components/ui/label";

interface ColorPickerProps {
  label: string;
  value?: string;
  onChange: (value: string) => void;
}

export function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  const [color, setColor] = useColor(value || "#000000");

  const handleChange = (newColor: IColor) => {
    setColor(newColor);
    onChange(newColor.hex);
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <ReactColorPicker color={color} onChange={handleChange} />
    </div>
  );
}
```

**Note:** This simplified version doesn't handle alpha channels. Use the full version from Section 8.1 for production.

---

**Plan Version:** 1.0  
**Created:** 2026-03-02  
**Author:** AI Assistant  
**Status:** Ready for Implementation
