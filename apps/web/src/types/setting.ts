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

// Site Setting
// ─────────────────────────────────────────────────────────────

export interface SiteSetting {
  theme?: ThemeConfig;
  darkTheme?: ThemeConfig;
  typography?: TypographyConfig;
  layout?: LayoutConfig;
  seo?: SeoConfig;
  analytics?: AnalyticsConfig;
}
