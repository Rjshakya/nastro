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
  type GetSiteInput,
} from "#/lib/site";
import { useRouter } from "@tanstack/react-router";
import { useState } from "react";

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

export const useSite = (input: GetSiteInput) => {
  const fetcher = () => getSite(input);

  const swr = useSWR(input.slug ? `/sites/${input.pageId}` : null, fetcher);

  return {
    data: swr.data?.data,
    error: swr.error,
    isLoading: swr.isLoading,
    mutate: swr.mutate,
  };
};

export const useCreateSite = () => {
  const router = useRouter();
  const [input, setInput] = useState<CreateSiteInput>({
    pageId: "",
    siteName: "",
    slug: "",
  });
  const { trigger, isMutating, error, reset } = useSWRMutation(
    "/sites",
    async (_key: string, { arg }: { arg: CreateSiteInput }) => {
      const site = await createSite(_key, { arg });
      router.invalidate({ sync: true });
      return site.data[0];
    },
  );

  return {
    createSite: trigger,
    isLoading: isMutating,
    error,
    reset,
    input,
    setInput,
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
