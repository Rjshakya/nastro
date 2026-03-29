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
  getIsSiteSlugAvailable,
} from "#/lib/site";
import { useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useDebounce } from "./use-debounce";

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

export const useIsSiteSlugAvailable = (slug: string) => {
  const fetcher = (v: string) => {
    if (!v || !v.length) return Promise.resolve(false);
    return getIsSiteSlugAvailable(v);
  };
  const { debouncedValue, value, setValue } = useDebounce(slug, 500);

  const [data, setData] = useState<{
    isAvailable: boolean;
    error: unknown;
    isLoading: boolean;
  }>({
    isAvailable: false,
    error: null,
    isLoading: true,
  });

  useEffect(() => {
    setData({ ...data, isLoading: true });

    let timer: NodeJS.Timeout | undefined;
    fetcher(debouncedValue as string)
      .then((v) => {
        if (timer) {
          clearTimeout(timer);
        }

        timer = setTimeout(
          () =>
            setData((prev) => ({ ...prev, isAvailable: v, isLoading: false })),
          300,
        );
      })
      .catch((r) =>
        setData((prev) => ({ ...prev, error: r, isLoading: false })),
      );

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [debouncedValue]);

  return {
    isAvailable: data.isAvailable,
    error: data.error,
    isLoading: data.isLoading,
    value,
    setValue,
  };
};
