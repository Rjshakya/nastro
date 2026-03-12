import type {
  CustomStyles,
  NotionPageSettings,
  ThemeSettingsButtonsSection,
} from "#/types/customization";
import { create } from "zustand";

interface NotionSettingsStore {
  styles?: CustomStyles;
  settings: NotionPageSettings;
  updateSettings: (settings: NotionPageSettings) => void;
  isPanelOpen: boolean;
  togglePanel: (v: boolean) => void;
  // isDark: boolean;
  setIsDark: (isDark: boolean) => void;
}

export const useNotionSettingsStore = create<NotionSettingsStore>((set, get) => ({
  settings: {},
  // isDark: false,
  updateSettings(settings) {
    const isDark = settings.general?.isDark ?? false;
    set({ settings, styles: computeCustomStyles(settings, isDark) });
  },
  setIsDark(isDark) {
    const { settings } = get();
    const updatedSettings = {
      ...settings,
      general: {
        ...settings.general,
        isDark,
      },
    };
    set({
      settings: updatedSettings,
      styles: computeCustomStyles(updatedSettings, isDark),
    });
  },
  styles: {},
  isPanelOpen: false,
  togglePanel: (v) => set({ isPanelOpen: v }),
}));

export const computeCustomStyles = (
  settings: NotionPageSettings | null,
  isDark: boolean = false,
): CustomStyles => {
  const styles: CustomStyles = {};

  const themeSettings = isDark ? settings?.darkTheme : settings?.theme;

  const theme = computeTheme(themeSettings);
  const typography = computeTypography(settings?.typography);
  const layout = computeLayout(settings?.layout);
  const general = computeGeneral(settings?.general);

  return {
    ...styles,
    ...theme,
    ...typography,
    ...layout,
    ...general,
  };
};

export const computeTheme = (customization: NotionPageSettings["theme"] | undefined) => {
  const styles: CustomStyles = {};
  if (!customization) return {};

  if (customization.main) {
    styles["--notion-custom-page-bg"] = customization.main.pageBackground;
    styles["--notion-custom-text"] = customization.main.textColor;
    styles["--custom-notion-select-color-0"] = customization.main.checkboxBackground;
  }

  if (customization.header) {
    styles["--notion-header-bg"] = customization.header.background;
    styles["--notion-header-text-color"] = customization.header.textColor;
  }

  if (customization.footer) {
    styles["--notion-footer-bg"] = customization.footer.background;
    styles["--notion-footer-text-color"] = customization.footer.textColor;
  }

  if (customization.notion) {
    const colorMap = [
      "gray",
      "brown",
      "orange",
      "yellow",
      "teal",
      "blue",
      "purple",
      "pink",
      "red",
    ] as const;

    colorMap.forEach((color) => {
      const colorData = customization.notion?.[color];
      if (colorData) {
        styles[`--custom-notion-${color}`] = colorData;
      }
    });
  }

  if (customization.notionBackground) {
    const bgColorMap = [
      "gray",
      "brown",
      "orange",
      "yellow",
      "teal",
      "blue",
      "purple",
      "pink",
      "red",
    ] as const;

    bgColorMap.forEach((color) => {
      const colorData = customization.notionBackground?.[color];
      if (colorData) {
        styles[`--custom-notion-${color}_background`] = colorData;
      }
    });
  }

  if (customization.card) {
    styles["--notion-collection-card"] = customization.card.cardBackground;
    styles["--notion-collection-card-hover"] = customization.card.cardHover;
    styles["--notion-collection-card-border"] = customization.card.cardBorder;
    styles["--notion-collection-card-text"] = customization.card.cardText;
  }

  if (customization.buttons) {
    const buttons = [
      "gray",
      "brown",
      "orange",
      "yellow",
      "green",
      "blue",
      "purple",
      "pink",
      "red",
    ] as const;
    buttons.forEach((btn) => {
      const btnData = customization.buttons;
      if (btnData) {
        styles[`--custom-notion-item-${btn}`] = btnData[btn as keyof ThemeSettingsButtonsSection];
      }
    });
  }

  if (customization.defaultButton) {
    styles["--notion-default-btn-bg"] = customization?.defaultButton?.background;
    styles["--notion-default-btn-text"] = customization?.defaultButton?.textColor;
    styles["--notion-default-btn-hover"] = customization?.defaultButton?.hoverBackground;
    styles["--notion-default-btn-border"] = customization?.defaultButton?.borderColor;
  }

  return styles;
};

export const computeTypography = (typography: NotionPageSettings["typography"]) => {
  const styles: CustomStyles = {};
  if (!typography) return {};

  if (typography.sizes) {
    styles["--notion-page-title"] = typography.sizes?.pageTitle + "px";
    styles["--notion-h1"] = typography.sizes?.heading1 + "px";
    styles["--notion-h2"] = typography.sizes?.heading2 + "px";
    styles["--notion-h3"] = typography.sizes?.heading3 + "px";
    styles["--base-font-size"] = typography.sizes?.base + "px";
  }

  if (typography.fonts) {
    styles["--notion-primary-font"] = typography.fonts?.primary;
    styles["--notion-secondary-font"] = typography.fonts?.secondary;
  }

  return styles;
};

export const computeLayout = (layout: NotionPageSettings["layout"]) => {
  const styles: CustomStyles = {};

  if (layout?.header) {
    styles["--notion-header-height"] = layout.header.height + "px";
    styles["--notion-header-width"] = (layout.header?.width || 100) + "%";
  }

  if (layout?.footer) {
    styles["--notion-footer-height"] = layout.footer.height + "px";
    styles["--notion-footer-width"] = (layout.footer?.width || 100) + "%";
  }

  if (layout?.sidebar) {
    styles["--notion-sidebar-height"] = layout.sidebar?.height + "px";
    styles["--notion-sidebar-width"] = layout.sidebar?.width + "%";
  }

  return styles;
};

export const computeGeneral = (general: NotionPageSettings["general"]) => {
  const styles: CustomStyles = {};

  if (!general) return styles;

  if (general.pageWidth) {
    styles["--notion-max-width"] = general.pageWidth + "%";
  }

  return styles;
};
