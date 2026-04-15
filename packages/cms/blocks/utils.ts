/**
 * Utility functions for block processing
 */

import type {
  RichTextItemResponse,
  BlockObjectResponse,
  PageObjectResponse,
} from "@notionhq/client";
import type { PageIcon, PageTitle, RichText } from "../types.js";

/**
 * Extract rich text content from a rich_text array
 * Returns plain text with href only (no annotations)
 */
export const extractRichText = (
  richText: RichTextItemResponse[],
): RichText[] => {
  return richText.map((rt) => ({
    text: rt.plain_text,
    href: rt.href,
  }));
};

export const mapRichTextToFullText = (richText: RichTextItemResponse[]):string => {
  return richText.map((rt) => {
    if (rt.href) {
      return `<link href=${rt.href}>${rt.plain_text}<link>`;
    }

    return rt.plain_text;
  }).join("\n")
};

/**
 * Type guard to check if block has children
 */
export const hasChildren = (block: BlockObjectResponse): boolean => {
  return block.has_children;
};



export function extractCoverUrl(
  cover: PageObjectResponse["cover"],
): string | null {
  let url = null;

  if (cover?.type === "external") {
    url = cover.external.url;
  }

  if (cover?.type === "file") {
    url = cover.file.url;
  }

  return url;
}

export function extractPageIcon(icon: PageObjectResponse["icon"]): PageIcon {
  let obj = null as PageIcon;

  if (icon?.type === "custom_emoji") {
    obj = {
      type: "custom_emoji",
      name: icon.custom_emoji.name,
      value: icon.custom_emoji.url,
    };
  }

  if (icon?.type === "emoji") {
    obj = {
      type: "emoji",
      value: icon.emoji,
    };
  }

  if (icon?.type === "external") {
    obj = {
      type: "external",
      value: icon.external.url,
    };
  }

  if (icon?.type === "file") {
    obj = {
      type: "file",
      value: icon.file.url,
    };
  }

  return obj;
}

export function extractPageTitle(
  props: PageObjectResponse["properties"],
): PageTitle {
  const title = {} as PageTitle;

  const titleProp = props["title"] as unknown as {
    id: string;
    type: "title";
    title: RichTextItemResponse[];
  };

  title.text = titleProp.title;
  title.fullText = titleProp.title.map((rt) => rt.plain_text).join("\n");

  return title;
}
