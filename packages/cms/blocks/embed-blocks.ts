/**
 * Embed block handlers
 * Embed, Bookmark, Link Preview
 */

import type {
  EmbedBlockObjectResponse,
  BookmarkBlockObjectResponse,
  LinkPreviewBlockObjectResponse,
} from "@notionhq/client";
import { extractRichText } from "./utils.js";
import type { EmbedContent, BookmarkContent } from "../types.js";

/**
 * Handle embed block
 */
export const handleEmbed =
  (block: () => EmbedBlockObjectResponse) => (): EmbedContent => {
    const b = block();
    return {
      url: b.embed.url,
    };
  };

/**
 * Handle bookmark block
 */
export const handleBookmark =
  (block: () => BookmarkBlockObjectResponse) => (): BookmarkContent => {
    const b = block();
    return {
      url: b.bookmark.url,
      caption: extractRichText(b.bookmark.caption),
    };
  };

/**
 * Handle link preview block
 */
export const handleLinkPreview =
  (block: () => LinkPreviewBlockObjectResponse) => (): EmbedContent => {
    const b = block();
    return {
      url: b.link_preview.url,
    };
  };
