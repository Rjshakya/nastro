import { client } from "@/lib/api-client";
import { handleHttpError } from "./error";

export const getNotionPages = async () => {
  const res = await client.api.notion.pages.$get();
  if (!res.ok) {
    const error = await res.json();
    handleHttpError()({
      // message: error?.message || "Failed to fetch Notion pages",
      message: "Failed to fetch Notion pages",
      statusCode: res.status,
      error,
      throwError: true,
      showToast: true,
    });
  }
  const data = await res.json();

  return data;
};
