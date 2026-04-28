import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { IconArrowLeft, IconSettings } from "@tabler/icons-react";
import { useNavigate } from "@tanstack/react-router";
import { useSiteSettingPanel } from "@/stores/site.setting.store";

export function SiteEditorHeader() {
  const navigate = useNavigate();
  const { onOpenChange } = useSiteSettingPanel();
  const handleBack = () => {
    navigate({ to: "/dashboard" });
  };

  return (
    <header className={cn("flex h-(--header-height) shrink-0 items-center gap-2 border-b")}>
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger />
        <Button className="mr-1" size="icon-xs" variant="secondary" onClick={handleBack}>
          <IconArrowLeft />
        </Button>

        <p className="font-medium">Editor</p>
        <div className="ml-auto flex items-center gap-2">
          <Button onClick={() => onOpenChange(true)} variant="outline" size="sm">
            <IconSettings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>
    </header>
  );
}
