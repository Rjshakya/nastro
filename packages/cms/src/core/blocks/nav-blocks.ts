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
import type {
  ChildDatabaseContent,
  ChildPageContent,
  LinkToPageContent,
  Page,
  PageContentOnly,
  PageHeader,
  PageBlock,
  PageBlockContentOnly,
} from "../types";
import { getDatabasePages, getRawDatabase, getRawPage } from "../notion";
import { getPageBlocks } from "../page";
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

    // Collect all pages from the async generator
    const pageHeaders: PageHeader[] = [];
    const pagesGenerator = getDatabasePages(rawDb.data_sources[0].id)(f);

    for await (const page of pagesGenerator) {
      pageHeaders.push(extractPageMetaData(page));
    }

    // Fetch blocks for each page
    const pagesWithBlocks = await Promise.all(
      pageHeaders.map(async (page) => {
        const blocks: (PageBlock | PageBlockContentOnly)[] = [];
        const blockGenerator = getPageBlocks({ pageId: page.id, contentOnly })(f);

        for await (const block of blockGenerator) {
          blocks.push(block);
        }

        return {
          ...page,
          blocks: blocks as PageBlock[] | PageBlockContentOnly[],
        };
      }),
    );

    return {
      pages: pagesWithBlocks as Page[] | PageContentOnly[],
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
