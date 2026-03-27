import { client } from "@/lib/api-client";
import useSWR, { mutate } from "swr";
import useSWRMutation from "swr/mutation";

import type { Theme } from "@/types/theme";
import {
  getAllThemes,
  getTheme,
  createTheme,
  updateTheme,
  deleteTheme,
  type CreateThemeInput,
} from "#/lib/site.theme";
import { useRouter } from "@tanstack/react-router";
import { useState } from "react";

type After<T> = (data: T) => Promise<T>;

/**
 *
 * @param  after
 *
 * @description
 *
 * it takes after callback ,
 * it will executed after primary data is fetched ,
 * and then return data modified by after ,
 *
 * if error occurs in after fn ,
 * then primary fetched data is returned
 *
 *
 */
export const useThemes = <T = Theme[]>({ after }: { after?: After<T> }) => {
  const fetcher = () => getAllThemes({ limit: 50 });
  const swr = useSWR("/themes", fetcher);
  const data = swr?.data?.result as T;

  return {
    data: data as T,
    error: swr.error,
    isLoading: swr.isLoading,
    mutate: swr.mutate,
    prevToken: swr.data?.prevToken,
  };
};

interface GetThemeInput {
  themeId: string;
}

export const useTheme = (input: GetThemeInput) => {
  const fetcher = () => getTheme(input);

  const swr = useSWR(
    input.themeId ? `/themes/${input.themeId}` : null,
    fetcher,
  );

  return {
    data: swr.data as Theme,
    error: swr.error,
    isLoading: swr.isLoading,
    mutate: swr.mutate,
  };
};

export const useCreateTheme = () => {
  const router = useRouter();
  const [input, setInput] = useState<CreateThemeInput>({
    name: "",
  });
  const { trigger, isMutating, error, reset } = useSWRMutation(
    "/themes",
    async (_key: string, { arg }: { arg: CreateThemeInput }) => {
      const theme = await createTheme(_key, { arg });
      router.invalidate({ sync: true });
      return theme.data;
    },
  );

  return {
    createTheme: trigger,
    isLoading: isMutating,
    error,
    reset,
    input,
    setInput,
  };
};

export const useUpdateTheme = () => {
  const router = useRouter();
  const { trigger, isMutating, error, reset } = useSWRMutation(
    "/themes",
    async (
      _key: string,
      {
        arg,
      }: {
        arg: {
          themeId: string;
          input: { name?: string; themeSetting?: any; isPublic?: boolean };
        };
      },
    ) => {
      const theme = await updateTheme(_key, { arg });
      await router.invalidate({ sync: true });
      return theme.data;
    },
  );

  return {
    updateTheme: trigger,
    isLoading: isMutating,
    error,
    reset,
  };
};

export const useDeleteTheme = () => {
  const router = useRouter();
  const { trigger, isMutating, error, reset } = useSWRMutation(
    "/themes",
    async (_key: string, { arg }: { arg: { themeId: string } }) => {
      await deleteTheme(_key, { arg });
      await router.invalidate({ sync: true });
    },
  );

  return {
    deleteTheme: trigger,
    isLoading: isMutating,
    error,
    reset,
  };
};
