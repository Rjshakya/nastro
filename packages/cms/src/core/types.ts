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
  url: string;
  publicUrl: string | null;
  icon: PageIcon;
};

export interface ChildDatabaseContent {
  pages: Page[] | PageContentOnly[];
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

// Structure blocks (no content, children hold the data)
export interface ColumnListContent {
  type: "column_list";
}

export interface ColumnContent {
  type: "column";
}

export interface BreadcrumbContent {
  type: "breadcrumb";
}

export interface TableOfContentsContent {
  type: "table_of_contents";
}

// Special blocks
export interface TemplateContent {
  type: "template";
}

export interface SyncedBlockContent {
  type: "synced_block";
}

export interface DividerContent {
  type: "divider";
}

export interface UnsupportedContent {
  type: string;
}

export type BlockContent =
  | ParagraphContent
  | HeadingContent
  | QuoteContent
  | CalloutContent
  | ListItemContent
  | ToDoContent
  | ToggleContent
  | MediaContent
  | CodeContent
  | EquationContent
  | TableContent
  | TableRowContent
  | ChildPageContent
  | ChildDatabaseContent
  | LinkToPageContent
  | EmbedContent
  | BookmarkContent
  | ColumnListContent
  | ColumnContent
  | BreadcrumbContent
  | TableOfContentsContent
  | TemplateContent
  | SyncedBlockContent
  | DividerContent
  | UnsupportedContent;

export type PageBlock = {
  id: string;
  type: string;
  content: BlockContent;
  hasChildren: boolean;
  childBlocks?: PageBlock[];
};

export type PageBlockContentOnly = {
  type: string;
  content: BlockContent;
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
  nextCursor?: string;
};

export type PageContentOnly = PageHeader & {
  blocks: PageBlockContentOnly[];
  nextCursor?: string;
};

export type Database = {
  id: string;
  title: string;
  pages: Page[];
};
