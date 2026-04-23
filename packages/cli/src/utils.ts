import type { NotionTable } from "@nastro/notion-orm";
import type { NotionApi } from "@nastro/notion-api";
import type { CreateDatabaseParameters, CreateDataSourceParameters } from "@notionhq/client";

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
