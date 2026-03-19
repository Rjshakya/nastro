import { useTheme } from "#/components/theme-provider";
import { Checkbox } from "#/components/ui/checkbox";
import { SliderInput } from "#/components/ui/slider-input";
import { useNotionSettingsStore } from "#/stores/notion-settings";
import type { GeneralSettingsUI } from "#/types/customization";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface TabGeneralProps {
  siteName?: { type: string; label: string };
  pageWidth?: { type: string; label: string; min: number; max: number };
  header?: { type: string; label: string };
  footer?: { type: string; label: string };
  isDark?: { type: string; label: string };
  slug?: { type: string; label: string };
}

export function TabGeneral({ tabProps }: { tabProps: TabGeneralProps }) {
  const { settings, updateSettings } = useNotionSettingsStore();

  return (
    <div className="space-y-4">
      {Object.entries(tabProps).map(([k, v]) => {
        if (v.type === "text") {
          return (
            <div className="space-y-2">
              <Label htmlFor="siteName">{v?.label}</Label>
              <Input
                id="siteName"
                value={
                  settings?.general?.[k as keyof GeneralSettingsUI] as string
                }
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  updateSettings({
                    ...settings,
                    general: { ...settings?.general, [k]: e.target.value },
                  })
                }
                placeholder="My Awesome Site"
              />
            </div>
          );
        }

        if (v.type === "number") {
          return (
            <SliderInput
              label={v.label}
              value={
                (settings?.general?.[k as keyof GeneralSettingsUI] as number) ||
                0
              }
              onChange={(v) =>
                updateSettings({
                  ...settings,
                  general: { ...settings?.general, [k]: v },
                })
              }
              min={v.min || 360}
              max={v.max || 1334}
            />
          );
        }

        if (v.type === "boolean") {
          return (
            <div className="w-full flex items-center justify-between ">
              <Label className="flex-1 cursor-pointer" htmlFor={v.label}>
                {v.label}
              </Label>
              <Checkbox
                id={v.label}
                checked={
                  settings.general?.[k as keyof GeneralSettingsUI] as boolean
                }
                onCheckedChange={(e) => {
                  updateSettings({
                    ...settings,
                    general: { ...settings?.general, [k]: e },
                  });

                  if (k === "isDark") {
                    const doc = window.document.documentElement;
                    doc.classList.forEach((c) => doc.classList.remove(c));
                    doc.classList.add(e ? "dark" : "light");
                  }
                }}
              />
            </div>
          );
        }
      })}
    </div>
  );
}
