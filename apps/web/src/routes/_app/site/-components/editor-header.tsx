import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { IconSettings } from "@tabler/icons-react";
import { getRouteApi } from "@tanstack/react-router";
import { useSiteSettingPanel } from "@/stores/site.setting.store";
import { useCodeEditorPanelStore } from "@/stores/code-editor-panel.store";
import { CodeEditorPanel } from "./code-editor-panel";

const siteRoute = getRouteApi("/_app/site/$pageId");

export function SiteEditorHeader() {
  const { site } = siteRoute.useLoaderData();
  const { onOpenChange: onSettingsOpenChange } = useSiteSettingPanel();
  const { onOpenChange: onCodeEditorOpenChange } = useCodeEditorPanelStore();
  const { toggleSidebar, setOpen } = useSidebar();

  return (
    <header
      className={cn(
        "flex h-(--header-height) shrink-0 items-center gap-2 border-b sticky top-0 z-10 bg-background",
      )}
    >
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <p className="font-medium">Editor</p>
        <div className="ml-auto flex items-center gap-2">
          <SidebarTrigger size={"icon"} variant={"secondary"} />
          <Button
            variant="secondary"
            onClick={() => {
              onCodeEditorOpenChange(true);
              setOpen(false);
            }}
          >
            Code
          </Button>
          <Button
            variant="secondary"
            onClick={() => onSettingsOpenChange(true)}
          >
            <IconSettings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>
      <CodeEditorPanel site={site} />
    </header>
  );
}
