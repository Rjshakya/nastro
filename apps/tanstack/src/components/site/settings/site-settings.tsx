"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUpdateSite } from "@/hooks/use-sites";
import type { Site, SiteSetting } from "@/types/site";
import { SiteTheme } from "./site-theme";
import { useNotionCustomizationStore } from "@/stores/notion-customization-store";
import { FontPicker } from "@/components/font-picker";

interface SiteSettingsProps {
  site: Site;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SiteSettings({ site, open, onOpenChange }: SiteSettingsProps) {
  const { updateSite, isLoading } = useUpdateSite();
  const [settings, setSettings] = useState<SiteSetting>(site.siteSetting ?? {});
  const [siteName, setSiteName] = useState(site.siteName);
  const { customization, updateStore } = useNotionCustomizationStore((s) => s);

  const handleSave = async () => {
    await updateSite({
      siteId: site.id,
      input: {
        siteName,
        siteSetting: {
          ...settings,
          notionCustomization: customization ?? undefined,
        },
      },
    });
    onOpenChange(false);
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
      <SheetContent className="sm:max-w-100 overflow-y-auto px-4 py-2 z-999">
        <SheetHeader className="px-0">
          <SheetTitle className=" font-medium">Site Settings</SheetTitle>
          <SheetDescription>
            Customize your site appearance and settings
          </SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="general" className="mt-4 grid">
          <TabsList className="  ">
            <TabsTrigger className=" cursor-pointer" value="general">
              General
            </TabsTrigger>
            <TabsTrigger className=" cursor-pointer" value="theme">
              Theme
            </TabsTrigger>
            <TabsTrigger className=" cursor-pointer" value="font">
              Font
            </TabsTrigger>
            <TabsTrigger className=" cursor-pointer" value="seo">
              SEO
            </TabsTrigger>
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
          </TabsContent>

          <TabsContent value="theme" className="space-y-4 mt-4">
            <SiteTheme />
          </TabsContent>

          <TabsContent value="font" className=" space-y-4">
            <div className="grid gap-2">
              <Label>Primary font</Label>
              <FontPicker
                onChange={(font) => {
                  const curr = customization?.fonts;
                  updateStore({ fonts: { ...curr, primary: font } });
                }}
                value={customization?.fonts?.primary || "primary font"}
              />
            </div>
            <div className="grid gap-2">
              <Label>Secondary font</Label>
              <FontPicker
                onChange={(font) => {
                  const curr = customization?.fonts;
                  updateStore({ fonts: { ...curr, secondary: font } });
                }}
                value={customization?.fonts?.secondary || "secondary font"}
              />
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

        <SheetFooter>
          <div className="mt-6 flex gap-1 justify-end">
            <Button size={"sm"} onClick={handleSave} disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
            <SheetClose className={"bg-muted px-4  rounded-md"}>
              Cancel
            </SheetClose>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
