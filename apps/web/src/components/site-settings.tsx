"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUpdateSite } from "@/hooks/use-sites";
import type { Site, SiteSetting } from "@/hooks/use-sites";

interface SiteSettingsProps {
  site: Site;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SiteSettings({ site, open, onOpenChange }: SiteSettingsProps) {
  const { updateSite, isLoading } = useUpdateSite();
  const [settings, setSettings] = useState<SiteSetting>(site.siteSetting ?? {});
  const [siteName, setSiteName] = useState(site.siteName);

  const handleSave = async () => {
    await updateSite({
      siteId: site.id,
      input: {
        siteName,
        siteSetting: settings,
      },
    });
    onOpenChange(false);
  };

  const updateThemeSetting = (
    key: keyof NonNullable<SiteSetting["theme"]>,
    value: string,
  ) => {
    setSettings((prev: SiteSetting) => ({
      ...prev,
      theme: {
        ...prev.theme,
        [key]: value,
      },
    }));
  };

  const updateSeoSetting = (
    key: keyof NonNullable<SiteSetting["seo"]>,
    value: string,
  ) => {
    setSettings((prev: SiteSetting) => ({
      ...prev,
      seo: {
        ...prev.seo,
        [key]: value,
      },
    }));
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-100 overflow-y-auto px-4 py-2">
        <SheetHeader className="px-0">
          <SheetTitle className=" font-medium">Site Settings</SheetTitle>
          <SheetDescription>
            Customize your site appearance and settings
          </SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="general" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="theme">Theme</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="siteName">Site Name</Label>
              <Input
                id="siteName"
                value={siteName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSiteName(e.target.value)
                }
                placeholder="My Awesome Site"
              />
            </div>

            <div className="space-y-2">
              <Label>Header</Label>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="showHeader"
                  checked={settings.header?.show ?? true}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setSettings((prev: SiteSetting) => ({
                      ...prev,
                      header: { ...prev.header, show: e.target.checked },
                    }))
                  }
                />
                <Label htmlFor="showHeader" className="font-normal">
                  Show header
                </Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Footer</Label>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="showFooter"
                  checked={settings.footer?.show ?? true}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setSettings((prev: SiteSetting) => ({
                      ...prev,
                      footer: { ...prev.footer, show: e.target.checked },
                    }))
                  }
                />
                <Label htmlFor="showFooter" className="font-normal">
                  Show footer
                </Label>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="theme" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="primaryColor">Primary Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  id="primaryColor"
                  value={settings.theme?.primaryColor ?? "#000000"}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    updateThemeSetting("primaryColor", e.target.value)
                  }
                  className="w-12 h-10 p-1"
                />
                <Input
                  value={settings.theme?.primaryColor ?? "#000000"}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    updateThemeSetting("primaryColor", e.target.value)
                  }
                  placeholder="#000000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="backgroundColor">Background Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  id="backgroundColor"
                  value={settings.theme?.backgroundColor ?? "#ffffff"}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    updateThemeSetting("backgroundColor", e.target.value)
                  }
                  className="w-12 h-10 p-1"
                />
                <Input
                  value={settings.theme?.backgroundColor ?? "#ffffff"}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    updateThemeSetting("backgroundColor", e.target.value)
                  }
                  placeholder="#ffffff"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="textColor">Text Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  id="textColor"
                  value={settings.theme?.textColor ?? "#000000"}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    updateThemeSetting("textColor", e.target.value)
                  }
                  className="w-12 h-10 p-1"
                />
                <Input
                  value={settings.theme?.textColor ?? "#000000"}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    updateThemeSetting("textColor", e.target.value)
                  }
                  placeholder="#000000"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="seo" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="seoTitle">SEO Title</Label>
              <Input
                id="seoTitle"
                value={settings.seo?.title ?? ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  updateSeoSetting("title", e.target.value)
                }
                placeholder="My Site - Awesome Content"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="seoDescription">SEO Description</Label>
              <textarea
                id="seoDescription"
                value={settings.seo?.description ?? ""}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  updateSeoSetting("description", e.target.value)
                }
                placeholder="Enter a description for search engines..."
                rows={3}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ogImage">OG Image URL</Label>
              <Input
                id="ogImage"
                value={settings.seo?.ogImage ?? ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  updateSeoSetting("ogImage", e.target.value)
                }
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex gap-2 justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
