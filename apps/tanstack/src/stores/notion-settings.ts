import { loadFont } from "#/lib/fonts";
import type {
  NotionPageSettings,
  ThemeSettingsButtonsSection,
} from "#/types/notion-page-settings";
import type { NotionPageStyles } from "#/types/notion-page-styles";
import { create } from "zustand";

interface NotionSettingsStore {
  styles?: NotionPageStyles;
  settings: NotionPageSettings;
  updateSettings: (settings: NotionPageSettings) => NotionPageSettings;
  isPanelOpen: boolean;
  togglePanel: (v: boolean) => void;
  // isDark: boolean;
  setIsDark: (isDark: boolean) => void;
}

export const useNotionSettingsStore = create<NotionSettingsStore>(
  (set, get) => ({
    settings: {},
    // isDark: false,
    updateSettings(settings) {
      const isDark = settings.general?.isDark ?? false;
      set({ settings, styles: computeCustomStyles(settings, isDark) });

      if (settings?.typography?.fonts) {
        Promise.all([
          loadFont(settings?.typography?.fonts?.primary as string),
          loadFont(settings?.typography?.fonts?.secondary as string),
        ]);
      }

      return settings;
    },
    setIsDark(isDark) {
      const { settings } = get();
      const updatedSettings = {
        ...settings,
        general: {
          ...settings.general,
          isDark,
          type: "general",
        },
      } as NotionPageSettings;
      set({
        settings: updatedSettings,
        styles: computeCustomStyles(updatedSettings, isDark),
      });
    },
    styles: {},
    isPanelOpen: false,
    togglePanel: (v) => set({ isPanelOpen: v }),
  }),
);

export const computeCustomStyles = (
  settings: NotionPageSettings | null,
  isDark: boolean = false,
): NotionPageStyles => {
  const styles: NotionPageStyles = {};

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

export const computeTheme = (
  customization: NotionPageSettings["theme"] | undefined,
) => {
  const styles: NotionPageStyles = {};
  if (!customization) return {};

  if (customization.main) {
    styles["--notion-custom-page-bg"] = customization.main.pageBackground;
    styles["--notion-custom-text"] = customization.main.textColor;
    styles["--custom-notion-select-color-0"] =
      customization.main.checkboxBackground;
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
        styles[`--custom-notion-item-${btn}`] =
          btnData[btn as keyof ThemeSettingsButtonsSection];
      }
    });
  }

  if (customization.defaultButton) {
    styles["--notion-default-btn-bg"] =
      customization?.defaultButton?.background;
    styles["--notion-default-btn-text"] =
      customization?.defaultButton?.textColor;
    styles["--notion-default-btn-hover"] =
      customization?.defaultButton?.hoverBackground;
    styles["--notion-default-btn-border"] =
      customization?.defaultButton?.borderColor;
  }

  if (customization.tab) {
    styles["--notion-collection-tab-bg"] = customization.tab?.background;
    styles["--notion-collection-tab-active-bg"] =
      customization.tab?.activeBackground;
  }

  return styles;
};

export const computeTypography = (
  typography: NotionPageSettings["typography"],
) => {
  const styles: NotionPageStyles = {};
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

  if (typography.spacing) {
    if (typography.spacing.lineHeight !== undefined) {
      styles["--notion-text-line-height"] =
        typography.spacing.lineHeight.toString();
    }
    if (typography.spacing.letterSpacing !== undefined) {
      styles["--notion-letter-spacing"] =
        typography.spacing.letterSpacing + "px";
    }
    if (typography.spacing.headingLetterSpacing !== undefined) {
      styles["--notion-heading-letter-spacing"] =
        typography.spacing.headingLetterSpacing + "px";
    }

    if (typography.spacing.titleLetterSpacing !== undefined) {
      styles["--notion-page-title-letter-spacing"] =
        typography.spacing.titleLetterSpacing + "px";
    }

    if (typography.spacing.fontWeight !== undefined) {
      styles["--notion-font-weight"] = typography.spacing.fontWeight.toString();
    }
  }

  return styles;
};

export const computeLayout = (layout: NotionPageSettings["layout"]) => {
  const styles: NotionPageStyles = {};

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

  // checking undefined rather than
  //  just if(foo) ,
  //  because foo can be zero here , which is falsy value.

  // Gallery Grid Gap
  if (layout?.gallery?.gridGap !== undefined) {
    styles["--notion-gallery-grid-gap"] = layout.gallery.gridGap + "px";
  }

  // Card Border Size
  if (layout?.card?.borderSize !== undefined) {
    styles["--notion-collection-card-border-size"] =
      layout.card.borderSize + "px";
  }

  // Card Padding
  if (layout?.card?.paddingX !== undefined) {
    styles["--notion-collection-card-padding-x"] = layout.card.paddingX + "px";
  }
  if (layout?.card?.paddingY !== undefined) {
    styles["--notion-collection-card-padding-y"] = layout.card.paddingY + "px";
  }

  // Card Cover Settings (support both new nested structure and old flat structure)
  const cover = layout?.card?.cover;
  if (cover) {
    if (cover.height !== undefined) {
      styles["--notion-collection-card-cover-height"] = cover.height + "px";
    }
    if (cover.radius !== undefined) {
      styles["--notion-collection-card-cover-radius"] = cover.radius + "px";
    }
    if (cover.paddingX !== undefined) {
      styles["--notion-collection-card-cover-padding-x"] =
        cover.paddingX + "px";
    }
    if (cover.paddingY !== undefined) {
      styles["--notion-collection-card-cover-padding-y"] =
        cover.paddingY + "px";
    }
    if (cover.marginX !== undefined) {
      styles["--notion-collection-card-cover-margin-x"] = cover.marginX + "px";
    }
    if (cover.marginY !== undefined) {
      styles["--notion-collection-card-cover-margin-y"] = cover.marginY + "px";
    }
  }

  // Card Body Settings (support both new nested structure and old flat structure)
  const body = layout?.card?.body;
  if (body) {
    if (body.paddingX !== undefined) {
      styles["--notion-collection-card-body-padding-x"] = body.paddingX + "px";
    }
    if (body.paddingY !== undefined) {
      styles["--notion-collection-card-body-padding-y"] = body.paddingY + "px";
    }
    if (body.marginX !== undefined) {
      styles["--notion-collection-card-body-margin-x"] = body.marginX + "px";
    }
    if (body.marginY !== undefined) {
      styles["--notion-collection-card-body-margin-y"] = body.marginY + "px";
    }
  }

  // Tabs
  if (layout?.tabs?.display !== undefined) {
    styles["--notion-collection-tab-row-display"] = layout.tabs.display;
  }

  return styles;
};

export const computeGeneral = (general: NotionPageSettings["general"]) => {
  const styles: NotionPageStyles = {};

  if (!general) return styles;

  if (general.pageWidth) {
    if (general.pageWidth === 1334) {
      styles["--notion-max-width"] = "100%";
    } else {
      styles["--notion-max-width"] = general.pageWidth + "px";
    }
  }

  if (
    general.pageCoverHeight !== undefined ||
    general.pageCoverHeight !== null
  ) {
    styles["--notion-page-cover-height"] = general.pageCoverHeight + "vh";
  }

  return styles;
};
