# ColorPicker Popover Integration Plan

## Executive Summary

**Goal:** Wrap the `react-color-palette` ColorPicker inside a shadcn/ui Popover component to create a compact, space-efficient color picker interface.

**Current State:** Full-sized color pickers inline, taking up significant vertical space

**Target State:** Compact color swatches that open color picker in a popover on click

**Risk Level:** Low - UI enhancement with same underlying functionality

**Estimated Effort:** 30-45 minutes

---

## 1. Current Architecture Analysis

### 1.1 Current Implementation

**File:** `apps/web/src/components/ui/color-picker.tsx`

```tsx
export function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  const normalizedValue = value || "#000000";
  const [color, setColor] = useColor(normalizedValue);

  const handleChange = (newColor: IColor) => {
    setColor(newColor);
    onChange(newColor.hex);
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <ReactColorPicker
        color={color}
        onChange={handleChange}
        hideAlpha={true}
        hideInput={["hsv"]}
      />
    </div>
  );
}
```

**Issues with Current Implementation:**

- Each color picker takes up ~250px vertical space
- With 30+ color fields, the page becomes very long
- Poor user experience - too much scrolling
- Visual clutter

### 1.2 shadcn/ui Popover Component Structure

**File:** `apps/web/src/components/ui/popover.tsx`

```tsx
// Exports:
- Popover (Root component)
- PopoverTrigger (Button that opens popover)
- PopoverContent (Container for popover content)
- PopoverAnchor (Optional anchor element)
- PopoverHeader, PopoverTitle, PopoverDescription (Optional headers)

// Default PopoverContent styling:
- Width: w-72 (288px)
- Background: bg-popover
- Border: rounded-md border
- Shadow: shadow-md
- Animation: slide-in/out with fade and zoom
```

### 1.3 Current Usage in site-theme.tsx

```tsx
<div className=" bg-muted px-4 py-4 mt-2 rounded-md">
  {comp?.fields
    ?.filter((field) => field.type === "color")
    .map((field) => {
      const section = customization?.[comp?.id] as any;
      const value = section?.[field.key];

      return (
        <ColorPicker
          key={field.key}
          label={field.label}
          value={value?.background || value || undefined}
          onChange={(v) => handleChange(v, { field, comp })}
        />
      );
    })}
</div>
```

**Current Layout:**

- Container: `bg-muted px-4 py-4 mt-2 rounded-md`
- Each ColorPicker: Full size, stacked vertically
- Space-y-2 between pickers (from ColorPicker component)

---

## 2. Proposed Solution

### 2.1 Design Pattern

**Compact Color Picker with Popover:**

```
┌─────────────────────────────────────┐
│ Page Background    [██████ #ffffff] │ ← Color swatch button
│ Text Color         [██████ #37352f] │
│ Checkbox Color     [██████ #2eaadc] │
└─────────────────────────────────────┘

When clicking a swatch:
┌─────────────────────────────────────┐
│ Page Background    [██████ #ffffff] │
│                     ┌─────────────┐ │
│ Text Color         │ ┌─────────┐ │ │ ← Popover opens
│ Checkbox Color     │ │  🎨     │ │ │   with color picker
│                    │ │ Picker  │ │ │
│                    │ └─────────┘ │ │
│                    └─────────────┘ │
└─────────────────────────────────────┘
```

### 2.2 Component Structure

```
ColorPicker (with Popover)
├── Label (field label)
├── Popover
│   ├── PopoverTrigger
│   │   └── Button/Trigger
│   │       ├── Color Swatch (div with background color)
│   │       └── Hex Value (optional)
│   └── PopoverContent
│       └── ReactColorPicker
│           ├── Saturation picker
│           ├── Hue slider
│           └── Hex/RGB inputs
```

### 2.3 Layout in site-theme.tsx

**Change from vertical stack to horizontal rows:**

```
Before (Current):
┌─────────────────────────────┐
│ Page Background             │
│ ┌─────────────────────────┐ │
│ │     Full Color Picker   │ │
│ │     (250px height)      │ │
│ └─────────────────────────┘ │
│                             │
│ Text Color                  │
│ ┌─────────────────────────┐ │
│ │     Full Color Picker   │ │
│ │     (250px height)      │ │
│ └─────────────────────────┘ │
└─────────────────────────────┘

After (With Popover):
┌─────────────────────────────┐
│ Page Background      [#fff] │
│ Text Color         [#3735]  │
│ Checkbox Color     [#2ead]  │
│ Background Color   [#ffff]  │
│ Border Color       [#rgba]  │
│ ...                         │
└─────────────────────────────┘
```

---

