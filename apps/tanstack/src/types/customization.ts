export interface NotionMainColors {
  pageBackground?: string;
  textColor?: string;
  textLightColor?: string;
  borderColor?: string;
  hoverBackground?: string;
  checkboxBackground?: string;
}

export interface NotionNavbarColors {
  textColor?: string;
  background?: string;
  buttonText?: string;
  buttonBackground?: string;
}

export interface NotionFooterColors {
  textColor?: string;
  background?: string;
}

export interface NotionTagColor {
  background: string;
}

export interface NotionButtonColor {
  background: string;
}

export interface NotionCardColors {
  cardBackground?: string;
  cardHover?: string;
  cardText?: string;
  cardBorder?: string;
}

export interface NotionDefaultButton {
  background?: string;
  textColor?: string;
  borderColor?: string;
  hoverBackground?: string;
}

export interface NotionSizes {
  pageTitle?: { value: number };
  heading1?: { value: number };
  heading2?: { value: number };
  heading3?: { value: number };
  base?: { value: number };
}

export interface NotionFonts {
  primary?: string;
  secondary?: string;
}

export interface NotionCustomization {
  main?: NotionMainColors;
  header?: NotionNavbarColors;
  footer?: NotionFooterColors;
  notion?: {
    gray?: NotionTagColor;
    brown?: NotionTagColor;
    orange?: NotionTagColor;
    yellow?: NotionTagColor;
    teal?: NotionTagColor;
    blue?: NotionTagColor;
    purple?: NotionTagColor;
    pink?: NotionTagColor;
    red?: NotionTagColor;
  };
  card?: NotionCardColors;
  buttons?: {
    gray?: NotionButtonColor;
    brown?: NotionButtonColor;
    orange?: NotionButtonColor;
    yellow?: NotionButtonColor;
    green?: NotionButtonColor;
    blue?: NotionButtonColor;
    purple?: NotionButtonColor;
    pink?: NotionButtonColor;
    red?: NotionButtonColor;
  };
  defaultButton?: NotionDefaultButton;
  sizes?: NotionSizes;
  fonts?: NotionFonts;
}
export interface CustomStyles {
  // main
  "--notion-custom-page-bg"?: string;
  "--notion-custom-text"?: string;
  "--notion-custom-text-light"?: string;
  "--notion-custom-border"?: string;
  "--custom-notion-select-color-0"?: string;

  // notion colors (text)
  "--custom-notion-gray"?: string;
  "--custom-notion-brown"?: string;
  "--custom-notion-orange"?: string;
  "--custom-notion-yellow"?: string;
  "--custom-notion-teal"?: string;
  "--custom-notion-blue"?: string;
  "--custom-notion-purple"?: string;
  "--custom-notion-pink"?: string;
  "--custom-notion-red"?: string;

  // notion background colors
  "--custom-notion-gray_background"?: string;
  "--custom-notion-brown_background"?: string;
  "--custom-notion-orange_background"?: string;
  "--custom-notion-yellow_background"?: string;
  "--custom-notion-teal_background"?: string;
  "--custom-notion-blue_background"?: string;
  "--custom-notion-purple_background"?: string;
  "--custom-notion-pink_background"?: string;
  "--custom-notion-red_background"?: string;

  // card
  "--notion-collection-card"?: string;
  "--notion-collection-card-border"?: string;
  "--notion-collection-card-text"?: string;
  "--notion-collection-card-hover"?: string;

  // notion-item (buttons)
  "--custom-notion-item-default"?: string;
  "--custom-notion-item-gray"?: string;
  "--custom-notion-item-brown"?: string;
  "--custom-notion-item-orange"?: string;
  "--custom-notion-item-yellow"?: string;
  "--custom-notion-item-green"?: string;
  "--custom-notion-item-blue"?: string;
  "--custom-notion-item-purple"?: string;
  "--custom-notion-item-pink"?: string;
  "--custom-notion-item-red"?: string;

  // button
  "--notion-default-btn-bg"?: string;
  "--notion-default-btn-text"?: string;
  "--notion-default-btn-border"?: string;
  "--notion-default-btn-hover"?: string;

  // size

