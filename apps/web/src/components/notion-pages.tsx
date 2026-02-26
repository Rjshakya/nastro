import {
  IconFileDescription,
  IconRefresh,
  IconNotebook,
  IconExternalLink,
} from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemo } from "react";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemGroup,
  ItemHeader,
  ItemMedia,
  ItemTitle,
} from "./ui/item";

interface NotionPage {
  id: string;
  url?: string;
  icon?: { type: string; emoji?: string } | null;
  properties?: Record<string, unknown>;
}

interface NotionPagesProps {
  data: NotionPage[] | undefined;
  isLoading: boolean;
  error: Error | undefined;
}

function getPageTitle(page: NotionPage): string {
  if (!page.properties) return "Untitled";

  const props = page.properties;
  for (const key of Object.keys(props)) {
    const prop = props[key] as {
      type: string;
      title?: { plain_text: string }[];
    };
    if (prop?.type === "title" && prop.title?.[0]?.plain_text) {
      return prop.title[0].plain_text;
    }
  }
  return "Untitled";
}

function PageItem({ page }: { page: NotionPage }) {
  const title = useMemo(() => getPageTitle(page), [page]);

  return (
    <a
      href={page.url ?? "#"}
      target="_blank"
      rel="noopener noreferrer"
      className=""
    >
      <Item className="bg-background" variant={"muted"}>
         <Button size={"icon-sm"} variant={"secondary"}>
          <IconFileDescription className="size-5" />
         </Button>
        <ItemContent>
          <ItemTitle className="">{title}</ItemTitle>
        </ItemContent>
        <ItemActions>
          <Button variant={"ghost"} size={"icon-sm"}>
            <IconExternalLink className="h-3 w-3" />
          </Button>
        </ItemActions>
      </Item>
    </a>
  );
}

function PageCardSkeleton() {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center gap-3 pb-3">
        <Skeleton className="h-9 w-9 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <Skeleton className="h-3 w-1/3" />
      </CardContent>
    </Card>
  );
}

interface NotionPagesSectionProps extends NotionPagesProps {
  onRetry?: () => void;
}

export function NotionPages({
  data,
  isLoading,
  error,
  onRetry,
}: NotionPagesSectionProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <PageCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
          <IconNotebook className="h-6 w-6 text-destructive" />
        </div>
        <p className="mb-4 text-sm text-muted-foreground">
          Failed to load Notion pages
        </p>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            <IconRefresh className="mr-2 h-4 w-4" />
            Try again
          </Button>
        )}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <IconNotebook className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="mb-1 text-sm font-medium">No pages found</p>
        <p className="text-xs text-muted-foreground">
          Connect your Notion workspace to see your pages here
        </p>
      </div>
    );
  }

  return (
    <ItemGroup className="p-1">
      {data.map((page) => (
        <PageItem key={page.id} page={page} />
      ))}
    </ItemGroup>
  );
}
