import { Button } from "#/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "#/components/ui/collapsible";
import { ColorPicker } from "#/components/ui/color-picker";
import { cn, getEntries } from "#/lib/utils";
import { useNotionSettingsStore } from "#/stores/notion-settings";
import type {
  ThemeSettingsMainSection,
  ThemeSettingsUI,
} from "#/types/notion-page-settings";
import { IconChevronDown } from "@tabler/icons-react";

export const TabTheme = ({ theme }: { theme: ThemeSettingsUI }) => {
  return (
    <div className="grid gap-4">
      {getEntries(theme).map(([k, v], i) => {
        if (!v || typeof v === "string") {
          return null;
        }

        return (
          <Collapsible key={i}>
            <CollapsibleTrigger
              render={
                <Button
                  className={"w-full flex items-center justify-between"}
                  variant={"ghost"}
                >
                  <p className=" capitalize">{k}</p>
                  <IconChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform",
                      //   openSections.includes(section.id) && "rotate-180",
                    )}
                  />
                </Button>
              }
            />
            <CollapsibleContent
              className={`bg-muted px-4 mt-2 rounded-md divide-y divide-border`}
            >
              <RenderThemeSections sections={v} sectionKey={k} />
            </CollapsibleContent>
          </Collapsible>
        );
      })}
    </div>
  );
};

export const RenderThemeSections = ({
  sectionKey,
  sections,
}: {
  sectionKey: keyof ThemeSettingsUI;
  sections: ThemeSettingsUI[keyof ThemeSettingsUI];
}) => {
  const { settings, updateSettings } = useNotionSettingsStore((s) => s);

  const getValue = (k: string, defaultValue?: string) => {
    if (!sections || typeof sections === "string") {
      return null;
    }

    const mode = settings?.general?.isDark ? "darkTheme" : "theme";

    // @ts-ignore
    console.log(settings?.[mode]?.[sectionKey]?.[k]);
    // @ts-ignore
    return settings?.[mode]?.[sectionKey]?.[k] || defaultValue;
  };

  const handleChange = (k: string, v?: string) => {
    const mode = settings?.general?.isDark ? "darkTheme" : "theme";

    updateSettings({
      ...settings,
      [mode]: {
        ...settings[mode],
        [sectionKey]: { ...(settings?.[mode]?.[sectionKey] as any), [k]: v },
      },
    });
  };

  if (!sections || sections === "theme") {
    return null;
  }

  return (
    <div>
      {getEntries(sections as ThemeSettingsMainSection).map(([k, v], i) => {
        return (
          <ColorPicker
            key={i}
            label={k}
            value={getValue(k, v)}
            onChange={(c) => handleChange(k, c)}
          />
        );
      })}
    </div>
  );
};
