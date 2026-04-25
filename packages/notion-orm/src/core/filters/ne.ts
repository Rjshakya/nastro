import { Filter, FilterColumnTypeMap, NeColumnType } from "./types.js";
import type { Column } from "../types.js";

export function ne<T extends Extract<Column, { type: NeColumnType }>>(
  column: T,
  value: FilterColumnTypeMap[T["type"]],
): Filter | null {
  const property = column.name as string;
  const type = column.type;

  switch (type) {
    case "email":
      return { property, email: { does_not_equal: value as string } };
    case "checkbox":
      return { property, checkbox: { does_not_equal: value as boolean } };
    case "number":
      return { property, number: { does_not_equal: value as number } };
    case "title":
      return { property, title: { does_not_equal: value as string } };
    case "phone_number":
      return { property, phone_number: { does_not_equal: value as string } };
    case "rich_text":
      return { property, rich_text: { does_not_equal: value as string } };
    case "select":
      return { property, select: { does_not_equal: value as string } };
    case "status":
      return { property, status: { does_not_equal: value as string } };
    case "unique_id":
      return { property, unique_id: { does_not_equal: value as number } };
    case "url":
      return { property, url: { does_not_equal: value as string } };
    default:
      return null;
  }
}
