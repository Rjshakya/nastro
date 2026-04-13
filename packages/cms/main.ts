import {
  BlockObjectResponse,
  Client,
  DatabaseObjectResponse,
  PageObjectResponse,
} from "@notionhq/client";
import { processBlock } from "./blocks";
import { Page, PageBlock } from "./types";
import { loadEnvFile } from "node:process";
import path from "node:path";
import { existsSync, writeFile } from "node:fs";

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

    const childblocks: any[] = await getPageContent(block.id)(f);

    return {
      id: block.id,
      type: block.type,
      content: blockContent,
      hasChildren: block.has_children,
      childblocks,
    } satisfies PageBlock;
  };
}

export function getPageContent(
  pageId: string,
  startCursor?: string,
  pageSize?: number,
) {
  return async (f: () => Client): Promise<PageBlock[]> => {
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
              processBlockRecursively(b as BlockObjectResponse)(f),
            ),
          ).then((d) => d);
        })
        .then((d) => {
          return d;
        });
    } while (startCursor);
  };
}

export function getPage(pageId: string) {
  return async (f: () => Client): Promise<Page> => {
    const rawpage = (await getRawPage(pageId)(f)) as PageObjectResponse;
    const blocks = await getPageContent(pageId)(f);

    return {
      id: rawpage.id,
      cover: rawpage.cover,
      icon: rawpage.icon,
      url: rawpage.url,
      publicUrl: rawpage.public_url,
      properties: rawpage.properties,
      blocks,
    } satisfies Page;
  };
}

export function runPage(token: string) {
  return (pageId: string) => {
    const client = getNotionClient(token);
    return getPage(pageId)(() => client);
  };
}

export function writeLocalFile(fileName: string, ext: "json") {
  return (data: unknown) => {
    let filePath = path.join("./", `${fileName}.${ext}`);

    if (existsSync(filePath)) {
      console.warn(`File ${filePath} already exists. Skipping write.`);

      const parsed = path.parse(filePath);
      const parsedFileName = parsed.name;

      const last = parsedFileName[parsedFileName.length - 1];
      const isNumber = Number.isInteger(last);

      const newFileName = isNumber
        ? `${parsedFileName}-${parseInt(last) + 1}${parsed.ext}`
        : `${parsedFileName}-${1}${parsed.ext}`;

      filePath = path.join("./", newFileName);
    }

    writeFile(filePath, JSON.stringify(data), (err) => {
      if (err) {
        console.error(`Error writing file ${filePath}:`, err);
      }
    });
  };
}

runPage(process.env.NOTION_API_TOKEN as string)(
  "34185bde2593804e9bf8fc1a468f0514",
)
  .then((d) => writeLocalFile("page2", "json")(d))
  .catch(console.error);
