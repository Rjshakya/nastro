import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown, RotateCcw } from "lucide-react";
import {
  notionCustomizationComps,
  useNotionCustomizationStore,
  type ColorFieldConfig,
  type SectionConfig,
} from "@/stores/notion-customization-store";
import { ColorPicker } from "@/components/ui/color-picker";
import { SliderInput } from "@/components/ui/slider-input";

export function SiteTheme() {
  const { customization, updateStore, setCustomization } =
    useNotionCustomizationStore();

  const [openSections, setOpenSections] = useState<string[]>([]);

  const toggleSection = (section: string) => {
    setOpenSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section],
    );
  };

  const handleChange = (
    v: string,
    { field, comp }: { field: ColorFieldConfig; comp: SectionConfig },
  ) => {
    const curr = customization?.[comp?.id];
    let value = v as string | {};

    if (comp.id === "notion" || comp.id === "buttons") {
      value = { background: v };
    }

    const updated = { [comp.id]: { ...curr, [field.key]: value } };
    updateStore(updated);
  };

  const handleReset = () => {
    setCustomization({
      main: {
        pageBackground: "#ffffff",
        textColor: "rgb(55, 53, 47)",
        textLightColor: "rgba(55, 53, 47, 0.6)",
        borderColor: "rgba(55, 53, 47, 0.09)",
        hoverBackground: "rgba(135, 131, 120, 0.15)",
        checkboxBackground: "rgb(46, 170, 220)",
      },
      navbar: {
        textColor: "rgb(55, 53, 47)",
        background: "#ffffff",
        buttonText: "#ffffff",
        buttonBackground: "rgb(55, 53, 47)",
      },
      footer: {
        textColor: "rgb(55, 53, 47)",
        background: "#ffffff",
      },
      notion: {
        gray: { background: "rgb(235, 236, 237)" },
        brown: { background: "rgb(233, 229, 227)" },
        orange: { background: "rgb(250, 235, 221)" },
        yellow: { background: "rgb(251, 243, 219)" },
        teal: { background: "rgb(221, 237, 234)" },
        blue: { background: "rgb(221, 235, 241)" },
        purple: { background: "rgb(234, 228, 242)" },
        pink: { background: "rgb(244, 223, 235)" },
        red: { background: "rgb(251, 228, 228)" },
      },
      card: {
        cardBackground: "#ffffff",
        cardHover: "rgba(135, 131, 120, 0.15)",
      },
      buttons: {
        gray: { background: "rgb(227, 226, 224)" },
        brown: { background: "rgb(238, 224, 218)" },
        orange: { background: "rgb(250, 222, 201)" },
        yellow: { background: "rgb(253, 236, 200)" },
        green: { background: "rgb(219, 237, 219)" },
        blue: { background: "rgb(211, 229, 239)" },
        purple: { background: "rgb(232, 222, 238)" },
        pink: { background: "rgb(245, 224, 233)" },
        red: { background: "rgb(255, 226, 221)" },
      },
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Theme</h3>
        <Button
          variant="outline"
          size="xs"
          onClick={handleReset}
          className="gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>
      </div>

      {notionCustomizationComps?.map((comp, i) => {
        return (
          <Collapsible
            key={i}
            open={openSections.includes(comp.id)}
            onOpenChange={() => toggleSection(comp.id)}
          >
            <CollapsibleTrigger
              render={
                <Button
                  variant="ghost"
                  className="w-full justify-between font-medium"
                >
                  {comp.label}
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${
                      openSections.includes(comp.id) ? "rotate-180" : ""
                    }`}
                  />
                </Button>
              }
            />

            <CollapsibleContent className="space-y-4">
              <div className="bg-muted px-4 mt-2 rounded-md divide-y divide-border">
                {comp?.fields?.map((field) => {
                  const section = customization?.[comp?.id] as any;
                  const value = section?.[field.key];

                  if (field.type === "color") {
                    return (
                      <ColorPicker
                        key={field.key}
                        label={field.label}
                        value={value?.background || value || undefined}
                        onChange={(v) => handleChange(v, { field, comp })}
                      />
                    );
                  }

                  if (field.type === "slider") {
                    return (
                      <SliderInput
                        label={field.label}
                        onChange={(v) => {
                          updateStore({
                            sizes: {
                              ...customization?.sizes,
                              [field.key]: { value: v },
                            },
                          });
                        }}
                        value={value?.value || 0}
                        max={field.max}
                        min={field.min}
                      />
                    );
                  }
                })}
              </div>
            </CollapsibleContent>
          </Collapsible>
        );
      })}
    </div>
  );
}