## 3. Implementation Strategy

### 3.1 Wrapper Component Enhancement

**Modify:** `apps/web/src/components/ui/color-picker.tsx`

**New Architecture:**

```tsx
import { useState } from "react";
import {
  ColorPicker as ReactColorPicker,
  useColor,
  type IColor,
} from "react-color-palette";
import "react-color-palette/css";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface ColorPickerProps {
  label: string;
  value?: string;
  onChange: (value: string) => void;
}

export function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  const [open, setOpen] = useState(false);
  const normalizedValue = value || "#000000";
  const [color, setColor] = useColor(normalizedValue);

  const handleChange = (newColor: IColor) => {
    setColor(newColor);
    onChange(newColor.hex);
  };

  return (
    <div className="flex items-center justify-between py-2">
      <Label className="text-sm font-medium">{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-24 h-8 p-1 flex items-center gap-2"
            style={{ backgroundColor: normalizedValue }}
          >
            <span className="sr-only">Pick {label} color</span>
            <span className="text-xs font-mono bg-background/80 px-1 rounded">
              {normalizedValue}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <div className="p-3">
            <ReactColorPicker
              color={color}
              onChange={handleChange}
              hideAlpha={true}
              hideInput={["hsv"]}
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
```

### 3.2 Alternative: Color Swatch Only (More Compact)

```tsx
<PopoverTrigger asChild>
  <button
    className="w-8 h-8 rounded-md border shadow-sm hover:scale-105 transition-transform"
    style={{ backgroundColor: normalizedValue }}
    aria-label={`Pick ${label} color`}
  />
</PopoverTrigger>
```

### 3.3 Recommended Layout

**Row-based layout with label and swatch:**

```tsx
// Each color picker row
div className="flex items-center justify-between py-2 border-b last:border-0"
  Label: field.label
  PopoverTrigger: Color swatch + optional hex value
```

**Styling considerations:**

- Border between rows for visual separation
- Consistent height (py-2)
- Swatch size: w-8 h-8 (32px) or w-10 h-10 (40px)
- Optional: Show hex value next to swatch
- Optional: Show color name if available

---

## 4. Implementation Steps

### Step 1: Update ColorPicker Component

**File:** `apps/web/src/components/ui/color-picker.tsx`

**Changes:**

1. Add imports for Popover components
2. Add Button import
3. Wrap picker in Popover
4. Add trigger with color swatch
5. Change layout from vertical to horizontal

**Before:**

```tsx
<div className="space-y-2">
  <Label>{label}</Label>
  <ReactColorPicker ... />
</div>
```

**After:**

```tsx
<div className="flex items-center justify-between py-2">
  <Label>{label}</Label>
  <Popover>
    <PopoverTrigger>...</PopoverTrigger>
    <PopoverContent>
      <ReactColorPicker ... />
    </PopoverContent>
  </Popover>
</div>
```

### Step 2: Update site-theme.tsx Container

**Current:**

```tsx
<div className=" bg-muted px-4 py-4 mt-2 rounded-md">{/* ColorPickers */}</div>
```

**Optional Enhancement:** Add dividers between items

```tsx
<div className="bg-muted px-4 py-2 mt-2 rounded-md divide-y">
  {/* ColorPickers */}
</div>
```

Or keep minimal:

```tsx
<div className="bg-muted px-4 py-2 mt-2 rounded-md">
  {/* ColorPickers with their own borders */}
</div>
```

### Step 3: Handle Popover State

**Options:**

**A. Uncontrolled (Recommended):**

- Let Popover manage its own open/close state
- Simplest implementation
- Click outside closes popover

**B. Controlled:**

- Manage open state in ColorPicker component
- Useful if we need to close on color select
- More complex but more control

**Recommendation:** Start with uncontrolled, add controlled state only if needed.

---

## 5. Edge Cases & Solutions

### 5.1 Popover Positioning

**Problem:** Popover might go off-screen on mobile or right edge

**Solution:**

- Use `align="end"` on PopoverContent to align with right side
- Popover has built-in collision detection (from Radix UI)
- On mobile, it will automatically adjust position

### 5.2 Color Value Format Display

**Problem:** Hex values like `#ffffff` are long, RGB values are even longer

**Solutions:**

**Option A - Truncate:**

```tsx
<span className="text-xs font-mono bg-background/80 px-1 rounded truncate max-w-16">
  {normalizedValue.length > 7
    ? normalizedValue.slice(0, 7) + "..."
    : normalizedValue}
</span>
```

**Option B - Short hex:**

