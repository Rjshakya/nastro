import { client } from "@/lib/api-client";
import useSWR from "swr";
export const useNotionPages = () => {
  const fetcher = () => getNotionPages();

  const { data, error, isLoading } = useSWR("/notion/pages", fetcher);

  return { data: data?.data, error, isLoading };
};

const getNotionPages = async () => {
  const res = await client.api.notion.pages.$get();
  if (!res.ok) {
    throw new Error("failed to get Notion pages");
  }

  const data = await res.json();

  return data;
};
