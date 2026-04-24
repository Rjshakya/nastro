import {
  CreateDatabaseParameters,
  CreateDataSourceParameters,
  CreatePageParameters,
  DatabaseObjectResponse,
  DataSourceObjectResponse,
  PageObjectResponse,
  QueryDataSourceParameters,
  UpdateDataSourceParameters,
  UpdatePageParameters,
} from "@notionhq/client";
import { runPage } from "./page";
import { Page } from "./types";
import { getNotionClient } from "./notion";

class BaseNotionApi {
  constructor(private token: string) {}

  updatePage(params: UpdatePageParameters) {
    return this.notionClient().pages.update(params);
  }

  updateDataSource(params: UpdateDataSourceParameters) {
    return this.notionClient().dataSources.update(params);
  }

  createDatabase(params: CreateDatabaseParameters) {
    return this.notionClient()
      .databases.create(params)
      .then((d) => d as DatabaseObjectResponse);
  }

  createDataSource(params: CreateDataSourceParameters) {
    return this.notionClient()
      .dataSources.create(params)
      .then((d) => d as DataSourceObjectResponse);
  }

  createPage(params: CreatePageParameters) {
    return this.notionClient()
      .pages.create(params)
      .then((p) => p as PageObjectResponse);
  }

  getPageBlocks({
    pageId,
    pageSize,
    startCursor,
  }: {
    pageId: string;
    pageSize?: number;
    startCursor?: string;
  }) {
    return this.notionClient().blocks.children.list({
      block_id: pageId,
      start_cursor: startCursor,
      page_size: pageSize,
    });
  }

  getPage(id: string) {
    return this.notionClient().pages.retrieve({ page_id: id });
  }

  async getDataBaseRows({
    id,
    pageSize,
    startCursor,
  }: {
    id: string;
    startCursor?: string;
    pageSize?: number;
  }) {
    const response = await this.notionClient().dataSources.query({
      data_source_id: id,
      start_cursor: startCursor,
      page_size: pageSize,
    });

    return {
      pages: response.results as PageObjectResponse[],
      nextCursor: response.next_cursor || undefined,
    };
  }

  async queryDataBase(params: QueryDataSourceParameters) {
    const result = await this.notionClient().dataSources.query(params);
    return {
      pages: result.results as PageObjectResponse[],
      nextCursor: result.next_cursor || undefined,
    };
  }

  getDataSource(id: string) {
    return this.notionClient()
      .dataSources.retrieve({ data_source_id: id })
      .then((d) => d as DataSourceObjectResponse);
  }

  getDataBase(id: string) {
    return this.notionClient()
      .databases.retrieve({ database_id: id })
      .then((d) => {
        return d as DatabaseObjectResponse;
      })
      .then((d) => {
        if (!d.data_sources.length) {
          return null;
        }

        return d;
      });
  }

  notionClient() {
    return getNotionClient(this.token);
  }
}

/**
 * NotionApi - Main class for fetching content from Notion
 *
 * Provides a chainable plugin system for transforming fetched content.
 * Plugins are executed in order, with each plugin receiving the output
 * of the previous plugin.
 *
 * The generic Output type tracks the final result type through the plugin chain.
 * Default is Page | PageContentOnly (raw Notion content).
 *
 * @example
 * const source = new NotionApi({ token: '...' });
 *
 * // Fetch raw page - returns Promise<Page>
 * const page = await source.fetch('page-id');
 *
 * // Fetch content-only - returns Promise<PageContentOnly>
 * const content = await source.fetch('page-id', { contentOnly: true });
 *
 * // With pagination - returns Promise<Page & { nextCursor?: string }>
 * const page = await source.fetch('page-id', { startCursor: undefined });
 * const nextPage = await source.fetch('page-id', { startCursor: page.nextCursor });
 *
 * // With plugins - type changes to plugin output
 * const html = await source
 *   .fetch('page-id')
 *   .use(toHTML())
 *   .run() // returns Promise<string>
 *
 *
 *
 *
 */

export class NotionApi<Output = Page> extends BaseNotionApi {
  private plugins: Array<(input: unknown) => unknown> = [];
  private result: Promise<Output> | null;

  constructor(public options: { token: string }) {
    super(options.token);
    this.result = null;
  }

  /**
   * Add a plugin to the transformation chain
   * Plugins are executed in the order they are added
   *
   * @param plugin - Transform function to apply to fetched content
   * @returns A new NotionApi with updated output type
   */
  use<NextOutput>(
    plugin: (input: Output) => NextOutput | Promise<NextOutput>,
  ): NotionApi<NextOutput> {
    const newSource = new NotionApi<NextOutput>({ token: this.options.token });
    newSource.result = this.result as Promise<NextOutput> | null;
    newSource.plugins = [...this.plugins, plugin as (input: unknown) => unknown];

    return newSource;
  }

  /**
   * Fetch a page from Notion and apply all plugins in the chain
   *
   * @param pageId - The Notion page ID to fetch
   * @param options - Fetch options
   * @returns this
   */
  fetch(pageId: string, options?: { startCursor?: string }): this {
    // Fetch raw content from Notion
    this.result = runPage({ token: this.options.token, ...options })(pageId) as Promise<Output>;
    return this;
  }

  /**
   * Returns the final output after fetch and applying all plugins;
   * If called before fetch throws an Error
   * @returns final Output
   */

  async run() {
    try {
      if (!this.result) {
        throw new Error("failed fetch content from notion");
      }

      let result: unknown = await this.result;
      for (const plugin of this.plugins) {
        result = await plugin(result);
      }

      return result as Output;
    } catch (e) {
      throw e;
    }
  }

  getDataBaseWithDataSource(id: string) {
    return this.getDataBase(id)
      .then((db) => {
        if (!db) {
          throw new Error(`Database with id ${id} not found or has no data sources`);
        }

        const datasource = db.data_sources[0].id;
        return this.getDataSource(datasource).then((ds) => {
          return {
            db,
            ds,
          };
        });
      })
      .catch(console.error);
  }
}

/**
 * Factory function to create a NotionApi instance
 * Convenience wrapper around the class constructor
 */
export function createNotionApi(options: {
  token: string;
  fetcher?: (input: string | URL | Request, init?: RequestInit) => Promise<Response>;
}): NotionApi<Page> {
  return new NotionApi(options);
}
