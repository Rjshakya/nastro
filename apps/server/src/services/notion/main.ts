import { getAccessToken } from "@/lib/tokens";
import { Data, Effect } from "effect";

const NOTION_API_URL = "https://api.notion.com/v1";
const NOTION_API_VERSION = "2025-09-03";
import type {
  DataSourceObjectResponse,
  PageObjectResponse,
  PartialDataSourceObjectResponse,
  PartialPageObjectResponse,
} from "@notionhq/client";

type GetPages = (
  | PageObjectResponse
  | PartialPageObjectResponse
  | PartialDataSourceObjectResponse
  | DataSourceObjectResponse
)[];

class NotionError extends Data.TaggedError("NotionError")<{
  message: string;
}> {}

export class NotionService {
  auth: string;

  constructor(auth: string) {
    this.auth = auth;
  }

  private async request<T>(endpoint: string, body: unknown): Promise<T> {
    const response = await fetch(`${NOTION_API_URL}${endpoint}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.auth}`,
        "Notion-Version": NOTION_API_VERSION,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = (await response.json().catch(() => ({}))) as {
        message?: string;
      };
      throw new Error(error.message || `Notion API error: ${response.status}`);
    }

    return response.json();
  }

  getPages() {
    return Effect.tryPromise({
      try: async () => {
        const result = await this.request<{
          results: GetPages;
        }>("/search", {
          query: "",
          page_size: 50,
        });

        return result.results;
      },
      catch: (e: unknown) =>
        new NotionError({
          message: e instanceof Error ? e.message : "NotionError",
        }),
    });
  }
}

export const getUserNotionPages = (userId: string) => {
  return Effect.gen(function* () {
    const { accessToken } = yield* getAccessToken(userId, "notion");

    const notion = new NotionService(accessToken as string);
    const notionPages = yield* notion.getPages();
    return notionPages;
  });
};
