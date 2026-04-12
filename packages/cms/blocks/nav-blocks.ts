/**
 * Navigation block handlers
 * Child Page, Child Database, Link to Page
 */

import type {
  ChildPageBlockObjectResponse,
  ChildDatabaseBlockObjectResponse,
  LinkToPageBlockObjectResponse,
} from "@notionhq/client";
import type {
  ChildPageContent,
  ChildDatabaseContent,
  LinkToPageContent,
} from "../types.js";

/**
 * Handle child page block
 */
export const handleChildPage =
  (block: () => ChildPageBlockObjectResponse) => (): ChildPageContent => {
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
  (): ChildDatabaseContent => {
    const b = block();

    return {
      title: b.child_database.title,
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
