import type { NotionTable } from "./table.js";
import { Insert } from "./insert.js";
import { createNotionApi, NotionApi } from "@nastro/notion-api";
import { Select } from "./select.js";
import { Update } from "./update.js";
import { Delete } from "./delete.js";

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
    public overrideMapping?: Record<string, string>,
    private fetcher?: (input: string | URL | Request, init?: RequestInit) => Promise<Response>,
  ) {
    this.notion = createNotionApi({ token });
  }

  /**
   * Start an insert operation for the given table.
   * Returns an Insert builder with a `.values()` method.
   */
  insert<T extends NotionTable>(table: T): Insert<T> {
    return new Insert({ notion: this.notion, table });
  }

  update<T extends NotionTable>(table: T) {
    return new Update({ notion: this.notion, table });
  }

  delete<T extends NotionTable>(table: T) {
    return new Delete({ notion: this.notion, table });
  }

  select() {
    return new Select({ notion: this.notion });
  }
}

export function createNotionDB({
  token,
  overrideMapping,
  fetcher,
}: {
  token: string;
  overrideMapping?: Record<string, string>;
  fetcher?: (input: string | URL | Request, init?: RequestInit) => Promise<Response>;
}) {
  return new DB(token, overrideMapping, fetcher);
}
