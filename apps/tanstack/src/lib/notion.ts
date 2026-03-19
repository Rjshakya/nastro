import { client } from "@/lib/api-client";

export const getNotionPages = async () => {
  const res = await client.api.notion.pages.$get();
  if (!res.ok) {
    throw new Error("failed to get Notion pages");
  }
  const data = await res.json();

  return data;
};
