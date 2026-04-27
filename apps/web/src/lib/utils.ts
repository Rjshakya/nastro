import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Site } from "@/types/site";
import { Env } from "@/lib/env";
import type { ExtendedRecordMap } from "notion-types";
import { defaultMapImageUrl, getPageTitle } from "notion-utils";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function createSlugUrl(slug: string) {
  const originHost = new URL("/", Env.clientUrl).hostname;
  const host = `${slug}.${originHost}`;

  const origin = `https://${host}`;
  return new URL("/", origin).href;
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
  const ogImgUrl = defaultNotionOgImage(page, pageId);
  const pageTitle = getNotionPageTitle(page);
  const pageIcon = getNotionPageIcon(page, site.rootPageId);

  return {
    title: pageTitle || "",
    description: site.name,
    ogImage: ogImgUrl,
    pageUrl: `${Env.clientUrl}/${site.id}?pageId=${pageId}`,
    pageIcon: pageIcon || "",
    type: "seo",
  };
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

export const getEntries = <T extends object>(obj: T) => {
  return Object.entries(obj) as [keyof T, T[keyof T]][];
};
