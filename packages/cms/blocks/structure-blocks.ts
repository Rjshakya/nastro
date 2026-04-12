/**
 * Structure block handlers
 * Column List, Column, Divider, Breadcrumb, Table of Contents
 */

import type {
  ColumnListBlockObjectResponse,
  ColumnBlockObjectResponse,
  DividerBlockObjectResponse,
  BreadcrumbBlockObjectResponse,
  TableOfContentsBlockObjectResponse,
} from "@notionhq/client";
import type { DividerContent } from "../types.js";

/**
 * Handle column list block
 * Content is empty, children (columns) hold the actual content
 */
export const handleColumnList =
  (block: () => ColumnListBlockObjectResponse) => (): Record<string, never> => {
    return {};
  };

/**
 * Handle column block
 * Content is empty, children hold the actual content
 */
export const handleColumn =
  (block: () => ColumnBlockObjectResponse) => (): Record<string, never> => {
    return {};
  };

/**
 * Handle divider block
 */
export const handleDivider =
  (block: () => DividerBlockObjectResponse) => (): DividerContent => {
    return {};
  };

/**
 * Handle breadcrumb block
 */
export const handleBreadcrumb =
  (block: () => BreadcrumbBlockObjectResponse) => (): Record<string, never> => {
    return {};
  };

/**
 * Handle table of contents block
 */
export const handleTableOfContents =
  (block: () => TableOfContentsBlockObjectResponse) =>
  (): Record<string, never> => {
    return {};
  };
