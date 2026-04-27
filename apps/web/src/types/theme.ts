import type { ThemeTableSelect } from "server/domain";
import type { ThemeConfig } from "./setting";

export type Theme = Omit<ThemeTableSelect, "createdAt" | "updatedAt" | "setting"> & {
  createdAt: string;
  updatedAt: string;
  setting: ThemeConfig;
};
