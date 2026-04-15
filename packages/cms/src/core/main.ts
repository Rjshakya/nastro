import { Page, PageContentOnly } from "./types";
import { runPage } from "./page";

/**
 * ContentSource - Main class for fetching content from Notion
 *
 * Provides a chainable plugin system for transforming fetched content.
 * Plugins are executed in order, with each plugin receiving the output
 * of the previous plugin.
 *
 * The generic Output type tracks the final result type through the plugin chain.
 * Default is Page | PageContentOnly (raw Notion content).
 *
 * @example
 * const source = new ContentSource({ token: '...' });
 *
 * // Fetch raw page - returns Promise<Page>
 * const page = await source.fetch('page-id');
 *
 * // Fetch content-only - returns Promise<PageContentOnly>
 * const content = await source.fetch('page-id', { contentOnly: true });
 *
 * // With plugins - type changes to plugin output
 * const html = await source
 *   .use(toHTML)
 *   .fetch('page-id'); // returns Promise<string>
 */
export class ContentSource<Output = Page | PageContentOnly> {
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
   * @returns A new ContentSource with updated output type
   */
  use<NextOutput>(
    plugin: (input: Output) => NextOutput | Promise<NextOutput>,
  ): ContentSource<NextOutput> {
    const newSource = new ContentSource<NextOutput>({ token: this.token });
    newSource.result = this.result as Promise<NextOutput> | null;
    newSource.plugins = [
      ...this.plugins,
      plugin as (input: unknown) => unknown,
    ];

    return newSource;
  }

  /**
   * Fetch a page from Notion and apply all plugins in the chain
   *
   * @param pageId - The Notion page ID to fetch
   * @param options - Fetch options
   * @returns Transformed content after all plugins have been applied
   */
  fetch<T extends boolean = false>(
    pageId: string,
    options?: { contentOnly?: T },
  ): this {
    try {
      // Fetch raw content from Notion
      this.result = runPage({
        token: this.token,
        contentOnly: options?.contentOnly,
      })(pageId) as Promise<Output>;

      return this;
    } catch (e) {
      throw new Error(String(e));
    }
  }

  /**
   * Returns the final output after fetch and applying all plugins;
   * If called before fetch throws an Error
   * @returns final Output
   */

  async run() {
    if (!this.result) {
      throw new Error("failed fetch content from notion");
    }

    let result: unknown = await this.result;
    for (const plugin of this.plugins) {
      result = await plugin(result);
    }

    return result as Output;
  }

  /**
   * Clear all plugins from the chain
   * @returns A new ContentSource with no plugins
   */
  clear(): ContentSource<Page | PageContentOnly> {
    return new ContentSource<Page | PageContentOnly>({ token: this.token });
  }

  /**
   * Get the current number of plugins in the chain
   */
  get pluginCount(): number {
    return this.plugins.length;
  }
}

/**
 * Factory function to create a ContentSource instance
 * Convenience wrapper around the class constructor
 */
export function createContentSource(options: {
  token: string;
}): ContentSource<Page | PageContentOnly> {
  return new ContentSource(options);
}
