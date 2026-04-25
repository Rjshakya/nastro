import { NotionApi } from "@nastro-dev/notion-api";
import { InferInsertType, NotionTable } from "./types";
import { getGeneratedDBMapping } from "./utils";
import { Filter } from "./filters";
import { QueryDataSourceParameters } from "@notionhq/client";
import { FilterByID } from "./filters/types";
import { convertToPageProperties } from "./page-properties";

export class Update<T extends NotionTable> {
  private data: Partial<InferInsertType<T>> | undefined;
  private query: QueryDataSourceParameters;
  private pageId: string | undefined;
  constructor(private config: { notion: NotionApi; table: T }) {
    this.query = { data_source_id: "" };
  }

  values(data: Partial<InferInsertType<T>>): this {
    this.data = data;
    return this;
  }

  where(condition: Filter | FilterByID | null): this {
    if (condition) {
      if ("_filter" in condition) {
        this.pageId = condition.value;
      } else {
        this.query.filter = condition;
      }
    }
    return this;
  }

  execute() {
    if (this.pageId) {
      // Update page by ID
      return Promise.resolve(this.data)
        .then((data) => {
          if (!data) {
            throw new Error("No data provided for update");
          }
          const props = convertToPageProperties(data, this.config.table);
          return props;
        })
        .then((props) => {
          if (!this.pageId) {
            throw new Error("Page ID is required for update");
          }
          return Promise.all([
            this.config.notion.updatePage({ page_id: this.pageId, properties: props }),
          ]);
        });
    }

    return this.getDatabaseMapping()
      .then((mapping) => {
        const databaseId = mapping[this.config.table.title];
        if (!databaseId) {
          throw new Error(
            `No database ID found for table "${this.config.table.title}". Did you run the push command?`,
          );
        }
        return { databaseId, mapping };
      })
      .then(({ databaseId, mapping }) => ({ databaseId, datasourceId: mapping[databaseId] }))
      .then(({ datasourceId }) =>
        this.config.notion.queryDataBase({ ...this.query, data_source_id: datasourceId }),
      )
      .then(({ pages }) => {
        if (!this.data) {
          throw new Error("No data provided for update");
        }
        const props = convertToPageProperties(this.data, this.config.table);
        return {
          pages: pages.map((page) => page.id),
          props,
        };
      })
      .then(({ pages, props }) => {
        return Promise.all(
          pages.map((id) => this.config.notion.updatePage({ page_id: id, properties: props })),
        );
      });
  }

  private getDatabaseMapping() {
    return getGeneratedDBMapping();
  }
}
