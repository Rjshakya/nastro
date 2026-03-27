import { useNotionSettingsStore } from "#/stores/notion-settings";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { IconArrowLeft, IconSettings } from "@tabler/icons-react";
import { useNavigate } from "@tanstack/react-router";

export function SiteEditorHeader() {
  const { togglePanel } = useNotionSettingsStore((s) => s);
  const navigate = useNavigate();

  const handleBack = () => {
    navigate({ to: "/dashboard" });
  };

  return (
    <header
      className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) sticky
     top-0 inset-x-0 z-50 bg-background "
    >
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="" />
        <Button className={"mr-1"} size={"icon-xs"} variant={"secondary"} onClick={handleBack}>
          <IconArrowLeft />
        </Button>

        <p className=" font-medium">Editor</p>
        <div className="ml-auto flex items-center gap-2"></div>

        <Button variant="outline" size="sm" onClick={() => togglePanel(true)}>
          <IconSettings className="mr-2 h-4 w-4" />
          Settings
        </Button>
      </div>
    </header>
  );
}
