import type { Site } from "#/types/site";
import type { ExtendedRecordMap } from "notion-types";
import { getNotionPageSeo } from "./utils";
import type { NotionPageSettings } from "#/types/notion-page-settings";
import { getFontLink } from "./fonts";
import { env } from "cloudflare:workers";
import { createServerFn } from "@tanstack/react-start";
import z from "zod";
import { getRequest } from "@tanstack/react-start/server";
import { setThemeServerFn } from "./theme";

const getSite = async ({
  pageId,
  slug,
  // fresh,
}: {
  slug: string;
  pageId: string;
  fresh?: string;
}) => {
  const url = new URL(`/api/site`, env.API_URL);
  url.searchParams.set("slug", slug);
  url.searchParams.set("pageId", pageId);
  // url.searchParams.set("fresh", fresh ?? "");

  const res = await fetch(url, {
    headers: {
      accept: "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(
      `url : ${url.href} status : ${res.status} , statusText:${res.statusText} , msg: Failed to fetch site`,
    );
  }
  return res.json() as Promise<{
    data: { site: Site; page: ExtendedRecordMap };
  }>;
};

const getSlugFromReq = (baseSlug: string) => {
  if (baseSlug && baseSlug.length > 0) {
    return baseSlug;
  }

  const req = getRequest();

  const url = new URL(req.url);
  const host = url.hostname;

  if (!host.includes(".nastro.xyz")) {
    return "";
  }

  const slug = host.split(".nastro.xyz")[0].trim();
  return slug;
};

export const pageIdLoader = createServerFn()
  .inputValidator(
    z.object({
      pageId: z.string(),
      slug: z.string(),
      fresh: z.enum(["true", "false"]).optional(),
    }),
  )
  .handler(async ({ data: input }) => {
    try {
      const { pageId, fresh, slug } = input;
      const resolvedSlug = getSlugFromReq(slug || "");
      const { data } = await getSite({ pageId, slug: resolvedSlug, fresh });
      const site = data?.site as Site;
      const page = data?.page as ExtendedRecordMap;
      const seo = getNotionPageSeo({ page, site, pageId });
      const settings = { ...site?.siteSetting } as NotionPageSettings;
      const fonts = {
        primary: getFontLink(settings?.typography?.fonts?.primary),
        secondary: getFontLink(settings?.typography?.fonts?.secondary),
      };

      setThemeServerFn({ data: settings?.general?.isDark ? "dark" : "light" });

      return {
        site,
        page,
        seo,
        css: {
          fonts,
        },
      };
    } catch (e) {
      console.error(e);
    }
  });
