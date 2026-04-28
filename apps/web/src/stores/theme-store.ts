import { create } from "zustand";
import type { Theme } from "@/types/theme";
import { useSiteSettingStore } from "./site.setting.store";
import { getDefaultSettings } from "@/lib/default-settings";

interface ThemeStore {
  theme: Theme | null;
  themes: Theme[];
  setTheme: (theme: Theme | null) => void;
  setThemes: (themes: Theme[]) => void;
}

export const useThemeStore = create<ThemeStore>((set) => ({
  theme: null,
  themes: [],

  setTheme(t) {
    if (!t) {
      set({ theme: null });
      return;
    }

    const currentSettings = useSiteSettingStore.getState().settings;

    // Merge theme preset into current settings, preserving layout/general/seo/analytics
    const merged = getDefaultSettings({
      ...currentSettings,
      theme: t.setting.theme,
      darkTheme: t.setting.darkTheme,
      typography: t.setting.typography,
    });

    useSiteSettingStore.getState().setSettings(merged);
    set({ theme: t });
  },

  setThemes(themes) {
    set({ themes });
  },
}));
