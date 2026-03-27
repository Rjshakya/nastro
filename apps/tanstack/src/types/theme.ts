import type { NotionPageSettings } from "./notion-page-settings";

export type Theme = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  isPublic: boolean | null;
  themeSetting: Omit<NotionPageSettings, "seo">;
};
