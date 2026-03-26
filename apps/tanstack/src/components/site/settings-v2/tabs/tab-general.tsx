import { Checkbox } from "#/components/ui/checkbox";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { SliderInput } from "#/components/ui/slider-input";
import { getEntries } from "#/lib/utils";
import { useNotionSettingsStore } from "#/stores/notion-settings";
import type { GeneralSettingsUI } from "#/types/notion-page-settings";

const labels = {
  siteName: "Site name",
  isDark: "Dark mode",
  pageCoverHeight: "Page Cover height",
  pageWidth: "Page width",
} as Record<keyof GeneralSettingsUI, string>;

export const TabGeneral = ({ general }: { general: GeneralSettingsUI }) => {
  const { updateSettings, settings } = useNotionSettingsStore((s) => s);

  return (
    <div className="grid gap-6 py-4">
      {getEntries(general).map(([k, v], i) => {
        if (!k || k === "type") {
          return null;
        }

        if (typeof v === "boolean") {
          return (
            <div key={i} className="w-full flex items-center ">
              <Label htmlFor={k} className=" capitalize flex-1">
                {labels[k] || k}
              </Label>
              <Checkbox
                id={k}
                checked={!!settings?.general?.[k]}
                onCheckedChange={(c) =>
                  updateSettings({
                    ...settings,
                    general: { ...general, [k]: c },
                    // ...settings,
                  })
                }
              />
            </div>
          );
        }

        if (typeof v === "string") {
          return (
            <div key={i} className="w-full grid gap-2 ">
              <Label className=" capitalize ">{labels[k] || k} </Label>
              <Input
                value={settings?.general?.[k] as string}
                onChange={(e) =>
                  updateSettings({
                    ...settings,
                    general: { ...general, [k]: e.target.value },
                    // ...settings,
                  })
                }
              />
            </div>
          );
        }

        if (typeof v === "number") {
          return (
            <div key={i} className="w-full grid gap-2 ">
              <SliderInput
                min={k === "pageWidth" ? 468 : 0}
                max={k === "pageWidth" ? 1334 : 100}
                label={labels[k] || k}
                value={v}
                onChange={(c) =>
                  updateSettings({
                    ...settings,
                    general: { ...general, [k]: c },
                  })
                }
              />
            </div>
          );
        }
      })}
    </div>
  );
};
