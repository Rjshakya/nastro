import { NotionRenderer as NotionRendererLib, Button } from "react-notion-x";
import { Card, CardContent } from "@/components/ui/card";
import { Code } from "react-notion-x/build/third-party/code";
import { Collection } from "react-notion-x/build/third-party/collection";
import { Equation } from "react-notion-x/build/third-party/equation";
import { useNotionCustomizationStore } from "@/stores/notion-customization-store";
import { type CSSProperties } from "react";
import { mutate } from "swr";

interface NotionRendererProps {
  pageId: string;
  recordMap: any;
  siteId: string;
}

export function NotionRenderer({
  pageId,
  recordMap,
  siteId,
}: NotionRendererProps) {
  const { customStyles } = useNotionCustomizationStore((s) => s);

  if (!recordMap) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No content available
        </CardContent>
      </Card>
    );
  }

  return (
    <div
      style={{ ...customStyles } as CSSProperties & Record<string, any>}
      className="notion-renderer tracking-tighter "
    >
      <NotionRendererLib
        fullPage={true}
        recordMap={recordMap}
        // darkMode={isDark}
        rootPageId={pageId}
        // showTableOfContents={true}
        components={{
          Button,
          Code,
          Equation,
          Collection,
          PageLink: ({ href, children, ...props }: any) => {
            const handleClick = (e: React.MouseEvent) => {
              // 1. Prevent the browser from doing a full refresh
              e.preventDefault();

              // 2. Extract the new pageId from the link
              // Notion links usually look like /<page-id> or include a slug
              const url = new URL(href, window.location.origin);
              const newPageId = url.searchParams.get("pageId") || "";

              // 3. Update your URL without reloading (Shallow Routing)
              const currentUrl = new URL(window.location.href);
              currentUrl.searchParams.set("pageId", newPageId);
              window.history.pushState({}, "", currentUrl);
              mutate(`/sites/${newPageId}`);

              // 4. Important: Trigger your React state update here
              // Example: setPageId(newPageId);
            };

            return (
              <a href={href} {...props} onClick={handleClick}>
                {children}
              </a>
            );
          },
        }}
        disableHeader
        rootDomain=""
        mapPageUrl={(pageId: string) => {
          return `/site/${siteId}?pageId=${pageId}`;
        }}
      />
    </div>
  );
}
