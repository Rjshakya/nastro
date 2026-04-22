import type { NotionTable } from "./table.js";
import { InferInsertType } from "./types.js";
import { convertToPageProperties } from "./page-properties.js";
import { NotionApi } from "@nastro/notion-api";
import { BlockObjectRequest, PageObjectResponse } from "@notionhq/client";

// =============================================================================
// Insert Builder
// =============================================================================

/**
 * Insert builder for a specific NotionTable.
 *
 * Provides a chainable `.values()` method that accepts typed insert data,
 * converts it to Notion page properties, and creates the page via the API.
 *
 * @example
 * ```ts
 * const db = new DB({ token: "...", rootPageId: "..." });
 * await db.insert(tasksTable).values({
 *   title: "My new task",
 *   status: "Todo",
 *   priority: "High",
 * });
 * ```
 */
export class Insert<T extends NotionTable, M, S> {
  constructor(
    private config: { table: T; notion: NotionApi; databaseMapping: Record<string, string> },
  ) {}

  values(
    data: InferInsertType<T, M, S>,
    content?: BlockObjectRequest[],
  ): { execute: () => Promise<PageObjectResponse> } {
    const databaseId = this.config.databaseMapping[this.config.table.title];

    if (!databaseId) {
      throw new Error(
        `Database ID not found for table "${this.config.table.title}". ` +
          `Run 'nastro-orm push' first to generate the mapping file.`,
      );
    }

    return {
      execute: () => {
        const props = convertToPageProperties(data, this.config.table);
        return this.config.notion.createPage({
          parent: { type: "database_id", database_id: databaseId },
          properties: props,
          content,
        });
      },
    };
  }
}
