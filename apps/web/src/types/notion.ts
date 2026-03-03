import type {
  DataSourceObjectResponse,
  PageObjectResponse,
  PartialDataSourceObjectResponse,
  PartialPageObjectResponse,
} from "@notionhq/client";

export type NotionPages = (
  | PageObjectResponse
  | PartialPageObjectResponse
  | PartialDataSourceObjectResponse
  | DataSourceObjectResponse
)[];
