/**
 * Output types for processed Notion blocks
 * Pure content only - no metadata
 */

import type {
  PageObjectResponse,
  RichTextItemResponse,
} from "@notionhq/client";

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
  fullText: string;
}

export interface HeadingContent {
  level: 1 | 2 | 3;
  text: RichText[];
  fullText: string;
}

export interface QuoteContent {
  text: RichText[];
  fullText: string;
}

export interface CalloutContent {
  text: RichText[];
  icon: PageIcon;
  fullText: string;
}

// List blocks
export interface ListItemContent {
  text: RichText[];
  fullText: string;
}

export interface ToDoContent {
  text: RichText[];
  checked: boolean;
  fullText: string;
}

export interface ToggleContent {
  text: RichText[];
  fullText: string;
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
export type ChildPageContent = {
  title: string;
};

export interface ChildDatabaseContent {
  pages: Page[];
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
  childBlocks?: PageBlock[];
};

export type PageBlockContentOnly = {
  content: unknown;
  childBlocks?: PageBlockContentOnly[];
};

export type PageIcon =
  | {
      type: "emoji" | "external" | "file";
      value: string;
    }
  | {
      type: "custom_emoji";
      value: string;
      name: string;
    }
  | null;

export type PageTitle = {
  text: RichTextItemResponse[];
  fullText: string;
};

export type PageHeader = {
  id: string;
  title: PageTitle;
  icon: PageIcon;
  cover: string | null;
  url: PageObjectResponse["url"];
  publicUrl: PageObjectResponse["public_url"];
  properties: PageObjectResponse["properties"];
};

export type Page = PageHeader & {
  blocks: PageBlock[];
};

export type PageContentOnly = PageHeader & {
  blocks: PageBlockContentOnly[];
};

export type SimpleBlock = {
  content: string | null;
};

export type Database = {
  id: string;
  title: string;
  pages: Page[];
};
