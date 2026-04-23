// Main exports for notion-orm/schema
// All column builders and table definition

export { table } from "./core/table.js";
export type { InferInsertType, InferSelectType } from "./core/types.js";
export type { NotionTable } from "./core/table.js";

export {
  checkbox,
  createdBy,
  createdTime,
  date,
  email,
  files,
  formula,
  lastEditedBy,
  lastEditedTime,
  multiSelect,
  number,
  people,
  phoneNumber,
  relation,
  richText,
  rollup,
  select,
  status,
  title,
  uniqueId,
  url,
} from "./core/columns.js";

export type {
  CheckboxColumn,
  Column,
  ColumnBase,
  CreatedByColumn,
  CreatedTimeColumn,
  DateColumn,
  EmailColumn,
  FilesColumn,
  FormulaColumn,
  LastEditedByColumn,
  LastEditedTimeColumn,
  MultiSelectColumn,
  NotionColor,
  NumberColumn,
  NumberFormat,
  PeopleColumn,
  PhoneNumberColumn,
  RelationColumn,
  RichTextColumn,
  RollupColumn,
  RollupFunction,
  SelectColumn,
  SelectOption,
  StatusColumn,
  StatusOption,
  TitleColumn,
  UniqueIdColumn,
  UrlColumn,
} from "./core/types.ts";

// Filters
export { eq, ne, gt, gte, lt, lte, and, or } from "./core/filters/index.js";

export { DB, createNotionDB } from "./core/db.js";
export type { DBOptions } from "./core/db.ts";

// Page property conversion utilities
export { convertToPageProperties } from "./core/page-properties.js";
