import {
  IconTrash,
  IconSettings,
  IconArrowUpRight,
  IconDots,
  IconLink,
} from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Site } from "@/types/site";
import { Link } from "@tanstack/react-router";
import { useDeleteSite } from "@/hooks/use-sites";
import { cn, createSlugUrl } from "@/lib/utils";
import { Env } from "@/lib/env";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  Item,
  ItemContent,
  ItemTitle,
  ItemActions,
} from "@/components/ui/item";

interface SiteCardProps {
  site: Site;
  className?: string;
}

export function SiteCard({ site, className }: SiteCardProps) {
  const { deleteSite, isLoading: isDeleting } = useDeleteSite();
  const url = Env.isDev
    ? `/${site.rootPageId}`
    : createSlugUrl(site.slug) + site.rootPageId;
  const _handleDelete = async () => {
    await deleteSite({ pageId: site.rootPageId || "", siteId: site.id });
  };

  const handleCopyLink = ({
    rootPageId,
    slug,
  }: {
    rootPageId: string;
    slug: string;
  }) => {
    if (import.meta.env.VITE_PUBLIC_ENVIRONMENT === "development") {
      navigator.clipboard.writeText(
        `https://${window.location.origin}/${rootPageId}?slug=${slug}`,
      );
    } else {
      navigator.clipboard.writeText(`https://${slug}.nastro.xyz/${rootPageId}`);
    }

    toast.success("Link copied to clipboard");
  };

  return (
    <Item className={cn(" rounded-xl bg-card hover:bg-accent", className)}>
      <ItemContent>
        <Link
          to="/site/$pageId"
          params={{ pageId: site.rootPageId || "" }}
          search={{ slug: site.slug }}
          className="w-full block"
        >
          <ItemTitle className="text-base">{site.name}</ItemTitle>
        </Link>
      </ItemContent>
      <ItemActions>
        <DropdownMenu>
          <DropdownMenuTrigger
            onClick={(e) => e.stopPropagation()}
            render={
              <Button size={"icon-sm"} variant={"ghost"}>
                <IconDots />
              </Button>
            }
          />
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <Link
                to={url}
                params={{ pageId: site.rootPageId || "" }}
                search={{ slug: site.slug }}
                target="_blank"
                className="w-full flex items-center gap-2"
              >
                <DropdownMenuItem className={"w-full"}>
                  <IconArrowUpRight className="size-4" />
                  <p>Link</p>
                </DropdownMenuItem>
              </Link>

              <DropdownMenuItem
                closeOnClick={false}
                onClick={() =>
                  handleCopyLink({
                    rootPageId: site.rootPageId as string,
                    slug: site.slug,
                  })
                }
                className={"w-full"}
              >
                <IconLink className="size-4" />
                <p>Copy</p>
              </DropdownMenuItem>

              <Link
                to="/site/$pageId"
                params={{ pageId: site.rootPageId || "" }}
                search={{ slug: site.slug }}
                className="w-full flex items-center gap-2"
              >
                <DropdownMenuItem className={"w-full"}>
                  <IconSettings className="h-4 w-4" />
                  <p>Edit</p>
                </DropdownMenuItem>
              </Link>

              <DropdownMenuItem
                variant="destructive"
                onClick={() => _handleDelete()}
                disabled={isDeleting}
              >
                <IconTrash className="h-4 w-4" />
                <p>Delete</p>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </ItemActions>
    </Item>
  );
}

export function SiteCardSkeleton() {
  return (
    <div className="flex items-center justify-between p-4 border-b last:border-b-0">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-8 w-8" />
    </div>
  );
}
