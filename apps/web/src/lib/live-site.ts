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

export const handleLiveSiteStyles = (site?: Site) => {
  const isDark = !!site?.setting?.general?.isDark;
  const withDefaults = getDefaultSettings(site?.setting as SiteSetting);
  const cssVariables = computeStyles(withDefaults, isDark ? "dark" : "light");

  const cssVarString = Object.entries(cssVariables)
    .map(([k, v]) => {
      return `${k}:${v}`;
    })
    .join(";");

  return cssVarString;
};
