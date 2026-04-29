import type { ThemeTableSelect } from "server/domain";
import type { ThemeConfig, TypographyConfig } from "./site.setting";

export interface ThemeSetting {
  theme: ThemeConfig;
  darkTheme: ThemeConfig;
  typography: TypographyConfig;
}

export type Theme = Omit<
  ThemeTableSelect,
  "createdAt" | "updatedAt" | "setting"
> & {
  createdAt: string;
  updatedAt: string;
  setting: ThemeSetting;
};
