import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Label } from "@/components/ui/label";
import { SliderInput } from "@/components/ui/slider-input";
import { FontPicker } from "@/components/font-picker";
import { useSiteSettingStore } from "@/stores/site.setting.store";
import type { TypographyConfig } from "@/types/site.setting";
import { IconChevronDown } from "@tabler/icons-react";

export function TypographyTab() {
  const { settings, updateTypography } = useSiteSettingStore((s) => s);
  const typography = settings.typography;

  const update = (partial: Partial<TypographyConfig>) => {
    updateTypography({ ...typography, ...partial });
  };

  return (
    <div className="grid gap-4 py-2">
      {/* Font Sizes */}
      <Collapsible>
        <CollapsibleTrigger
          render={
            <Button className="w-full flex items-center justify-between" variant="ghost">
              <span>Font Sizes</span>
              <IconChevronDown className="h-4 w-4 transition-transform" />
            </Button>
          }
        />
        <CollapsibleContent className="shadow-sm ring-2 ring-input px-4 mt-2 rounded-md space-y-4 py-4">
          <SliderInput
            label="Page Title"
            min={0}
            max={256}
            value={typography.size.title}
            onChange={(v) => update({ size: { ...typography.size, title: v } })}
            valueFormatter={(v) => `${v}px`}
          />
          <SliderInput
            label="H1"
            min={0}
            max={256}
            value={typography.size.h1}
            onChange={(v) => update({ size: { ...typography.size, h1: v } })}
            valueFormatter={(v) => `${v}px`}
          />
          <SliderInput
            label="H2"
            min={0}
            max={256}
            value={typography.size.h2}
            onChange={(v) => update({ size: { ...typography.size, h2: v } })}
            valueFormatter={(v) => `${v}px`}
          />
          <SliderInput
            label="H3"
            min={0}
            max={256}
            value={typography.size.h3}
            onChange={(v) => update({ size: { ...typography.size, h3: v } })}
            valueFormatter={(v) => `${v}px`}
          />
          <SliderInput
            label="Base"
            min={0}
            max={256}
            value={typography.size.base}
            onChange={(v) => update({ size: { ...typography.size, base: v } })}
            valueFormatter={(v) => `${v}px`}
          />
        </CollapsibleContent>
      </Collapsible>

      {/* Fonts */}
      <Collapsible>
        <CollapsibleTrigger
          render={
            <Button className="w-full flex items-center justify-between" variant="ghost">
              <span>Fonts</span>
              <IconChevronDown className="h-4 w-4 transition-transform" />
            </Button>
          }
        />
        <CollapsibleContent className="shadow-sm ring-2 ring-input px-4 mt-2 rounded-md space-y-4 py-4">
          <div className="space-y-2">
            <Label>
              <span className="capitalize">Primary</span> Font
            </Label>
            <FontPicker
              value={typography.font.primary}
              onChange={(font) => update({ font: { ...typography.font, primary: font } })}
            />
          </div>
          <div className="space-y-2">
            <Label>
              <span className="capitalize">Secondary</span> Font
            </Label>
            <FontPicker
              value={typography.font.secondary}
              onChange={(font) => update({ font: { ...typography.font, secondary: font } })}
            />
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Letter Spacing */}
      <Collapsible>
        <CollapsibleTrigger
          render={
            <Button className="w-full flex items-center justify-between" variant="ghost">
              <span>Letter Spacing</span>
              <IconChevronDown className="h-4 w-4 transition-transform" />
            </Button>
          }
        />
        <CollapsibleContent className="shadow-sm ring-2 ring-input px-4 mt-2 rounded-md space-y-4 py-4">
          <SliderInput
            label="Title"
            min={-10}
            max={10}
            step={0.1}
            value={typography.letterSpacing.title}
            onChange={(v) => update({ letterSpacing: { ...typography.letterSpacing, title: v } })}
            valueFormatter={(v) => `${v}px`}
          />
          <SliderInput
            label="Heading"
            min={-10}
            max={10}
            step={0.1}
            value={typography.letterSpacing.heading}
            onChange={(v) => update({ letterSpacing: { ...typography.letterSpacing, heading: v } })}
            valueFormatter={(v) => `${v}px`}
          />
          <SliderInput
            label="Base"
            min={-10}
            max={10}
            step={0.1}
            value={typography.letterSpacing.base}
            onChange={(v) => update({ letterSpacing: { ...typography.letterSpacing, base: v } })}
            valueFormatter={(v) => `${v}px`}
          />
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
