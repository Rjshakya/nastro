import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSiteSettingStore } from "@/stores/site.setting.store";
import type { SeoConfig } from "@/types/site.setting";

export function SeoTab() {
  const { settings, updateSeo } = useSiteSettingStore();
  const seo = settings.seo;

  const update = (key: keyof SeoConfig, value: string) => {
    updateSeo({ ...seo, [key]: value });
  };

  return (
    <div className="grid gap-4 py-4">
      <div className="w-full grid gap-2">
        <Label className="capitalize">Title</Label>
        <Input
          value={seo.title}
          onChange={(e) => update("title", e.target.value)}
          placeholder="Site title"
        />
      </div>
      <div className="w-full grid gap-2">
        <Label className="capitalize">Description</Label>
        <Input
          value={seo.description}
          onChange={(e) => update("description", e.target.value)}
          placeholder="Site description"
        />
      </div>
      <div className="w-full grid gap-2">
        <Label className="capitalize">URL</Label>
        <Input
          value={seo.url}
          onChange={(e) => update("url", e.target.value)}
          placeholder="https://example.com"
        />
      </div>
      <div className="w-full grid gap-2">
        <Label className="capitalize">OG Image</Label>
        <Input
          value={seo.ogImage}
          onChange={(e) => update("ogImage", e.target.value)}
          placeholder="https://example.com/og.png"
        />
      </div>
    </div>
  );
}
