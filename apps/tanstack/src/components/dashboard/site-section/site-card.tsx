import { IconTrash, IconSettings } from "@tabler/icons-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Site } from "@/types/site";
import { Link, useRouter } from "@tanstack/react-router";

interface SiteCardProps {
  site: Site;
  onEdit: (site: Site) => void;
  handleDelete: (siteId: string) => Promise<void> | void;
  isDeleting?: boolean;
}

export function SiteCard({
  site,
  onEdit,
  handleDelete,
  isDeleting,
}: SiteCardProps) {
  const router = useRouter();

  const _handleDelete = async (id: string) => {
    await handleDelete(id);
    await router.invalidate({ sync: true });
  };

  return (
    <Card className="hover:shadow-md transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base font-medium line-clamp-1">
              {site.siteName}
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              {site.pageId
                ? `Page ID: ${site.pageId.slice(0, 8)}...`
                : "No page linked"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            ID: {site.shortId}
          </div>
          <div className="flex items-center gap-1">
            <Link
              to="/site/$siteId"
              params={{ siteId: site.id }}
              search={{ pageId: site.pageId || "" }}
            >
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                // onClick={() => onEdit(site)}
              >
                <IconSettings className="h-4 w-4" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={() => _handleDelete(site.id)}
              disabled={isDeleting}
            >
              <IconTrash className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function SiteCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <Skeleton className="h-5 w-3/4 mb-2" />
        <Skeleton className="h-3 w-1/2" />
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-1/4" />
          <div className="flex gap-1">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
