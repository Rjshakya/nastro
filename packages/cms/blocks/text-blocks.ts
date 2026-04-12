/**
 * Text content block handlers
 * Paragraph, Heading 1/2/3, Quote, Callout
 */

import type {
  ParagraphBlockObjectResponse,
  Heading1BlockObjectResponse,
  Heading2BlockObjectResponse,
  Heading3BlockObjectResponse,
  QuoteBlockObjectResponse,
  CalloutBlockObjectResponse,
} from "@notionhq/client";
import { extractRichText } from "./utils.js";
import type {
  ParagraphContent,
  HeadingContent,
  QuoteContent,
  CalloutContent,
} from "../types.js";

/**
 * Handle paragraph block
 */
export const handleParagraph =
  (block: () => ParagraphBlockObjectResponse) => (): ParagraphContent => {
    const b = block();
    return {
      text: extractRichText(b.paragraph.rich_text),
    };
  };

/**
 * Handle heading 1 block
 */
export const handleHeading1 =
  (block: () => Heading1BlockObjectResponse) => (): HeadingContent => {
    const b = block();
    return {
      level: 1,
      text: extractRichText(b.heading_1.rich_text),
    };
  };

/**
 * Handle heading 2 block
 */
export const handleHeading2 =
  (block: () => Heading2BlockObjectResponse) => (): HeadingContent => {
    const b = block();
    return {
      level: 2,
      text: extractRichText(b.heading_2.rich_text),
    };
  };

/**
 * Handle heading 3 block
 */
export const handleHeading3 =
  (block: () => Heading3BlockObjectResponse) => (): HeadingContent => {
    const b = block();
    return {
      level: 3,
      text: extractRichText(b.heading_3.rich_text),
    };
  };

/**
 * Handle quote block
 */
export const handleQuote =
  (block: () => QuoteBlockObjectResponse) => (): QuoteContent => {
    const b = block();
    return {
      text: extractRichText(b.quote.rich_text),
    };
  };

/**
 * Handle callout block
 */
export const handleCallout =
  (block: () => CalloutBlockObjectResponse) => (): CalloutContent => {
    const b = block();
    const icon = b.callout.icon;
    let iconString: string | null = null;

    if (icon) {
      if (icon.type === "emoji") {
        iconString = icon.emoji;
      } else if (icon.type === "external") {
        iconString = icon.external.url;
      } else if (icon.type === "file") {
        iconString = icon.file.url;
      } else if (icon.type === "custom_emoji") {
        iconString = icon.custom_emoji.url;
      }
    }

    return {
      text: extractRichText(b.callout.rich_text),
      icon: iconString,
    };
  };
