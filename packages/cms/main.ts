import { Client, type BlockObjectResponse } from "@notionhq/client";
import { existsSync, writeFile } from "node:fs";
import path from "node:path";
import { Result } from "better-result";
import { processBlocks } from "./blocks/index.ts";
import type { ProcessedBlock } from "./types";
import {
  NotionApiError,
  FileSystemError,
  DataSourceNotFoundError,
  DatabaseDataSourceError,
  type CmsError,
} from "./errors.ts";

const notion = (token: string) =>
  new Client({
    auth: token,
  });

/**
 * Fetch a page from Notion
 */
const getPage = (pageId: string) => {
  return async (token: string) => {
    return Result.tryPromise({
      try: async () => {
        const res = await notion(token).pages.retrieve({ page_id: pageId });
        return res;
      },
      catch: (cause) => new NotionApiError({ operation: "getPage", cause }),
    });
  };
};

/**
 * Fetch block children from Notion
 */
const getBlock = (blockId: string) => {
  return async (token: string) => {
    return Result.tryPromise({
      try: async () => {
        const res = await notion(token).blocks.children.list({
          block_id: blockId,
        });
        return res;
      },
      catch: (cause) => new NotionApiError({ operation: "getBlock", cause }),
    });
  };
};

/**
 * Fetch a database from Notion
 */
const getDB = (dbId: string) => {
  return async (token: string) => {
    return Result.tryPromise({
      try: async () => {
        const res = await notion(token).databases.retrieve({
          database_id: dbId,
        });
        return res;
      },
      catch: (cause) => new NotionApiError({ operation: "getDB", cause }),
    });
  };
};

/**
 * Fetch data source pages from a database
 */
const getDSPages = (dbId: string) => {
  return async (tokenId: string) => {
    return Result.tryPromise({
      try: async () => {
        const res = await notion(tokenId).dataSources.query({
          data_source_id: dbId,
        });
        return res;
      },
      catch: (cause) => new NotionApiError({ operation: "getDSPages", cause }),
    });
  };
};

/**
 * Create a fetch children function for recursive block processing
 */
export const createFetchChildren =
  (token: string) =>
  async (
    blockId: string,
  ): Promise<Result<BlockObjectResponse[], NotionApiError>> => {
    return Result.tryPromise({
      try: async () => {
        const response = await notion(token).blocks.children.list({
          block_id: blockId,
        });
        return response.results as BlockObjectResponse[];
      },
      catch: (cause) =>
        new NotionApiError({ operation: "fetchChildren", cause }),
    });
  };

/**
 * Generate a unique file path, handling duplicates
 */
const generateFilePath = (fileName: string): Result<string, never> => {
  const filePath = path.join("./", fileName);

  if (existsSync(filePath)) {
    console.warn(`File ${fileName} already exists, modifying file name`);
    const fileNameWithoutExt = path.parse(fileName).name;
    const fileExt = path.parse(fileName).ext;
    const timestamp = Date.now();
    const newPath = path.join(
      "./",
      `${fileNameWithoutExt}-${timestamp.toString().slice(5)}${fileExt}`,
    );
    return Result.ok(newPath);
  }

  return Result.ok(filePath);
};

/**
 * Write data to a local JSON file
 */
const createLocalFile = (
  fileName: string,
  data: unknown,
): Result<void, FileSystemError> => {
  const filePathResult = generateFilePath(fileName);

  // generateFilePath never returns Err, but we handle it for type safety
  if (filePathResult.isErr()) {
    return Result.err(
      new FileSystemError({
        operation: "generatePath",
        path: fileName,
        cause: filePathResult.error,
      }),
    );
  }

  const filePath = filePathResult.value;

  return Result.try({
    try: () => {
      writeFile(filePath, JSON.stringify(data, null, 2), (err) => {
        if (err) {
          throw err;
        }
      });
    },
    catch: (cause) =>
      new FileSystemError({
        operation: "writeFile",
        path: filePath,
        cause,
      }),
  });
};

/**
 * Result type for database source processing
 */
