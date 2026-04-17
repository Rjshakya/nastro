/**
 * Main block dispatcher
 * Routes blocks to appropriate handlers and manages block content transformation
 */

import type { BlockObjectResponse, Client } from "@notionhq/client";
import type {
  BlockContent,
  PageBlock,
} from "../types.js";

// Import all handlers
import {
  handleParagraph,
  handleHeading1,
  handleHeading2,
  handleHeading3,
  handleQuote,
  handleCallout,
} from "./text-blocks.js";

import {
  handleBulletedListItem,
  handleNumberedListItem,
  handleToDo,
  handleToggle,
} from "./list-blocks.js";

import { handleImage, handleVideo, handleAudio, handlePdf, handleFile } from "./media-blocks.js";

import { handleEmbed, handleBookmark, handleLinkPreview } from "./embed-blocks.js";

import { handleTable, handleTableRow } from "./table-blocks.js";

import {
  handleColumnList,
  handleColumn,
  handleDivider,
  handleBreadcrumb,
  handleTableOfContents,
} from "./structure-blocks.js";

import { handleChildPage, handleChildDatabase, handleLinkToPage } from "./nav-blocks.js";

import {
  handleCode,
  handleEquation,
  handleTemplate,
  handleSyncedBlock,
  handleUnsupported,
} from "./special-blocks.js";
import { getPageBlocksPaginated } from "../page.js";

/**
 * Type for function that fetches child blocks
 */
export type FetchChildrenFn = (blockId: string) => Promise<BlockObjectResponse[]>;

/**
 * Error type for block processing failures
 */
export class BlockProcessingError extends Error {
  constructor(
    message: string,
    public readonly blockId: string,
    public readonly blockType: string,
  ) {
    super(message);
    this.name = "BlockProcessingError";
  }
}

/**
 * Process a single block and return its content
 * Uses currying pattern: (block) => () => Content
 * This transforms Notion block to our simplified content format
 */
export const getBlockContent =
  (block: () => BlockObjectResponse, contentOnly?: boolean) =>
  async (f: () => Client): Promise<BlockContent> => {
    const b = block();
    const blockType = b.type;

    // Route to appropriate handler based on block type
    switch (blockType) {
      case "paragraph":
        return handleParagraph(() => b as Extract<typeof b, { type: "paragraph" }>)();

      case "heading_1":
        return handleHeading1(() => b as Extract<typeof b, { type: "heading_1" }>)();

      case "heading_2":
        return handleHeading2(() => b as Extract<typeof b, { type: "heading_2" }>)();

      case "heading_3":
        return handleHeading3(() => b as Extract<typeof b, { type: "heading_3" }>)();

      case "bulleted_list_item":
        return handleBulletedListItem(
          () => b as Extract<typeof b, { type: "bulleted_list_item" }>,
        )();

      case "numbered_list_item":
        return handleNumberedListItem(
          () => b as Extract<typeof b, { type: "numbered_list_item" }>,
        )();

      case "quote":
        return handleQuote(() => b as Extract<typeof b, { type: "quote" }>)();

      case "to_do":
        return handleToDo(() => b as Extract<typeof b, { type: "to_do" }>)();

      case "toggle":
        return handleToggle(() => b as Extract<typeof b, { type: "toggle" }>)();

      case "callout":
        return handleCallout(() => b as Extract<typeof b, { type: "callout" }>)();

      case "image":
        return handleImage(() => b as Extract<typeof b, { type: "image" }>)();

      case "video":
        return handleVideo(() => b as Extract<typeof b, { type: "video" }>)();

      case "audio":
        return handleAudio(() => b as Extract<typeof b, { type: "audio" }>)();

      case "pdf":
        return handlePdf(() => b as Extract<typeof b, { type: "pdf" }>)();

      case "file":
        return handleFile(() => b as Extract<typeof b, { type: "file" }>)();

      case "embed":
        return handleEmbed(() => b as Extract<typeof b, { type: "embed" }>)();

      case "bookmark":
        return handleBookmark(() => b as Extract<typeof b, { type: "bookmark" }>)();

      case "link_preview":
        return handleLinkPreview(() => b as Extract<typeof b, { type: "link_preview" }>)();

      case "code":
        return handleCode(() => b as Extract<typeof b, { type: "code" }>)();

      case "equation":
        return handleEquation(() => b as Extract<typeof b, { type: "equation" }>)();

      case "table":
        return handleTable(() => b as Extract<typeof b, { type: "table" }>)();

      case "table_row":
        return handleTableRow(() => b as Extract<typeof b, { type: "table_row" }>)();

      case "column_list":
        return handleColumnList(() => b as Extract<typeof b, { type: "column_list" }>)();

      case "column":
        return handleColumn(() => b as Extract<typeof b, { type: "column" }>)();

      case "divider":
        return handleDivider(() => b as Extract<typeof b, { type: "divider" }>)();

      case "breadcrumb":
        return handleBreadcrumb(() => b as Extract<typeof b, { type: "breadcrumb" }>)();

      case "table_of_contents":
        return handleTableOfContents(() => b as Extract<typeof b, { type: "table_of_contents" }>)();

      case "child_page":
        return await handleChildPage(() => b as Extract<typeof b, { type: "child_page" }>)(f);

      case "child_database":
        return await handleChildDatabase(
          () => b as Extract<typeof b, { type: "child_database" }>,
          contentOnly,
        )(f);

      case "link_to_page":
        return handleLinkToPage(() => b as Extract<typeof b, { type: "link_to_page" }>)();

      case "template":
        return handleTemplate(() => b as Extract<typeof b, { type: "template" }>)();

      case "synced_block":
        return handleSyncedBlock(() => b as Extract<typeof b, { type: "synced_block" }>)();

      case "unsupported":
        return handleUnsupported(() => b as Extract<typeof b, { type: "unsupported" }>)();

      default:
        // Exhaustive check - if we reach here, Notion added a new block type
        return { type: blockType };
    }
  };

export function getBlockContentRecursively(block: BlockObjectResponse) {
  return async (f: () => Client): Promise<PageBlock> => {
    const blockContent = await getBlockContent(() => block)(f);
    const result: PageBlock = {
      id: block.id,
      type: block.type,
      content: blockContent,
      hasChildren: block.has_children,
    };

    if (!block.has_children) {
      //  process the block without children
      return result;
    }

    // Collect all child blocks from the async generator
    const { blocks: childBlocks } = await getPageBlocksPaginated({
      pageId: block.id,
    })(f);

    result.childBlocks = childBlocks as PageBlock[];
    return result;
  };
}
