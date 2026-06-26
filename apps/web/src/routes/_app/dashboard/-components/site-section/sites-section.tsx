import { SiteCard } from "./site-card";
import type { Site } from "@/types/site";
import { IconWorld, IconWorldOff } from "@tabler/icons-react";
import { CreateSiteDialog } from "./create-site";
import { EmptyState } from "@/components/empty";
import { useSites } from "@/hooks/use-sites";
import { DashboardLoading } from "../dashboard-loading";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { ItemGroup } from "@/components/ui/item";
import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

export const DashboardSitesSection = () => {
  const { data: sites, isLoading } = useSites();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [hoveredRect, setHoveredRect] = useState<DOMRect | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  if (isLoading) {
    return <DashboardLoading />;
  }

  return (
    <div className="bg-accent rounded-2xl p-1">
      <div className="mb-2 p-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <IconWorld className="size-5 text-blue-400" stroke={2} />
          <CardTitle>Sites</CardTitle>
        </div>
        <CreateSiteDialog />
      </div>

      <Card className="rounded-xl p-1 bg-background">
        <CardContent className="p-0">
          {sites && sites.length > 0 ? (
            <ItemGroup className="gap-0 relative" ref={containerRef}>
              <AnimatePresence>
                {hoveredId && hoveredRect && containerRef.current && (
                  <motion.div
                    key="hover-bg"
                    className="absolute bg-muted rounded-xl z-0 pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: 1,
                      top:
                        hoveredRect.top -
                        containerRef.current.getBoundingClientRect().top,
                      left: 0,
                      width: hoveredRect.width,
                      height: hoveredRect.height,
                    }}
                    exit={{ opacity: 0 }}
                    transition={{
                      type: "spring",
                      bounce: 0.2,
                      duration: 0.4,
                    }}
                  />
                )}
              </AnimatePresence>
              {sites?.map((site) => (
                <SiteCard
                  key={site.id}
                  site={site as Site}
                  onMouseEnter={(e) => {
                    setHoveredId(site.id);
                    setHoveredRect(
                      (e.currentTarget as HTMLElement).getBoundingClientRect(),
                    );
                  }}
                  onMouseLeave={() => {
                    setHoveredId(null);
                    setHoveredRect(null);
                  }}
                />
              ))}
            </ItemGroup>
          ) : (
            <EmptyState
              className="py-8"
              icon={IconWorldOff}
              title="No Sites Yet"
              description="You haven't created any sites yet. Create your first site to get started."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};
