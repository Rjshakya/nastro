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
import type { CSSProperties } from "react";
import { computeStyles } from "../lib/compute-styles";
import { getDefaultSettings } from "@/lib/default-settings";
import { loadSiteFonts } from "@/lib/fonts";

interface SiteSettingStore {
  settings: PopulatedSiteSetting;
  isDark: boolean;
  styles: CSSProperties;

  setSettings: (settings: SiteSetting) => void;

  updateTheme: (theme: ThemeConfig) => void;
  updateDarkTheme: (darkTheme: ThemeConfig) => void;
  updateTypography: (typography: TypographyConfig) => void;
  updateLayout: (layout: LayoutConfig) => void;
  updateSeo: (seo: SeoConfig) => void;
  updateAnalytics: (analytics: AnalyticsConfig) => void;
  updateGeneral: (general: GeneralConfig) => void;

  setIsDark: (isDark: boolean) => void;

  reset: (currentSettings?: SiteSetting) => void;
}

const defaultSettings = getDefaultSettings({});
export const useSiteSettingStore = create<SiteSettingStore>((set, get) => ({
  settings: defaultSettings,
  isDark: defaultSettings.general.isDark,
  styles: computeStyles(
    defaultSettings,
    defaultSettings.general.isDark ? "dark" : "light",
  ),

  setSettings(settings) {
    const withDefaults = getDefaultSettings(settings);
    const isDark = withDefaults.general.isDark;
    const styles = computeStyles(withDefaults, isDark ? "dark" : "light");
    loadSiteFonts(settings);
    set({ settings: withDefaults, isDark, styles });
  },

  updateTheme(theme) {
    get().setSettings({ ...get().settings, theme });
  },

  updateDarkTheme(darkTheme) {
    get().setSettings({ ...get().settings, darkTheme });
  },

  updateTypography(typography) {
    get().setSettings({ ...get().settings, typography });
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

  setIsDark(isDark) {
    const settings = {
      ...get().settings,
      general: { ...get().settings.general, isDark },
    };
    const styles = computeStyles(settings, isDark ? "dark" : "light");
    set({ isDark, settings: getDefaultSettings(settings), styles });
  },

  reset() {
    const settings = getDefaultSettings({});
    const styles = computeStyles(settings, "light");
    set({ settings, isDark: false, styles });
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
