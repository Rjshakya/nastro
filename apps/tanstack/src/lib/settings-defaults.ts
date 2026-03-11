import type { NotionPageSettings } from "#/types/customization";
import type { Site } from "#/types/site";
import type { ExtendedRecordMap } from "notion-types";
import { getNotionPageSeo } from "./utils";

export const defaultThemeSettings = (
  themeSettings: NotionPageSettings["theme"],
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
};

export const defaultLayoutSettings = (
  pageTitle: string,
  pageIcon: string,
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
});

export const defaultGeneralSettings: NotionPageSettings["general"] = {
  siteName: "",
  pageWidth: 65,
  header: true,
  footer: true,
};

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
    typography: {
      ...defaultTypographySettings,
      ...existingSettings?.typography,
    },
    layout: {
      ...defaultLayoutSettings(seo?.title, seo?.pageIcon),
      ...existingSettings?.layout,
    },
    general: { ...defaultGeneralSettings, ...existingSettings?.general },
    seo,
  };
};
