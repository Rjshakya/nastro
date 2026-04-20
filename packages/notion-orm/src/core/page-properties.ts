import type { Column } from "./types.ts";
import type { CreatePageParameters } from "@notionhq/client";

// =============================================================================
// Notion Page Property Types (for CreatePage / UpdatePage)
// =============================================================================
// These represent the shapes expected by the Notion API when writing page
// properties. They mirror the union in CreatePageBodyParameters['properties'].
// =============================================================================

export type NotionPageProperty =
  | { title: Array<{ text: { content: string } }>; type?: "title" }
  | { rich_text: Array<{ text: { content: string } }>; type?: "rich_text" }
  | { number: number | null; type?: "number" }
  | { select: { name: string } | null; type?: "select" }
  | { multi_select: Array<{ name: string }>; type?: "multi_select" }
  | { status: { name: string } | null; type?: "status" }
  | { date: { start: string; end?: string | null } | null; type?: "date" }
  | { people: Array<{ id: string }>; type?: "people" }
  | {
      files: Array<
        | { name: string; external: { url: string }; type?: "external" }
        | { name: string; file: { url: string }; type?: "file" }
      >;
      type?: "files";
    }
  | { checkbox: boolean; type?: "checkbox" }
  | { url: string | null; type?: "url" }
  | { email: string | null; type?: "email" }
  | { phone_number: string | null; type?: "phone_number" }
  | { relation: Array<{ id: string }>; type?: "relation" };

// =============================================================================
// Individual Column Converters
// Each function takes a typed value and returns a Notion page property object.
// =============================================================================

/**
 * Convert a string value to a Notion title property
 */
export function convertTitle(value: string): Extract<NotionPageProperty, { title: unknown }> {
  return {
    title: [{ text: { content: value } }],
  };
}

/**
 * Convert a string value to a Notion rich_text property
 */
export function convertRichText(
  value: string,
): Extract<NotionPageProperty, { rich_text: unknown }> {
  return {
    rich_text: [{ text: { content: value } }],
  };
}

/**
 * Convert a number value to a Notion number property
 */
export function convertNumber(value: number): Extract<NotionPageProperty, { number: unknown }> {
  return {
    number: value,
  };
}

/**
 * Convert a string value to a Notion select property
 */
export function convertSelect(value: string): Extract<NotionPageProperty, { select: unknown }> {
  return {
    select: { name: value },
  };
}

/**
 * Convert an array of strings to a Notion multi_select property
 */
export function convertMultiSelect(
  value: string[],
): Extract<NotionPageProperty, { multi_select: unknown }> {
  return {
    multi_select: value.map((name) => ({ name })),
  };
}

/**
 * Convert a string value to a Notion status property
 */
export function convertStatus(value: string): Extract<NotionPageProperty, { status: unknown }> {
  return {
    status: { name: value },
  };
}

/**
 * Convert a date string (or date object) to a Notion date property
 */
export function convertDate(
  value: string | { start: string; end?: string | null },
): Extract<NotionPageProperty, { date: unknown }> {
  if (typeof value === "string") {
    return {
      date: { start: value },
    };
  }
  return {
    date: { start: value.start, end: value.end ?? null },
  };
}

/**
 * Convert an array of user objects to a Notion people property
 */
export function convertPeople(
  value: Array<{ id: string }>,
): Extract<NotionPageProperty, { people: unknown }> {
  return {
    people: value.map((user) => ({ id: user.id })),
  };
}

/**
 * Convert an array of file objects to a Notion files property
 */
export function convertFiles(
  value: Array<{ name: string; url: string; type?: "external" | "file" }>,
): Extract<NotionPageProperty, { files: unknown }> {
  return {
    files: value.map((file) => {
      if (file.type === "file") {
        return { name: file.name, file: { url: file.url } };
      }
      return { name: file.name, external: { url: file.url } };
    }),
  };
}

/**
 * Convert a boolean value to a Notion checkbox property
 */
export function convertCheckbox(
  value: boolean,
): Extract<NotionPageProperty, { checkbox: unknown }> {
  return {
    checkbox: value,
  };
}

/**
 * Convert a string value to a Notion url property
 */
export function convertUrl(value: string): Extract<NotionPageProperty, { url: unknown }> {
  return {
    url: value,
  };
}

/**
 * Convert a string value to a Notion email property
 */
export function convertEmail(value: string): Extract<NotionPageProperty, { email: unknown }> {
  return {
    email: value,
  };
}

/**
 * Convert a string value to a Notion phone_number property
 */
export function convertPhoneNumber(
  value: string,
): Extract<NotionPageProperty, { phone_number: unknown }> {
  return {
    phone_number: value,
  };
}

