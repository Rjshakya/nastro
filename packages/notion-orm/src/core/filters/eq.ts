import { EqColumnType, Filter, FilterByID, FilterColumnTypeMap } from "./types.js";
import type { Column } from "../types.js";

export function eq(column: "id", value: string): FilterByID;
export function eq<T extends Extract<Column, { type: EqColumnType }>>(
  column: T,
  value: FilterColumnTypeMap[T["type"]],
): Filter | null;

export function eq<T extends Extract<Column, { type: EqColumnType }>>(
  column: T & "id",
  value: FilterColumnTypeMap[T["type"]] & string,
): Filter | FilterByID | null {
  const property = column.name as string;
  const type = column.type;

  if (column === "id") {
    return { _filter: "filter_by_id", value };
  }

  switch (type) {
    case "email":
      return { property, email: { equals: value as string } };
    case "checkbox":
      return { property, checkbox: { equals: value as unknown as boolean } };
    case "date":
      return { property, date: { equals: value as string } };
    case "number":
      return { property, number: { equals: value as unknown as number } };
    case "title":
      return { property, title: { equals: value as string } };
    case "phone_number":
      return { property, phone_number: { equals: value as string } };
    case "rich_text":
      return { property, rich_text: { equals: value as string } };
    case "select":
      return { property, select: { equals: value as string } };
    case "status":
      return { property, status: { equals: value as string } };
    case "unique_id":
      return { property, unique_id: { equals: value as unknown as number } };
    case "url":
      return { property, url: { equals: value as string } };
    case "created_time":
      return { property, created_time: { equals: value as string } };
    case "last_edited_time":
      return { property, last_edited_time: { equals: value as string } };
    default:
      return null;
  }
}
