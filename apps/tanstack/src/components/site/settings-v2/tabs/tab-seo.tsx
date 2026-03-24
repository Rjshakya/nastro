import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { getEntries } from "#/lib/utils";
import { useNotionSettingsStore } from "#/stores/notion-settings";
import type { SeoSettingsUI } from "#/types/notion-page-settings";

export const TabSeo = ({ seo }: { seo: SeoSettingsUI }) => {
  const { settings, updateSettings } = useNotionSettingsStore();

  return (
    <div className="grid gap-4 py-4">
      {getEntries(seo).map(([key]) => {
        if (!key || key === "type") return null;

        return (
          <div key={key} className="w-full grid gap-2">
            <Label className="capitalize">{key}</Label>
            <Input
              value={settings?.seo?.[key as keyof SeoSettingsUI] || ""}
              onChange={(e) =>
                updateSettings({
                  ...settings,
                  seo: { ...settings?.seo, [key]: e.target.value, type: "seo" },
                })
              }
              placeholder={key}
            />
          </div>
        );
      })}
    </div>
  );
};
