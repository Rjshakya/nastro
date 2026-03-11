import { useNotionSettingsStore } from "#/stores/notion-settings";
import type { SEO } from "#/types/customization";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface TabSeoProps {
  title?: { type: string; label: string };
  description?: { type: string; label: string };
  ogImage?: { type: string; label: string };
  pageUrl?: { type: string; label: string };
  pageIcon?: { type: string; label: string };
}

export function TabSeo({ tabProps }: { tabProps: TabSeoProps }) {
  const { settings, updateSettings } = useNotionSettingsStore();

  return (
    <div className="space-y-4">
      {Object.entries(tabProps).map(([k, v]) => (
        <div key={k} className="space-y-2">
          <Label htmlFor={k}>{v.label}</Label>
          <Input
            id={k}
            value={settings?.seo?.[k as keyof SEO] as string}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updateSettings({
                ...settings,
                seo: { ...settings?.seo, [k]: e.target.value },
              })
            }
            placeholder={v.label}
          />
        </div>
      ))}
    </div>
  );
}
