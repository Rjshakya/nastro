import type { NotionPageSettings } from "./notion-page-settings";

export type Template = {
  id: string;
  createdBy: string;
  pageId: string;
  slug: string;
  databaseId: string | null;
  shortId: string;
  templateName: string;
  templateSetting: NotionPageSettings | null;
  isPaid: boolean | null;
  createdAt: string;
  updatedAt: string;
};