```tsx
// Convert #ffffff to #fff if possible
const shortHex = normalizedValue.replace(
  /^#([a-f0-9])\1([a-f0-9])\2([a-f0-9])\3$/i,
  "#$1$2$3",
);
```

**Option C - Show only on hover:**

- Show just the color swatch
- Show hex value in tooltip or on hover

**Option D - No value text:**

- Just show the colored swatch button
- Simplest and cleanest

**Recommendation:** Option D for MVP, Option B for enhanced UX

### 5.3 Empty/Undefined Values

**Problem:** `value` can be undefined

**Current handling:** Falls back to `#000000`

**Visual impact:** Shows black swatch

**Enhancement:** Show placeholder/empty state

```tsx
const normalizedValue = value || "#000000";

// In trigger
<PopoverTrigger asChild>
  <Button
    variant="outline"
    className={cn(
      "w-8 h-8 rounded-md border shadow-sm",
      !value && "bg-muted border-dashed", // Different style for empty
    )}
    style={value ? { backgroundColor: normalizedValue } : undefined}
  >
    {!value && <Plus className="w-4 h-4 text-muted-foreground" />}
  </Button>
</PopoverTrigger>;
```

### 5.4 Mobile Responsiveness

**Problem:** Popover might be too small on mobile devices

**Solution:**

- Radix UI Popover automatically handles mobile
- On mobile, it uses bottom sheet pattern
- Color picker (200px height) fits well in w-72 popover

**Testing checklist:**

- [ ] Test on mobile viewport
- [ ] Verify popover doesn't overflow screen
- [ ] Check touch interactions work

### 5.5 Multiple Popovers Open

**Problem:** User might open multiple color pickers simultaneously

**Current behavior:** Each Popover is independent

**Expected behavior:** Only one popover open at a time

**Solution:** Radix UI Popover automatically closes others when clicking outside or opening another

### 5.6 Performance

**Problem:** Many popovers on page (30+ color fields)

**Analysis:**

- Popover content is rendered only when open
- Each ColorPicker has useColor hook (lightweight)
- No performance impact from closed popovers

**Optimization:** None needed, but we can use `React.memo` if we see re-renders

### 5.7 Accessibility

**Requirements:**

- [ ] Keyboard navigation works
- [ ] Screen reader announcements
- [ ] Focus trap in popover
- [ ] ESC key closes popover

**Implementation:**

- Radix UI Popover provides all accessibility features
- Add `aria-label` to trigger button
- Ensure color picker is keyboard navigable

```tsx
<PopoverTrigger asChild>
  <Button
    aria-label={`Current color: ${normalizedValue}. Click to change ${label}`}
    ...
  />
</PopoverTrigger>
```

### 5.8 Color Preview in Trigger

**Problem:** How to show current color in the trigger button

**Solution A - Background color:**

```tsx
<Button style={{ backgroundColor: normalizedValue }} />
```

**Problem:** Light colors on white background are hard to see

**Solution B - With border:**

```tsx
<Button
  className="border-2 border-border"
  style={{ backgroundColor: normalizedValue }}
/>
```

**Solution C - Checkerboard pattern for transparency (if we add alpha later):**

```tsx
// CSS background pattern for transparency
className = "bg-[url('data:image/png;base64,...')]";
```

**Recommendation:** Solution B with border

### 5.9 Dark Mode Compatibility

**Problem:** Popover and color picker need to work in dark mode

**Solutions:**

- Popover uses `bg-popover` and `text-popover-foreground` (already handles dark mode)
- react-color-palette CSS needs to be checked for dark mode support
- May need to override some color picker styles for dark mode

**Testing:**

- [ ] Test in dark mode
- [ ] Verify all text is readable
- [ ] Check contrast ratios

---

## 6. Detailed Code Implementation

### 6.1 Option 1: Minimal (Swatch Only)

```tsx
// apps/web/src/components/ui/color-picker.tsx
import { useState } from "react";
import {
  ColorPicker as ReactColorPicker,
  useColor,
  type IColor,
} from "react-color-palette";
import "react-color-palette/css";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface ColorPickerProps {
  label: string;
  value?: string;
  onChange: (value: string) => void;
}

export function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  const [open, setOpen] = useState(false);
  const normalizedValue = value || "#000000";
  const [color, setColor] = useColor(normalizedValue);

  const handleChange = (newColor: IColor) => {
    setColor(newColor);
    onChange(newColor.hex);
  };

  return (
    <div className="flex items-center justify-between py-2">
      <Label className="text-sm font-medium">{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              "w-8 h-8 rounded-md border-2 border-border shadow-sm",
              "hover:scale-105 transition-transform focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            )}
            style={{ backgroundColor: normalizedValue }}
            aria-label={`${label}: ${normalizedValue}. Click to change.`}
          />
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3" align="end">
          <ReactColorPicker
            color={color}
            onChange={handleChange}
            hideAlpha={true}
            hideInput={["hsv"]}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
```

