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
import type {
  ColumnListContent,
  ColumnContent,
  DividerContent,
  BreadcrumbContent,
  TableOfContentsContent,
} from "../types.js";

/**
 * Handle column list block
 * Content is empty, children (columns) hold the actual content
 */
export const handleColumnList =
  (block: () => ColumnListBlockObjectResponse) => (): ColumnListContent => {
    return { type: "column_list" };
  };

/**
 * Handle column block
 * Content is empty, children hold the actual content
 */
export const handleColumn =
  (block: () => ColumnBlockObjectResponse) => (): ColumnContent => {
    return { type: "column" };
  };

/**
 * Handle divider block
 */
export const handleDivider =
  (block: () => DividerBlockObjectResponse) => (): DividerContent => {
    return { type: "divider" };
  };

/**
 * Handle breadcrumb block
 */
export const handleBreadcrumb =
  (block: () => BreadcrumbBlockObjectResponse) => (): BreadcrumbContent => {
    return { type: "breadcrumb" };
  };

/**
 * Handle table of contents block
 */
export const handleTableOfContents =
  (block: () => TableOfContentsBlockObjectResponse) =>
  (): TableOfContentsContent => {
    return { type: "table_of_contents" };
  };
