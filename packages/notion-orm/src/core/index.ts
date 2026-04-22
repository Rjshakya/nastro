// Main exports for notion-orm/schema
// All column builders and table definition

export { table } from "./table.js";
export type { InferInsertType } from "./types.js";
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

// Query builder
export { DB } from "./db.js";
export type { DBOptions } from "./db.ts";
export { Insert, setMapping } from "./insert.js";

// Page property conversion utilities
export { convertToPageProperties } from "./page-properties.js";
