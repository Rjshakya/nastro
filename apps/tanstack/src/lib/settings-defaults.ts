import type { NotionPageSettings } from "#/types/customization";
import type { Site } from "#/types/site";
import type { ExtendedRecordMap } from "notion-types";
import { getNotionPageSeo } from "./utils";

export const defaultThemeSettings = (
  themeSettings?: NotionPageSettings["theme"],
) => {
  return {
    main: {
      pageBackground: "#ffffff",
      textColor: "#242424",
      checkboxBackground: "#2eaadc",
      ...themeSettings?.main,
    },
    header: {
      background: "#ffffff",
      textColor: "#242424",
      buttonText: "#ffffff",
      buttonBackground: "#242424",
      ...themeSettings?.header,
    },
    footer: {
      background: "#ffffff",
      textColor: "#242424",
      buttonText: "#ffffff",
      buttonBackground: "#242424",
      ...themeSettings?.footer,
    },
    notion: {
      gray: "#9b9a97",
      brown: "#64473a",
      orange: "#d9730d",
      yellow: "#dfab01",
      teal: "#0f7b6c",
      blue: "#0073e6",
      purple: "#9065b0",
      pink: "#c44c7d",
      red: "#e03e3e",
      ...themeSettings?.notion,
    },
    notionBackground: {
      gray: "#eeedec",
      brown: "#eeebe9",
      orange: "#faebe0",
      yellow: "#fbf3db",
      teal: "#ddf2f0",
      blue: "#ddebf3",
      purple: "#ece9f2",
      pink: "#f5e0eb",
      red: "#ffe2dd",
      ...themeSettings?.notionBackground,
    },
    card: {
      cardBackground: "#ffffff",
      cardHover: "#f7f6f3",
      cardText: "#242424",
      cardBorder: "#ebebeb",
      ...themeSettings?.card,
    },
    buttons: {
      gray: "#e3e2e0",
      brown: "#eee0db",
      orange: "#faddcd",
      yellow: "#fdecc8",
      teal: "#dbf1f1",
      blue: "#d3e5ef",
      purple: "#e8e0f0",
      pink: "#f5e0eb",
      red: "#ffe2dd",
      ...themeSettings?.buttons,
    },
    defaultButton: {
      background: "#242424",
      textColor: "#ffffff",
      borderColor: "#373737",
      hoverBackground: "#242424",
      ...themeSettings?.defaultButton,
    },
  };
};

export const defaultTypographySettings: NotionPageSettings["typography"] = {
  sizes: {
    pageTitle: 41,
    heading1: 28,
    heading2: 24,
    heading3: 20,
    base: 16,
  },
  spacing: {
    lineHeight: 1.8,
    letterSpacing: -0.8,
    headingLetterSpacing: -1.3,
    fontWeight: 400,
  },
};

export const defaultLayoutSettings = (
  pageTitle: string,
  pageIcon?: string,
): NotionPageSettings["layout"] => ({
  header: {
    text: pageTitle,
    logo: pageIcon,
    width: 100,
    height: 60,
  },
  footer: {
    text: pageTitle,
    logo: pageIcon,
    width: 100,
    height: 45,
  },
  gallery: {
    gridGap: 16,
  },
  card: {
    borderSize: 1,
  },
  cardCover: {
    height: 200,
    radius: 10,
    paddingX: 0,
    paddingY: 0,
    marginX: 0,
    marginY: 0,
  },
  cardBody: {
    paddingX: 12,
    paddingY: 12,
    marginX: 0,
    marginY: 0,
  },
});

