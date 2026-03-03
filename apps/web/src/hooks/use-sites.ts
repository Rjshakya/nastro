import { client } from "@/lib/api-client";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";

import type { Site, SiteSetting } from "@/types/site";

interface CreateSiteInput {
  pageId: string;
  siteName: string;
  siteSetting?: SiteSetting;
}

interface UpdateSiteInput {
  siteName?: string;
  siteSetting?: SiteSetting;
}

export const useSites = () => {
  const fetcher = () => getSites();

  const swr = useSWR("/sites", fetcher);

  return {
    data: swr.data?.data as Site[],
    error: swr.error,
    isLoading: swr.isLoading,
    mutate: swr.mutate,
  };
};

export const useSite = (siteId: string, pageId: string) => {
  const fetcher = () => getSite(siteId, pageId);

  const swr = useSWR(siteId ? `/sites/${pageId}` : null, fetcher);

  return {
    data: swr.data?.data,
    error: swr.error,
    isLoading: swr.isLoading,
    mutate: swr.mutate,
  };
};

export const useCreateSite = () => {
  const { trigger, isMutating, error, reset } = useSWRMutation(
    "/sites",
    createSite,
  );

  return {
    createSite: trigger,
    isLoading: isMutating,
    error,
    reset,
  };
};

export const useUpdateSite = () => {
  const { trigger, isMutating, error, reset } = useSWRMutation(
    "/sites",
    updateSite,
  );

  return {
    updateSite: trigger,
    isLoading: isMutating,
    error,
    reset,
  };
};

export const useDeleteSite = () => {
  const { trigger, isMutating, error, reset } = useSWRMutation(
    "/sites",
    deleteSite,
  );

  return {
    deleteSite: trigger,
    isLoading: isMutating,
    error,
    reset,
  };
};

const getSites = async () => {
  const res = await client.api.sites.$get({});
  if (!res.ok) {
    throw new Error("Failed to fetch sites");
  }
  return await res.json();
};

export const getSite = async (siteId: string, pageId: string) => {
  const res = await client.api.sites[":id"].$get({
    param: { id: siteId },
    query: { pageId },
  });
  if (!res.ok) {
    throw new Error("Failed to fetch site");
  }
  return res.json();
};

export const createSite = async (
  _key: string,
  { arg }: { arg: CreateSiteInput },
) => {
  const res = await client.api.sites.$post({
    json: arg,
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
    json: arg.input,
  });
  if (!res.ok) {
    throw new Error("Failed to update site");
  }
  return res.json();
};

export const deleteSite = async (
  _key: string,
  { arg }: { arg: string },
): Promise<{ data: null }> => {
  const res = await client.api.sites[":id"].$delete({
    param: { id: arg },
  });
  if (!res.ok) {
    throw new Error("Failed to delete site");
  }
  return res.json();
};
