import { Badge } from "#/components/ui/badge";
import { Checkbox } from "#/components/ui/checkbox";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { SliderInput } from "#/components/ui/slider-input";
import { useIsSiteSlugAvailable } from "#/hooks/use-sites";
import { getEntries } from "#/lib/utils";
import { useNotionSettingsStore } from "#/stores/notion-settings";
import type { GeneralSettingsUI, NotionPageSettings } from "#/types/notion-page-settings";
import { useSearch } from "@tanstack/react-router";
import { useState } from "react";

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

        if (k === "slug") {
          return <SlugInput key={i} general={general} />;
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

function SlugInput({ general }: { general: NotionPageSettings["general"] }) {
  const { updateSettings, settings } = useNotionSettingsStore((s) => s);
  const { isAvailable, value, setValue, isLoading } = useIsSiteSlugAvailable("");
  const search = useSearch({ from: "/site/$pageId" });
  const [showAvailablityIndicator, setShowAvailablityIndicator] = useState(false);

  const handleSlugUpdate = (value: string, k: string) => {
    updateSettings({
      ...settings,
      general: { ...general, [k]: value, type: "general" },
    });

    if (value !== search?.slug) {
      setShowAvailablityIndicator(true);
      setValue(value);
    } else {
      setShowAvailablityIndicator(false);
    }
  };

  return (
    <div className="w-full grid gap-2 ">
      <Label className="capitalize flex items-center justify-between gap-2" htmlFor="slug">
        <p>Slug</p>
        {showAvailablityIndicator &&
          value.length > 0 &&
          (isLoading ? (
            <Badge variant={"outline"}>loading...</Badge>
          ) : isAvailable ? (
            <Badge className="bg-green-500" variant={"default"}>
              available
            </Badge>
          ) : (
            <Badge className="" variant={"destructive"}>
              unavailable
            </Badge>
          ))}
      </Label>

      <Input
        value={settings?.general?.["slug"] as string}
        onChange={(e) => handleSlugUpdate(e.target.value, "slug")}
      />
    </div>
  );
}
