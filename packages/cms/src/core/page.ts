import { BlockObjectResponse, Client, PageObjectResponse } from "@notionhq/client";
import { Page, PageBlock } from "./types";
import { extractPageMetaData } from "./utils";
import { getBlocks, getNotionClient, getRawPage } from "./notion";
import { getBlockContentRecursively } from "./blocks";

/**
 * Get page blocks with client-controlled pagination
 * Returns one batch of blocks + nextCursor for next batch
 */
export function getPageBlocksPaginated({
  pageId,
  pageSize,
  startCursor,
}: {
  pageId: string;
  pageSize?: number;
  startCursor?: string;
}) {
  return async (
    f: () => Client,
  ): Promise<{
    blocks: PageBlock[];
    nextCursor?: string;
  }> => {
    const response = await getBlocks(pageId, pageSize, startCursor)(f);

    // Process all blocks from this batch
    const blocks: PageBlock[] = await Promise.all(
      response.results.map((block) => {
        return getBlockContentRecursively(block as BlockObjectResponse)(f);
      }),
    );

    return {
      blocks,
      nextCursor: response.next_cursor || undefined,
    };
  };
}

/**
 * Get a page with client-controlled pagination
 * Returns one batch of blocks + nextCursor for next batch
 */
export function getPagePaginated({
  pageId,
  pageSize,
  startCursor,
}: {
  pageId: string;
  pageSize?: number;
  startCursor?: string;
}) {
  return async (f: () => Client): Promise<Page> => {
    const raw = (await getRawPage(pageId)(f)) as PageObjectResponse;

    const { blocks, nextCursor } = await getPageBlocksPaginated({
      pageId,
      pageSize,
      startCursor,
    })(f);

    return {
      ...extractPageMetaData(raw),
      blocks: blocks as PageBlock[],
      nextCursor,
    };
  };
}

/**
 * Run a paginated page fetch with client-controlled pagination
 * Returns one batch of blocks + nextCursor for next batch
 */
export function runPage({
  token,
  pageSize,
  startCursor,
}: {
  token: string;
  pageSize?: number;
  startCursor?: string;
}): (pageId: string) => Promise<Page> {
  return (pageId: string) => {
    const client = getNotionClient(token);
    return getPagePaginated({ pageId, pageSize, startCursor })(() => client) as Promise<Page>;
  };
}
