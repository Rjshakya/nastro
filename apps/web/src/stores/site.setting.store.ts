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
import { convertCssVarsRecordToStr } from "@/lib/live-site";

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

  setIsDark: (isDark: boolean, settings?: SiteSetting) => void;

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

  setIsDark(isDark, defaultSettings) {
    const settings = defaultSettings ?? {
      ...get().settings,
      general: { ...get().settings.general, isDark },
    };

    const styles = computeStyles(settings, isDark ? "dark" : "light");
    set({ isDark, settings: getDefaultSettings(settings), styles });

    const typography = get().settings.typography;
    const liveSiteStyleElem = document.getElementById("LIVE_SITE_STYLES");

    if (!liveSiteStyleElem) return;

    const cssVariables = convertCssVarsRecordToStr(styles);
    const styleContext = `

    
           .notion {

              --primary-font:${typography?.font?.primary ?? "Manrope Variable"};                    

              ${cssVariables};
        

              .notion-page-icon-hero.notion-page-icon-image {
                width: 100%;
                height: fit-content;
                margin-left: 0;
                display: flex;
                justify-content: start;
                padding-inline: 16px;
              }

              .notion-page-icon-hero.notion-page-icon-image .notion-page-icon {
                    width: 124px;
                    height: 124px;
              }
          }

        

      `;

    liveSiteStyleElem.textContent = "";
    liveSiteStyleElem.textContent = styleContext;
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
