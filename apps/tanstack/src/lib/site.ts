import type { NotionPageSettings } from "#/types/notion-page-settings";
import { client } from "./api-client";
import type { Site } from "@/types/site";
import type { ExtendedRecordMap } from "notion-types";

export interface CreateSiteInput {
  slug: string;
  pageId: string;
  siteName: string;
  siteSetting?: NotionPageSettings;
}

export interface UpdateSiteInput {
  slug: string;
  pageId?: string;
  siteName: string;
  siteSetting?: NotionPageSettings;
}

export interface GetSiteInput {
  slug: string;
  pageId: string;
  fresh?: "true" | "false";
}

export const getSites = async () => {
  const res = await client.api.site.all.$get({});
  if (!res.ok) {
    throw new Error("Failed to fetch sites hc");
  }
  return await res.json();
};

export const getSite = async ({ pageId, slug, fresh }: GetSiteInput) => {
  const res = await client.api.site.$get({
    query: { pageId, fresh, slug },
  });
  if (!res.ok) {
    throw new Error("Failed to fetch site");
  }

  const json = await res.json();
  return json as {
    data: { site: Site; page: ExtendedRecordMap };
  };
};

export const createSite = async (
  _key: string,
  { arg }: { arg: CreateSiteInput },
) => {
  const res = await client.api.site.$post({
    json: arg,
  });
  if (!res.ok) {
    const error = await res.json();
    console.log(error);
    throw new Error("Failed to create site");
  }

  return res.json();
};

export const updateSite = async (
  _key: string,
  { arg }: { arg: { siteId: string; input: UpdateSiteInput } },
) => {
  const res = await client.api.site[":id"].$patch({
    param: { id: arg.siteId },
    json: arg.input,
  });
  if (!res.ok) {
    throw new Error("Failed to update site");
  }

  return res.json();
};

export const deleteSite = async (
  _key: string,
  { arg }: { arg: { siteId: string; pageId: string } },
) => {
  const res = await client.api.site[":id"].$delete({
    param: { id: arg.siteId },
    query: { pageId: arg.pageId },
  });
  if (!res.ok) {
    throw new Error("Failed to delete site");
  }

  return res.json();
};

export const getIsSiteSlugAvailable = async (slug: string) => {
  const res = await client.api.site.slug.available.$post({ json: { slug } });

  if (!res.ok) {
    throw new Error("Failed to check slug availability");
  }

  const data = await res.json();
  return data?.data;
};
