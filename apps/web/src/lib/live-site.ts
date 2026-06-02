import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { Env } from "./env";
import { getNotionPageSeo } from "./utils";
import type { Site } from "@/types/site";
import type { ExtendedRecordMap } from "notion-types";
import type { SiteSetting } from "@/types/site.setting";
import { getFontUrl, type GoogleFont } from "./fonts";
import { getDefaultSettings } from "./default-settings";
import { computeStyles } from "./compute-styles";
import type { CSSProperties } from "react";

const resolveSlug = (baseSlug: string) => {
  if (baseSlug) {
    return baseSlug;
  }

  const req = getRequest();
  const url = new URL(req.url);
  const host = url.hostname;

  if (host.includes(Env.subdomain)) {
    const slug = host.split(`.${Env.subdomain}`)[0].trim();
    return slug;
  }

  return "";
};

export const liveSiteLoader = createServerFn()
  .inputValidator(
    z.object({
      pageId: z.string(),
      slug: z.string().optional(),
    }),
  )
  .handler(async ({ data: input }) => {
    try {
      const { pageId, slug } = input;
      const resolvedSlug = resolveSlug(slug || "");

      const apiUrl = new URL("/api/site", Env.apiUrl);
      apiUrl.searchParams.set("slug", resolvedSlug);
      apiUrl.searchParams.set("rootPageId", pageId);

      const res = await fetch(apiUrl, {
        headers: {
          accept: "application/json",
        },
      });

      if (!res.ok) {
        const error = (await res.json()) as { message?: string };
        console.error("Failed to fetch site:", {
          url: apiUrl.href,
          status: res.status,
          error,
        });
        throw new Error(error?.message || "Failed to load site");
      }

      const { data } = (await res.json()) as {
        data: { site: Site; page: ExtendedRecordMap };
      };

      const site = data?.site;
      const page = data?.page;

      if (!site || !page) {
        throw new Error("Site or page not found");
      }

      const seo = getNotionPageSeo({ page, site, pageId });

      return {
        site,
        page,
        seo,
      };
    } catch (e) {
      console.error(e);
      throw new Error(String(e));
    }
  });

export const customDomainSiteLoader = createServerFn()
  .inputValidator(
    z.object({
      pageId: z.string().optional(),
    }),
  )
  .handler(async ({ data: input }) => {
    try {
      const { pageId } = input;

      const req = getRequest();
      const hostname = new URL(req.url).hostname;

      if (
        !hostname ||
        hostname.includes("nastro.xyz") ||
        hostname.includes("nastro.site")
      ) {
        return {
          site: undefined,
          page: undefined,
          seo: undefined,
        };
      }

      const apiUrl = new URL("/api/custom-domain/site", Env.apiUrl);
      apiUrl.searchParams.set("hostname", hostname);
      if (pageId) {
        apiUrl.searchParams.set("pageId", pageId);
      }

      const res = await fetch(apiUrl, {
        headers: {
          accept: "application/json",
        },
      });

      if (!res.ok) {
        const error = (await res.json()) as { message?: string };
        console.error("Failed to fetch custom domain site:", {
          url: apiUrl.href,
          status: res.status,
          error,
        });
        throw new Error(error?.message || "Failed to load custom domain site");
      }

      const { data } = (await res.json()) as {
        data: { site: Site; page: ExtendedRecordMap };
      };

      const site = data?.site;
      const page = data?.page;

      if (!site || !page) {
        throw new Error("Site or page not found");
      }

      const resolvedPageId = pageId || site.rootPageId;
      const seo = getNotionPageSeo({ page, site, pageId: resolvedPageId });

      return {
        site,
        page,
        seo,
      };
    } catch (e) {
      console.error(e);
      return {
        site: undefined,
        page: undefined,
        seo: undefined,
      };
    }
  });

export const handleLiveSiteHtmlLinks = (site?: Site) => {
  const typography = site?.setting?.typography;

  const links: (
    | React.DetailedHTMLProps<
      React.LinkHTMLAttributes<HTMLLinkElement>,
      HTMLLinkElement
    >
    | undefined
  )[] = [];

  if (site?.customCssLink) {
    links.push({ rel: "stylesheet", href: site.customCssLink });
  }

  if (typography?.font?.primary) {
    const href = getFontUrl({
      family: typography?.font?.primary,
    } as GoogleFont);

    links.push({ rel: "stylesheet", href });
  }

  if (typography?.font?.secondary) {
    const href = getFontUrl({
      family: typography?.font?.secondary,
    } as GoogleFont);

    links.push({ rel: "stylesheet", href });
  }
  return links;
};

export const handleLiveSiteStyles = (
  settings?: SiteSetting,
  isDark?: boolean,
) => {
  const _isDark = isDark || settings?.general?.isDark;
  const withDefaults = getDefaultSettings(settings as SiteSetting);
  const cssVariables = computeStyles(withDefaults, _isDark ? "dark" : "light");

  const cssVarString = convertCssVarsRecordToStr(cssVariables);

  return cssVarString;
};

export const convertCssVarsRecordToStr = (
  cssVariables: Record<string, string> | CSSProperties,
): string => {
  const cssVarString = Object.entries(cssVariables)
    .map(([k, v]) => {
      return `${k}:${v}`;
    })
    .join(";\n");

  return cssVarString;
};

export const buildLiveSiteHead = (loaderData?: {
  site?: Site;
  page?: ExtendedRecordMap;
  seo?: ReturnType<typeof getNotionPageSeo>;
}) => {
  const seo = loaderData?.seo;
  const site = loaderData?.site;
  const typography = site?.setting?.typography;

  const scripts: Array<{
    type: "script";
    src?: string;
    children?: string;
    async?: boolean;
  }> = [];

  const trackingId = site?.setting?.analytics?.trackingId;
  const GA4_REGEX = /^G-[A-Z0-9]{10}$/;

  if (trackingId && GA4_REGEX.test(trackingId)) {
    scripts.push(
      {
        type: "script",
        children: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${trackingId}');
        `,
      },
      {
        type: "script",
        src: `https://www.googletagmanager.com/gtag/js?id=${trackingId}`,
        async: true,
      },
    );
  }

  if (site?.customScriptLink) {
    scripts.push({
      type: "script",
      src: site.customScriptLink,
    });
  }

  const links = handleLiveSiteHtmlLinks(site);

  const cssVariables = handleLiveSiteStyles(
    site?.setting as SiteSetting,
    false,
  );

  return {
    meta: [
      { title: seo?.title || site?.name || "Nastro" },
      { property: "og:title", content: seo?.title },
      { property: "og:description", content: seo?.description },
      { property: "og:url", content: seo?.pageUrl },
      { property: "og:image", content: seo?.ogImage },
      { name: "twitter:title", content: seo?.title },
      { name: "twitter:description", content: seo?.description },
      { name: "twitter:url", content: seo?.pageUrl },
      { name: "twitter:image", content: seo?.ogImage },
    ],
    scripts,
    links,
    styles: [
      {
        id: "LIVE_SITE_STYLES",
        children: `
          .notion {
            --primary-font:${typography?.font?.primary ?? "Manrope Variable"};
            ${cssVariables};
            .notion-page-icon-hero.notion-page-icon-image {
              width: 100%;
              height: fit-content;
              margin-left: 0;
              display: flex;
              justify-content: start;
              padding-inline: 16px;
            }
            .notion-page-icon-hero.notion-page-icon-image .notion-page-icon {
              width: 124px;
              height: 124px;
            }
          }
        `,
      },
    ],
  };
};
