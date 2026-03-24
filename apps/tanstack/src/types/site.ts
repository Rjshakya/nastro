import type { NotionPageSettings } from "./notion-page-settings";

export interface Site {
  id: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  pageId: string | null;
  slug: string;
  databaseId: string | null;
  shortId: string;
  siteName: string;
  siteSetting: NotionPageSettings | null;
}

export interface Header {}
