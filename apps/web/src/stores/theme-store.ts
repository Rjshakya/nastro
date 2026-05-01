import { create } from "zustand";
import type { Theme } from "@/types/theme";
import { useSiteSettingStore } from "./site.setting.store";
import { getDefaultSettings } from "@/lib/default-settings";

interface ThemeStore {
  theme: Theme | null;
  themes: Theme[];
  setTheme: (theme: Theme | null) => void;
  setThemes: (themes: Theme[]) => void;
  unsetTheme: () => void;
}

export const useThemeStore = create<ThemeStore>((set, get) => ({
  theme: null,
  themes: [],

  setTheme(theme) {
    if (!theme) {
      set({ theme: null });
      return;
    }

    const { settings: currentSettings, setSettings } =
      useSiteSettingStore.getState();

    // Merge theme preset into current settings, preserving layout/general/seo/analytics
    const siteSettingWithDefaultsAndNewTheme = getDefaultSettings({
      ...currentSettings,
      theme: theme.setting.theme,
      darkTheme: theme.setting.darkTheme,
      typography: theme.setting.typography,
    });

    setSettings(siteSettingWithDefaultsAndNewTheme);
    set({ theme: theme });
  },

  setThemes(themes) {
    set({ themes });
  },
  unsetTheme() {
    const { theme } = get();
    if (!theme) {
      return;
    }

    const { settings, setSettings } = useSiteSettingStore.getState();
    const { general, analytics, seo, layout } = settings;
    const defaultSiteSetting = getDefaultSettings({
      general,
      analytics,
      seo,
      layout,
    });
    setSettings(defaultSiteSetting);
    set({ theme: null });
  },
}));
