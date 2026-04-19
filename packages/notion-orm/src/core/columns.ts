import type {
  CheckboxColumn,
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

// ============== Writable Column Builders ==============

/**
 * Title property - required, exactly one per table
 * Controls the title that appears at the top of a page
 */
export function title(params?: ColumnBase): TitleColumn {
  return {
    name: params?.name,
    description: params?.description,
    type: "title",
    title: {},
  };
}

/**
 * Rich text property
 * Contains text values with optional formatting
 */
export function richText(params?: ColumnBase): RichTextColumn {
  return {
    name: params?.name,
    description: params?.description,
    type: "rich_text",
    rich_text: {},
  };
}

/**
 * Number property
 * Contains numeric values with optional format
 */
export function number(params?: ColumnBase & { format?: NumberFormat }): NumberColumn {
  return {
    name: params?.name,
    description: params?.description,
    type: "number",
    number: {
      format: params?.format || "number",
    },
  };
}

/**
 * Select property
 * Contains values from a selection of options (single choice)
 */
export function select(params: ColumnBase & { options: (string | SelectOption)[] }): SelectColumn {
  const options: SelectOption[] = params.options.map((opt) => {
    if (typeof opt === "string") {
      return { name: opt, color: "default" };
    }
    return opt;
  });

  return {
    name: params.name,
    description: params.description,
    type: "select",
    select: {
      options,
    },
  };
}

/**
 * Multi-select property
 * Contains values from a range of options (multiple choices allowed)
 */
export function multiSelect(
  params: ColumnBase & { options: (string | SelectOption)[] },
): MultiSelectColumn {
  // Normalize string options to SelectOption objects
  const options: SelectOption[] = params.options.map((opt) => {
    if (typeof opt === "string") {
      return { name: opt, color: "default" };
    }
    return opt;
  });

  return {
    name: params.name,
    description: params.description,
    type: "multi_select",
    multi_select: {
      options,
    },
  };
}

/**
 * Status property
 * Contains values from a list of status options
 * Note: If no options specified, Notion creates defaults:
 * "Not started", "In progress", "Done"
 */
export function status(params: ColumnBase & { options: (string | StatusOption)[] }): StatusColumn {
  const options: StatusOption[] = params.options.map((opt) => {
    if (typeof opt === "string") {
      return { name: opt, color: "default" };
    }
    return opt;
  });

  return {
    name: params.name,
    description: params.description,
    type: "status",
    status: { options },
  };
}

/**
 * Date property
 * Contains date values, optionally with time and ranges
 */
export function date(params?: ColumnBase): DateColumn {
  return {
    name: params?.name,
    description: params?.description,
    type: "date",
    date: {},
  };
}

/**
 * People property
 * Contains people mentions (users)
 */
export function people(params?: ColumnBase): PeopleColumn {
  return {
    name: params?.name,
    description: params?.description,
    type: "people",
    people: {},
  };
}

/**
 * Files property
 * Contains files uploaded to Notion or external links
 */
export function files(params?: ColumnBase): FilesColumn {
  return {
    name: params?.name,
    description: params?.description,
    type: "files",
    files: {},
  };
}

/**
 * Checkbox property
 * Contains boolean checkboxes
 */
export function checkbox(params?: ColumnBase): CheckboxColumn {
  return {
    name: params?.name,
    description: params?.description,
    type: "checkbox",
    checkbox: {},
  };
}

/**
 * URL property
 * Contains URL values
 */
export function url(params?: ColumnBase): UrlColumn {
  return {
    name: params?.name,
    description: params?.description,
    type: "url",
    url: {},
  };
}

/**
 * Email property
 * Contains email address values
 */
export function email(params?: ColumnBase): EmailColumn {
  return {
    name: params?.name,
    description: params?.description,
    type: "email",
    email: {},
  };
}

/**
 * Phone number property
 * Contains phone number values (no format enforced)
 */
export function phoneNumber(params?: ColumnBase): PhoneNumberColumn {
  return {
    name: params?.name,
    description: params?.description,
    type: "phone_number",
    phone_number: {},
  };
}

/**
 * Relation property
 * Contains references to pages in another data source
 * The relatedTo field is the export name of the related schema (deferred resolution)
 */
export function relation(params: ColumnBase & { relatedTo?: string }): RelationColumn {
  return {
    name: params.name,
    description: params.description,
    type: "relation",
    relation: {},
    relatedTo: params.relatedTo,
  };
}

// ============== Computed/Read-only Column Builders ==============

/**
 * Formula property (computed, read-only)
 * Contains values derived from a provided expression
 * See: https://www.notion.so/help/formulas
 */
export function formula(params: ColumnBase & { expression: string }): FormulaColumn {
  return {
    name: params.name,
    description: params.description,
    type: "formula",
    formula: {
      expression: params.expression,
    },
  };
}

/**
 * Rollup property (computed, read-only)
 * Contains values pulled from a related data source
 */
export function rollup(
  params: ColumnBase & {
    relationProperty: string;
    rollupProperty: string;
    function: RollupFunction;
  },
): RollupColumn {
  return {
    name: params.name,
    description: params.description,
    type: "rollup",
    rollup: {
      function: params.function,
      relation_property_name: params.relationProperty,
      rollup_property_name: params.rollupProperty,
    },
  };
}

/**
 * Unique ID property (auto-generated, read-only)
 * Automatically incremented, unique across all pages
 * Useful for task/bug report IDs (e.g., "TASK-1234")
 */
export function uniqueId(params?: ColumnBase & { prefix?: string }): UniqueIdColumn {
  return {
    name: params?.name,
    description: params?.description,
    type: "unique_id",
    unique_id: {
      prefix: params?.prefix ?? null,
    },
  };
}

// ============== System Column Builders (all read-only) ==============

/**
 * Created time property (system, read-only)
 * Contains timestamp of when each row was created
 */
export function createdTime(params?: ColumnBase): CreatedTimeColumn {
  return {
    name: params?.name,
    description: params?.description,
    type: "created_time",
    created_time: {},
  };
}

/**
 * Created by property (system, read-only)
 * Contains user who created each row
 */
export function createdBy(params?: ColumnBase): CreatedByColumn {
  return {
    name: params?.name,
    description: params?.description,
    type: "created_by",
    created_by: {},
  };
}

/**
 * Last edited time property (system, read-only)
 * Contains timestamp of when each row was last edited
 */
export function lastEditedTime(params?: ColumnBase): LastEditedTimeColumn {
  return {
    name: params?.name,
    description: params?.description,
    type: "last_edited_time",
    last_edited_time: {},
  };
}

/**
 * Last edited by property (system, read-only)
 * Contains user who last edited each row
 */
export function lastEditedBy(params?: ColumnBase): LastEditedByColumn {
  return {
    name: params?.name,
    description: params?.description,
    type: "last_edited_by",
    last_edited_by: {},
  };
}
