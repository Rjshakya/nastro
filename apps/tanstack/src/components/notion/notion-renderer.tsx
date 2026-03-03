import { NotionRenderer as NotionRendererLib, Button } from "react-notion-x";
import { Card, CardContent } from "@/components/ui/card";
import { Code } from "react-notion-x/build/third-party/code";
import { Collection } from "react-notion-x/build/third-party/collection";
import { Equation } from "react-notion-x/build/third-party/equation";
import { useNotionCustomizationStore } from "@/stores/notion-customization-store";
import { type CSSProperties } from "react";
import { mutate } from "swr";
import { Link } from "@tanstack/react-router";

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
            return (
              <Link to={href} {...props}>
                {children}
              </Link>
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
