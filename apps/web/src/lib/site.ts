import { client } from "./api-client";
import type { Site } from "@/types/site";
import type { SiteSetting } from "@/types/site.setting";
import type { ExtendedRecordMap } from "notion-types";
import { handleHttpError } from "./error";

export interface CreateSiteInput {
  userId: string;
  slug: string;
  rootPageId: string;
  name: string;
  setting?: SiteSetting;
}

export interface UpdateSiteInput {
  userId: string;
  slug: string;
  rootPageId: string;
  name: string;
  setting?: SiteSetting;
}

export interface GetSiteInput {
  slug: string;
  rootPageId: string;
  fresh?: "true" | "false";
}

export const getSites = async () => {
  const res = await client.api.site.all.$get({});

  if (!res.ok) {
    const error = await res.json();
    handleHttpError()({
      message: error?.message || "failed to get sites",
      statusCode: res.status,
      error,
      throwError: true,
      showToast: true,
    });
  }

  return await res.json();
};

export const getSite = async ({ rootPageId, slug, fresh }: GetSiteInput) => {
  const res = await client.api.site.$get({
    query: {
      slug,
      rootPageId,
      fresh,
    },
  });

  if (!res.ok) {
    const error = await res.json();
    handleHttpError()({
      message: error?.message || `failed to get your site ${slug}`,
      statusCode: res.status,
      error,
      throwError: true,
      showToast: true,
    });
  }

  const { data, error, message } = await res.json();
  return {
    data: data as { site: Site; page: ExtendedRecordMap },
    message,
    error,
  };
};

export const createSite = async (_key: string, { arg }: { arg: CreateSiteInput }) => {
  const res = await client.api.site.$post({
    json: arg,
  });
  if (!res.ok) {
    const error = await res.json();
    handleHttpError()({
      message: error?.message || "Failed to create site",
      statusCode: res.status,
      error,
      throwError: true,
      showToast: true,
    });
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
    const error = await res.json();
    handleHttpError()({
      message: error?.message || "Failed to update site",
      statusCode: res.status,
      error,
      throwError: true,
      showToast: true,
    });
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
    const error = await res.json();
    handleHttpError()({
      message: error?.message || "Failed to delete site",
      statusCode: res.status,
      error,
      throwError: true,
      showToast: true,
    });
  }

  return res.json();
};

export const getIsSiteSlugAvailable = async (slug: string) => {
  const res = await client.api.site.slug.available.$post({ json: { slug } });

  if (!res.ok) {
    const error = await res.json();

    handleHttpError()({
      message: error?.message || "Failed to check slug availability",
      statusCode: res.status,
      error,
      throwError: true,
      showToast: true,
    });
  }

  const data = await res.json();
  return data?.data;
};
