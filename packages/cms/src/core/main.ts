import { runPage } from "./page";
import { Page } from "./types";

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

export class NotionApi<Output = Page> {
  private plugins: Array<(input: unknown) => unknown> = [];
  private token: string;
  private result: Promise<Output> | null;

  constructor(options: { token: string }) {
    this.token = options.token;
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
    const newSource = new NotionApi<NextOutput>({ token: this.token });
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
    this.result = runPage({ token: this.token, ...options })(pageId) as Promise<Output>;
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

  /**
   * Clear all plugins from the chain
   * @returns A new NotionApi with no plugins
   */
  private clear(): NotionApi<Page> {
    return new NotionApi<Page>({ token: this.token });
  }

  /**
   * Get the current number of plugins in the chain
   */
  private get pluginCount(): number {
    return this.plugins.length;
  }
}

/**
 * Factory function to create a NotionApi instance
 * Convenience wrapper around the class constructor
 */
export function createNotionApi(options: { token: string }): NotionApi<Page> {
  return new NotionApi(options);
}
