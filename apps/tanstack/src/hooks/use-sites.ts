import { client } from "@/lib/api-client";
import useSWR, { mutate } from "swr";
import useSWRMutation from "swr/mutation";

import type { Site } from "@/types/site";
import { getSites, createSite, getSite, updateSite, deleteSite } from "#/lib/site";



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

export const useSite = (siteId: string, pageId: string , fresh?:boolean) => {
  const fetcher = () => getSite({pageId , siteId , fresh});

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


