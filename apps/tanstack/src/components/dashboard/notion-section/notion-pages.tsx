import {
  IconFileDescription,
  IconNotebook,
  IconExternalLink,
} from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemo } from "react";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemGroup,
  ItemTitle,
} from "../../ui/item";
import { ScrollArea, ScrollBar } from "#/components/ui/scroll-area";

interface NotionPage {
  id: string;
  url?: string;
  icon?: { type: string; emoji?: string } | null;
  properties?: Record<string, unknown>;
}

interface NotionPagesProps {
  data: NotionPage[] | undefined;
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
      <Item className="p-1" variant={"muted"}>
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

export function NotionPages({ data }: NotionPagesProps) {
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
    <ScrollArea className={"h-80 rounded-md"}>
      <ItemGroup className=" gap-1  ">
        {data.map((page) => (
          <PageItem key={page.id} page={page} />
        ))}
      </ItemGroup>
      <ScrollBar />
    </ScrollArea>
  );
}
