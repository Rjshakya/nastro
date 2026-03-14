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

export const useNotionSettingsStore = create<NotionSettingsStore>(
  (set, get) => ({
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
  }),
);

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

export const computeTheme = (
  customization: NotionPageSettings["theme"] | undefined,
) => {
  const styles: CustomStyles = {};
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

  return styles;
};

export const computeTypography = (
  typography: NotionPageSettings["typography"],
) => {
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

  if (typography.spacing) {
    if (typography.spacing.lineHeight) {
      styles["--notion-text-line-height"] =
        typography.spacing.lineHeight.toString();
    }
    if (typography.spacing.letterSpacing) {
      styles["--notion-letter-spacing"] =
        typography.spacing.letterSpacing + "px";
    }
    if (typography.spacing.headingLetterSpacing) {
      styles["--notion-heading-letter-spacing"] =
        typography.spacing.headingLetterSpacing + "px";
    }
    if (typography.spacing.fontWeight) {
      styles["--notion-font-weight"] = typography.spacing.fontWeight.toString();
    }
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

  // Card Cover Settings
  if (layout?.cardCover) {
    const cover = layout.cardCover;
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

  // Card Body Settings
  if (layout?.cardBody) {
    const body = layout.cardBody;
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

  return styles;
};

export const computeGeneral = (general: NotionPageSettings["general"]) => {
  const styles: CustomStyles = {};

  if (!general) return styles;

  if (general.pageWidth) {
    if (general.pageWidth === 1334) {
      styles["--notion-max-width"] = "100%";
    } else {
      styles["--notion-max-width"] = general.pageWidth + "px";
    }
  }

  return styles;
};