export const defaultDarkThemeSettings = (
  darkThemeSettings?: NotionPageSettings["darkTheme"],
) => {
  return {
    main: {
      pageBackground: "#0a0a0a",
      textColor: "#f5f5f5",
      checkboxBackground: "#2eaadc",
      ...darkThemeSettings?.main,
    },
    header: {
      background: "#0f0f10",
      textColor: "#f5f5f5",
      buttonText: "#a1a1aa",
      buttonBackground: "#f4f4f5",
      ...darkThemeSettings?.header,
    },
    footer: {
      background: "#0f0f10",
      textColor: "#f5f5f5",
      buttonText: "#a1a1aa",
      buttonBackground: "#f4f4f5",
      ...darkThemeSettings?.footer,
    },
    notion: {
      gray: "#9ca3af",
      brown: "#8b7355",
      orange: "#f97316",
      yellow: "#eab308",
      teal: "#14b8a6",
      blue: "#3b82f6",
      purple: "#a855f7",
      pink: "#ec4899",
      red: "#ef4444",
      ...darkThemeSettings?.notion,
    },
    notionBackground: {
      gray: "#27272a",
      brown: "#451a03",
      orange: "#7c2d12",
      yellow: "#713f12",
      teal: "#134e4a",
      blue: "#1e3a8a",
      purple: "#581c87",
      pink: "#831843",
      red: "#7f1d1d",
      ...darkThemeSettings?.notionBackground,
    },
    card: {
      cardBackground: "#18181b",
      cardHover: "#27272a",
      cardText: "#f5f5f5",
      cardBorder: "#27272a",
      ...darkThemeSettings?.card,
    },
    buttons: {
      gray: "#3f3f46",
      brown: "#57534e",
      orange: "#9a3412",
      yellow: "#854d0e",
      teal: "#115e59",
      blue: "#1e40af",
      purple: "#6b21a8",
      pink: "#9d174d",
      red: "#991b1b",
      ...darkThemeSettings?.buttons,
    },
    defaultButton: {
      background: "#ffffff",
      textColor: "#0a0a0a",
      borderColor: "#71717a",
      hoverBackground: "#ffffff",
      ...darkThemeSettings?.defaultButton,
    },
  };
};

export const defaultGeneralSettings = (siteName?: string, slug?: string) => ({
  siteName,
  pageWidth: 768,
  header: true,
  footer: true,
  isDark: false,
  slug: slug,
});

export const applyDefaultSettings = ({
  existingSettings,
  page,
  site,
  pageId,
}: {
  existingSettings: NotionPageSettings | null | undefined;
  page: ExtendedRecordMap;
  site: Site;
  pageId: string;
}): NotionPageSettings => {
  const seo = getNotionPageSeo({ page, pageId, site });

  return {
    theme: {
      ...defaultThemeSettings(existingSettings?.theme),
    },
    darkTheme: {
      ...defaultDarkThemeSettings(existingSettings?.darkTheme),
    },
    typography: {
      ...defaultTypographySettings,
      ...existingSettings?.typography,
      sizes: {
        ...defaultTypographySettings.sizes,
        ...existingSettings?.typography?.sizes,
      },
      spacing: {
        ...defaultTypographySettings.spacing,
        ...existingSettings?.typography?.spacing,
      },
    },
    layout: {
      ...defaultLayoutSettings(seo?.title, seo?.pageIcon),
      ...existingSettings?.layout,
      header: {
        ...defaultLayoutSettings(seo?.title, seo?.pageIcon)?.header,
        ...existingSettings?.layout?.header,
      },
      footer: {
        ...defaultLayoutSettings(seo?.title, seo?.pageIcon)?.footer,
        ...existingSettings?.layout?.footer,
      },
      gallery: {
        ...defaultLayoutSettings(seo?.title, seo?.pageIcon)?.gallery,
        ...existingSettings?.layout?.gallery,
      },
      card: {
        ...defaultLayoutSettings(seo?.title, seo?.pageIcon)?.card,
        ...existingSettings?.layout?.card,
      },
      cardCover: {
        ...defaultLayoutSettings(seo?.title, seo?.pageIcon)?.cardCover,
        ...existingSettings?.layout?.cardCover,
      },
      cardBody: {
        ...defaultLayoutSettings(seo?.title, seo?.pageIcon)?.cardBody,
        ...existingSettings?.layout?.cardBody,
      },
    },
    general: {
      ...defaultGeneralSettings(seo?.title || "", site.slug),
      ...existingSettings?.general,
      isDark: existingSettings?.general?.isDark ?? true,
    },
    seo,
  };
};

export const defaultNotionSettings = (
  title: string,
  slug: string,
): NotionPageSettings => {
  return {
    theme: {
      ...defaultThemeSettings(),
    },
    darkTheme: {
      ...defaultDarkThemeSettings(),
    },
    typography: {
      ...defaultTypographySettings,
      sizes: {
        ...defaultTypographySettings.sizes,
      },
      spacing: {
        ...defaultTypographySettings.spacing,
      },
    },
    layout: {
      ...defaultLayoutSettings(title),
      header: {
        ...defaultLayoutSettings(title)?.header,
      },
      footer: {
        ...defaultLayoutSettings(title)?.footer,
      },
      gallery: {
        ...defaultLayoutSettings(title)?.gallery,
      },
      card: {
        ...defaultLayoutSettings(title)?.card,
      },
      cardCover: {
        ...defaultLayoutSettings(title)?.cardCover,
      },
      cardBody: {
        ...defaultLayoutSettings(title)?.cardBody,
      },
    },
    general: {
      ...defaultGeneralSettings(title, slug),
      isDark: true,
    },
  };
};
