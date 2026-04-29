import type { PopulatedSiteSetting } from "@/types/site.setting";
import type { ThemeSetting } from "@/types/theme";

export function getThemeRelatedSettingsOnly(
  settings: PopulatedSiteSetting,
): ThemeSetting {
  return {
    theme: settings.theme,
    darkTheme: settings.darkTheme,
    typography: settings.typography,
  };
}
