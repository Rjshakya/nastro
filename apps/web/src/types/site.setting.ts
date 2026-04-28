// Theme Configuration
// ─────────────────────────────────────────────────────────────

export interface ThemeColorConfig {
  color: string;
}

export interface NotionPaletteConfig {
  gray?: string;
  brown?: string;
  orange?: string;
  yellow?: string;
  teal?: string;
  blue?: string;
  purple?: string;
  pink?: string;
  red?: string;
}

export interface CardConfig {
  background?: string;
  foreground?: string;
  hover?: string;
}

export interface DefaultButtonConfig {
  background?: string;
  foreground?: string;
  hover?: string;
}

export interface TabConfig {
  background?: string;
  foreground?: string;
}

export interface TextSelectionConfig {
  background?: string;
  foreground?: string;
}

export interface ThemeConfig {
  background?: ThemeColorConfig;
  foreground?: ThemeColorConfig;
  checkbox?: ThemeColorConfig;
  notionColors?: NotionPaletteConfig;
  notionBackgroundColors?: NotionPaletteConfig;
  card?: CardConfig;
  defaultButton?: DefaultButtonConfig;
  tab?: TabConfig;
  textSelection?: TextSelectionConfig;
  roundness?: number;
}

// Typography Configuration
// ─────────────────────────────────────────────────────────────

export interface FontConfig {
  primary?: string;
  secondary?: string;
}

export interface SizeConfig {
  title?: number;
  h1?: number;
  h2?: number;
  h3?: number;
  h4?: number;
  base?: number;
}

export interface LetterSpacingConfig {
  title?: number;
  heading?: number;
  base?: number;
}

export interface TypographyConfig {
  font?: FontConfig;
  size?: SizeConfig;
  letterSpacing?: LetterSpacingConfig;
}

// Layout Configuration
// ─────────────────────────────────────────────────────────────

export interface NavLink {
  url: string;
}

export type NavDropdown = Record<string, NavLink>;
export interface NavConfig {
  logo?: {
    text?: string;
    icon?: string;
  };
  links?: Record<string, NavLink>;
  dropdowns?: Record<string, NavDropdown>;
}

export interface LayoutConfig {
  header?: boolean;
  headerConfig?: NavConfig;
  footer?: boolean;
  footerConfig?: NavConfig;
  sidebar?: boolean;
  sidebarConfig?: NavConfig;
}

// General Configuration
// ─────────────────────────────────────────────────────────────

export interface GeneralConfig {
  isDark?: boolean;
  pageWidth?: number;
  pageCoverHeight?: number;
}

// SEO Configuration
// ─────────────────────────────────────────────────────────────

export interface SeoConfig {
  title?: string;
  description?: string;
  url?: string;
  ogImage?: string;
}

// Analytics Configuration
// ─────────────────────────────────────────────────────────────

export interface AnalyticsConfig {
  trackingId?: string;
}

// Populated / Deeply Required Types
// ─────────────────────────────────────────────────────────────

export interface PopulatedThemeConfig {
  background: ThemeColorConfig;
  foreground: ThemeColorConfig;
  checkbox: ThemeColorConfig;
  notionColors: Required<NotionPaletteConfig>;
  notionBackgroundColors: Required<NotionPaletteConfig>;
  card: Required<CardConfig>;
  defaultButton: Required<DefaultButtonConfig>;
  tab: Required<TabConfig>;
  textSelection: Required<TextSelectionConfig>;
  roundness: number;
}

export interface PopulatedTypographyConfig {
  font: Required<FontConfig>;
  size: Required<SizeConfig>;
  letterSpacing: Required<LetterSpacingConfig>;
}

export interface PopulatedLayoutConfig {
  header: boolean;
  headerConfig: NavConfig;
  footer: boolean;
  footerConfig: NavConfig;
  sidebar: boolean;
  sidebarConfig: NavConfig;
}

export interface PopulatedSeoConfig {
  title: string;
  description: string;
  url: string;
  ogImage: string;
}

export interface PopulatedAnalyticsConfig {
  trackingId: string;
}

export interface PopulatedGeneralConfig {
  isDark: boolean;
  pageWidth: number;
  pageCoverHeight: number;
}

export interface PopulatedSiteSetting {
  theme: PopulatedThemeConfig;
  darkTheme: PopulatedThemeConfig;
  typography: PopulatedTypographyConfig;
  layout: PopulatedLayoutConfig;
  general: PopulatedGeneralConfig;
  seo: PopulatedSeoConfig;
  analytics: PopulatedAnalyticsConfig;
}

// Site Setting
// ─────────────────────────────────────────────────────────────

export interface SiteSetting {
  theme?: ThemeConfig;
  darkTheme?: ThemeConfig;
  typography?: TypographyConfig;
  layout?: LayoutConfig;
  general?: GeneralConfig;
  seo?: SeoConfig;
  analytics?: AnalyticsConfig;
}
