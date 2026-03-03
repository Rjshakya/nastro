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
  navbar?: NotionNavbarColors;
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

  // navbar
  "--notion-custom-navbar-text"?: string;
  "--notion-custom-navbar-bg"?: string;
  "--notion-custom-navbar-btn-text"?: string;
  "--notion-custom-navbar-btn-bg"?: string;

  // footer
  "--notion-custom-footer-text"?: string;
  "--notion-custom-footer-bg"?: string;

  // notion colors (text)
  "--notion-gray"?: string;
  "--notion-brown"?: string;
  "--notion-orange"?: string;
  "--notion-yellow"?: string;
  "--notion-teal"?: string;
  "--notion-blue"?: string;
  "--notion-purple"?: string;
  "--notion-pink"?: string;
  "--notion-red"?: string;

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
}
