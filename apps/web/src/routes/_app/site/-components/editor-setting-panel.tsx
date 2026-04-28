import { useState } from "react";
import { Button } from "@/components/ui/button";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSiteSettingPanel, useSiteSettingStore } from "@/stores/site.setting.store";
import { useUpdateSite } from "@/hooks/use-sites";
import { toast } from "sonner";
import { GeneralTab } from "./setting-panel-tabs/general-tab";
import { ThemeTab } from "./setting-panel-tabs/theme-tab";
import { TypographyTab } from "./setting-panel-tabs/typography-tab";
import { LayoutTab } from "./setting-panel-tabs/layout-tab";
import { SeoTab } from "./setting-panel-tabs/seo-tab";
import { AnalyticsTab } from "./setting-panel-tabs/analytics-tab";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { Site } from "@/types/site";
import { authClient } from "@/lib/auth-client";
import { ThemeSelector } from "@/components/site/theme-selector";

interface SettingsDrawerProps {
  site: Site;
}

export function SettingsPanel({ site }: SettingsDrawerProps) {
  const { settings } = useSiteSettingStore();
  const { open, onOpenChange } = useSiteSettingPanel();
  const { updateSite, isLoading } = useUpdateSite();
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id || "";

  const [siteName, setSiteName] = useState(site.name);
  const [slug, setSlug] = useState(site.slug);

  const handleSave = async () => {
    try {
      await updateSite({
        siteId: site.id,
        input: {
          userId,
          rootPageId: site.rootPageId,
          name: siteName,
          slug,
          setting: settings,
        },
      });
      toast.success("Settings saved");
    } catch {
      toast.error("Failed to save settings");
    }
  };

  return (
    <Sheet disablePointerDismissal={true} modal={false} open={open} onOpenChange={onOpenChange}>
      <SheetContent overlayClassName="hidden" className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Site Settings</SheetTitle>
          <SheetDescription>Customize your site appearance and behavior</SheetDescription>
        </SheetHeader>

        <ThemeSelector />

        <div className="px-4 overflow-y-auto flex-1">
          <Tabs defaultValue="general" className="w-full">
            <TabsList
              className="w-full justify-start overflow-x-auto scrollable"
              style={{ scrollbarWidth: "none" }}
            >
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="theme">Theme</TabsTrigger>
              <TabsTrigger value="typography">Typography</TabsTrigger>
              <TabsTrigger value="layout">Layout</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="general">
              <GeneralTab
                siteName={siteName}
                slug={slug}
                onSiteNameChange={setSiteName}
                onSlugChange={setSlug}
              />
            </TabsContent>
            <TabsContent value="theme">
              <ThemeTab />
            </TabsContent>
            <TabsContent value="typography">
              <TypographyTab />
            </TabsContent>
            <TabsContent value="layout">
              <LayoutTab />
            </TabsContent>
            <TabsContent value="seo">
              <SeoTab />
            </TabsContent>
            <TabsContent value="analytics">
              <AnalyticsTab />
            </TabsContent>
          </Tabs>
        </div>

        <SheetFooter>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
          <SheetClose render={<Button variant="outline">Close</Button>} />
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
