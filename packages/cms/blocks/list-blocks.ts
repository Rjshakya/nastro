/**
 * List block handlers
 * Bulleted list item, Numbered list item, To Do, Toggle
 */

import type {
  BulletedListItemBlockObjectResponse,
  NumberedListItemBlockObjectResponse,
  ToDoBlockObjectResponse,
  ToggleBlockObjectResponse,
} from "@notionhq/client";
import { extractRichText } from "./utils.js";
import type { ListItemContent, ToDoContent, ToggleContent } from "../types.js";

/**
 * Handle bulleted list item block
 */
export const handleBulletedListItem =
  (block: () => BulletedListItemBlockObjectResponse) => (): ListItemContent => {
    const b = block();
    return {
      text: extractRichText(b.bulleted_list_item.rich_text),
    };
  };

/**
 * Handle numbered list item block
 */
export const handleNumberedListItem =
  (block: () => NumberedListItemBlockObjectResponse) => (): ListItemContent => {
    const b = block();
    return {
      text: extractRichText(b.numbered_list_item.rich_text),
    };
  };

/**
 * Handle to do block
 */
export const handleToDo =
  (block: () => ToDoBlockObjectResponse) => (): ToDoContent => {
    const b = block();
    return {
      text: extractRichText(b.to_do.rich_text),
      checked: b.to_do.checked,
    };
  };

/**
 * Handle toggle block
 */
export const handleToggle =
  (block: () => ToggleBlockObjectResponse) => (): ToggleContent => {
    const b = block();
    return {
      text: extractRichText(b.toggle.rich_text),
    };
  };
