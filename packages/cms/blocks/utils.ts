/**
 * Utility functions for block processing
 */

import type {
  RichTextItemResponse,
  BlockObjectResponse,
} from "@notionhq/client";
import type { RichText } from "../types.js";

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

/**
 * Type guard to check if block has children
 */
export const hasChildren = (block: BlockObjectResponse): boolean => {
  return block.has_children;
};
