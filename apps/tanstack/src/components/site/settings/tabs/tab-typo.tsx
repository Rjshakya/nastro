import { useState } from "react";
import { useNotionSettingsStore } from "#/stores/notion-settings";
import type { TypoSettingsUI } from "#/types/customization";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { SliderInput } from "@/components/ui/slider-input";
import { FontPicker } from "@/components/font-picker";
import { cn } from "@/lib/utils";

interface TypoSectionField {
  key: string;
  label: string;
  type: "number" | "font";
  min?: number;
  max?: number;
}

interface TypoSection {
  id: keyof TypoSettingsUI;
  label: string;
  fields: TypoSectionField[];
}

export interface TabTypoProps {
  sections: TypoSection[];
}

export function TabTypo({ sections }: TabTypoProps) {
  const { settings, updateSettings } = useNotionSettingsStore();
  const typoSettings = settings.typography ?? {};
  const [openSections, setOpenSections] = useState<string[]>([]);

  const toggleSection = (sectionId: string) => {
    setOpenSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((s) => s !== sectionId)
        : [...prev, sectionId],
    );
  };

  const handleNumberChange = (
    sectionId: keyof TypoSettingsUI,
    fieldKey: string,
    value: number,
  ) => {
    updateSettings({
      ...settings,
      typography: {
        ...typoSettings,
        [sectionId]: {
          ...(typoSettings[sectionId] as Record<string, unknown>),
          [fieldKey]: value,
        },
      },
    });
  };

  const handleFontChange = (
    sectionId: keyof TypoSettingsUI,
    fieldKey: string,
    value: string,
  ) => {
    updateSettings({
      ...settings,
      typography: {
        ...typoSettings,
        [sectionId]: {
          ...(typoSettings[sectionId] as Record<string, unknown>),
          [fieldKey]: value,
        },
      },
    });
  };

  return (
    <div className="space-y-4">
      {sections.map((section) => (
        <Collapsible
          key={section.id}
          open={openSections.includes(section.id)}
          onOpenChange={() => toggleSection(section.id)}
        >
          <CollapsibleTrigger
            render={
              <Button
                variant="ghost"
                className="w-full justify-between font-medium"
              >
                {section.label}
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform",
                    openSections.includes(section.id) && "rotate-180",
                  )}
                />
              </Button>
            }
          />

          <CollapsibleContent className="bg-muted px-4 mt-2 rounded-md divide-y divide-border space-y-4 py-4">
            {section.fields.map((field) => {
              const sectionData = typoSettings[section.id] as
                | Record<string, unknown>
                | undefined;
              const value = sectionData?.[field.key];

              if (field.type === "number") {
                return (
                  <SliderInput
                    key={field.key}
                    label={field.label}
                    value={(value as number) || 16}
                    onChange={(val) =>
                      handleNumberChange(section.id, field.key, val)
                    }
                    min={field.min}
                    max={field.max}
                  />
                );
              }

              if (field.type === "font") {
                return (
                  <div key={field.key} className="space-y-2">
                    <FontPicker
                      value={(value as string) || ""}
                      onChange={(val) =>
                        handleFontChange(section.id, field.key, val)
                      }
                    />
                  </div>
                );
              }

              return null;
            })}
          </CollapsibleContent>
        </Collapsible>
      ))}
    </div>
  );
}
