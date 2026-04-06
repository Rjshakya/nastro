import {
  defaultDarkThemeSettings,
  defaultThemeSettings,
  defaultTypographySettings,
} from "#/lib/settings-defaults";
import type { NotionPageSettings } from "#/types/notion-page-settings";

export const getThemeRelatedSettingsOnly = (
  settings: NotionPageSettings,
): NotionPageSettings => {
  const theme = defaultThemeSettings(settings?.theme);
  const darkTheme = defaultDarkThemeSettings(settings?.darkTheme);
  const typography = defaultTypographySettings(settings?.typography);
  const general: NotionPageSettings["general"] = {
    type: "general",
    isDark: settings?.general?.isDark,
  };

  return {
    general,
    typography,
    darkTheme,
    theme,
  };
};
