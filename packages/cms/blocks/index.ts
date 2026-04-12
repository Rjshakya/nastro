/**
 * Main block dispatcher
 * Routes blocks to appropriate handlers and manages recursive children processing
 */

/**
 *
 *
 * getBlock(blockId)(token)
 *  --> get the block
 *  --> create res = {...block}
 *  --> process/simplify the block
 *  --> check block.has_children
 *  --> if true then res.children = getBlock(child.id)(token)
 *
 *  --> return res
 *
 *  --> after fetching the content
 *  --> then we pass handleBlocks or processBlocks functions
 *  --> and last return res
 *
 */

import { Result } from "better-result";
import type { BlockObjectResponse } from "@notionhq/client";
import type { ProcessedBlock } from "../types.js";
import { hasChildren } from "./utils.js";

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

import {
  handleImage,
  handleVideo,
  handleAudio,
  handlePdf,
  handleFile,
} from "./media-blocks.js";

import {
  handleEmbed,
  handleBookmark,
  handleLinkPreview,
} from "./embed-blocks.js";

import { handleTable, handleTableRow } from "./table-blocks.js";

import {
  handleColumnList,
  handleColumn,
  handleDivider,
  handleBreadcrumb,
  handleTableOfContents,
} from "./structure-blocks.js";

import {
  handleChildPage,
  handleChildDatabase,
  handleLinkToPage,
} from "./nav-blocks.js";

import {
  handleCode,
  handleEquation,
  handleTemplate,
  handleSyncedBlock,
  handleUnsupported,
} from "./special-blocks.js";

/**
 * Type for function that fetches child blocks
 * Returns a Result type for error handling
 */
export type FetchChildrenFn = (
  blockId: string,
) => Promise<Result<BlockObjectResponse[], Error>>;

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
 * Process a single block and return processed content
 * Uses currying pattern: (block) => (fetchChildren) => Result<ProcessedBlock, Error>
 */
