import { ThemeToggle } from "../ThemeToggle";
import { DashboardSitesSection } from "./site-section/sites-section";
import { getRouteApi } from "@tanstack/react-router";

export const dashboardHomeApi = getRouteApi("/dashboard");
export const DashboardHome = () => {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2 max-w-4xl mx-auto w-full">
        <div className="flex flex-col gap-6 p-4 md:p-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl tracking-tight">Dashboard</h1>
              <p className="text-sm text-muted-foreground mt-1">Manage your sites</p>
            </div>
            <div className="flex ">
              <ThemeToggle />
            </div>
          </div>

          {/* Sites Section */}
          <DashboardSitesSection />
        </div>
      </div>
    </div>
  );
};