/**
 * Convert an array of page IDs to a Notion relation property
 */
export function convertRelation(
  value: string[],
): Extract<NotionPageProperty, { relation: unknown }> {
  return {
    relation: value.map((id) => ({ id })),
  };
}

// =============================================================================
// Main Converter: Convert a table schema + user values → Notion page properties
// =============================================================================

/**
 * Convert ORM insert values to Notion page properties for create/update.
 *
 * Iterates over the table schema, skipping read-only columns, and converts
 * each provided value into its Notion API page property shape.
 *
 * @param table - The NotionTable schema definition
 * @param values - The user-provided insert values
 * @returns A Record mapping property names to Notion page property objects
 */
export function convertToPageProperties(
  table: { properties: Record<string, Column> },
  values: Record<string, unknown>,
): Record<string, NotionPageProperty> {
  const properties: Record<string, NotionPageProperty> = {};

  for (const [key, column] of Object.entries(table.properties)) {
    const propName = column.name || key;
    const value = values[key];

    // Skip undefined values
    if (value === undefined) continue;

    // Skip read-only / computed columns
    if (isReadOnlyColumn(column)) continue;

    const converted = convertValueByType(column.type, value);
    if (converted) {
      properties[propName] = converted;
    }
  }

  return properties;
}

// =============================================================================
// Internal Helpers
// =============================================================================

/**
 * Check if a column is read-only (formula, rollup, unique_id, system timestamps, etc.)
 */
function isReadOnlyColumn(column: Column): boolean {
  switch (column.type) {
    case "formula":
    case "rollup":
    case "unique_id":
    case "created_time":
    case "created_by":
    case "last_edited_time":
    case "last_edited_by":
    case "last_visited_time":
    case "place":
    case "button":
    case "location":
    case "verification":
      return true;
    default:
      return false;
  }
}

/**
 * Route a value to its type-specific converter based on the column type.
 * Returns null if the type is unsupported or read-only.
 */
function convertValueByType(type: Column["type"], value: unknown): NotionPageProperty | null {
  switch (type) {
    case "title":
      if (typeof value !== "string")
        throw new TypeError(`Expected string for title, got ${typeof value}`);
      return convertTitle(value);

    case "rich_text":
      if (typeof value !== "string")
        throw new TypeError(`Expected string for rich_text, got ${typeof value}`);
      return convertRichText(value);

    case "number":
      if (typeof value !== "number")
        throw new TypeError(`Expected number for number, got ${typeof value}`);
      return convertNumber(value);

    case "select":
      if (typeof value !== "string")
        throw new TypeError(`Expected string for select, got ${typeof value}`);
      return convertSelect(value);

    case "multi_select":
      if (!Array.isArray(value) || !value.every((v) => typeof v === "string")) {
        throw new TypeError(`Expected string[] for multi_select`);
      }
      return convertMultiSelect(value as string[]);

    case "status":
      if (typeof value !== "string")
        throw new TypeError(`Expected string for status, got ${typeof value}`);
      return convertStatus(value);

    case "date":
      if (typeof value === "string") {
        return convertDate(value);
      }
      if (typeof value === "object" && value !== null && "start" in value) {
        return convertDate(value as { start: string; end?: string | null });
      }
      throw new TypeError(`Expected string or date object for date, got ${typeof value}`);

    case "people":
      if (!Array.isArray(value))
        throw new TypeError(`Expected array for people, got ${typeof value}`);
      return convertPeople(value as Array<{ id: string }>);

    case "files":
      if (!Array.isArray(value))
        throw new TypeError(`Expected array for files, got ${typeof value}`);
      return convertFiles(
        value as Array<{ name: string; url: string; type?: "external" | "file" }>,
      );

    case "checkbox":
      if (typeof value !== "boolean")
        throw new TypeError(`Expected boolean for checkbox, got ${typeof value}`);
      return convertCheckbox(value);

    case "url":
      if (typeof value !== "string")
        throw new TypeError(`Expected string for url, got ${typeof value}`);
      return convertUrl(value);

    case "email":
      if (typeof value !== "string")
        throw new TypeError(`Expected string for email, got ${typeof value}`);
      return convertEmail(value);

    case "phone_number":
      if (typeof value !== "string")
        throw new TypeError(`Expected string for phone_number, got ${typeof value}`);
      return convertPhoneNumber(value);

    case "relation":
      if (!Array.isArray(value) || !value.every((v) => typeof v === "string")) {
        throw new TypeError(`Expected string[] for relation`);
      }
      return convertRelation(value as string[]);

    default:
      return null;
  }
}