export const processBlock =
  (block: () => BlockObjectResponse) =>
  (fetchChildren: FetchChildrenFn) =>
  async (): Promise<Result<ProcessedBlock, Error>> => {
    try {
      const b = block();
      const blockId = b.id;
      const blockType = b.type;
      const hasChildBlocks = hasChildren(b);

      let content: unknown;

      // Route to appropriate handler based on block type
      switch (blockType) {
        case "paragraph":
          content = handleParagraph(
            () => b as Extract<typeof b, { type: "paragraph" }>,
          )();
          break;

        case "heading_1":
          content = handleHeading1(
            () => b as Extract<typeof b, { type: "heading_1" }>,
          )();
          break;

        case "heading_2":
          content = handleHeading2(
            () => b as Extract<typeof b, { type: "heading_2" }>,
          )();
          break;

        case "heading_3":
          content = handleHeading3(
            () => b as Extract<typeof b, { type: "heading_3" }>,
          )();
          break;

        case "bulleted_list_item":
          content = handleBulletedListItem(
            () => b as Extract<typeof b, { type: "bulleted_list_item" }>,
          )();
          break;

        case "numbered_list_item":
          content = handleNumberedListItem(
            () => b as Extract<typeof b, { type: "numbered_list_item" }>,
          )();
          break;

        case "quote":
          content = handleQuote(
            () => b as Extract<typeof b, { type: "quote" }>,
          )();
          break;

        case "to_do":
          content = handleToDo(
            () => b as Extract<typeof b, { type: "to_do" }>,
          )();
          break;

        case "toggle":
          content = handleToggle(
            () => b as Extract<typeof b, { type: "toggle" }>,
          )();
          break;

        case "callout":
          content = handleCallout(
            () => b as Extract<typeof b, { type: "callout" }>,
          )();
          break;

        case "image":
          content = handleImage(
            () => b as Extract<typeof b, { type: "image" }>,
          )();
          break;

        case "video":
          content = handleVideo(
            () => b as Extract<typeof b, { type: "video" }>,
          )();
          break;

        case "audio":
          content = handleAudio(
            () => b as Extract<typeof b, { type: "audio" }>,
          )();
          break;

        case "pdf":
          content = handlePdf(() => b as Extract<typeof b, { type: "pdf" }>)();
          break;

        case "file":
          content = handleFile(
            () => b as Extract<typeof b, { type: "file" }>,
          )();
          break;

        case "embed":
          content = handleEmbed(
            () => b as Extract<typeof b, { type: "embed" }>,
          )();
          break;

        case "bookmark":
          content = handleBookmark(
            () => b as Extract<typeof b, { type: "bookmark" }>,
          )();
          break;

        case "link_preview":
          content = handleLinkPreview(
            () => b as Extract<typeof b, { type: "link_preview" }>,
          )();
          break;

        case "code":
          content = handleCode(
            () => b as Extract<typeof b, { type: "code" }>,
          )();
          break;

        case "equation":
          content = handleEquation(
            () => b as Extract<typeof b, { type: "equation" }>,
          )();
          break;

        case "table":
          content = handleTable(
            () => b as Extract<typeof b, { type: "table" }>,
          )();
          break;

        case "table_row":
          content = handleTableRow(
            () => b as Extract<typeof b, { type: "table_row" }>,
          )();
          break;

        case "column_list":
          content = handleColumnList(
            () => b as Extract<typeof b, { type: "column_list" }>,
          )();
          break;

        case "column":
          content = handleColumn(
            () => b as Extract<typeof b, { type: "column" }>,
          )();
          break;

        case "divider":
          content = handleDivider(
            () => b as Extract<typeof b, { type: "divider" }>,
          )();
          break;

        case "breadcrumb":
          content = handleBreadcrumb(
            () => b as Extract<typeof b, { type: "breadcrumb" }>,
          )();
          break;

        case "table_of_contents":
          content = handleTableOfContents(
            () => b as Extract<typeof b, { type: "table_of_contents" }>,
          )();
          break;

        case "child_page":
          content = handleChildPage(
            () => b as Extract<typeof b, { type: "child_page" }>,
          )();
          break;

        case "child_database":
          content = handleChildDatabase(
            () => b as Extract<typeof b, { type: "child_database" }>,
          )();
          break;

        case "link_to_page":
          content = handleLinkToPage(
            () => b as Extract<typeof b, { type: "link_to_page" }>,
          )();
          break;

        case "template":
          content = handleTemplate(
            () => b as Extract<typeof b, { type: "template" }>,
          )();
          break;

        case "synced_block":
          content = handleSyncedBlock(
            () => b as Extract<typeof b, { type: "synced_block" }>,
          )();
          break;

        case "unsupported":
          content = handleUnsupported(
            () => b as Extract<typeof b, { type: "unsupported" }>,
          )();
          break;

        default:
          // Exhaustive check - if we reach here, Notion added a new block type
          content = { type: blockType };
      }

      const result: ProcessedBlock = {
        id: blockId,
        type: blockType,
        content,
        hasChildren: hasChildBlocks,
      };

      // Recursively fetch children if present
      if (hasChildBlocks) {
        const childBlocksResult = await fetchChildren(blockId);

        if (childBlocksResult.isErr()) {
          return Result.err(
            new BlockProcessingError(
              `Failed to fetch children: ${childBlocksResult.error.message}`,
              blockId,
              blockType,
            ),
          );
        }

        const childBlocks = childBlocksResult.value;
        const processedChildrenResults = await Promise.all(
          childBlocks.map((child) =>
            processBlock(() => child)(fetchChildren)(),
          ),
        );

        // Check if any child processing failed
        const processedChildren: ProcessedBlock[] = [];
        for (const childResult of processedChildrenResults) {
          if (childResult.isErr()) {
            return childResult;
          }
          processedChildren.push(childResult.value);
        }

        result.children = processedChildren;
      }

      return Result.ok(result);
    } catch (error) {
      return Result.err(
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

/**
 * Process multiple blocks
 */
export const processBlocks =
  (blocks: () => BlockObjectResponse[]) =>
  (fetchChildren: FetchChildrenFn) =>
  async (): Promise<Result<ProcessedBlock[], Error>> => {
    try {
      const blockArray = blocks();
      const results = await Promise.all(
        blockArray.map((block) => processBlock(() => block)(fetchChildren)()),
      );

      // Check if any block processing failed
      const processedBlocks: ProcessedBlock[] = [];
      for (const result of results) {
        if (result.isErr()) {
          return Result.err(result.error);
        }
        processedBlocks.push(result.value);
      }

      return Result.ok(processedBlocks);
    } catch (error) {
      return Result.err(
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };
