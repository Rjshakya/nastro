import { getNotionPages, getNotionToken } from "@/lib/notion";
import type { NotionPages } from "@/types/notion";
import useSWR from "swr";

export const useNotionPages = () => {
  const fetcher = () => getNotionPages();
  const swr = useSWR("/notion/pages", fetcher);

  return {
    data: swr.data?.data as NotionPages,
    error: swr.error,
    isLoading: swr.isLoading,
    mutate: swr.mutate,
  };
};

export const useNotionToken = () => {
  const fetcher = () => getNotionToken();
  const swr = useSWR("/notion/token", fetcher);

  return {
    data: swr.data?.data as string | undefined,
    error: swr.error,
    isLoading: swr.isLoading,
    mutate: swr.mutate,
  };
};
