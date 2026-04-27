import { create } from "zustand";
import type {
  SiteSetting,
  ThemeConfig,
  TypographyConfig,
  LayoutConfig,
  SeoConfig,
  AnalyticsConfig,
} from "@/types/setting";

interface SiteSettingStore {
  settings: SiteSetting;
  isDark: boolean;

  setSettings: (settings: SiteSetting) => void;

  updateTheme: (theme: ThemeConfig) => void;
  updateDarkTheme: (darkTheme: ThemeConfig) => void;
  updateTypography: (typography: TypographyConfig) => void;
  updateLayout: (layout: LayoutConfig) => void;
  updateSeo: (seo: SeoConfig) => void;
  updateAnalytics: (analytics: AnalyticsConfig) => void;

  setIsDark: (isDark: boolean) => void;

  reset: () => void;
}

const defaultSettings: SiteSetting = {};

export const useSiteSettingStore = create<SiteSettingStore>((set) => ({
  settings: defaultSettings,
  isDark: false,

  setSettings(settings) {
    set({ settings });
  },

  updateTheme(theme) {
    set((state) => ({
      settings: { ...state.settings, theme },
    }));
  },

  updateDarkTheme(darkTheme) {
    set((state) => ({
      settings: { ...state.settings, darkTheme },
    }));
  },

  updateTypography(typography) {
    set((state) => ({
      settings: { ...state.settings, typography },
    }));
  },

  updateLayout(layout) {
    set((state) => ({
      settings: { ...state.settings, layout },
    }));
  },

  updateSeo(seo) {
    set((state) => ({
      settings: { ...state.settings, seo },
    }));
  },

  updateAnalytics(analytics) {
    set((state) => ({
      settings: { ...state.settings, analytics },
    }));
  },

  setIsDark(isDark) {
    set({ isDark });
  },

  reset() {
    set({ settings: defaultSettings, isDark: false });
  },
}));
