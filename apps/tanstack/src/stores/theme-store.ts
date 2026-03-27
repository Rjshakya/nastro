import type { NotionPageSettings } from "#/types/notion-page-settings";
import type { Theme } from "#/types/theme";
import { create } from "zustand";
import { useNotionSettingsStore } from "./notion-settings";
import { getPureDefaultSettings } from "#/lib/settings-defaults";

interface ThemeStore {
  theme: Theme | null;
  themes: Theme[];
  hasThemeChanged: boolean;
  setTheme: (theme: Theme) => void;
  defaultTheme: (settings: NotionPageSettings) => Theme;
  setThemes: (themes: Theme[]) => void;
  setHasThemeChanged: (bool: boolean) => void;
}

export const useThemeStore = create<ThemeStore>((set) => ({
  theme: null,
  themes: [],
  hasThemeChanged: false,
  setTheme(t) {
    let themeSetting = t?.themeSetting;
    const { settings, updateSettings } = useNotionSettingsStore.getState();
    const settingWithCorrectDefaults = getPureDefaultSettings(
      {
        ...settings,
        ...themeSetting,
      },
      settings?.seo?.title,
      settings?.seo?.pageIcon,
    );

    updateSettings(settingWithCorrectDefaults);
    themeSetting = settingWithCorrectDefaults;
    set({ theme: { ...t, themeSetting } });
  },
  defaultTheme(s) {
    return {
      name: "default",
      createdAt: "",
      createdBy: "",
      id: "",
      isPublic: true,
      themeSetting: s,
      updatedAt: "",
    };
  },
  setThemes(themes) {
    set({ themes });
  },
  setHasThemeChanged(bool) {
    set({ hasThemeChanged: bool });
  },
}));