  "--notion-page-title"?: string;
  "--notion-h2"?: string;
  "--notion-h3"?: string;
  "--notion-h1"?: string;
  "--base-font-size"?: string;

  // font

  "--notion-primary-font"?: string;
  "--notion-secondary-font"?: string;

  // spacing

  "--notion-letter-spacing"?: string;
  "--notion-heading-letter-spacing"?: string;
  "--notion-text-line-height"?: string;
  "--notion-font-weight"?: string;

  // header

  "--notion-header-bg"?: string;
  "--notion-header-text-color"?: string;
  "--notion-header-btn-bg"?: string;
  "--notion-header-btn-color"?: string;
  "--notion-header-height"?: string;
  "--notion-header-width"?: string;

  // sidebar

  "--notion-sidebar-bg"?: string;
  "--notion-sidebar-text-color"?: string;
  "--notion-sidebar-btn-bg"?: string;
  "--notion-sidebar-btn-color"?: string;
  "--notion-sidebar-height"?: string;
  "--notion-sidebar-width"?: string;

  // footer

  "--notion-footer-bg"?: string;
  "--notion-footer-text-color"?: string;
  "--notion-footer-btn-bg"?: string;
  "--notion-footer-btn-color"?: string;
  "--notion-footer-height"?: string;
  "--notion-footer-width"?: string;

  // width
  "--notion-max-width"?: string;

  // gallery
  "--notion-gallery-grid-gap"?: string;

  // card border
  "--notion-collection-card-border-size"?: string;

  // card cover
  "--notion-collection-card-cover-height"?: string;
  "--notion-collection-card-cover-radius"?: string;
  "--notion-collection-card-cover-padding-x"?: string;
  "--notion-collection-card-cover-padding-y"?: string;
  "--notion-collection-card-cover-margin-x"?: string;
  "--notion-collection-card-cover-margin-y"?: string;

  // card body
  "--notion-collection-card-body-padding-x"?: string;
  "--notion-collection-card-body-padding-y"?: string;
  "--notion-collection-card-body-margin-x"?: string;
  "--notion-collection-card-body-margin-y"?: string;
}

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

export interface ThemeSettingsUI {
  main?: ThemeSettingsMainSection;
  header?: ThemeSettingsHeaderSection;
  footer?: ThemeSettingsFooterSection;
  notion?: ThemeSettingsNotionSection;
  notionBackground?: ThemeSettingsNotionBackgroundSection;
  card?: ThemeSettingsCardSection;
  buttons?: ThemeSettingsButtonsSection;
  defaultButton?: ThemeSettingsDefaultButtonSection;
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
  fontWeight?: number;
};

export interface GeneralSettingsUI {
  siteName?: string;
  pageWidth?: number;
  header?: boolean;
  footer?: boolean;
  isDark?: boolean;
}

export interface TypoSettingsUI {
  sizes?: TypoSizesUI;
  fonts?: TypoFontsUI;
  spacing?: TypoSpacingUI;
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
export type LayoutHeaderUI = {
  text?: string;
  logo?: string;
  links?: HeaderLink[];
  list?: {
    text?: string;
    links?: HeaderLink[];
  }[];
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

// NEW: Card Border Settings
export type LayoutCardUI = {
  borderSize?: number;
};

// NEW: Card Cover (Image) Settings
export type LayoutCardCoverUI = {
  height?: number;
  radius?: number;
  paddingX?: number;
  paddingY?: number;
  marginX?: number;
  marginY?: number;
};

// NEW: Card Body (Content) Settings
export type LayoutCardBodyUI = {
  paddingX?: number;
  paddingY?: number;
  marginX?: number;
  marginY?: number;
};

export interface LayoutSettingsUI {
  header?: LayoutHeaderUI;
  footer?: LayoutFooterUI;
  sidebar?: LayoutHeaderUI;
  gallery?: LayoutGalleryUI;
  card?: LayoutCardUI;
  cardCover?: LayoutCardCoverUI;
  cardBody?: LayoutCardBodyUI;
}

export interface SEO {
  title?: string;
  description?: string;
  ogImage?: string;
  pageUrl?: string;
  pageIcon?: string;
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
  seo?: SEO;
}
