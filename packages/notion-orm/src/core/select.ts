import { NotionTable } from "./types.js";
import { QueryDataSourceParameters } from "@notionhq/client";
import { Filter } from "./filters/types.js";
import { NotionApi } from "@nastro/notion-api";
import { convertPageObjectToSelectType } from "./page-properties.js";
import { getGeneratedDBMapping } from "./utils.js";

export class Select<T extends NotionTable, MultiSelectEnum, SelectEnum, StatusEnum> {
  constructor(
    private config: {
      notion: NotionApi;
    },
  ) {}

  from(table: T) {
    return new QueryBuilder<T, MultiSelectEnum, SelectEnum, StatusEnum>({
      notion: this.config.notion,
      table,
    });
  }
}

export class QueryBuilder<T extends NotionTable, MultiSelectEnum, SelectEnum, StatusEnum> {
  private query: QueryDataSourceParameters;

  constructor(
    private config: {
      table: T;
      notion: NotionApi;
    },
  ) {
    // it will provided in execute()
    this.query = { data_source_id: "" };
  }

  where(condition: Filter | null): this {
    if (condition) {
      this.query.filter = condition;
    }
    return this;
  }

  limit(size: number) {
    this.query = { ...this.query, page_size: size };
    return this;
  }

  setCursor(cursor?: string) {
    this.query = { ...this.query, start_cursor: cursor };
    return this;
  }

  sort(key: keyof T["properties"], order: "asc" | "desc") {
    const direction = order === "asc" ? "ascending" : "descending";
    const property = key as string;
    this.query = {
      ...this.query,
      sorts: [...(this.query?.sorts ?? []), { property: property, direction }],
    };
    return this;
  }

  raw(filter: QueryDataSourceParameters["filter"]) {
    this.query.filter = filter;
    return this;
  }

  execute() {
    return this.getDatabaseMapping()
      .then((mapping) => {
        const databaseId = mapping[this.config.table.title];
        if (!databaseId) {
          throw new Error(
            `No database ID found for table "${this.config.table.title}". Did you run the push command?`,
          );
        }

        return databaseId;
      })
      .then((id) => this.config.notion.getDataBase(id))
      .then((db) => {
        const datasourceId = db?.data_sources[0].id as string;
        return datasourceId;
      })
      .then((dsId) => this.config.notion.queryDataBase({ ...this.query, data_source_id: dsId }))
      .then(({ pages, nextCursor }) => {
        const rows = pages.map((page) =>
          convertPageObjectToSelectType<T, MultiSelectEnum, SelectEnum, StatusEnum>(
            this.config.table.properties,
            page,
          ),
        );
        return { rows, nextCursor };
      })
      .catch((e) => {
        console.error("Error executing select operation:", e);
        throw e;
      });
  }

  private getDatabaseMapping() {
    return getGeneratedDBMapping();
  }
}
