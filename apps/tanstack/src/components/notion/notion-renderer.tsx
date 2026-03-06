import { NotionRenderer as NotionRendererLib, Button } from "react-notion-x";
import { Card, CardContent } from "@/components/ui/card";
import { Code } from "react-notion-x/build/third-party/code";
import { Collection } from "react-notion-x/build/third-party/collection";
import { Equation } from "react-notion-x/build/third-party/equation";
import { useNotionCustomizationStore } from "@/stores/notion-customization-store";
import { type CSSProperties } from "react";
import {
  getRouteApi,
  Link,
  useLocation,
  useRouter,
} from "@tanstack/react-router";
import type { SiteSetting } from "#/types/site";
import { SiteHeader } from "../site/site-header";
import { useNotionSettingsStore } from "#/stores/notion-settings";
import type { NotionPageSettings } from "#/types/customization";
import { SiteFooter } from "../site/site-footer";

interface NotionRendererProps {
  pageId: string;
  recordMap: any;
  siteId: string;
  seo?: NotionPageSettings["seo"];
}

export function NotionRenderer({
  pageId,
  recordMap,
  siteId,
  seo,
}: NotionRendererProps) {
  const { styles } = useNotionSettingsStore((s) => s);
  const pathname = useLocation({ select: ({ pathname }) => pathname });

  if (!recordMap) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No content available
        </CardContent>
      </Card>
    );
  }

  const handlePageUrl = (pageId: string) => {
    if (pathname === `/${siteId}`) {
      return `/${siteId}?pageId=${pageId}`;
    }

    return `/site/${siteId}?pageId=${pageId}`;
  };

  return (
    <div
      style={{ ...styles } as CSSProperties & Record<string, any>}
      className="notion-renderer tracking-tighter"
    >
      <NotionRendererLib
        fullPage={true}
        recordMap={recordMap}
        rootPageId={pageId}
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
          Header: SiteHeader,
        }}
        mapPageUrl={handlePageUrl}
        footer={<SiteFooter />}
        header={<SiteHeader />}
        disableHeader
      />
    </div>
  );
}
