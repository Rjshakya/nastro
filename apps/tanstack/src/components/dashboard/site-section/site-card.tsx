import {
  IconTrash,
  IconSettings,
  IconCircleArrowUpRightFilled,
} from "@tabler/icons-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Site } from "@/types/site";
import { Link } from "@tanstack/react-router";
import { useDeleteSite } from "#/hooks/use-sites";
import { createSlugUrl } from "#/lib/utils";
import { Env } from "env";

interface SiteCardProps {
  site: Site;
}

export function SiteCard({ site }: SiteCardProps) {
  const { deleteSite, isLoading: isDeleting } = useDeleteSite();
  const url = Env.isDev
    ? "/$pageId"
    : createSlugUrl(site.slug) + "/" + site.pageId;
  const _handleDelete = async () => {
    await deleteSite({ pageId: site.pageId || "", siteId: site.id });
  };

  return (
    <Card className="rounded-md p-1">
      <CardHeader className="px-1 flex items-center justify-between gap-2">
        <CardTitle className="">{site.siteName}</CardTitle>
        <div className="">
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-destructive"
            onClick={() => _handleDelete()}
            disabled={isDeleting}
          >
            <IconTrash className="h-4 w-4" />
          </Button>

          <Link
            to="/site/$pageId"
            params={{ pageId: site.pageId || "" }}
            search={{ slug: site.slug }}
          >
            <Button variant="ghost" size="icon-sm" className="">
              <IconSettings className="h-4 w-4" />
            </Button>
          </Link>

          <Link
            to={url}
            params={{ pageId: site.pageId || "" }}
            search={{ slug: site.slug }}
            target="_blank"
          >
            <Button
              variant="secondary"
              size="icon-sm"
              className="text-blue-500"
              disabled={isDeleting}
            >
              <IconCircleArrowUpRightFilled />
            </Button>
          </Link>
        </div>
      </CardHeader>
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