**Pros:**

- Clean, minimal UI
- Fast to scan
- Mobile-friendly
- No text overflow issues

**Cons:**

- Can't see hex value at a glance
- Might not be obvious it's clickable (add hover state)

### 6.2 Option 2: With Hex Value

```tsx
export function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  const [open, setOpen] = useState(false);
  const normalizedValue = value || "#000000";
  const [color, setColor] = useColor(normalizedValue);

  const handleChange = (newColor: IColor) => {
    setColor(newColor);
    onChange(newColor.hex);
  };

  // Shorten hex if possible (#ffffff -> #fff)
  const displayValue = normalizedValue.replace(
    /^#([a-f0-9])\1([a-f0-9])\2([a-f0-9])\3$/i,
    "#$1$2$3",
  );

  return (
    <div className="flex items-center justify-between py-2">
      <Label className="text-sm font-medium">{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 px-2 gap-2">
            <span
              className="w-4 h-4 rounded border"
              style={{ backgroundColor: normalizedValue }}
            />
            <span className="text-xs font-mono">{displayValue}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3" align="end">
          <ReactColorPicker
            color={color}
            onChange={handleChange}
            hideAlpha={true}
            hideInput={["hsv"]}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
```

**Pros:**

- Shows hex value for power users
- More obvious it's a button
- Still compact

**Cons:**

- Takes slightly more space
- Hex value might still be truncated on small screens

### 6.3 Option 3: Tooltip + Swatch (Best UX)

```tsx
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  const [open, setOpen] = useState(false);
  const normalizedValue = value || "#000000";
  const [color, setColor] = useColor(normalizedValue);

  const handleChange = (newColor: IColor) => {
    setColor(newColor);
    onChange(newColor.hex);
  };

  return (
    <div className="flex items-center justify-between py-2">
      <Label className="text-sm font-medium">{label}</Label>
      <TooltipProvider>
        <Tooltip>
          <Popover open={open} onOpenChange={setOpen}>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="w-8 h-8 rounded-md border-2 border-border shadow-sm hover:scale-105 transition-transform"
                  style={{ backgroundColor: normalizedValue }}
                />
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>{normalizedValue}</p>
            </TooltipContent>
            <PopoverContent className="w-auto p-3" align="end">
              <ReactColorPicker
                color={color}
                onChange={handleChange}
                hideAlpha={true}
                hideInput={["hsv"]}
              />
            </PopoverContent>
          </Popover>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
```

**Note:** Tooltip might conflict with Popover. Better to use simple title attribute or aria-label.

**Recommendation:** Start with **Option 1 (Minimal)** for clean UI, add **Option 2 (With Hex)** if users need to see values.

---

## 7. Container Styling Updates

### 7.1 Current Container

```tsx
<div className="bg-muted px-4 py-4 mt-2 rounded-md">{/* ColorPickers */}</div>
```

### 7.2 Enhanced Container Options

**Option A - With dividers:**

```tsx
<div className="bg-muted px-4 py-2 mt-2 rounded-md divide-y divide-border">
  {/* ColorPickers */}
</div>
```

**Option B - Grid layout (2 columns on desktop):**

```tsx
<div className="bg-muted px-4 py-4 mt-2 rounded-md grid grid-cols-1 md:grid-cols-2 gap-x-4">
  {/* ColorPickers */}
</div>

// ColorPicker component
<div className="flex items-center justify-between py-2">
```

**Option C - Compact list:**

```tsx
<div className="bg-muted px-4 mt-2 rounded-md">
  {/* ColorPickers with first:pt-2 last:pb-2 */}
</div>

// In ColorPicker
<div className="flex items-center justify-between py-2 first:pt-4 last:pb-4">
```

**Recommendation:** Option A for clarity, Option B if we have many colors and want to save vertical space

---

## 8. Testing Strategy

### 8.1 Manual Testing Checklist

- [ ] Click color swatch opens popover
- [ ] Color picker displays inside popover
- [ ] Changing color updates the swatch
- [ ] Clicking outside closes popover
- [ ] ESC key closes popover
- [ ] Multiple sections can have pickers open (or only one at a time)
- [ ] Mobile: Popover displays correctly
- [ ] Mobile: Touch interactions work
- [ ] Dark mode: Popover styled correctly
- [ ] All color values display correctly
- [ ] Reset button restores all colors
- [ ] Empty/undefined values show default (black)

