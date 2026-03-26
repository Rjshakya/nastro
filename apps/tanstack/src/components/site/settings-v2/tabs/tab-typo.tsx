import { FontPicker } from "#/components/font-picker";
import { Button } from "#/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "#/components/ui/collapsible";
import { Label } from "#/components/ui/label";
import { SliderInput } from "#/components/ui/slider-input";
import { getEntries } from "#/lib/utils";
import { useNotionSettingsStore } from "#/stores/notion-settings";
import type {
  TypoFontsUI,
  TypoSettingsUI,
  TypoSizesUI,
  TypoSpacingUI,
} from "#/types/notion-page-settings";
import { IconChevronDown } from "@tabler/icons-react";
import { useMemo } from "react";

export const TabTypo = ({ typography }: { typography: TypoSettingsUI }) => {
  const { settings, updateSettings } = useNotionSettingsStore();

  const updateTypography = (key: keyof TypoSettingsUI, value: unknown) => {
    updateSettings({
      ...settings,
      typography: {
        ...settings.typography,
        [key]: value,
        type: "typography",
      },
    });
  };

  const getSpacingConfig = useMemo(() => {
    return {
      fontWeight: { min: 100, max: 900, step: 100, label: "Font weight" },
      headingLetterSpacing: {
        min: -10,
        max: 10,
        step: 0.1,
        label: "Heading letter spacing",
      },
      letterSpacing: { min: -10, max: 10, step: 0.1, label: "Letter spacing" },
      lineHeight: { min: -10, max: 10, step: 0.1, label: "Line height" },
      titleLetterSpacing: {
        min: -10,
        max: 10,
        step: 0.1,
        label: "Title letter spacing",
      },
    } as Record<
      keyof TypoSpacingUI,
      { min: number; max: number; step: number; label: string }
    >;
  }, []);

  const getSizesConfig = useMemo(() => {
    return {
      pageTitle: { label: "Page title", min: 0, max: 256, step: 1 },
      heading1: { label: "H1", min: 0, max: 256, step: 1 },
      heading2: { label: "H2", min: 0, max: 256, step: 1 },
      heading3: { label: "H3", min: 0, max: 256, step: 1 },
      base: { label: "Base", min: 0, max: 256, step: 1 },
    } as Record<
      keyof TypoSizesUI,
      { min: number; max: number; step: number; label: string }
    >;
  }, []);

  return (
    <div className="grid gap-4">
      {/* Sizes Section */}

      <Collapsible>
        <CollapsibleTrigger
          render={
            <Button
              className="w-full flex items-center justify-between"
              variant="ghost"
            >
              <span>Font Sizes</span>
              <IconChevronDown className="h-4 w-4 transition-transform" />
            </Button>
          }
        />
        <CollapsibleContent className="shadow-sm ring-2 ring-input px-4 mt-2 rounded-md space-y-4 py-4">
          {getEntries(typography.sizes as TypoSizesUI).map(([k, v]) => {
            return (
              <SliderInput
                label={getSizesConfig[k].label}
                min={getSizesConfig[k].min}
                max={getSizesConfig[k].max}
                step={getSizesConfig[k].step}
                value={typography?.sizes?.[k] || v || 40}
                onChange={(value) =>
                  updateTypography("sizes", {
                    ...typography?.sizes,
                    [k]: value,
                  })
                }
              />
            );
          })}
        </CollapsibleContent>
      </Collapsible>

      {/* Fonts Section */}
      <Collapsible>
        <CollapsibleTrigger
          render={
            <Button
              className=" w-full flex items-center justify-between"
              variant="ghost"
            >
              <span>Fonts</span>
              <IconChevronDown className="h-4 w-4 transition-transform" />
            </Button>
          }
        />
        <CollapsibleContent className="shadow-sm ring-2 ring-input px-4 mt-2 rounded-md space-y-4 py-4">
          {/* make it dynamic */}

          {getEntries(typography.fonts as TypoFontsUI).map(([k, v]) => {
            return (
              <div className="space-y-2">
                <Label>
                  <span className=" capitalize">{k}</span>
                  Font
                </Label>
                <FontPicker
                  value={typography?.fonts?.[k] || v || ""}
                  onChange={(font) =>
                    updateTypography("fonts", {
                      ...typography?.fonts,
                      [k]: font,
                    })
                  }
                />
              </div>
            );
          })}
        </CollapsibleContent>
      </Collapsible>

      {/* Spacing Section */}
      <Collapsible>
        <CollapsibleTrigger
          render={
            <Button
              className="w-full flex items-center justify-between"
              variant="ghost"
            >
              <span>Spacing</span>
              <IconChevronDown className="h-4 w-4 transition-transform" />
            </Button>
          }
        />
        <CollapsibleContent className="shadow-sm ring-2 ring-input px-4 mt-2 rounded-md space-y-4 py-4">
          {getEntries(typography?.spacing as TypoSpacingUI).map(([k, v]) => {
            return (
              <SliderInput
                label={getSpacingConfig[k].label}
                min={getSpacingConfig[k].min}
                max={getSpacingConfig[k].max}
                step={getSpacingConfig[k].step}
                value={typography?.spacing?.[k] || v || 1}
                onChange={(value) =>
                  updateTypography("spacing", {
                    ...typography?.spacing,
                    [k]: value,
                  })
                }
              />
            );
          })}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
