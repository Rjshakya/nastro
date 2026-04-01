import { NotionRenderer as NotionRendererLib, Button } from "react-notion-x";
import { Card, CardContent } from "@/components/ui/card";
import { Code } from "react-notion-x/build/third-party/code";
import { Collection } from "react-notion-x/build/third-party/collection";
import { Equation } from "react-notion-x/build/third-party/equation";
import { type CSSProperties } from "react";
import { Link, useLocation, useRouter, useSearch } from "@tanstack/react-router";
import { SiteHeader } from "../site/site-header";
import { useNotionSettingsStore } from "#/stores/notion-settings";
import type { NotionPageSettings } from "#/types/notion-page-settings";
import { SiteFooter } from "../site/site-footer";
import type { Block } from "notion-types";
import { Button as ShadBtn } from "#/components/ui/button";
import { IconFile, IconFileDescription } from "@tabler/icons-react";

interface NotionRendererProps {
  pageId: string;
  recordMap: any;
  slug: string;
  themeId?: string;
}

export function NotionRenderer({
  pageId,
  recordMap,
  slug,
  settings,
  themeId,
}: NotionRendererProps & { settings?: NotionPageSettings }) {
  const { styles } = useNotionSettingsStore((s) => s);
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

  const pageWithThemeId = (pageId: string) => {
    const url = handlePageUrl(pageId).trim();

    if (!themeId) {
      return url;
    }

    return url + `&themeId=${themeId}`;
  };

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
          Code,
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
                    className={"w-full flex justify-start rounded-xs px-2"}
                    variant={"ghost"}
                    size={"sm"}
                  >
                    <IconFileDescription className=" stroke-muted-foreground size-5" />
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
        }}
        mapPageUrl={pageWithThemeId}
        header={settings?.general?.header && <SiteHeader header={settings?.layout?.header} />}
        disableHeader
      />
      {settings?.general?.footer && <SiteFooter footer={settings?.layout?.footer} />}
    </div>
  );
}
