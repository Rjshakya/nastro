import { Button } from "@/components/ui/button";
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
import { useNotionSettingsStore } from "#/stores/notion-settings";
import type { NotionPageSettings } from "#/types/notion-page-settings";

import { useUpdateSite } from "#/hooks/use-sites";
import { getEntries } from "#/lib/utils";
import { TabGeneral } from "./tabs/tab-general";
import { TabTheme } from "./tabs/tab-theme";
import { TabLayout } from "./tabs/tab-layout";
import { TabTypo } from "./tabs/tab-typo";
import { TabSeo } from "./tabs/tab-seo";
import { useThemes } from "#/hooks/use-themes";
import { CreateTheme, SaveTheme, SelectThemes } from "./theme";
import { useNavigate } from "@tanstack/react-router";
import { siteEditorRoute } from "../editor";

export const SettingsV2 = ({
  pageSettings,
  onOpenChange,
  open,
  siteId,
}: {
  pageSettings: NotionPageSettings;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  siteId: string;
}) => {
  const { updateSite, isLoading } = useUpdateSite();
  const { settings } = useNotionSettingsStore();
  const { data: themes } = useThemes();
  const navigate = useNavigate();
  const search = siteEditorRoute.useSearch();

  const handleSave = async () => {
    try {
      await updateSite({
        siteId,
        input: {
          slug: settings.general?.slug || "",
          siteName: settings.general?.siteName || "",
          siteSetting: settings,
        },
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to save settings:", error);
    }
  };
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        overlayClassName="supports-backdrop-filter:backdrop-blur-none  "
        className="w-full sm:max-w-md overflow-y-auto px-4 py-2 z-50 "
      >
        <SheetHeader className="px-0">
          <SheetTitle className="font-medium">Site Settings</SheetTitle>
          <SheetDescription>Customize your site appearance and settings</SheetDescription>
        </SheetHeader>

        <SelectThemes
          themes={themes}
          onThemeChange={(th) => {
            navigate({
              to: "/site/$pageId",
              search: () => {
                let res = { slug: search.slug } as { slug: string; themeId?: string };

                if (th.id) {
                  res.themeId = th.id;
                }

                return res;
              },
              params: (prev) => ({ pageId: prev.pageId || "page" }),
            });
          }}
        />

        <Tabs defaultValue="general" className="mt-4 grid">
          <TabsList
            className="w-full justify-start overflow-x-scroll "
            style={{ scrollbarWidth: "none" }}
          >
            {Object.keys(pageSettings).map((v) => {
              if (v === "darkTheme") {
                return null;
              }

              return (
                <TabsTrigger value={v} className={"capitalize"}>
                  {v}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {getEntries(pageSettings).map(
            ([k, v]: [string, NotionPageSettings[keyof NotionPageSettings]]) => {
              return (
                <TabsContent value={k} key={k}>
                  <RenderSettingSection section={v} />
                </TabsContent>
              );
            },
          )}
        </Tabs>

        <SheetFooter>
          <div className="mt-6 flex gap-2 justify-end">
            <Button size="sm" onClick={handleSave} disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>

            {search.themeId ? <SaveTheme themeId={search.themeId} /> : <CreateTheme />}

            <SheetClose className="bg-muted px-4 rounded-md hover:bg-muted/80 transition-colors">
              Cancel
            </SheetClose>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export const RenderSettingSection = ({
  section,
}: {
  section: NotionPageSettings[keyof NotionPageSettings];
}) => {
  if (!section) {
    return null;
  }

  if (section.type === "general") {
    return <TabGeneral general={section} />;
  }

  if (section.type === "theme") {
    return <TabTheme theme={section} />;
  }

  if (section.type === "layout") {
    return <TabLayout layout={section} />;
  }

  if (section.type === "typography") {
    return <TabTypo typography={section} />;
  }

  if (section.type === "seo") {
    return <TabSeo seo={section} />;
  }

  return null;
};
