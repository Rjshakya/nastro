import type {
  SiteSetting,
  ThemeConfig,
  TypographyConfig,
  LayoutConfig,
  GeneralConfig,
  PopulatedSiteSetting,
} from "@/types/site.setting";

// ─────────────────────────────────────────────────────────────
// Light Theme Defaults (derived from styles.css :root)
// ─────────────────────────────────────────────────────────────

const defaultLightTheme: Required<ThemeConfig> = {
  background: { color: "oklch(1 0 0)" },
  foreground: { color: "oklch(0.148 0.004 228.8)" },
  checkbox: { color: "oklch(0.841 0.238 128.85)" },
  notionColors: {
    gray: "#9b9a97",
    brown: "#64473a",
    orange: "#d9730d",
    yellow: "#dfab01",
    teal: "#0f7b6c",
    blue: "#0073e6",
    purple: "#9065b0",
    pink: "#c44c7d",
    red: "#e03e3e",
  },
  notionBackgroundColors: {
    gray: "#eeedec",
    brown: "#eeebe9",
    orange: "#faebe0",
    yellow: "#fbf3db",
    teal: "#ddf2f0",
    blue: "#ddebf3",
    purple: "#ece9f2",
    pink: "#f5e0eb",
    red: "#ffe2dd",
  },
  card: {
    background: "oklch(1 0 0)",
    foreground: "oklch(0.148 0.004 228.8)",
    hover: "oklch(0.963 0.002 197.1)",
  },
  defaultButton: {
    background: "oklch(0.841 0.238 128.85)",
    foreground: "oklch(0.405 0.101 131.063)",
    hover: "oklch(0.841 0.238 128.85)",
  },
  tab: {
    background: "oklch(0.967 0.001 286.375)",
    foreground: "oklch(0.21 0.006 285.885)",
  },
  textSelection: {
    background: "oklch(0.841 0.238 128.85)",
    foreground: "oklch(0.405 0.101 131.063)",
  },
  roundness: 10,
};

// ─────────────────────────────────────────────────────────────
// Dark Theme Defaults (derived from styles.css .dark)
// ─────────────────────────────────────────────────────────────

const defaultDarkTheme: Required<ThemeConfig> = {
  background: { color: "oklch(0.148 0.004 228.8)" },
  foreground: { color: "oklch(0.987 0.002 197.1)" },
  checkbox: { color: "oklch(0.768 0.233 130.85)" },
  notionColors: {
    gray: "#9ca3af",
    brown: "#8b7355",
    orange: "#f97316",
    yellow: "#eab308",
    teal: "#14b8a6",
    blue: "#3b82f6",
    purple: "#a855f7",
    pink: "#ec4899",
    red: "#ef4444",
  },
  notionBackgroundColors: {
    gray: "#27272a",
    brown: "#451a03",
    orange: "#7c2d12",
    yellow: "#713f12",
    teal: "#134e4a",
    blue: "#1e3a8a",
    purple: "#581c87",
    pink: "#831843",
    red: "#7f1d1d",
  },
  card: {
    background: "oklch(0.218 0.008 223.9)",
    foreground: "oklch(0.987 0.002 197.1)",
    hover: "oklch(0.275 0.011 216.9)",
  },
  defaultButton: {
    background: "oklch(0.768 0.233 130.85)",
    foreground: "oklch(0.405 0.101 131.063)",
    hover: "oklch(0.768 0.233 130.85)",
  },
  tab: {
    background: "oklch(0.274 0.006 286.033)",
    foreground: "oklch(0.985 0 0)",
  },
  textSelection: {
    background: "oklch(0.768 0.233 130.85)",
    foreground: "oklch(0.405 0.101 131.063)",
  },
  roundness: 10,
};

// ─────────────────────────────────────────────────────────────
// Typography Defaults
// ─────────────────────────────────────────────────────────────

const defaultTypography: Required<TypographyConfig> = {
  font: {
    primary: "Manrope Variable",
    secondary: "Manrope Variable",
  },
  size: {
    title: 41,
    h1: 28,
    h2: 24,
    h3: 20,
    base: 16,
  },
  letterSpacing: {
    title: -0.8,
    heading: -1.3,
    base: -0.8,
  },
};

// ─────────────────────────────────────────────────────────────
// Layout Defaults
// ─────────────────────────────────────────────────────────────

const defaultLayout: Required<LayoutConfig> = {
  header: false,
  footer: false,
  sidebar: false,
  headerConfig: {},
  footerConfig: {},
  sidebarConfig: {},
};

// ─────────────────────────────────────────────────────────────
// General Defaults
// ─────────────────────────────────────────────────────────────

const defaultGeneral: Required<GeneralConfig> = {
  isDark: false,
  pageWidth: 768,
  pageCoverHeight: 40,
};

// ─────────────────────────────────────────────────────────────
// Deep Merge Helper
// ─────────────────────────────────────────────────────────────

function deepMerge<T extends Record<string, any>>(
  base: T,
  override?: Partial<T>,
): T {
  if (!override) return base;

  const result = { ...base } as T;

  for (const key of Object.keys(override) as Array<keyof T>) {
    const baseVal = base[key];
    const overrideVal = override[key];

    if (
      typeof baseVal === "object" &&
      baseVal !== null &&
      !Array.isArray(baseVal) &&
      typeof overrideVal === "object" &&
      overrideVal !== null &&
      !Array.isArray(overrideVal)
    ) {
      result[key] = deepMerge(baseVal, overrideVal as any);
    } else if (overrideVal !== undefined) {
      result[key] = overrideVal as T[keyof T];
    }
  }

  return result;
}

// ─────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────

export function getDefaultSettings(
  settings?: SiteSetting,
): PopulatedSiteSetting {
  return {
    theme: deepMerge(
      defaultLightTheme,
      settings?.theme,
    ) as PopulatedSiteSetting["theme"],
    darkTheme: deepMerge(
      defaultDarkTheme,
      settings?.darkTheme,
    ) as PopulatedSiteSetting["darkTheme"],
    typography: deepMerge(
      defaultTypography,
      settings?.typography,
    ) as PopulatedSiteSetting["typography"],
    layout: deepMerge(
      defaultLayout,
      settings?.layout,
    ) as PopulatedSiteSetting["layout"],
    general: deepMerge(
      defaultGeneral,
      settings?.general,
    ) as PopulatedSiteSetting["general"],
    seo: {
      title: "",
      description: "",
      url: "",
      ogImage: "",
      ...settings?.seo,
    },
    analytics: {
      trackingId: "",
      ...settings?.analytics,
    },
  };
}
