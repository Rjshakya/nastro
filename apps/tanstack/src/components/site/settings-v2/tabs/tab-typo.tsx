import { FontPicker } from "#/components/font-picker";
import { Button } from "#/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "#/components/ui/collapsible";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { SliderInput } from "#/components/ui/slider-input";
import { useNotionSettingsStore } from "#/stores/notion-settings";
import type { TypoSettingsUI } from "#/types/notion-page-settings";
import { IconChevronDown } from "@tabler/icons-react";

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
        <CollapsibleContent className="bg-muted px-4 mt-2 rounded-md space-y-4 py-4">
          {/* make it dynamic */}
          <SliderInput
            label="Page Title"
            min={20}
            max={80}
            value={typography?.sizes?.pageTitle || 41}
            onChange={(value) =>
              updateTypography("sizes", {
                ...typography?.sizes,
                pageTitle: value,
              })
            }
          />
          <SliderInput
            label="Heading 1"
            min={20}
            max={60}
            value={typography?.sizes?.heading1 || 28}
            onChange={(value) =>
              updateTypography("sizes", {
                ...typography?.sizes,
                heading1: value,
              })
            }
          />
          <SliderInput
            label="Heading 2"
            min={16}
            max={48}
            value={typography?.sizes?.heading2 || 24}
            onChange={(value) =>
              updateTypography("sizes", {
                ...typography?.sizes,
                heading2: value,
              })
            }
          />
          <SliderInput
            label="Heading 3"
            min={14}
            max={36}
            value={typography?.sizes?.heading3 || 20}
            onChange={(value) =>
              updateTypography("sizes", {
                ...typography?.sizes,
                heading3: value,
              })
            }
          />
          <SliderInput
            label="Base Text"
            min={12}
            max={24}
            value={typography?.sizes?.base || 16}
            onChange={(value) =>
              updateTypography("sizes", {
                ...typography?.sizes,
                base: value,
              })
            }
          />
        </CollapsibleContent>
      </Collapsible>

      {/* Fonts Section */}
      <Collapsible>
        <CollapsibleTrigger
          render={
            <Button
              className="w-full flex items-center justify-between"
              variant="ghost"
            >
              <span>Fonts</span>
              <IconChevronDown className="h-4 w-4 transition-transform" />
            </Button>
          }
        />
        <CollapsibleContent className="bg-muted px-4 mt-2 rounded-md space-y-4 py-4">
          {/* make it dynamic */}
          <div className="space-y-2">
            <Label>Primary Font</Label>
            <FontPicker
              value={typography?.fonts?.primary || ""}
              onChange={(font) =>
                updateTypography("fonts", {
                  ...typography?.fonts,
                  primary: font,
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Secondary Font</Label>
            <FontPicker
              value={typography?.fonts?.secondary || ""}
              onChange={(font) =>
                updateTypography("fonts", {
                  ...typography?.fonts,
                  secondary: font,
                })
              }
            />
          </div>
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
        <CollapsibleContent className="bg-muted px-4 mt-2 rounded-md space-y-4 py-4">
          <SliderInput
            label="Line Height"
            min={1}
            max={2.5}
            step={0.1}
            value={typography?.spacing?.lineHeight || 1.8}
            onChange={(value) =>
              updateTypography("spacing", {
                ...typography?.spacing,
                lineHeight: value,
              })
            }
          />
          <SliderInput
            label="Letter Spacing"
            min={-2}
            max={5}
            step={0.1}
            value={typography?.spacing?.letterSpacing || -0.8}
            onChange={(value) =>
              updateTypography("spacing", {
                ...typography?.spacing,
                letterSpacing: value,
              })
            }
          />
          <SliderInput
            label="Heading Letter Spacing"
            min={-2}
            max={5}
            step={0.1}
            value={typography?.spacing?.headingLetterSpacing || -1.3}
            onChange={(value) =>
              updateTypography("spacing", {
                ...typography?.spacing,
                headingLetterSpacing: value,
              })
            }
          />
          <SliderInput
            label="Font Weight"
            min={100}
            max={900}
            step={100}
            value={typography?.spacing?.fontWeight || 400}
            onChange={(value) =>
              updateTypography("spacing", {
                ...typography?.spacing,
                fontWeight: value,
              })
            }
          />
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
