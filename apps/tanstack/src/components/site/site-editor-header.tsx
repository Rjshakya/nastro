import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useNotionCustomizationStore } from "@/stores/notion-customization-store";
import { IconArrowLeft, IconSettings } from "@tabler/icons-react";
import { useRouter } from "@tanstack/react-router";

export function SiteEditorHeader() {
  const { togglePanel } = useNotionCustomizationStore((s) => s);
  const router = useRouter();

  const handleBack = () => {
    router.history.back();
  };

  return (
    <header
      className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) sticky
     top-0 inset-x-0 z-50 bg-background "
    >
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <Button size={"icon-xs"} variant={"secondary"} onClick={handleBack}>
          <IconArrowLeft />
        </Button>
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />

        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">Nastro</h1>
        <div className="ml-auto flex items-center gap-2"></div>

        <Button variant="outline" size="sm" onClick={() => togglePanel(true)}>
          <IconSettings className="mr-2 h-4 w-4" />
          Settings
        </Button>
      </div>
    </header>
  );
}
