import { NotionCMS } from "@mikemajara/notion-cms";
import { Effect, Layer, ServiceMap } from "effect";
import { NotionAPI } from "notion-client";

/**
 *
 *
 * Notion as cms client
 * - for notion - page as cms
 */
export const getNotionCms = (token: string) => new NotionCMS(token);

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
>()("lib/notionRendererCleint") {}

export const NotionClientLive = Layer.effect(
  NotionClient,
  Effect.succeed({
    getClient: getNotionClient,
  }),
);
