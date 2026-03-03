import type { NotionCustomization } from "./customization";

export interface SiteSetting {
  seo?: {
    title?: string;
    description?: string;
    ogImage?: string;
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
  userId: string;
  pageId: string | null;
  databaseId: string | null;
  shortId: string;
  siteName: string;
  siteSetting: SiteSetting | null;
  createdAt: string;
  updatedAt: string;
}
