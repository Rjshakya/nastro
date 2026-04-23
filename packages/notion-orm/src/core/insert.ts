import type { NotionTable } from "./table.js";
import { InferInsertType } from "./types.js";
import { convertToPageProperties } from "./page-properties.js";
import { NotionApi } from "@nastro/notion-api";
import { BlockObjectRequest, PageObjectResponse } from "@notionhq/client";
import { getGeneratedDBMapping } from "./utils.js";

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
export class Insert<T extends NotionTable, MultiSelectEnum, SelectEnum, StatusEnum> {
  private data: InferInsertType<T, MultiSelectEnum, SelectEnum, StatusEnum> | undefined;
  private content: BlockObjectRequest[] | undefined;
  constructor(private config: { table: T; notion: NotionApi }) {}

  values(
    data: InferInsertType<T, MultiSelectEnum, SelectEnum, StatusEnum>,
    content?: BlockObjectRequest[],
  ): this {
    this.data = data;
    this.content = content;
    return this;
  }

  execute() {
    return this.getDatabaseMapping()
      .then((mapping) => {
        const databaseId = mapping[this.config.table.title];
        if (!databaseId) {
          throw new Error(
            `No database ID found for table "${this.config.table.title}". Did you run the push command?`,
          );
        }

        if (!this.data) {
          throw new Error(
            `No data provided for insert operation on table "${this.config.table.title}". Please call .values() with the data to insert.`,
          );
        }

        return { databaseId, data: this.data };
      })
      .then(({ data, databaseId }) => {
        const props = convertToPageProperties(data, this.config.table);
        return this.config.notion.createPage({
          parent: { type: "database_id", database_id: databaseId },
          properties: props,
          content: this.content,
        });
      })
      .catch((e) => {
        console.error("Error executing insert operation:", e);
        throw e;
      });
  }

  private async getDatabaseMapping() {
    return await getGeneratedDBMapping();
  }
}
