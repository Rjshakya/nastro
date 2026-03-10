import { client } from "./api-client";

import type { Site, SiteSetting } from "@/types/site";
import type { NotionPageSettings } from "#/types/customization";

export interface CreateSiteInput {
  pageId: string;
  siteName: string;
  siteSetting?: SiteSetting;
}

export interface UpdateSiteInput {
  siteName?: string;
  siteSetting?: NotionPageSettings;
  pageId: string;
}

export const getSites = async () => {
  const res = await client.api.sites.$get({});
  if (!res.ok) {
    throw new Error("Failed to fetch sites hc");
  }
  return await res.json();
};

export const getSite = async ({
  pageId,
  siteId,
  fresh,
}: {
  siteId: string;
  pageId: string;
  fresh?: boolean;
}) => {
  const res = await client.api.sites[":id"].$get({
    param: { id: siteId },
    query: { pageId, fresh },
  });
  if (!res.ok) {
    throw new Error("Failed to fetch site");
  }
  return await res.json();
};

export const createSite = async (
  _key: string,
  { arg }: { arg: CreateSiteInput },
) => {
  const { pageId, siteName, siteSetting } = arg;
  const res = await client.api.sites.$post({
    json: { pageId, siteName, siteSetting: siteSetting as any },
  });
  if (!res.ok) {
    throw new Error("Failed to create site");
  }

  return res.json();
};

export const updateSite = async (
  _key: string,
  { arg }: { arg: { siteId: string; input: UpdateSiteInput } },
) => {
  const res = await client.api.sites[":id"].$patch({
    param: { id: arg.siteId },
    json: {
      siteName: arg.input.siteName,
      siteSetting: arg.input.siteSetting as any,
      pageId: arg.input.pageId,
    },
  });
  if (!res.ok) {
    throw new Error("Failed to update site");
  }

  return res.json();
};

export const deleteSite = async (
  _key: string,
  { arg }: { arg: { siteId: string; pageId: string } },
): Promise<{ data: null }> => {
  const res = await client.api.sites[":id"].$delete({
    param: { id: arg.siteId },
    query: { pageId: arg.pageId },
  });
  if (!res.ok) {
    throw new Error("Failed to delete site");
  }
  

  return res.json();
};
