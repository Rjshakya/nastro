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
import { TabAnalytics } from "./tabs/tab-analytics";
import { useThemes } from "#/hooks/use-themes";
import { SelectThemes } from "./theme.components";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { siteEditorRoute } from "../editor";
import type { Theme } from "#/types/theme";
import { useThemeStore } from "#/stores/theme-store";
import { useEffect } from "react";
import { toast } from "sonner";
import { useIsMobile } from "#/hooks/use-mobile";

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
  const { updateSite, isLoading: isSaving } = useUpdateSite();
  const { settings: currentSettings } = useNotionSettingsStore();
  const navigate = useNavigate();

  const search = siteEditorRoute.useSearch();
  const { settings: defaultSettings } = siteEditorRoute.useLoaderData();

  const router = useRouter();

  const isMobile = useIsMobile();

  const { defaultTheme, setThemes, setTheme, setHasThemeChanged } = useThemeStore((s) => s);
  const { data: themes } = useThemes({});

  const handleSave = async () => {
    const generalSettings = currentSettings?.general;

    if (!generalSettings || !generalSettings?.slug || !generalSettings?.siteName) {
      toast.error("Site name and slug are required");
      return;
    }

    try {
      await updateSite({
        siteId,
        input: {
          slug: generalSettings?.slug,
          siteName: generalSettings?.siteName,
          siteSetting: currentSettings,
        },
      }).then(async () => await router.invalidate());

      onOpenChange(false);
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast.error("failed to save site");
    }
  };

  useEffect(() => {
    if (!themes || !themes.length) return;

    const run = async (ths: Theme[]): Promise<void> => {
      const defTheme = defaultTheme(defaultSettings);
      const themesWithDefault = [...ths, defTheme];
      const findTheme = ths?.length && ths.find((t) => t?.id === search?.themeId);

      if (findTheme) {
        setTheme({
          ...findTheme,
          themeSetting: {
            ...findTheme.themeSetting,
            general: {
              ...findTheme.themeSetting?.general,
              type: "general",
              slug: defaultSettings.general?.slug,
            },
            layout: defaultSettings?.layout,
          },
        });
      } else {
        setTheme(defTheme);
      }

      setThemes(themesWithDefault);
      setHasThemeChanged(false);
    };

    run(themes);
  }, [themes, search?.themeId]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        overlayClassName="supports-backdrop-filter:backdrop-blur-none"
        className={"px-4 py-4  data-[side=bottom]:h-[60vh] overflow-y-auto z-50"}
      >
        <SheetHeader className="px-0">
          <SheetTitle className="font-medium">Site Settings</SheetTitle>
          <SheetDescription>Customize your site appearance and settings</SheetDescription>
        </SheetHeader>

        <SelectThemes
          onThemeChange={(th) => {
            navigate({
              to: "/site/$pageId",
              search: () => {
                let res = { slug: search.slug } as {
                  slug: string;
                  themeId?: string;
                };

                if (th.id) {
                  res.themeId = th.id;
                }

                return res;
              },
              params: (prev) => ({ pageId: prev.pageId || "page" }),
            });
          }}
        />

        <Tabs defaultValue="general" className=" grid">
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
            <Button size={"sm"} onClick={handleSave}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>

            <SheetClose
              render={
                <Button size={"sm"} variant={"destructive"}>
                  Close
                </Button>
              }
            />
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

  if (section.type === "analytics") {
    return <TabAnalytics analytics={section} />;
  }

  return null;
};
