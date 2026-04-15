import { Client, DatabaseObjectResponse, PageObjectResponse } from "@notionhq/client";

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

export function getDatabasePages(dsId: string, pageSize?: number) {
  return async function* (f: () => Client) {
    let startCursor: string | undefined;

    do {
      const response = await f().dataSources.query({
        data_source_id: dsId,
        start_cursor: startCursor,
        page_size: pageSize,
      });

      for (const result of response.results) {
        yield result as PageObjectResponse;
      }

      startCursor = response.next_cursor || undefined;
    } while (startCursor);
  };
}

export function getRawPage(pageId: string) {
  return (f: () => Client) => {
    return f().pages.retrieve({ page_id: pageId });
  };
}

export function getBlocks(blockId: string, pageSize?: number, startCursor?: string) {
  return (f: () => Client) => {
    return f().blocks.children.list({
      block_id: blockId,
      start_cursor: startCursor,
      page_size: pageSize,
    });
  };
}
