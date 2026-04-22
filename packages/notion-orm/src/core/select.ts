import { InferSelectType, NotionTable } from "./types.js";
import { PageObjectResponse, QueryDataSourceParameters } from "@notionhq/client";
import { FilterCondition } from "./filters/logical.js";
import { NotionApi } from "@nastro/notion-api";

export class Select<T extends NotionTable> {
  constructor(
    _databaseMapping: Record<string, string>,
    _notion: NotionApi,
    _fields: T["properties"],
  ) {}

  from(_table: T) {}
}

export class QueryBuilder<T extends NotionTable> {
  private query: QueryDataSourceParameters;

  constructor(
    private config: {
      fields: T["properties"];
      notion: NotionApi;
      datasourceId: string;
    },
  ) {
    this.query = { data_source_id: this.config.datasourceId };
  }

  where(condition: FilterCondition | null): this {
    if (condition) {
      this.query.filter = condition;
    }
    return this;
  }

  raw(filter: QueryDataSourceParameters["filter"]) {
    this.query.filter = filter;
  }

  execute() {
    return this.config.notion
      .queryDataBase(this.query)
      .then(({ pages }) =>
        pages.map((page) => convertPageObjectToSelectType(this.config.fields, page)),
      );
  }
}

export function convertPageObjectToSelectType<T extends NotionTable, M, S>(
  props: T["properties"],
  page: PageObjectResponse,
): InferSelectType<T, M, S> {
  const result = { id: page.id } as InferSelectType<T, M, S>;

  for (const [key, column] of Object.entries(props)) {
    const propValue = page.properties[key];

    // Property missing from page → set null
    if (!propValue) {
      (result as Record<string, unknown>)[key] = null;
      continue;
    }

    const v = propValue as { type: string } & Record<string, unknown>;

    switch (column.type) {
      case "title": {
        const items = v.title as Array<{ plain_text: string }>;
        (result as Record<string, unknown>)[key] = items.map((t) => t.plain_text).join("");
        break;
      }
      case "rich_text": {
        const items = v.rich_text as Array<{ plain_text: string }>;
        (result as Record<string, unknown>)[key] = items.map((t) => t.plain_text).join("");
        break;
      }
      case "number": {
        (result as Record<string, unknown>)[key] = v.number ?? null;
        break;
      }
      case "select": {
        const sel = v.select as { name: string } | null;
        (result as Record<string, unknown>)[key] = sel?.name ?? null;
        break;
      }
      case "multi_select": {
        const items = (v.multi_select as Array<{ name: string }>) ?? [];
        (result as Record<string, unknown>)[key] = items.map((x) => ({ name: x.name }));
        break;
      }
      case "status": {
        const st = v.status as { name: string } | null;
        (result as Record<string, unknown>)[key] = st?.name ?? "";
        break;
      }
      case "date": {
        const d = v.date as { start: string } | null;
        (result as Record<string, unknown>)[key] = d?.start ?? null;
        break;
      }
      case "people": {
        const items = (v.people as Array<{ id: string }>) ?? [];
        (result as Record<string, unknown>)[key] = items.map((p) => ({ id: p.id }));
        break;
      }
      case "files": {
        const items =
          (v.files as Array<{
            name: string;
            type: "external" | "file";
            external?: { url: string };
            file?: { url: string };
          }>) ?? [];
        (result as Record<string, unknown>)[key] = items.map((f) => ({
          name: f.name,
          url: f.type === "external" ? f.external!.url : f.file!.url,
          type: f.type,
        }));
        break;
      }
      case "checkbox": {
        (result as Record<string, unknown>)[key] = v.checkbox ?? false;
        break;
      }
      case "url": {
        (result as Record<string, unknown>)[key] = (v.url as string | null) ?? null;
        break;
      }
      case "email": {
        (result as Record<string, unknown>)[key] = (v.email as string | null) ?? null;
        break;
      }
      case "phone_number": {
        (result as Record<string, unknown>)[key] = (v.phone_number as string | null) ?? null;
        break;
      }
      case "relation": {
        const items = (v.relation as Array<{ id: string }>) ?? [];
        (result as Record<string, unknown>)[key] = items.map((r) => ({ id: r.id }));
        break;
      }
      case "unique_id": {
        const uid = v.unique_id as { prefix: string | null; number: number | null } | null;
        (result as Record<string, unknown>)[key] = uid?.number ?? null;
        break;
      }
      case "created_time": {
        (result as Record<string, unknown>)[key] = (v.created_time as string) ?? "";
        break;
      }
      case "created_by": {
        const cb = v.created_by as { id: string } | null;
        (result as Record<string, unknown>)[key] = cb?.id ?? "";
        break;
      }
      case "last_edited_time": {
        (result as Record<string, unknown>)[key] = (v.last_edited_time as string) ?? "";
        break;
      }
      case "last_edited_by": {
        const leb = v.last_edited_by as { id: string } | null;
        (result as Record<string, unknown>)[key] = leb?.id ?? "";
        break;
      }
      // formula / rollup are excluded from InferSelectType — skip
      default:
        break;
    }
  }

  return result;
}
