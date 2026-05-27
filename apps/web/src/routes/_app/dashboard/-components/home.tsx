import { ThemeToggle } from "@/components/ThemeToggle";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSitesSection } from "./site-section/sites-section";

export const DashboardHome = () => {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your sites
          </p>
        </div>
        <div className="flex items-center ">
          <SidebarTrigger />
          <ThemeToggle />
        </div>
      </div>

      {/* Sites Section */}
      <DashboardSitesSection />
    </div>
  );
};
