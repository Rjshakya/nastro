import { Effect, Layer, ServiceMap } from "effect";

const NOTION_API_URL = "https://api.notion.com/v1";
const NOTION_API_VERSION = "2025-09-03";
import type {
  DataSourceObjectResponse,
  PageObjectResponse,
  PartialDataSourceObjectResponse,
  PartialPageObjectResponse,
} from "@notionhq/client";
import { NotionClient, NotionClientLive } from "@/lib/notion";
import { ExtendedRecordMap } from "notion-types";
import { type GetAccessTokenResult } from "@/lib/tokens";

export type GetPages = (
  | PageObjectResponse
  | PartialPageObjectResponse
  | PartialDataSourceObjectResponse
  | DataSourceObjectResponse
)[];

export type GetPageOptions = {
  concurrency?: number | undefined;
  fetchMissingBlocks?: boolean | undefined;
  fetchCollections?: boolean | undefined;
  signFileUrls?: boolean | undefined;
  chunkLimit?: number | undefined;
  chunkNumber?: number | undefined;
  throwOnCollectionErrors?: boolean | undefined;
  collectionReducerLimit?: number | undefined;
  fetchRelationPages?: boolean | undefined;
};

import { NotionError } from "@/errors/tagged.errors";

export class NotionService extends ServiceMap.Service<
  NotionService,
  {
    readonly getPage: (
      pageId: string,
      options?: GetPageOptions,
    ) => Effect.Effect<ExtendedRecordMap, NotionError>;
    readonly getNotionPages: () => Effect.Effect<GetPages, NotionError, never>;
  }
>()("services/notion/notionService") {}

const _request = <T>({
  endpoint,
  body,
  token,
}: {
  endpoint: string;
  body: unknown;
  token?: string;
}) =>
  Effect.tryPromise({
    try: async () => {
      if (!token) {
        throw new NotionError({
          message: "NOTION ACCESS TOKEN NOT PROVIDED",
          type: "ACCESS_TOKEN_MISSING",
          code: 401,
        });
      }

      const response = await fetch(`${NOTION_API_URL}${endpoint}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
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

export const NotionServiceLive = (accessToken?: string | GetAccessTokenResult) =>
  Layer.effect(
    NotionService,
    Effect.gen(function* () {
      const getNotionClient = yield* NotionClient;
      const resolvedAccessToken = yield* resolveAccessToken(accessToken);
      const notionClient = getNotionClient.getClient(resolvedAccessToken);

      return NotionService.of({
        getPage: (pageId, options) =>
          Effect.tryPromise({
            try: async () => {
              const page = await notionClient.getPage(pageId, options ? { ...options } : undefined);
              return page;
            },
            catch: (e) => {
              console.error(e);
              return new NotionError({
                message: "NOTION PAGE ERROR",
                type: "PAGE_ERROR",
                code: 500,
              });
            },
          }),
        getNotionPages: () =>
          Effect.gen(function* () {
            const response = yield* _request<{ results: GetPages }>({
              endpoint: "/search",
              body: {
                query: "",
                page_size: 50,
              },
              token: resolvedAccessToken,
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
