import {
  Client,
  DatabaseObjectResponse,
  DataSourceObjectResponse,
  PageObjectResponse,
} from "@notionhq/client";

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

export function getDataSource(dsId: string) {
  return (f: () => Client) => {
    return f()
      .dataSources.retrieve({ data_source_id: dsId })
      .then((d) => d as DataSourceObjectResponse);
  };
}

/**
 * Fetch database pages with client-controlled pagination
 * Returns one batch of pages + nextCursor for next batch
 */
export function getDatabasePagesPaginated({
  dsId,
  pageSize,
  startCursor,
}: {
  dsId: string;
  pageSize?: number;
  startCursor?: string;
}) {
  return async (
    f: () => Client,
  ): Promise<{ results: PageObjectResponse[]; nextCursor?: string }> => {
    const response = await f().dataSources.query({
      data_source_id: dsId,
      start_cursor: startCursor,
      page_size: pageSize,
    });

    return {
      results: response.results as PageObjectResponse[],
      nextCursor: response.next_cursor || undefined,
    };
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
