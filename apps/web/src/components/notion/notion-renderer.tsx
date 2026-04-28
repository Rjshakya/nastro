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

export function NotionRenderer({ pageId, recordMap, slug }: NotionRendererProps) {
  const { settings, isDark, styles } = useSiteSettingStore();
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
            const block = children?.props?.block as Block;
            if (block?.type === "page") {
              if (block.parent_table !== "block") {
                return (
                  <Link to={href} {...props}>
                    {children}
                  </Link>
                );
              }
              const title = block.properties?.title?.[0] || "";
              return (
                <Link {...props} to={href}>
                  <ShadBtn
                    className="w-full flex justify-start rounded-xs px-2"
                    variant="ghost"
                    size="sm"
                  >
                    <IconFileDescription className="stroke-(--ns-text)/70 size-5" />
                    <p>{title}</p>
                  </ShadBtn>
                </Link>
              );
            }
            return (
              <Link to={href} {...props}>
                {children}
              </Link>
            );
          },
          Header: SiteHeader,
          Code,
          // Code: renderCodeBlock(recordMap),
        }}
        mapPageUrl={handlePageUrl}
        header={showHeader ? <SiteHeader header={settings.layout?.headerConfig} /> : undefined}
        disableHeader
      />
      {showFooter && <SiteFooter footer={settings.layout?.footerConfig} />}
    </div>
  );
}
