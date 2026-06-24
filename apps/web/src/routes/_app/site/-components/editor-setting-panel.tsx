import { useState } from "react";
import { Button } from "@/components/ui/button";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useSiteSettingPanel,
  useSiteSettingStore,
} from "@/stores/site.setting.store";
import { useUpdateSite } from "@/hooks/use-sites";
import { toast } from "sonner";
import { GeneralTab } from "./setting-panel-tabs/general-tab";
import { ThemeTab } from "./setting-panel-tabs/theme-tab";
import { TypographyTab } from "./setting-panel-tabs/typography-tab";
import { LayoutTab } from "./setting-panel-tabs/layout-tab";
import { SeoTab } from "./setting-panel-tabs/seo-tab";
import { AnalyticsTab } from "./setting-panel-tabs/analytics-tab";
import { CodeTab } from "./setting-panel-tabs/code-tab";
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
import { ThemeSelector } from "./theme/theme-selector";
import { useThemeStore } from "@/stores/theme-store";
import { useParams } from "@tanstack/react-router";
import { useIsMobile } from "@/hooks/use-mobile";

interface SettingsDrawerProps {
  site: Site;
}

export function SettingsPanel({ site }: SettingsDrawerProps) {
  const { settings } = useSiteSettingStore((s) => s);
  const { theme } = useThemeStore();
  const params = useParams({ from: "/_app/site/$pageId" });
  const { open, onOpenChange } = useSiteSettingPanel();
  const { updateSite, isLoading } = useUpdateSite();

  const isMobile = useIsMobile();
  const [siteName, setSiteName] = useState(site.name);
  const [slug, setSlug] = useState(site.slug);

  const handleSave = async () => {
    try {
      await updateSite({
        siteId: site.id,
        input: {
          name: siteName,
          slug,
          setting: settings,
          themeId: theme?.id ?? null,
        },
        pageId: params.pageId,
      });
      toast.success("Settings saved");
    } catch {
      toast.error("Failed to save settings");
    }
  };

  return (
    <Sheet
      disablePointerDismissal={true}
      modal={isMobile ? true : false}
      open={open}
      onOpenChange={onOpenChange}
    >
      <SheetContent
        showCloseButton={false}
        side={isMobile ? "bottom" : "right"}
        overlayClassName="hidden"
        className=" gap-2 data-[side=bottom]:h-full data-[side=right]:sm:max-w-lg py-4"
      >
        <SheetHeader className="py-0">
          <SheetTitle>Site Settings</SheetTitle>
          <SheetDescription>
            Customize your site appearance and behavior
          </SheetDescription>
        </SheetHeader>

        <ThemeSelector />

        <div className="h-full px-4 overflow-y-auto flex-1">
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
              <TabsTrigger value="code">Code</TabsTrigger>
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
              <SeoTab site={site} pageId={params.pageId} />
            </TabsContent>
            <TabsContent value="analytics">
              <AnalyticsTab />
            </TabsContent>
            <TabsContent value="code">
              <CodeTab site={site} />
            </TabsContent>
          </Tabs>
        </div>

        <SheetFooter className="py-0">
          <Button size={"lg"} onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
          <SheetClose render={<Button variant="outline">Close</Button>} />
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
