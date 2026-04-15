import {
  BlockObjectResponse,
  Client,
  DatabaseObjectResponse,
  PageObjectResponse,
} from "@notionhq/client";
import { processBlock } from "./blocks";
import { Page, PageBlock, PageBlockContentOnly } from "./types";
import { loadEnvFile } from "node:process";
import path from "node:path";
import { writeFile } from "node:fs";
import { extractPageMetaData } from "./blocks/page-metadata";

loadEnvFile();

export function getNotionClient(token: string) {
  return new Client({
    auth: token,
  });
}

export function getRawDatabase(dbId: string) {
  return (f: () => Client) => {
    return f()
      .databases.retrieve({ database_id: dbId })
      .then((d) => {
        return d as DatabaseObjectResponse;
      })
      .then((d) => {
        if (!d.data_sources.length) {
          return null;
        }

        return d;
      });
  };
}

export function getDatabasePages(
  dsId: string,
  startCursor?: string,
  pageSize?: number,
) {
  return (f: () => Client) => {
    do {
      return f()
        .dataSources.query({
          data_source_id: dsId,
          start_cursor: startCursor,
          page_size: pageSize,
        })
        .then((d) => d.results as PageObjectResponse[])
        .then((d) => d);
    } while (startCursor);
  };
}

export function getRawPage(pageId: string) {
  return (f: () => Client) => {
    return f().pages.retrieve({ page_id: pageId });
  };
}

export function getBlocks(
  blockId: string,
  pageSize?: number,
  startCursor?: string,
) {
  return (f: () => Client) => {
    return f().blocks.children.list({
      block_id: blockId,
      start_cursor: startCursor,
      page_size: pageSize,
    });
  };
}

export function processBlockRecursively(block: BlockObjectResponse) {
  return async (f: () => Client): Promise<PageBlock> => {
    const blockContent = await processBlock(() => block)(f);

    if (!block.has_children) {
      //  process the block without children

      return {
        id: block.id,
        type: block.type,
        content: blockContent,
        hasChildren: block.has_children,
      } satisfies PageBlock;
    }

    const childBlocks: any[] = await getPageContent({ pageId: block.id })(f);

    return {
      id: block.id,
      type: block.type,
      content: blockContent,
      hasChildren: block.has_children,
      childBlocks,
    } satisfies PageBlock;
  };
}

export function processBlockRecursivelyForContentOnly(
  block: BlockObjectResponse,
) {
  return async (f: () => Client): Promise<PageBlockContentOnly> => {
    const blockContent = await processBlock(() => block)(f);

    if (!block.has_children) {
      return {
        content: blockContent,
      } satisfies PageBlockContentOnly;
    }

    const childBlocks: PageBlockContentOnly[] = await getPageContent({
      pageId: block.id,
      contentOnly: true,
    })(f);

    return {
      content: blockContent,
      childBlocks,
    } satisfies PageBlockContentOnly;
  };
}

export function getPageContent({
  pageId,
  contentOnly,
  pageSize,
  startCursor,
}: {
  pageId: string;
  startCursor?: string;
  pageSize?: number;
  contentOnly?: boolean;
}) {
  return async (
    f: () => Client,
  ): Promise<PageBlock[] | PageBlockContentOnly[]> => {
    do {
      return getBlocks(
        pageId,
        pageSize,
        startCursor,
      )(f)
        .then((v) => v.results)
        .then((res) => {
          return Promise.all(
            res.map((b) =>
              !contentOnly
                ? processBlockRecursively(b as BlockObjectResponse)(f)
                : processBlockRecursivelyForContentOnly(
                    b as BlockObjectResponse,
                  )(f),
            ),
          ).then((d) => d);
        })
        .then((d) => {
          return d;
        });
    } while (startCursor);
  };
}

export function getPage(pageId: string, contentOnly?: boolean) {
  return async (f: () => Client): Promise<Page | PageBlockContentOnly> => {
    const rawpage = (await getRawPage(pageId)(f)) as PageObjectResponse;
    const blocks = await getPageContent({ pageId, contentOnly })(f);

    return {
      ...extractPageMetaData(rawpage),
      blocks,
    } as Page | PageBlockContentOnly;
  };
}

export function runPage({
  token,
  contentOnly,
}: {
  token: string;
  contentOnly?: boolean;
}) {
  return (pageId: string) => {
    const client = getNotionClient(token);
    return getPage(pageId, contentOnly)(() => client);
  };
}

export function writeLocalFile(fileName: string, ext: "json") {
  return (data: unknown) => {
    let filePath = path.join("./", `${fileName}.${ext}`);
    writeFile(filePath, JSON.stringify(data), (err) => {
      if (err) {
        console.error(`Error writing file ${filePath}:`, err);
      }
    });
  };
}

runPage({ token: process.env.NOTION_API_TOKEN as string, contentOnly: true })(
  "34185bde2593804e9bf8fc1a468f0514",
)
  .then((d) => writeLocalFile("page2", "json")(d))
  .catch(console.error);
