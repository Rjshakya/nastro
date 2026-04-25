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
  const record = props.reduce(
    (acc, curr, i) => {
      const [name, col] = curr;

      if (!col.name) {
        col.name = name;
      }

      if (!col.id) {
        col.id = `col_${i}`;
      }

      acc[name] = col;
      return acc;
    },
    {} as Record<string, Column>,
  );

  return {
    _type: "table",
    title: title,
    properties: record as T,
  };
}
