import { computeCustomStyles } from "#/stores/notion-settings";
import type { NotionPageSettings } from "#/types/customization";
import type { Site } from "#/types/site";
import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import { Env } from "env";
import type { ExtendedRecordMap } from "notion-types";
import { defaultMapImageUrl, getPageTitle } from "notion-utils";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function createSlugUrl(slug: string) {
  return new URL(slug, Env.clientUrl).href;
}

export function defaultNotionOgImage(page: ExtendedRecordMap, pageId: string) {
  let imageUrl: string | undefined;

  for (const key of Object.keys(page.block)) {
    const block = page.block[key];
    const pageBlock = block.value as any;

    if (pageBlock?.value) {
      if (pageBlock?.value?.id === pageId) {
        const url = pageBlock?.value?.format?.page_cover;
        imageUrl = defaultMapImageUrl(url, pageBlock?.value);
      }
    } else if (pageBlock?.id === pageId) {
      const url = pageBlock?.format?.page_cover;
      imageUrl = defaultMapImageUrl(url, pageBlock);
    }
  }

  return imageUrl;
}

export function getNotionPageSeo({
  page,
  pageId,
  site,
}: {
  site: Site;
  page: ExtendedRecordMap;
  pageId: string;
}) {
  const seo = site.siteSetting?.seo;
  const ogImgUrl = defaultNotionOgImage(page, pageId);
  const pageTitle = getNotionPageTitle(page);
  const pageIcon = getNotionPageIcon(page, site?.pageId || "");

  return {
    title: seo?.title || pageTitle || "",
    description: seo?.description || site.siteName,
    ogImage: seo?.ogImage || ogImgUrl,
    pageUrl: seo?.pageUrl || `${Env.clientUrl}/${site.id}?pageId=${pageId}`,
    pageIcon: seo?.pageIcon || pageIcon || "",
  } satisfies NotionPageSettings["seo"];
}

export function getNotionPageTitle(page: ExtendedRecordMap) {
  return getPageTitle(page);
}

export function getNotionPageIcon(page: ExtendedRecordMap, pageId: string) {
  let icon: string | null | undefined;
  for (const key of Object.keys(page.block)) {
    const block = page.block[key];
    const pageBlock = block.value as any;

    if (pageBlock?.value) {
      if (pageBlock?.value?.id === pageId) {
        const url = pageBlock?.value?.format?.page_icon;
        icon = defaultMapImageUrl(url, pageBlock?.value);
      }
    } else if (pageBlock?.id === pageId) {
      const url = pageBlock?.format?.page_icon;
      icon = defaultMapImageUrl(url, pageBlock);
    }
  }

  return icon;
}

export function covertPageSettingsIntoStyles(
  settings: NotionPageSettings | null,
) {
  if (!settings) return;

  // get styles from settings
  const styles = computeCustomStyles(settings);
  const darkStyles = computeCustomStyles(settings, true);

  const css = Object.entries(styles)
    .filter(([_, v]) => !!v)
    .map(([k, v]) => `${k}:${v};`)
    .join("\n");

  const darkCss = Object.entries(darkStyles)
    .filter(([_, v]) => !!v)
    .map(([k, v]) => `${k}:${v};`)
    .join("\n");

  return `
  :root {${css}};
  .dark {${darkCss}};


  .notion-page-icon-hero {
    position: absolute;
    top: 0;
    left: 0%;
    display: flex;
    flex-direction: row;
    justify-content: center;
  }

  .notion-page-icon-hero.notion-page-icon-image {
    width: 124px;
    height: 124px;
    margin-left: 16px;
  }

  `;
}

export const clientThemeToggle = (bool: boolean) => {
  const doc = window.document.documentElement;
  doc.classList.forEach((c) => doc.classList.remove(c));
  doc.classList.add(bool ? "dark" : "light");
};
