import { NotionCMS } from "@mikemajara/notion-cms";
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
export const getNotionRendererClient = (token: string) =>
  new NotionAPI({ authToken: token });
