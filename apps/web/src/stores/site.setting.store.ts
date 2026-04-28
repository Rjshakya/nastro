import { create } from "zustand";
import type {
  SiteSetting,
  ThemeConfig,
  TypographyConfig,
  LayoutConfig,
  SeoConfig,
  AnalyticsConfig,
  GeneralConfig,
  PopulatedSiteSetting,
} from "@/types/site.setting";
import type { Theme } from "@/types/theme";
import type { CSSProperties } from "react";
import { computeStyles } from "../lib/compute-styles";
import { getDefaultSettings } from "@/lib/default-settings";
import { getThemeRelatedSettingsOnly } from "@/lib/theme-settings";

function settingsEqual(a: PopulatedSiteSetting, b: PopulatedSiteSetting): boolean {
  return (
    JSON.stringify(getThemeRelatedSettingsOnly(a)) ===
    JSON.stringify(getThemeRelatedSettingsOnly(b))
  );
}

interface SiteSettingStore {
  settings: PopulatedSiteSetting;
  isDark: boolean;
  styles: CSSProperties;
  appliedTheme: Theme | null;
  hasThemeChanged: boolean;

  setSettings: (settings: SiteSetting) => void;

  updateTheme: (theme: ThemeConfig) => void;
  updateDarkTheme: (darkTheme: ThemeConfig) => void;
  updateTypography: (typography: TypographyConfig) => void;
  updateLayout: (layout: LayoutConfig) => void;
  updateSeo: (seo: SeoConfig) => void;
  updateAnalytics: (analytics: AnalyticsConfig) => void;
  updateGeneral: (general: GeneralConfig) => void;

  applyTheme: (theme: Theme) => void;

  setIsDark: (isDark: boolean) => void;

  reset: () => void;
}

const defaultSettings = getDefaultSettings({});
export const useSiteSettingStore = create<SiteSettingStore>((set, get) => ({
  settings: defaultSettings,
  isDark: defaultSettings.general.isDark,
  styles: computeStyles(defaultSettings, defaultSettings.general.isDark ? "dark" : "light"),
  appliedTheme: null,
  hasThemeChanged: false,

  setSettings(settings) {
    const withDefaults = getDefaultSettings(settings);
    const isDark = withDefaults.general.isDark;
    const styles = computeStyles(withDefaults, isDark ? "dark" : "light");
    set({ settings: withDefaults, isDark, styles });
  },

  updateTheme(theme) {
    const next = { ...get().settings, theme };
    get().setSettings(next);
    const applied = get().appliedTheme;
    if (applied) {
      const changed = !settingsEqual(getDefaultSettings(next), getDefaultSettings(applied.setting));
      set({ hasThemeChanged: changed });
    }
  },

  updateDarkTheme(darkTheme) {
    const next = { ...get().settings, darkTheme };
    get().setSettings(next);
    const applied = get().appliedTheme;
    if (applied) {
      const changed = !settingsEqual(getDefaultSettings(next), getDefaultSettings(applied.setting));
      set({ hasThemeChanged: changed });
    }
  },

  updateTypography(typography) {
    const next = { ...get().settings, typography };
    get().setSettings(next);
    const applied = get().appliedTheme;
    if (applied) {
      const changed = !settingsEqual(getDefaultSettings(next), getDefaultSettings(applied.setting));
      set({ hasThemeChanged: changed });
    }
  },

  updateLayout(layout) {
    get().setSettings({ ...get().settings, layout });
  },

  updateSeo(seo) {
    get().setSettings({ ...get().settings, seo });
  },

  updateAnalytics(analytics) {
    get().setSettings({ ...get().settings, analytics });
  },

  updateGeneral(general) {
    get().setSettings({ ...get().settings, general });
  },

  applyTheme(theme) {
    const currentSettings = get().settings;
    const merged = getDefaultSettings({
      ...currentSettings,
      theme: theme.setting.theme,
      darkTheme: theme.setting.darkTheme,
      typography: theme.setting.typography,
    });
    const isDark = merged.general.isDark;
    const styles = computeStyles(merged, isDark ? "dark" : "light");
    set({ settings: merged, isDark, styles, appliedTheme: theme, hasThemeChanged: false });
  },

  setIsDark(isDark) {
    const settings = { ...get().settings, general: { ...get().settings.general, isDark } };
    const styles = computeStyles(settings, isDark ? "dark" : "light");
    set({ isDark, settings: getDefaultSettings(settings), styles });
  },

  reset() {
    const settings = getDefaultSettings({});
    const styles = computeStyles(settings, "light");
    set({ settings, isDark: false, styles, appliedTheme: null, hasThemeChanged: false });
  },
}));

interface SiteSettingPanel {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const useSiteSettingPanel = create<SiteSettingPanel>((set) => ({
  open: false,
  onOpenChange: (v) => set({ open: v }),
}));