### 8.2 Visual Regression

Screenshots to compare:

- All sections collapsed
- Main Colors section expanded
- One color picker popover open
- Mobile view (375px width)
- Tablet view (768px width)
- Desktop view (1440px width)

---

## 9. Rollback Plan

### 9.1 Quick Rollback

If issues arise:

```bash
# Revert color-picker.tsx to previous version
git checkout HEAD~1 -- apps/web/src/components/ui/color-picker.tsx

# Or restore from git stash if stashed
git stash pop
```

### 9.2 Feature Flag (Optional)

Add feature flag for gradual rollout:

```tsx
const USE_POPOVER_COLOR_PICKER = import.meta.env.VITE_USE_POPOVER_COLOR_PICKER === 'true';

// In component
{USE_POPOVER_COLOR_PICKER ? (
  <ColorPickerWithPopover ... />
) : (
  <ColorPickerInline ... />
)}
```

---

## 10. Implementation Timeline

| Step      | Task                                      | Duration        | Dependencies |
| --------- | ----------------------------------------- | --------------- | ------------ |
| 1         | Update ColorPicker component with Popover | 15 min          | None         |
| 2         | Test locally and adjust styling           | 10 min          | Step 1       |
| 3         | Update container styling (optional)       | 5 min           | Step 1       |
| 4         | Mobile testing                            | 5 min           | Step 1       |
| 5         | Dark mode testing                         | 5 min           | Step 1       |
| **Total** |                                           | **~40 minutes** |              |

---

## 11. Summary

### What Changes

1. **UI Enhancement:** Compact color swatches instead of full pickers
2. **UX Improvement:** Popover pattern for space efficiency
3. **Code:** ColorPicker component wrapped in Popover
4. **Layout:** Horizontal rows instead of vertical stack

### What Stays the Same

1. **API:** Same props (label, value, onChange)
2. **Data Flow:** Same update handlers in site-theme.tsx
3. **Functionality:** Same color picker library (react-color-palette)
4. **Logic:** Same color format handling

### Key Decisions

1. **Popover alignment:** `align="end"` for right-side positioning
2. **Trigger style:** Color swatch with border (w-8 h-8)
3. **Controlled state:** Manage open state for better UX
4. **No hex display:** Keep it minimal (can add later)
5. **Container:** Add dividers between rows for clarity

### Risk Assessment

- ✅ Low risk - UI enhancement only
- ✅ No data structure changes
- ✅ Easy rollback
- ✅ Well-tested component (shadcn/ui Popover)
- ✅ Accessible by default

---

## Appendix A: Implementation Code

### Complete ColorPicker Component (Option 1 - Recommended)

```tsx
// apps/web/src/components/ui/color-picker.tsx
import { useState } from "react";
import {
  ColorPicker as ReactColorPicker,
  useColor,
  type IColor,
} from "react-color-palette";
import "react-color-palette/css";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface ColorPickerProps {
  label: string;
  value?: string;
  onChange: (value: string) => void;
}

export function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  const [open, setOpen] = useState(false);
  const normalizedValue = value || "#000000";
  const [color, setColor] = useColor(normalizedValue);

  const handleChange = (newColor: IColor) => {
    setColor(newColor);
    onChange(newColor.hex);
  };

  return (
    <div className="flex items-center justify-between py-2">
      <Label className="text-sm font-medium">{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              "w-8 h-8 rounded-md border-2 border-border shadow-sm",
              "hover:scale-105 transition-transform",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            )}
            style={{ backgroundColor: normalizedValue }}
            aria-label={`${label}: ${normalizedValue}. Click to change.`}
          />
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3" align="end">
          <ReactColorPicker
            color={color}
            onChange={handleChange}
            hideAlpha={true}
            hideInput={["hsv"]}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
```

### Container Update in site-theme.tsx

```tsx
// Line ~159
<CollapsibleContent className="space-y-4">
  <div className="bg-muted px-4 mt-2 rounded-md divide-y divide-border">
    {comp?.fields
      ?.filter((field) => field.type === "color")
      .map((field) => {
        const section = customization?.[comp?.id] as any;
        const value = section?.[field.key];

        return (
          <ColorPicker
            key={field.key}
            label={field.label}
            value={value?.background || value || undefined}
            onChange={(v) => handleChange(v, { field, comp })}
          />
        );
      })}
  </div>
</CollapsibleContent>
```

---

**Plan Version:** 1.0  
**Created:** 2026-03-03  
**Author:** AI Assistant  
**Status:** Ready for Implementation  
**Recommended Option:** Option 1 (Minimal swatch design)
