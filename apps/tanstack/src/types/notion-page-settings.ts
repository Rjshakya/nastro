// Site Settings

export type ThemeSettingsMainSection = {
  pageBackground?: string;
  textColor?: string;
  checkboxBackground?: string;
};

export type ThemeSettingsHeaderSection = {
  textColor?: string;
  background?: string;
  buttonText?: string;
  buttonBackground?: string;
};

export type ThemeSettingsFooterSection = {
  textColor?: string;
  background?: string;
  buttonText?: string;
  buttonBackground?: string;
};

export type ThemeSettingsNotionSection = {
  gray?: string;
  brown?: string;
  orange?: string;
  yellow?: string;
  teal?: string;
  blue?: string;
  purple?: string;
  pink?: string;
  red?: string;
};

export type ThemeSettingsNotionBackgroundSection = {
  gray?: string;
  brown?: string;
  orange?: string;
  yellow?: string;
  teal?: string;
  blue?: string;
  purple?: string;
  pink?: string;
  red?: string;
};

export type ThemeSettingsCardSection = {
  cardBackground?: string;
  cardHover?: string;
  cardText?: string;
  cardBorder?: string;
};

export type ThemeSettingsButtonsSection = {
  gray?: string;
  brown?: string;
  orange?: string;
  yellow?: string;
  teal?: string;
  blue?: string;
  purple?: string;
  pink?: string;
  red?: string;
};

export type ThemeSettingsDefaultButtonSection = {
  background?: string;
  textColor?: string;
  borderColor?: string;
  hoverBackground?: string;
};

export type ThemeSettingsTabSection = {
  background?: string;
  activeBackground?: string;
};

export type ThemeSettingsTextSelection = {
  background?: string;
  textColor?: string;
};

export interface ThemeSettingsUI {
  main?: ThemeSettingsMainSection;
  header?: ThemeSettingsHeaderSection;
  footer?: ThemeSettingsFooterSection;
  notion?: ThemeSettingsNotionSection;
  notionBackground?: ThemeSettingsNotionBackgroundSection;
  card?: ThemeSettingsCardSection;
  buttons?: ThemeSettingsButtonsSection;
  defaultButton?: ThemeSettingsDefaultButtonSection;
  tab?: ThemeSettingsTabSection;
  textSelection?: ThemeSettingsTextSelection;
  type: "theme";
}

export type TypoSizesUI = {
  pageTitle?: number;
  heading1?: number;
  heading2?: number;
  heading3?: number;
  base?: number;
};

export type TypoFontsUI = {
  primary?: string;
  secondary?: string;
};

export type TypoSpacingUI = {
  lineHeight?: number;
  letterSpacing?: number;
  headingLetterSpacing?: number;
  titleLetterSpacing?: number;
  fontWeight?: number;
};

export interface GeneralSettingsUI {
  siteName?: string;
  pageWidth?: number;
  pageCoverHeight?: number;
  header?: boolean;
  footer?: boolean;
  isDark?: boolean;
  slug?: string;
  type: "general";
}

export interface TypoSettingsUI {
  sizes?: TypoSizesUI;
  fonts?: TypoFontsUI;
  spacing?: TypoSpacingUI;
  type: "typography";
}

export type HeaderLink = {
  text?: string;
  url?: string;
  variant?:
    | "default"
    | "outline"
    | "secondary"
    | "ghost"
    | "destructive"
    | "link";
};

export type HeaderList = {
  text?: string;
  links?: HeaderLink[];
};

export type LayoutHeaderUI = {
  text?: string;
  logo?: string;
  links?: HeaderLink[];
  lists?: HeaderList[];
  height?: number;
  width?: number;
};

export type LayoutFooterUI = {
  text?: string;
  logo?: string;
  links?: HeaderLink[];
  height?: number;
  width?: number;
};

// NEW: Gallery Grid Settings
export type LayoutGalleryUI = {
  gridGap?: number;
};

// NEW: Card Settings (unified with nested cover and body)
export type LayoutCardUI = {
  borderSize?: number;
  paddingX?: number;
  paddingY?: number;
  cover?: {
    height?: number;
    radius?: number;
    paddingX?: number;
    paddingY?: number;
    marginX?: number;
    marginY?: number;
  };
  body?: {
    paddingX?: number;
    paddingY?: number;
    marginX?: number;
    marginY?: number;
  };
};

// NEW: Simple Tabs Settings
export type LayoutTabsUI = {
  display?: "flex" | "none";
};

export interface LayoutSettingsUI {
  type: "layout";
  header?: LayoutHeaderUI;
  footer?: LayoutFooterUI;
  sidebar?: LayoutHeaderUI;
  gallery?: LayoutGalleryUI;
  card?: LayoutCardUI;
  tabs?: LayoutTabsUI;
  // // Legacy fields for backward compatibility (marked as deprecated)
  // /** @deprecated Use card.cover instead */
  // cardCover?: {
  //   height?: number;
  //   radius?: number;
  //   paddingX?: number;
  //   paddingY?: number;
  //   marginX?: number;
  //   marginY?: number;
  // };
  // /** @deprecated Use card.body instead */
  // cardBody?: {
  //   paddingX?: number;
  //   paddingY?: number;
  //   marginX?: number;
  //   marginY?: number;
  // };
}

export interface SeoSettingsUI {
  title?: string;
  description?: string;
  ogImage?: string;
  pageUrl?: string;
  pageIcon?: string;
  type: "seo";
}

export interface NotionPageSettings {
  general?: GeneralSettingsUI;
  theme?: ThemeSettingsUI;
  /**
   * if general.isDark is true
   * then all the changes will be saved in
   * darkTheme
   */
  darkTheme?: ThemeSettingsUI;
  typography?: TypoSettingsUI;
  layout?: LayoutSettingsUI;
  seo?: SeoSettingsUI;
}
