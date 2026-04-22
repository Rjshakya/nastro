import type { NotionTable } from "./table.js";
import { Insert } from "./insert.js";
import { createNotionApi, NotionApi } from "@nastro/notion-api";

// =============================================================================
// DB - Main Query Builder Entry Point
// =============================================================================

export interface DBOptions {
  /** Notion integration token */
  token: string;
  /** Root page ID where databases were created (reserved for future use) */
  rootPageId: string;
  /** Optional explicit mapping override */
  mapping?: Record<string, string>;
}

/**
 * Main database client for the Notion ORM.
 *
 * Provides a fluent API for CRUD operations against Notion databases
 * that were previously pushed with the CLI.
 *
 * @example
 * ```ts
 * const db = new DB({
 *   token: process.env.NOTION_TOKEN!,
 *   rootPageId: "abc123...",
 * });
 *
 * // Insert
 * await db.insert(tasksTable).values({
 *   title: "New task",
 *   status: "Todo",
 * });
 * ```
 */
export class DB {
  private notion: NotionApi;

  constructor(
    token: string,
    public config?: Record<string, string>,
  ) {
    this.notion = createNotionApi({ token });
  }

  /**
   * Start an insert operation for the given table.
   * Returns an Insert builder with a `.values()` method.
   */
  insert<T extends NotionTable, M, S>(table: T): Insert<T, M, S> {
    return new Insert({ databaseMapping: {}, notion: this.notion, table });
  }
}
