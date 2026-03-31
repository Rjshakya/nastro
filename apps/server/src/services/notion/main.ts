import { Effect, Layer, ServiceMap } from "effect";

const NOTION_API_URL = "https://api.notion.com/v1";
const NOTION_API_VERSION = "2025-09-03";
import type {
  DataSourceObjectResponse,
  PageObjectResponse,
  PartialDataSourceObjectResponse,
  PartialPageObjectResponse,
} from "@notionhq/client";
import { NotionClient } from "@/lib/notion";
import { ExtendedRecordMap } from "notion-types";
import { type GetAccessTokenResult } from "@/lib/tokens";

export type GetPages = (
  | PageObjectResponse
  | PartialPageObjectResponse
  | PartialDataSourceObjectResponse
  | DataSourceObjectResponse
)[];

import { NotionError } from "@/errors/tagged.errors";

export class NotionService extends ServiceMap.Service<
  NotionService,
  {
    readonly getPageOfSite: (
      pageId: string,
    ) => Effect.Effect<ExtendedRecordMap, NotionError>;
    readonly getNotionPages: () => Effect.Effect<GetPages, NotionError, never>;
  }
>()("services/notion/notionService") {}

export const NotionServiceLive = (
  accessToken?: string | GetAccessTokenResult,
) =>
  Layer.effect(
    NotionService,
    Effect.gen(function* () {
      const getNotionClient = yield* NotionClient;
      const resolvedAccessToken = yield* resolveAccessToken(accessToken);
      const notionClient = getNotionClient.getClient(resolvedAccessToken);
      const _request = <T>({
        endpoint,
        body,
      }: {
        endpoint: string;
        body: unknown;
      }) =>
        Effect.tryPromise({
          try: async () => {
            
            if (!resolveAccessToken) {
              throw new NotionError({
                message: "NOTION ACCESS TOKEN NOT PROVIDED",
                type: "ACCESS_TOKEN_MISSING",
                code: 401,
              });
            }

            const response = await fetch(`${NOTION_API_URL}${endpoint}`, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${resolvedAccessToken}`,
                "Notion-Version": NOTION_API_VERSION,
                "Content-Type": "application/json",
              },
              body: JSON.stringify(body),
            });

            if (!response.ok) {
              throw new NotionError({
                message: "NOTION REQUEST FAILED",
                type: "REQUEST_FAILED",
                code: 500,
              });
            }

            return (await response.json()) as T;
          },
          catch: (e) => {
            console.error(e);
            return new NotionError({
              message: "NOTION REQUEST FAILED",
              type: "REQUEST_FAILED",
              code: 500,
            });
          },
        });

      return NotionService.of({
        getPageOfSite: (pageId) =>
          Effect.tryPromise({
            try: async () => {
              const page = await notionClient.getPage(pageId);
              return page;
            },
            catch: (e) =>
              new NotionError({
                message: "NOTION PAGE ERROR",
                type: "PAGE_ERROR",
                code: 500,
              }),
          }),
        getNotionPages: () =>
          Effect.gen(function* () {
            const response = yield* _request<{ results: GetPages }>({
              endpoint: "/search",
              body: {
                query: "",
                page_size: 50,
              },
            });
            return response?.results as GetPages;
          }),
      });
    }),
  );

function resolveAccessToken(
  accessToken?: string | GetAccessTokenResult,
): Effect.Effect<string | undefined, "getAccessTokenError", never> {
  return Effect.gen(function* () {
    if (Effect.isEffect(accessToken)) {
      const result = yield* accessToken;
      return result.accessToken || undefined;
    }
    return accessToken;
  });
}
