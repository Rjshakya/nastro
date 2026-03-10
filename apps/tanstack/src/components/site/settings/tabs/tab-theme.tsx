import { useState } from "react";
import { useNotionSettingsStore } from "#/stores/notion-settings";
import type { ThemeSettingsUI } from "#/types/customization";
import { ColorPicker } from "@/components/ui/color-picker";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThemeSectionField {
  key: string;
  label: string;
}

interface ThemeSection {
  id: keyof ThemeSettingsUI;
  label: string;
  fields: ThemeSectionField[];
}

export interface TabThemeProps {
  sections: ThemeSection[];
}

export function TabTheme({ sections }: TabThemeProps) {
  const { settings, updateSettings } = useNotionSettingsStore();
  const [openSections, setOpenSections] = useState<string[]>([]);

  const toggleSection = (sectionId: string) => {
    setOpenSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((s) => s !== sectionId)
        : [...prev, sectionId],
    );
  };

  const handleColorChange = (
    sectionId: keyof ThemeSettingsUI,
    fieldKey: string,
    color: string,
  ) => {
    const currentTheme = settings?.theme;
    updateSettings({
      ...settings,
      theme: {
        ...currentTheme,
        [sectionId]: {
          ...currentTheme?.[sectionId],
          [fieldKey]: color,
        },
      },
    });
  };

  const getValue = (field: ThemeSectionField, section: ThemeSection) => {
    const theme = settings?.theme as ThemeSettingsUI;
    const value =
      theme?.[section?.id]?.[
        field?.key as keyof ThemeSettingsUI[keyof ThemeSettingsUI]
      ];

    return value as string | undefined;
  };

  return (
    <div className="space-y-4">
      {sections.map((section) => (
        <Collapsible
          key={section.id}
          // open={openSections.includes(section.id)}
          // onOpenChange={() => toggleSection(section.id)}
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

          <CollapsibleContent className="bg-muted px-4 mt-2 rounded-md divide-y divide-border">
            {section.fields.map((field) => (
              <ColorPicker
                key={field.key}
                label={field.label}
                value={getValue(field, section)}
                onChange={(color: string) =>
                  handleColorChange(section.id, field.key, color)
                }
              />
            ))}
          </CollapsibleContent>
        </Collapsible>
      ))}
    </div>
  );
}
