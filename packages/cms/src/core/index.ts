// Core exports
export { NotionApi, createNotionApi } from "./main";

// Page functions - both standard and paginated
export { getPagePaginated, getPageBlocksPaginated, runPage } from "./page";

// Notion API functions - both standard and paginated
export {
  getNotionClient,
  getRawDatabase,
  getDatabasePages,
  getDatabasePagesPaginated,
  getRawPage,
  getBlocks,
} from "./notion";


// Types
export * from "./types";

// Utilities (optional - for advanced use cases)
export { escapeHtml } from "./plugins/html";

// Block handlers (for advanced use cases)
export {
  getBlockContent,
  getBlockContentRecursively,
  BlockProcessingError,
} from "./blocks";
