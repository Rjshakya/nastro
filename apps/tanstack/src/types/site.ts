import type { NotionCustomization, NotionPageSettings } from "./customization";

export interface SiteSetting {
  seo?: {
    title?: string;
    description?: string;
    ogImage?: string;
    pageUrl?: string;
    pageTitle?: string;
  };
  header?: {
    show: boolean;
    customNavLinks?: Array<{ label: string; url: string }>;
  };
  footer?: {
    show: boolean;
    content?: string;
  };
  notionCustomization?: NotionCustomization;
}

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
