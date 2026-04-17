/**
 * Navigation block handlers
 * Child Page, Child Database, Link to Page
 */

import type {
  ChildPageBlockObjectResponse,
  ChildDatabaseBlockObjectResponse,
  LinkToPageBlockObjectResponse,
  Client,
  PageObjectResponse,
} from "@notionhq/client";
import type { ChildDatabaseContent, ChildPageContent, LinkToPageContent } from "../types";
import { getDatabasePagesPaginated, getRawDatabase, getRawPage } from "../notion";
import { getPagePaginated } from "../page";
import { extractPageMetaData } from "../utils";

/**
 * Handle child page block
 * Returns just the ID - children are processed recursively at the page level
 */
export const handleChildPage =
  (block: () => ChildPageBlockObjectResponse) =>
  async (f: () => Client): Promise<ChildPageContent> => {
    const b = block();
    const page = await getRawPage(b.id)(f);
    const metaData = extractPageMetaData(page as PageObjectResponse);

    return {
      title: b.child_page.title,
      icon: metaData.icon,
      url: metaData.url,
      publicUrl: metaData.publicUrl,
    };
  };

/**
 * Handle child database block
 */
export const handleChildDatabase =
  <T extends boolean = false>(block: () => ChildDatabaseBlockObjectResponse, contentOnly?: T) =>
  async (f: () => Client): Promise<ChildDatabaseContent> => {
    const b = block();

    const rawDb = await getRawDatabase(b.id)(f);
    if (!rawDb || !rawDb.data_sources.length) {
      return { pages: [] };
    }

    const databasePages = await getDatabasePagesPaginated({ dsId: rawDb.data_sources[0].id })(f);
    const pages = await Promise.all(
      databasePages.results.map((page) => {
        return getPagePaginated({ pageId: page.id })(f);
      }),
    );

    return {
      pages,
    };
  };

/**
 * Handle link to page block
 */
export const handleLinkToPage =
  (block: () => LinkToPageBlockObjectResponse) => (): LinkToPageContent => {
    const b = block();
    const link = b.link_to_page;

    if (link.type === "page_id") {
      return {
        type: "page_id",
        id: link.page_id,
      };
    } else if (link.type === "database_id") {
      return {
        type: "database_id",
        id: link.database_id,
      };
    } else {
      return {
        type: "comment_id",
        id: link.comment_id,
      };
    }
  };
