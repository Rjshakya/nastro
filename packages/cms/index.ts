/**
 * CMS Module - Notion Content Management
 *
 * This module provides functionality to fetch and process content from Notion.
 * Simplified architecture with recursive block processing.
 *
 * @example
 * ```typescript
 * import { run } from "@nastro/cms";
 *
 * const result = await run(token)(pageId);
 * console.log(result.blocks); // All blocks including deeply nested ones
 * ```
 */

// Main exports
export { run, getPage, getBlocks, processPage } from "./main.ts";

// Block processing
export {
  processBlock,
  // processBlocks,
  BlockProcessingError,
} from "./blocks/index.ts";
export type { FetchChildrenFn } from "./blocks/index.ts";

// Utilities
export { extractRichText, hasChildren } from "./blocks/utils.ts";

// Type definitions
export type {
  RichText,
  ProcessedBlock,
  ProcessPageResult,
  ProcessPage,
  ParagraphContent,
  HeadingContent,
  QuoteContent,
  CalloutContent,
  ListItemContent,
  ToDoContent,
  ToggleContent,
  MediaContent,
  CodeContent,
  EquationContent,
  TableContent,
  TableRowContent,
  ChildPageContent,
  ChildDatabaseContent,
  LinkToPageContent,
  EmbedContent,
  BookmarkContent,
  DividerContent,
  UnsupportedContent,
} from "./types.ts";
