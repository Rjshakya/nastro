import useSWR from "swr";
import useSWRMutation from "swr/mutation";

import type { Theme } from "@/types/theme";
import type { ThemeConfig } from "@/types/setting";
import {
  getAllThemes,
  getTheme,
  createTheme,
  updateTheme,
  deleteTheme,
  type CreateThemeInput,
} from "@/lib/site.theme";
import { useRouter } from "@tanstack/react-router";
import { useState } from "react";

export const useThemes = () => {
  const fetcher = () => getAllThemes({ limit: 50 });
  const swr = useSWR("/themes", fetcher);
  const data = swr?.data?.result as Theme[];

  return {
    data,
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
          input: { name?: string; setting?: ThemeConfig; isPublic?: boolean };
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
