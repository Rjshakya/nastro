import { client } from "@/lib/api-client";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";

export interface SiteSetting {
  theme?: {
    primaryColor?: string;
    backgroundColor?: string;
    textColor?: string;
    fontFamily?: string;
  };
  seo?: {
    title?: string;
    description?: string;
    ogImage?: string;
  };
  header?: {
    show: boolean;
    customNavLinks?: Array<{ label: string; url: string }>;
  };
  footer?: {
    show: boolean;
    content?: string;
  };
}

export interface Site {
  id: string;
  userId: string;
  pageId: string | null;
  databaseId: string | null;
  shortId: string;
  siteName: string;
  siteSetting: SiteSetting | null;
  createdAt: string;
  updatedAt: string;
}

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
    data: swr.data?.data,
    error: swr.error,
    isLoading: swr.isLoading,
    mutate: swr.mutate,
  };
};

export const useSite = (siteId: string) => {
  const fetcher = () => getSite(siteId);

  const swr = useSWR(siteId ? `/sites/${siteId}` : null, fetcher);

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
    async (
      _key: string,
      { arg }: { arg: CreateSiteInput },
    ): Promise<{ data: Site }> => {
      const res = await client.api.sites.$post({
        json: arg,
      });
      if (!res.ok) {
        throw new Error("Failed to create site");
      }
      return res.json();
    },
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
    async (
      _key: string,
      { arg }: { arg: { siteId: string; input: UpdateSiteInput } },
    ): Promise<{ data: Site }> => {
      const res = await client.api.sites[":id"].$patch({
        param: { id: arg.siteId },
        json: arg.input,
      });
      if (!res.ok) {
        throw new Error("Failed to update site");
      }
      return res.json();
    },
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
    async (_key: string, { arg }: { arg: string }): Promise<{ data: null }> => {
      const res = await client.api.sites[":id"].$delete({
        param: { id: arg },
      });
      if (!res.ok) {
        throw new Error("Failed to delete site");
      }
      return res.json();
    },
  );

  return {
    deleteSite: trigger,
    isLoading: isMutating,
    error,
    reset,
  };
};

const getSites = async (): Promise<{ data: Site[] }> => {
  const res = await client.api.sites.$get({});
  if (!res.ok) {
    throw new Error("Failed to fetch sites");
  }
  return res.json();
};

const getSite = async (siteId: string) => {
  const res = await client.api.sites[":id"].$get({ param: { id: siteId } });
  if (!res.ok) {
    throw new Error("Failed to fetch site");
  }
  return res.json();
};
