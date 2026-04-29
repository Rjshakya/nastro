import type { CSSProperties } from "react";
import type {
  SiteSetting,
  PopulatedThemeConfig,
  PopulatedTypographyConfig,
  PopulatedLayoutConfig,
  PopulatedGeneralConfig,
} from "@/types/site.setting";
import { getDefaultSettings } from "@/lib/default-settings";

// ═══════════════════════════════════════════════════════════════
// Theme Styles
// ═══════════════════════════════════════════════════════════════

function computeThemeStyles(
  theme: PopulatedThemeConfig,
): Record<string, string> {
  const styles: Record<string, string> = {};

  // ── Page ──
  styles["--ns-page-bg"] = theme.background.color;
  styles["--ns-text"] = theme.foreground.color;
  styles["--ns-checkbox"] = theme.checkbox.color;

  // ── Notion Palette ──
  const palette = theme.notionColors;
  styles["--ns-notion-gray"] = palette.gray;
  styles["--ns-notion-brown"] = palette.brown;
  styles["--ns-notion-orange"] = palette.orange;
  styles["--ns-notion-yellow"] = palette.yellow;
  styles["--ns-notion-teal"] = palette.teal;
  styles["--ns-notion-blue"] = palette.blue;
  styles["--ns-notion-purple"] = palette.purple;
  styles["--ns-notion-pink"] = palette.pink;
  styles["--ns-notion-red"] = palette.red;

  // ── Notion Background Palette ──
  const bgPalette = theme.notionBackgroundColors;
  styles["--ns-notion-gray-bg"] = bgPalette.gray;
  styles["--ns-notion-brown-bg"] = bgPalette.brown;
  styles["--ns-notion-orange-bg"] = bgPalette.orange;
  styles["--ns-notion-yellow-bg"] = bgPalette.yellow;
  styles["--ns-notion-teal-bg"] = bgPalette.teal;
  styles["--ns-notion-blue-bg"] = bgPalette.blue;
  styles["--ns-notion-purple-bg"] = bgPalette.purple;
  styles["--ns-notion-pink-bg"] = bgPalette.pink;
  styles["--ns-notion-red-bg"] = bgPalette.red;

  // ── Card ──
  const card = theme.card;
  styles["--ns-card-bg"] = card.background;
  styles["--ns-card-hover"] = card.hover;
  styles["--ns-card-text"] = card.foreground;

  // ── Button ──
  const btn = theme.defaultButton;
  styles["--ns-btn-bg"] = btn.background;
  styles["--ns-btn-text"] = btn.foreground;
  styles["--ns-btn-hover"] = btn.hover;

  // ── Tab ──
  const tab = theme.tab;
  styles["--ns-tab-bg"] = tab.background;
  styles["--ns-tab-active"] = tab.foreground;

  // ── Text Selection ──
  const sel = theme.textSelection;
  styles["--ns-selection-bg"] = sel.background;
  styles["--ns-selection-text"] = sel.foreground;

  // ── Radius ──
  styles["--ns-radius"] = `${theme.roundness}px`;

  return styles;
}

// ═══════════════════════════════════════════════════════════════
// Typography Styles
// ═══════════════════════════════════════════════════════════════

function computeTypographyStyles(
  typography: PopulatedTypographyConfig,
): Record<string, string> {
  const styles: Record<string, string> = {};

  styles["--ns-font-primary"] = typography.font.primary;
  styles["--ns-font-secondary"] = typography.font.secondary;

  styles["--ns-size-title"] = `${typography.size.title}px`;
  styles["--ns-size-h1"] = `${typography.size.h1}px`;
  styles["--ns-size-h2"] = `${typography.size.h2}px`;
  styles["--ns-size-h3"] = `${typography.size.h3}px`;
  styles["--ns-size-base"] = `${typography.size.base}px`;

  styles["--ns-spacing-title"] = `${typography.letterSpacing.title}px`;
  styles["--ns-spacing-heading"] = `${typography.letterSpacing.heading}px`;
  styles["--ns-spacing-base"] = `${typography.letterSpacing.base}px`;

  return styles;
}

// ═══════════════════════════════════════════════════════════════
// Layout Styles
// ═══════════════════════════════════════════════════════════════

function computeLayoutStyles(
  layout: PopulatedLayoutConfig,
): Record<string, string> {
  const styles: Record<string, string> = {};

  styles["--ns-layout-header-display"] = layout.header ? "block" : "none";
  styles["--ns-layout-footer-display"] = layout.footer ? "block" : "none";

  return styles;
}

// ═══════════════════════════════════════════════════════════════
// General Styles
// ═══════════════════════════════════════════════════════════════

function computeGeneralStyles(
  general: PopulatedGeneralConfig,
): Record<string, string> {
  const styles: Record<string, string> = {};

  styles["--ns-page-width"] = `${general.pageWidth}px`;
  styles["--ns-cover-height"] = `${general.pageCoverHeight}vh`;

  return styles;
}

// ═══════════════════════════════════════════════════════════════
// Main Entry
// ═══════════════════════════════════════════════════════════════

export function computeStyles(
  settings: SiteSetting,
  mode: "light" | "dark" = "light",
): CSSProperties {
  const withDefaults = getDefaultSettings(settings);
  const theme = mode === "dark" ? withDefaults.darkTheme : withDefaults.theme;

  const themeStyles = computeThemeStyles(theme);
  const typographyStyles = computeTypographyStyles(withDefaults.typography);
  const layoutStyles = computeLayoutStyles(withDefaults.layout);
  const generalStyles = computeGeneralStyles(withDefaults.general);

  return {
    ...themeStyles,
    ...typographyStyles,
    ...layoutStyles,
    ...generalStyles,
  } as CSSProperties;
}
