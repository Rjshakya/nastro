import { client } from "@/lib/api-client";
import useSWR, { mutate } from "swr";
import useSWRMutation from "swr/mutation";

import type { Site } from "@/types/site";
import {
  getSites,
  createSite,
  getSite,
  updateSite,
  deleteSite,
  type CreateSiteInput,
} from "#/lib/site";
import { useRouter } from "@tanstack/react-router";

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

export const useSite = (siteId: string, pageId: string, fresh?: boolean) => {
  const fetcher = () => getSite({ pageId, siteId, fresh });

  const swr = useSWR(siteId ? `/sites/${pageId}` : null, fetcher);

  return {
    data: swr.data?.data,
    error: swr.error,
    isLoading: swr.isLoading,
    mutate: swr.mutate,
  };
};

export const useCreateSite = () => {
  const router = useRouter();
  const { trigger, isMutating, error, reset } = useSWRMutation(
    "/sites",
    async (_key: string, { arg }: { arg: CreateSiteInput }) => {
      const site = await createSite(_key, { arg });
      router.invalidate({ sync: true });
      return site;
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
  const router = useRouter();
  const { trigger, isMutating, error, reset } = useSWRMutation(
    "/sites",
    async (
      _key: string,
      { arg }: { arg: { siteId: string; pageId: string } },
    ) => {
      await deleteSite(_key, { arg });
      await router.invalidate({ sync: true });
    },
  );

  return {
    deleteSite: trigger,
    isLoading: isMutating,
    error,
    reset,
  };
};
