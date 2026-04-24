import { NotionApi } from "@nastro/notion-api";
import { NotionTable } from "./types";
import { getGeneratedDBMapping } from "./utils";
import { Filter } from "./filters";
import { QueryDataSourceParameters } from "@notionhq/client";
import { FilterByID } from "./filters/types";

export class Delete<T extends NotionTable> {
  private query: QueryDataSourceParameters;
  private pageId: string | undefined;
  constructor(private config: { notion: NotionApi; table: T }) {
    this.query = { data_source_id: "" };
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
      return Promise.all([this.config.notion.updatePage({ page_id: this.pageId, in_trash: true })]);
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
        return {
          pages: pages.map((page) => page.id),
        };
      })
      .then(({ pages }) => {
        return Promise.all(
          pages.map((id) => this.config.notion.updatePage({ page_id: id, in_trash: true })),
        );
      });
  }

  private async getDatabaseMapping() {
    return await getGeneratedDBMapping();
  }
}
