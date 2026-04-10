import { ThemeToggle } from "@/components/ThemeToggle";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { TemplatesGrid } from "./templates-grid";
import { CreateTemplateDialog } from "./create-template";

export const TemplateIndexPage = () => {
  return (
    <div className="flex flex-1 flex-col tracking-tight">
      <div className="@container/main mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6">
        <div className="flex flex-col gap-6 p-4 md:p-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl tracking-tight">Templates</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Browse and manage your templates
              </p>
            </div>
            <div className="flex items-center gap-2">
              <CreateTemplateDialog />
              <ThemeToggle />
              <SidebarTrigger customeSize="icon" />
            </div>
          </div>

          {/* Templates Grid */}
          <TemplatesGrid />
        </div>
      </div>
    </div>
  );
};
