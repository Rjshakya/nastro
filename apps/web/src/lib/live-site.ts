import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { Env } from "./env";
import { getNotionPageSeo } from "./utils";
import type { Site } from "@/types/site";
import type { ExtendedRecordMap } from "notion-types";

const resolveSlug = (baseSlug: string) => {
  if (baseSlug && baseSlug.length > 0) {
    return baseSlug;
  }

  const req = getRequest();
  if (!req) return "";

  const url = new URL(req.url);
  const host = url.hostname;
  const originHost = new URL("/", Env.clientUrl).hostname;

  if (host === originHost) {
    return "";
  }

  if (host.endsWith(`.${originHost}`)) {
    return host.slice(0, -(originHost.length + 1));
  }

  return "";
};

export const liveSiteLoader = createServerFn()
  .inputValidator(
    z.object({
      pageId: z.string(),
      slug: z.string().optional(),
      // fresh: z.enum(["true", "false"]).optional(),
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
      throw new Error("Oops! Failed to load your site");
    }
  });
