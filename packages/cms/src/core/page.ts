import { BlockObjectResponse, Client, PageObjectResponse } from "@notionhq/client";
import { Page, PageBlock, PageBlockContentOnly, PageContentOnly } from "./types";
import { extractPageMetaData } from "./utils";
import { getBlocks, getNotionClient, getRawPage } from "./notion";
import { getBlockContentRecursively, getBlockContentRecursivelyForContentOnly } from "./blocks";

export function getPageBlocks({
  pageId,
  contentOnly,
  pageSize,
}: {
  pageId: string;
  pageSize?: number;
  contentOnly?: boolean;
}) {
  return async function* (
    f: () => Client,
  ): AsyncGenerator<PageBlock | PageBlockContentOnly, void, unknown> {
    let startCursor: string | undefined;

    do {
      const response = await getBlocks(pageId, pageSize, startCursor)(f);

      for (const block of response.results) {
        const processedBlock = contentOnly
          ? await getBlockContentRecursivelyForContentOnly(block as BlockObjectResponse)(f)
          : await getBlockContentRecursively(block as BlockObjectResponse)(f);

        yield processedBlock;
      }

      startCursor = response.next_cursor || undefined;
    } while (startCursor);
  };
}

export function getPage({
  pageId,
  contentOnly,
  pageSize,
}: {
  pageId: string;
  contentOnly?: boolean;
  pageSize?: number;
}) {
  return async (f: () => Client): Promise<Page | PageContentOnly> => {
    const rawpage = (await getRawPage(pageId)(f)) as PageObjectResponse;

    // Collect all blocks from the async generator
    const blocks: (PageBlock | PageBlockContentOnly)[] = [];
    const blockGenerator = getPageBlocks({
      pageId,
      contentOnly,
      pageSize,
    })(f);

    for await (const block of blockGenerator) {
      blocks.push(block);
    }

    return {
      ...extractPageMetaData(rawpage),
      blocks: blocks as PageBlock[] | PageBlockContentOnly[],
    } as Page | PageContentOnly;
  };
}

export function runPage<T extends boolean = false>({
  token,
  contentOnly,
  pageSize,
}: {
  token: string;
  contentOnly?: T;
  pageSize?: number;
}): (pageId: string) => Promise<T extends true ? PageContentOnly : Page> {
  return (pageId: string) => {
    const client = getNotionClient(token);
    return getPage({ pageId, contentOnly, pageSize })(() => client) as Promise<
      T extends true ? PageContentOnly : Page
    >;
  };
}
