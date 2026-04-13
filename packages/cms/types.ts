/**
 * Output types for processed Notion blocks
 * Pure content only - no metadata
 */

import type { PageObjectResponse } from "@notionhq/client";

export interface RichText {
  text: string;
  href: string | null;
}

export interface ProcessedBlock {
  id: string;
  type: string;
  content: unknown;
  hasChildren: boolean;
  children?: ProcessedBlock[];
}

// Text blocks
export interface ParagraphContent {
  text: RichText[];
}

export interface HeadingContent {
  level: 1 | 2 | 3;
  text: RichText[];
}

export interface QuoteContent {
  text: RichText[];
}

export interface CalloutContent {
  text: RichText[];
  icon: string | null;
}

// List blocks
export interface ListItemContent {
  text: RichText[];
}

export interface ToDoContent {
  text: RichText[];
  checked: boolean;
}

export interface ToggleContent {
  text: RichText[];
}

// Media blocks
export interface MediaContent {
  url: string;
  caption: RichText[];
}

// Code block
export interface CodeContent {
  code: string;
  language: string;
  caption: RichText[];
}

// Equation block
export interface EquationContent {
  expression: string;
}

// Table blocks
export interface TableContent {
  width: number;
  hasColumnHeader: boolean;
  hasRowHeader: boolean;
}

export interface TableRowContent {
  cells: RichText[][];
}

// Navigation blocks
export interface ChildPageContent {
  id: string;
}

export interface ChildDatabaseContent {
  id: string;
}

export interface LinkToPageContent {
  type: "page_id" | "database_id" | "comment_id";
  id: string;
}

// Embed blocks
export interface EmbedContent {
  url: string;
}

export interface BookmarkContent {
  url: string;
  caption: RichText[];
}

// Special blocks
export interface DividerContent {
  // No content
}

export interface UnsupportedContent {
  type: string;
}

// Page processing result
export interface ProcessPageResult {
  id: string;
  cover: { url: string } | null;
  icon: { url: string } | null;
  url: string;
  publicUrl: string | null;
  properties: PageObjectResponse["properties"];
  blocks: ProcessedBlock[];
}

// ProcessPage function type
export type ProcessPage = (
  pageId: string,
) => (token: string) => Promise<ProcessPageResult>;

export type PageBlock = {
  id: string;
  type: string;
  content: unknown;
  hasChildren: boolean;
  childblocks?: PageBlock[];
};

export type Page = {
  id: string;
  cover: PageObjectResponse["cover"];
  icon: PageObjectResponse["icon"];
  url: PageObjectResponse["url"];
  publicUrl: PageObjectResponse["public_url"];
  properties: PageObjectResponse["properties"];
  blocks: PageBlock[];
};

export type Database = {
  id: string;
  title: string;
  pages: Page[];
};
