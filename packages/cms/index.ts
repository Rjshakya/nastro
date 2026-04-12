/**
 * CMS Module - Notion Content Management
 *
 * This module provides functionality to fetch and process content from Notion.
 * Uses better-result for type-safe error handling with TaggedError.
 *
 * @example
 * ```typescript
 * import { run, NotionApiError, FileSystemError } from "@nastro/cms";
 *
 * const result = await run(token)(sourceId, "page");
 *
 * result.match({
 *   ok: (data) => console.log("Success:", data),
 *   err: (error) => {
 *     if (NotionApiError.is(error)) {
 *       console.error("Notion API error:", error.message);
 *     } else if (FileSystemError.is(error)) {
 *       console.error("File system error:", error.message);
 *     }
 *   },
 * });
 * ```
 */

// Main exports
export {
  run,
  getPage,
  getBlock,
  getDB,
  getDSPages,
  createFetchChildren,
  createLocalFile,
  processDatabaseSource,
  processPageSource,
} from "./main.ts";

// Error types
export {
  NotionApiError,
  FileSystemError,
  DataSourceNotFoundError,
  DatabaseDataSourceError,
} from "./errors.ts";
export type { CmsError } from "./errors.ts";

// Block processing
export {
  processBlock,
  processBlocks,
  BlockProcessingError,
} from "./blocks/index.ts";
export type { FetchChildrenFn } from "./blocks/index.ts";

// Utilities
export { extractRichText, hasChildren } from "./blocks/utils.ts";

// Type definitions
export type {
  RichText,
  ProcessedBlock,
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
