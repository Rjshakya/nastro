import type { SiteTableSelect } from "server/domain";
import type { SiteSetting } from "./site.setting";

export type Site = Omit<SiteTableSelect, "createdAt" | "updatedAt" | "setting"> & {
  createdAt: string;
  updatedAt: string;
  setting: SiteSetting;
};

export interface Header {}
