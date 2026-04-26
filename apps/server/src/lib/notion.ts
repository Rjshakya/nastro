import { Effect, Layer, ServiceMap } from "effect";
import { NotionAPI } from "notion-client";

/**
 *
 *
 *  Notion api client for rendering notion content
 *  - for notion - page as website service
 */
export const getNotionClient = (token?: string, accountId?: string) =>
  new NotionAPI({
    authToken: token,
    activeUser: accountId,
  });

export class NotionClient extends ServiceMap.Service<
  NotionClient,
  {
    getClient: (token?: string, accountId?: string) => NotionAPI;
  }
>()("lib/notion") {}

export const NotionClientLive = Layer.succeed(NotionClient, {
  getClient: getNotionClient,
});
