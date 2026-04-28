import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ColorPicker } from "@/components/color-picker";
import { useSiteSettingStore } from "@/stores/site.setting.store";
import type { ThemeConfig, NotionPaletteConfig } from "@/types/site.setting";
import { IconChevronDown } from "@tabler/icons-react";
import { SliderInput } from "@/components/ui/slider-input";

const paletteColors = [
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

export function ThemeTab() {
  const { settings, updateTheme, updateDarkTheme, isDark } = useSiteSettingStore();
  const theme = isDark ? settings.darkTheme : settings.theme;

  const update = (partial: Partial<ThemeConfig>) => {
    const updater = isDark ? updateDarkTheme : updateTheme;
    updater({ ...theme, ...partial });
  };

  return (
    <div className="grid gap-4 py-2">
      {/* Main colors */}
      <ThemeSection title="Page Colors">
        <ColorPicker
          label="Background"
          value={theme.background.color}
          onChange={(color) => update({ background: { ...theme.background, color } })}
        />
        <ColorPicker
          label="Text"
          value={theme.foreground.color}
          onChange={(color) => update({ foreground: { ...theme.foreground, color } })}
        />
        <ColorPicker
          label="Checkbox"
          value={theme.checkbox.color}
          onChange={(color) => update({ checkbox: { ...theme.checkbox, color } })}
        />
      </ThemeSection>

      {/* Notion palette */}
      <ThemeSection title="Notion Colors">
        {paletteColors.map((color) => (
          <ColorPicker
            key={color}
            label={color}
            value={theme.notionColors[color]}
            onChange={(c) =>
              update({
                notionColors: { ...theme.notionColors, [color]: c } as NotionPaletteConfig,
              })
            }
          />
        ))}
      </ThemeSection>

      {/* Notion background palette */}
      <ThemeSection title="Notion Background Colors">
        {paletteColors.map((color) => (
          <ColorPicker
            key={color}
            label={color}
            value={theme.notionBackgroundColors[color]}
            onChange={(c) =>
              update({
                notionBackgroundColors: {
                  ...theme.notionBackgroundColors,
                  [color]: c,
                } as NotionPaletteConfig,
              })
            }
          />
        ))}
      </ThemeSection>

      {/* Card */}
      <ThemeSection title="Card">
        <ColorPicker
          label="Background"
          value={theme.card.background}
          onChange={(c) => update({ card: { ...theme.card, background: c } })}
        />
        <ColorPicker
          label="Hover"
          value={theme.card.hover}
          onChange={(c) => update({ card: { ...theme.card, hover: c } })}
        />
        <ColorPicker
          label="Text"
          value={theme.card.foreground}
          onChange={(c) => update({ card: { ...theme.card, foreground: c } })}
        />
      </ThemeSection>

      {/* Default Button */}
      <ThemeSection title="Default Button">
        <ColorPicker
          label="Background"
          value={theme.defaultButton.background}
          onChange={(c) => update({ defaultButton: { ...theme.defaultButton, background: c } })}
        />
        <ColorPicker
          label="Text"
          value={theme.defaultButton.foreground}
          onChange={(c) => update({ defaultButton: { ...theme.defaultButton, foreground: c } })}
        />
        <ColorPicker
          label="Hover"
          value={theme.defaultButton.hover}
          onChange={(c) => update({ defaultButton: { ...theme.defaultButton, hover: c } })}
        />
      </ThemeSection>

      {/* Tab */}
      <ThemeSection title="Tab">
        <ColorPicker
          label="Background"
          value={theme.tab.background}
          onChange={(c) => update({ tab: { ...theme.tab, background: c } })}
        />
        <ColorPicker
          label="Active"
          value={theme.tab.foreground}
          onChange={(c) => update({ tab: { ...theme.tab, foreground: c } })}
        />
      </ThemeSection>

      {/* Text Selection */}
      <ThemeSection title="Text Selection">
        <ColorPicker
          label="Background"
          value={theme.textSelection.background}
          onChange={(c) => update({ textSelection: { ...theme.textSelection, background: c } })}
        />
        <ColorPicker
          label="Text"
          value={theme.textSelection.foreground}
          onChange={(c) => update({ textSelection: { ...theme.textSelection, foreground: c } })}
        />
      </ThemeSection>

      {/* Roundness */}
      <div className="py-2">
        <SliderInput
          label="Roundness"
          min={0}
          max={32}
          value={theme.roundness}
          onChange={(v) => update({ roundness: v })}
          valueFormatter={(v) => `${v}px`}
        />
      </div>
    </div>
  );
}

function ThemeSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Collapsible>
      <CollapsibleTrigger
        render={
          <Button className="w-full flex items-center justify-between" variant="ghost">
            <p className="capitalize">{title}</p>
            <IconChevronDown className="h-4 w-4 transition-transform" />
          </Button>
        }
      />
      <CollapsibleContent className="shadow-sm ring-2 ring-input px-4 mt-2 rounded-md divide-y divide-border">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}
