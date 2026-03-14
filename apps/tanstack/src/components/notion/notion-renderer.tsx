import { NotionRenderer as NotionRendererLib, Button } from "react-notion-x";
import { Card, CardContent } from "@/components/ui/card";
import { Code } from "react-notion-x/build/third-party/code";
import { Collection } from "react-notion-x/build/third-party/collection";
import { Equation } from "react-notion-x/build/third-party/equation";
import { type CSSProperties } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { SiteHeader } from "../site/site-header";
import { useNotionSettingsStore } from "#/stores/notion-settings";
import type { NotionPageSettings } from "#/types/customization";
import { SiteFooter } from "../site/site-footer";
import type { Block } from "notion-types";
import { Button as ShadBtn } from "#/components/ui/button";

interface NotionRendererProps {
  pageId: string;
  recordMap: any;
  siteId: string;
}

export function NotionRenderer({
  pageId,
  recordMap,
  siteId,
  settings,
}: NotionRendererProps & { settings?: NotionPageSettings }) {
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

  console.log(recordMap);

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
                    className={
                      "w-full flex justify-start rounded-xs px-0 hover:scale-99 transition-all duration-300 ease-in-out"
                    }
                    variant={"ghost"}
                    size={"sm"}
                  >
                    <span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="#fff"
                      >
                        <g clipPath="url(#clip0_4418_4825)">
                          <path
                            opacity="0.4"
                            d="M20.5 10.19H17.61C15.24 10.19 13.31 8.26 13.31 5.89V3C13.31 2.45 12.86 2 12.31 2H8.07C4.99 2 2.5 4 2.5 7.57V16.43C2.5 20 4.99 22 8.07 22H15.93C19.01 22 21.5 20 21.5 16.43V11.19C21.5 10.64 21.05 10.19 20.5 10.19Z"
                            fill="white"
                            style={{ fill: "var(--fillg)" }}
                          />
                          <path
                            d="M15.8002 2.21048C15.3902 1.80048 14.6802 2.08048 14.6802 2.65048V6.14048C14.6802 7.60048 15.9202 8.81048 17.4302 8.81048C18.3802 8.82048 19.7002 8.82048 20.8302 8.82048C21.4002 8.82048 21.7002 8.15048 21.3002 7.75048C19.8602 6.30048 17.2802 3.69048 15.8002 2.21048Z"
                            fill="white"
                            style={{ fill: "var(--fillg)" }}
                          />
                          <path
                            d="M13.5 13.75H7.5C7.09 13.75 6.75 13.41 6.75 13C6.75 12.59 7.09 12.25 7.5 12.25H13.5C13.91 12.25 14.25 12.59 14.25 13C14.25 13.41 13.91 13.75 13.5 13.75Z"
                            fill="white"
                            style={{ fill: "var(--fillg)" }}
                          />
                          <path
                            d="M11.5 17.75H7.5C7.09 17.75 6.75 17.41 6.75 17C6.75 16.59 7.09 16.25 7.5 16.25H11.5C11.91 16.25 12.25 16.59 12.25 17C12.25 17.41 11.91 17.75 11.5 17.75Z"
                            fill="white"
                            style={{ fill: "var(--fillg)" }}
                          />
                        </g>
                        <defs>
                          <clipPath id="clip0_4418_4825">
                            <rect width="24" height="24" fill="white" />
                          </clipPath>
                        </defs>
                      </svg>
                    </span>
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
        mapPageUrl={handlePageUrl}
        header={
          settings?.general?.header && (
            <SiteHeader header={settings?.layout?.header} />
          )
        }
        disableHeader
      />
      {settings?.general?.footer && (
        <SiteFooter footer={settings?.layout?.footer} />
      )}
    </div>
  );
}
