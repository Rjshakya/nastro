import { getNotionPages } from "#/lib/notion";
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
