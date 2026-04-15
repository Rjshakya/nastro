import type { PageObjectResponse } from "@notionhq/client";
import type { PageHeader } from "../types";
import { extractPageTitle, extractCoverUrl, extractPageIcon } from "./utils";

export const extractPageMetaData = (page: PageObjectResponse): PageHeader => {
  const title = extractPageTitle(page.properties);
  const cover = extractCoverUrl(page.cover);
  const icon = extractPageIcon(page.icon);

  return {
    id: page.id,
    title,
    cover,
    icon,
    properties: page.properties,
    url: page.url,
    publicUrl: page.public_url,
  };
};