type DatabaseSourceResult = {
  results: unknown[];
  blocks: ProcessedBlock[];
};

/**
 * Process a database source and return all blocks from its pages
 */
const processDatabaseSource = async (
  dbId: string,
  token: string,
): Promise<
  Result<DatabaseSourceResult, NotionApiError | DatabaseDataSourceError>
> => {
  const dbResult = await getDB(dbId)(token);

  if (dbResult.isErr()) {
    return Result.err(dbResult.error);
  }

  const db = dbResult.value;

  // @ts-ignore - data_sources is not typed
  const dataSourceId = db.data_sources?.[0]?.id;

  if (!dataSourceId) {
    return Result.err(new DatabaseDataSourceError({ dbId }));
  }

  const pagesResult = await getDSPages(dataSourceId)(token);

  if (pagesResult.isErr()) {
    return Result.err(pagesResult.error);
  }

  const pages = pagesResult.value;
  const blocks: ProcessedBlock[] = [];

  for (const page of pages.results) {
    const blockResponseResult = await getBlock(page.id)(token);

    if (blockResponseResult.isErr()) {
      return Result.err(blockResponseResult.error);
    }

    const blockResponse = blockResponseResult.value;
    const fetchChildrenFn = createFetchChildren(token);
    const processedBlocksResult = await processBlocks(
      () => blockResponse.results as BlockObjectResponse[],
    )(fetchChildrenFn)();

    if (processedBlocksResult.isErr()) {
      return Result.err(
        new NotionApiError({
          operation: "processBlocks",
          cause: processedBlocksResult.error,
        }),
      );
    }

    blocks.push(...processedBlocksResult.value);
  }

  return Result.ok({ results: pages.results, blocks });
};

/**
 * Result type for page source processing
 */
type PageSourceResult = unknown & { blocks: ProcessedBlock[] };

/**
 * Process a page source and return all blocks
 */
const processPageSource = async (
  pageId: string,
  token: string,
): Promise<Result<PageSourceResult, NotionApiError>> => {
  const pageResult = await getPage(pageId)(token);

  if (pageResult.isErr()) {
    return Result.err(pageResult.error);
  }

  const page = pageResult.value;

  const blockResponseResult = await getBlock(page.id)(token);

  if (blockResponseResult.isErr()) {
    return Result.err(blockResponseResult.error);
  }

  const blockResponse = blockResponseResult.value;
  const fetchChildrenFn = createFetchChildren(token);

  const processedBlocksResult = await processBlocks(
    () => blockResponse.results as BlockObjectResponse[],
  )(fetchChildrenFn)();

  if (processedBlocksResult.isErr()) {
    return Result.err(
      new NotionApiError({
        operation: "processBlocks",
        cause: processedBlocksResult.error,
      }),
    );
  }

  return Result.ok({ ...page, blocks: processedBlocksResult.value });
};

/**
 * Run the CMS fetch and processing pipeline
 */
const run = (
  token: string,
): ((
  sourceId: string,
  source: "page" | "db",
) => Promise<Result<unknown, CmsError>>) => {
  return async (sourceId, source) => {
    if (source === "db") {
      const result = await processDatabaseSource(sourceId, token);

      if (result.isErr()) {
        return Result.err(result.error);
      }

      return Result.ok(result.value);
    }

    // source === "page"
    const result = await processPageSource(sourceId, token);

    if (result.isErr()) {
      return Result.err(result.error);
    }

    return Result.ok(result.value);
  };
};

// CLI execution
run("")(
  "33785bde259380c3a809d850fc018dbf",
  "page",
).then((result) => {
  result.match({
    ok: (data) => {
      const writeResult = createLocalFile("nastro.demo.json", data);
      writeResult.match({
        ok: () => console.log("File written successfully"),
        err: (e) => console.error(`File write error: ${e.message}`),
      });
    },
    err: (e) => console.error(`CMS Error: ${e.message}`),
  });
});

export {
  getPage,
  getBlock,
  getDB,
  getDSPages,
  createLocalFile,
  processDatabaseSource,
  processPageSource,
  run,
};
export type { CmsError };
