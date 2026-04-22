// Main exports for notion-orm/schema
// All column builders and table definition

export { table } from "./table.js";
export type { InferInsertType, InferSelectType } from "./types.js";
export type { NotionTable } from "./table.js";

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
} from "./columns.js";

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
} from "./types.ts";

// Filters
export { eq, ne, gt, gte, lt, lte, and, or } from "./filters/index.js";
export type { FilterCondition } from "./filters/index.js";

// Select / Query builder
export { Select, QueryBuilder, convertPageObjectToSelectType } from "./select.js";
export { DB } from "./db.js";
export type { DBOptions } from "./db.ts";
export { Insert } from "./insert.js";

// Page property conversion utilities
export { convertToPageProperties } from "./page-properties.js";
