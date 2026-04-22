import type { Column } from "./types.ts";

/**
 * Table definition structure
 * Represents a complete Notion database schema
 */
export interface NotionTable<TProperties extends Record<string, Column> = Record<string, Column>> {
  _type: "table";
  title: string;
  properties: TProperties;
}

/**
 * Table builder function
 * Creates a table definition that can be used for:
 * 1. Type inference via InferType<typeof table>
 * 2. CLI push to create/update databases
 * 3. Query building with .from(table)
 *
 * @example
 * ```typescript
 * const projectsTable = table({
 *   title: "Projects",
 *   properties: {
 *     name: title({ name: "Project Name" }),
 *     status: status({ name: "Status" }),
 *   }
 * });
 *
 * type Project = InferType<typeof projectsTable>;
 * // { id: string, name: string, status: string, ... }
 * ```
 */
export function table<T extends Record<string, Column>>(
  title: string,
  properties: T,
): NotionTable<T> {
  const props = Object.entries(properties);
  const record: Record<string, Column> = {};

  for (const prop of props) {
    const [name, column] = prop;
    const columnWithName = column;

    if (!column.name) {
      columnWithName.name = name;
    }
    record[name] = columnWithName;
  }

  return {
    _type: "table",
    title: title,
    properties: record as T,
  };
}
