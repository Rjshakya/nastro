import { NotionRenderer as NotionRendererLib, Button } from "react-notion-x";
import { Card, CardContent } from "@/components/ui/card";
import { Collection } from "react-notion-x/third-party/collection";
import { Code } from "react-notion-x/third-party/code";
import { Equation } from "react-notion-x/third-party/equation";
import { type CSSProperties } from "react";
import { Link, useLocation, useRouter } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { useSiteSettingStore } from "@/stores/site.setting.store";
import type { Block } from "notion-types";
import { Button as ShadBtn } from "@/components/ui/button";
import { IconFileDescription } from "@tabler/icons-react";
import { renderCodeBlock } from "./code";

interface NotionRendererProps {
  pageId: string;
  recordMap: any;
  slug: string;
}

export function NotionRenderer({
  pageId,
  recordMap,
  slug,
}: NotionRendererProps) {
  const { settings, styles } = useSiteSettingStore();
  const { pathname } = useLocation();
  const { origin } = useRouter();
  const host = new URL("/", origin).hostname;

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
    if (!pathname.includes("/site")) {
      if (host.includes(".nastro.xyz")) {
        return `/${pageId}`;
      }
      return `/${pageId}?slug=${slug}`;
    }
    return `/site/${pageId}?slug=${slug}`;
  };

  const showHeader = settings.layout?.header ?? false;
  const showFooter = settings.layout?.footer ?? false;

  return (
    <div
      style={{ ...styles } as CSSProperties & Record<string, any>}
      className="notion-renderer tracking-tighter relative"
    >
      <NotionRendererLib
        className=""
        fullPage={true}
        recordMap={recordMap}
        rootPageId={pageId}
        components={{
          Button,
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
          Code,
        }}
        mapPageUrl={handlePageUrl}
        header={
          showHeader ? (
            <SiteHeader header={settings.layout?.headerConfig} />
          ) : undefined
        }
        disableHeader
      />
      {showFooter && <SiteFooter footer={settings.layout?.footerConfig} />}
    </div>
  );
}
