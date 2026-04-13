/**
 * Navigation block handlers
 * Child Page, Child Database, Link to Page
 */

import type {
  ChildPageBlockObjectResponse,
  ChildDatabaseBlockObjectResponse,
  LinkToPageBlockObjectResponse,
  Client,
} from "@notionhq/client";
import type { Database, LinkToPageContent, Page } from "../types";
import { getDatabasePages, getPageContent, getRawDatabase } from "../main";

/**
 * Handle child page block
 * Returns just the ID - children are processed recursively at the page level
 */
export const handleChildPage = (block: () => ChildPageBlockObjectResponse) => {
  const b = block();

  return {
    title: b.child_page.title,
  };
};

/**
 * Handle child database block
 */
export const handleChildDatabase =
  (block: () => ChildDatabaseBlockObjectResponse) =>
  async (f: () => Client) => {
    const b = block();

    const pages = await getRawDatabase(b.id)(f)
      .then((d) => {
        if (d) {
          return getDatabasePages(d?.data_sources[0].id)(f);
        }

        return [];
      })
      .then((pages) => {
        return pages.map((p) => ({
          id: p.id,
          cover: p.cover,
          icon: p.icon,
          url: p.url,
          publicUrl: p.public_url,
          properties: p.properties,
        }));
      })
      .then((pages) => {
        return Promise.all(
          pages.map((p) => {
            return getPageContent(p.id)(f).then((blocks) => ({
              ...p,
              blocks,
            }));
          }),
        );
      })
      .then((pages) => pages as Page[]);

    return {
      id: b.id,
      title: b.child_database.title,
      pages,
    } satisfies Database;
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
