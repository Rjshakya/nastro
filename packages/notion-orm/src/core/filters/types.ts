import { QueryDataSourceParameters } from "@notionhq/client";
import { Column, ColumnTypeMap } from "../types.js";

export type Filter = NonNullable<QueryDataSourceParameters["filter"]>;

// ============== Filter Types ==============

/** Column type map for filter operation value types (includes read-only columns) */
export type FilterColumnTypeMap<
  MultiSelectEnum = string,
  SelectEnum = string,
  StatusEnum = string,
> = ColumnTypeMap<MultiSelectEnum, SelectEnum, StatusEnum> & {
  unique_id: number;
  created_time: string;
  last_edited_time: string;
};

/** Column types supported by `eq` operator */
export type EqColumnType =
  | "title"
  | "rich_text"
  | "number"
  | "select"
  | "status"
  | "date"
  | "phone_number"
  | "email"
  | "url"
  | "checkbox"
  | "unique_id"
  | "created_time"
  | "last_edited_time";

/** Column types supported by `ne` operator */
export type NeColumnType =
  | "title"
  | "rich_text"
  | "number"
  | "select"
  | "status"
  | "phone_number"
  | "email"
  | "url"
  | "checkbox"
  | "unique_id";

/** Column types that support gt/gte/lt/lte comparison in Notion API */
export type ComparableColumnType =
  | "number"
  | "date"
  | "unique_id"
  | "created_time"
  | "last_edited_time";

/** Extract only the Column union members whose `type` is comparable */
export type ComparableColumn = Extract<Column, { type: ComparableColumnType }>;

/** Infer the value type for a comparable column */
export type ComparableColumnValue<T extends ComparableColumn> = T["type"] extends
  | "number"
  | "unique_id"
  ? number
  : string;
