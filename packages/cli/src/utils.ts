import type { Column, NotionTable } from "@nastro-dev/notion-orm";
import type { NotionApi } from "@nastro-dev/notion-api";
import type {
  CreateDatabaseParameters,
  CreateDataSourceParameters,
  UpdateDataSourceParameters,
} from "@notionhq/client";

type UpdatePropertyPayload = NonNullable<UpdateDataSourceParameters["properties"]>;

export const convertSchemeToDataSourceProperties = (
  table: NotionTable,
): CreateDataSourceParameters["properties"] => {
  const properties = {} as CreateDataSourceParameters["properties"];

  for (const [name, column] of Object.entries(table.properties)) {
    if (column.type === "relation") {
      continue;
    }

    if (column.type === "status") {
      properties[name] = { type: column.type, status: {} };
    }

    if (column.type !== "status") {
      properties[name] = column;
    }
  }

  return properties;
};

export const convertSchemeToDataBaseParams = (
  table: NotionTable,
  parentId: string,
): CreateDatabaseParameters => {
  const properties = convertSchemeToDataSourceProperties(table);
  const intialDataSource = {} as NonNullable<CreateDatabaseParameters["initial_data_source"]>;

  intialDataSource.properties = properties;

  const params = {} as CreateDatabaseParameters;
  params.parent = { type: "page_id", page_id: parentId };
  params.initial_data_source = intialDataSource;
  params.title = [{ type: "text", text: { content: table.title } }];

  return params;
};

export const createDatabase = async (notion: NotionApi, params: CreateDatabaseParameters) => {
  return notion.createDatabase(params).then((db) => ({
    id: db.id,
    dataSourceId: db.data_sources[0].id,
  }));
};

/**
 * Convert a notion-orm Column to Notion API update property payload
 * Returns null for unsupported types (formula, relation, rollup)
 */
export function buildUpdateProperty(column: Column): UpdatePropertyPayload[string] | null {
  switch (column.type) {
    case "formula":
    case "relation":
    case "rollup":
      return null;

    case "title":
    case "rich_text":
    case "url":
    case "people":
    case "files":
    case "checkbox":
    case "email":
    case "phone_number":
    case "date":
    case "created_by":
    case "created_time":
    case "last_edited_by":
    case "last_edited_time": {
      const t = column.type;
      return { type: t, [t]: {} } as UpdatePropertyPayload[string];
    }

    case "number":
      return {
        type: "number",
        number: {
          format: column.number.format || "number",
        },
      };

    case "select":
      return {
        type: "select",
        select: {
          options: column.select.options.map((opt) =>
            typeof opt === "string" ? { name: opt, color: "default" } : opt,
          ),
        },
      };

    case "multi_select":
      return {
        type: "multi_select",
        multi_select: {
          options:
            column.multi_select.options?.map((opt) =>
              typeof opt === "string" ? { name: opt, color: "default" } : opt,
            ) || [],
        },
      };

    case "status":
      return {
        type: "status",
        status: {
          options: column.status.options.map((opt) =>
            typeof opt === "string" ? { name: opt, color: "default" } : opt,
          ),
        },
      } as unknown as UpdatePropertyPayload[string];

    case "unique_id":
      return {
        type: "unique_id",
        unique_id: {
          prefix: column.unique_id.prefix ?? null,
        },
      };

    default:
      return null;
  }
}
