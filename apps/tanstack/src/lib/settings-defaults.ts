import type { NotionPageSettings } from "#/types/notion-page-settings";
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
    tab: {
      activeBackground: "oklch(0.967 0.001 286.375)",
      background: "oklch(1 0 0)",
      ...themeSettings?.tab,
    },
    type: "theme",
  } as NotionPageSettings["theme"];
};

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
    tab: {
      activeBackground: "oklch(0.274 0.006 286.033)",
      background: "oklch(0.145 0 0)",
    },
    type: "theme",
  } as NotionPageSettings["darkTheme"];
};

export const defaultTypographySettings = (
  typography?: NotionPageSettings["typography"],
): NotionPageSettings["typography"] => {
  return {
    ...typography,
    sizes: {
      pageTitle: 41,
      heading1: 28,
      heading2: 24,
      heading3: 20,
      base: 16,
      ...typography?.sizes,
    },
    spacing: {
      lineHeight: 1.8,
      letterSpacing: -0.8,
      headingLetterSpacing: -1.3,
      fontWeight: 400,
      titleLetterSpacing: -0.8,
      ...typography?.spacing,
    },
    fonts: {
      primary: "Geist",
      secondary: "Geist Mono",
      ...typography?.fonts,
    },
    type: "typography",
  };
};

export const defaultLayoutSettings = (
  pageTitle?: string,
  pageIcon?: string,
  layoutSettings?: NotionPageSettings["layout"],
): NotionPageSettings["layout"] => ({
  header: {
    text: pageTitle,
    logo: pageIcon,
    width: 100,
    height: 60,
    ...layoutSettings?.header,
  },
  footer: {
    text: pageTitle,
    logo: pageIcon,
    width: 100,
    height: 45,
    ...layoutSettings?.footer,
  },
  gallery: {
    gridGap: 16,
    ...layoutSettings?.gallery,
  },
  card: {
    borderSize: 1,
    paddingX: 0,
    paddingY: 0,
    ...layoutSettings?.card,
    cover: {
      height: 200,
      radius: 10,
      paddingX: 0,
      paddingY: 0,
      marginX: 0,
      marginY: 0,
      ...layoutSettings?.card?.cover,
    },
    body: {
      paddingX: 12,
      paddingY: 12,
      marginX: 0,
      marginY: 0,
      ...layoutSettings?.card?.body,
    },
  },
  tabs: {
    display: "flex",
    ...layoutSettings?.tabs,
  },
  type: "layout",
});

export const defaultGeneralSettings = (siteName?: string, slug?: string) => ({
  siteName,
  slug: slug,
  header: true,
  footer: true,
  isDark: false,
  pageWidth: 768,
  pageCoverHeight: 40,
});

export const getPureDefaultSettings = (
  existingSettings?: NotionPageSettings,
  pageTitle?: string,
  pageIcon?: string,
): NotionPageSettings => {
  const defaultLayout = defaultLayoutSettings(
    pageTitle,
    pageIcon,
    existingSettings?.layout,
  );

  return {
    general: {
      ...defaultGeneralSettings(
        existingSettings?.seo?.title || "",
        existingSettings?.general?.slug,
      ),
      ...existingSettings?.general,
      isDark: existingSettings?.general?.isDark ?? true,
      type: "general",
    },
    theme: defaultThemeSettings(existingSettings?.theme),
    darkTheme: defaultDarkThemeSettings(existingSettings?.darkTheme),
    layout: defaultLayout,
    typography: defaultTypographySettings(existingSettings?.typography),
    seo: existingSettings?.seo,
  };
};

export const getDefaultSettings = ({
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
  return getPureDefaultSettings(
    { ...existingSettings, seo },
    seo?.title,
    seo?.pageIcon,
  );
};

export const defaultNotionSettings = (
  title: string,
  slug: string,
): NotionPageSettings => {
  const defaultLayout = defaultLayoutSettings(title);

  return {
    theme: {
      ...defaultThemeSettings(),
      type: "theme",
    },
    darkTheme: {
      ...defaultDarkThemeSettings(),
      type: "theme",
    },
    typography: {
      ...defaultTypographySettings(),
      sizes: {
        ...defaultTypographySettings()?.sizes,
      },
      spacing: {
        ...defaultTypographySettings()?.spacing,
      },
      type: "typography",
    },
    layout: defaultLayout,
    general: {
      ...defaultGeneralSettings(title, slug),
      isDark: true,
      type: "general",
    },
  };
};
