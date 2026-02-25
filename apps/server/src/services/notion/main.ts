import { getDB } from "@/db";
import { account } from "@/db/schema/auth-schema";
import { getAccessToken } from "@/lib/tokens";
import { NotionCMS } from "@mikemajara/notion-cms";
import {
  Client,
  GetPageParameters,
  GetPagePropertyParameters,
  type SearchParameters,
} from "@notionhq/client";
import { eq } from "drizzle-orm";
import { Data, Effect } from "effect";
import { NotionCMSService } from "./cms";

//  1 - getPages: () => NotionPages
//  2 - getNotionDatabases : () => NotionDB(s)

// class Notion extends Context

class NotionError extends Data.TaggedError("NotionError")<{
  message: string;
}> {}

export class NotionService {
  client: Client;

  constructor(client: Client) {
    this.client = client;
  }

  getPages() {
    return Effect.tryPromise({
      try: async () => {
        const pages = await this.client.search({
          query: "",
          page_size: 50,
        });

        return pages.results;
      },
      catch: (e) =>
        new NotionError({
          message: e instanceof Error ? e.message : "NotionError",
        }),
    });
  }

  getPage(params: GetPageParameters) {
    return Effect.tryPromise({
      try: async () => {
        const page = await this.client.pages.retrieve(params);
        return page;
      },
      catch: (e) =>
        new NotionError({
          message: e instanceof Error ? e.message : "NotionError",
        }),
    });
  }

  getPageProperties(params: GetPagePropertyParameters) {
    return Effect.tryPromise({
      try: async () => {
        const props = await this.client.pages.properties.retrieve(params);
        return props;
      },
      catch: (e) =>
        new NotionError({
          message: e instanceof Error ? e.message : "NotionError",
        }),
    });
  }

  getDataSource(params: GetPagePropertyParameters) {
    return Effect.tryPromise({
      try: async () => {
        const props = await this.client;
        return props;
      },
      catch: (e) =>
        new NotionError({
          message: e instanceof Error ? e.message : "NotionError",
        }),
    });
  }
}

export const getUserNotionPages = (userId: string) => {
  return Effect.gen(function* () {
    const { accessToken } = yield* getAccessToken(userId, "notion");

    const client = getNotionClient(accessToken as string);
    const notion = new NotionService(client);

    const pages = yield* notion.getPages();
    const cms = getNotionCms(accessToken as string);
    const notionCmsService = new NotionCMSService(cms);
    // const effects = pages.map((page) => {
    //   return notion.getPage({ page_id: page.id });
    // });

    // const allEffects = yield* Effect.all(effects);

    return pages
  });
};

export const getNotionClient = (auth: string) =>
  new Client({ auth, fetch: fetch.bind(globalThis) });

export const getNotionCms = (token: string) => new NotionCMS(token);
