export interface GoogleFont {
  family: string;
  variants: string[];
  subsets: string[];
  version: string;
  lastModified: string;
  files: Record<string, string>;
  category: string;
  kind: string;
}

import { Env } from "@/lib/env";
import type { SiteSetting } from "@/types/site.setting";

const API_KEY = Env.googleFontApiKey;
const API_URL = "https://www.googleapis.com/webfonts/v1/webfonts";

export async function fetchGoogleFonts(): Promise<GoogleFont[]> {
  if (!API_KEY) {
    throw new Error("Google Fonts API key is not configured");
  }

  try {
    const response = await fetch(`${API_URL}?key=${API_KEY}&sort=popularity`);
    if (!response.ok) {
      throw new Error("Failed to fetch Google Fonts");
    }
    const data = (await response.json()) as any;
    return data?.items;
  } catch (error) {
    console.error("Error fetching Google Fonts:", error);
    throw error;
  }
}

export function getFontUrl(font: GoogleFont, variant = "regular"): string {
  const fontFamily = font.family.replace(/\s+/g, "+");
  const fontVariant = variant === "regular" ? "400" : variant;
  return `https://fonts.googleapis.com/css2?family=${fontFamily}:wght@${fontVariant}&display=swap`;
}

const loadedFont = new Set();

export async function loadFont(
  fontFamily: string,
  variant = "regular",
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!fontFamily) {
      return resolve();
    }

    if (loadedFont.has(fontFamily)) {
      resolve();
      return;
    }

    const link = document.createElement("link");
    link.href = getFontUrl({ family: fontFamily } as GoogleFont, variant);
    link.rel = "stylesheet";

    link.onload = () => {
      loadedFont.add(fontFamily);
      resolve();
    };

    link.onerror = () => {
      if (loadedFont.has(fontFamily)) {
        loadedFont.delete(fontFamily);
      }
      reject(new Error(`Failed to load font: ${fontFamily}`));
    };

    document.head.appendChild(link);
  });
}

export function getFontLink(fontFamily?: string, variant = "regular") {
  if (!fontFamily) return;
  const href = getFontUrl({ family: fontFamily } as GoogleFont, variant);
  const rel = "stylesheet";
  return { href, rel };
}

export interface FontPickerProps {
  onFontSelect?: (font: GoogleFont) => void;
  value?: string;
}

export const FONT_CATEGORIES = [
  "serif",
  "sans-serif",
  "display",
  "handwriting",
  "monospace",
] as const;

export type FontCategory = (typeof FONT_CATEGORIES)[number];

export const FONT_WEIGHTS = [
  "100",
  "200",
  "300",
  "400",
  "500",
  "600",
  "700",
  "800",
  "900",
] as const;

export type FontWeight = (typeof FONT_WEIGHTS)[number];

export function loadSiteFonts(setting: SiteSetting): void {
  const fontsToLoad = new Set<string>();
  if (setting.typography?.font?.primary) {
    fontsToLoad.add(setting.typography.font.primary);
  }

  if (setting.typography?.font?.secondary) {
    fontsToLoad.add(setting.typography.font.secondary);
  }

  fontsToLoad.forEach((font) => loadFont(font).catch(console.error));
  return;
}
