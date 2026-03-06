import type { NotionPageSettings } from "#/types/customization";
import type { Site, SiteSetting } from "#/types/site";
import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import { Env } from "env";
import type { Block, ExtendedRecordMap } from "notion-types";
import { defaultMapImageUrl, getPageTitle, getBlockIcon } from "notion-utils";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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
    pageUrl: `${Env.clientUrl}/${site.id}?pageId=${pageId}`,
    pageTitle: seo?.pageTitle || pageTitle || "",
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
