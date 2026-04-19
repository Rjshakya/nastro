/**
 * Special block handlers
 * Code, Equation, Template, Synced Block, Unsupported
 */

import type {
  CodeBlockObjectResponse,
  EquationBlockObjectResponse,
  TemplateBlockObjectResponse,
  SyncedBlockBlockObjectResponse,
  UnsupportedBlockObjectResponse,
} from "@notionhq/client";
import { extractRichText } from "../utils.js";
import type {
  CodeContent,
  EquationContent,
  TemplateContent,
  SyncedBlockContent,
  UnsupportedContent,
} from "../types.js";

/**
 * Handle code block
 */
export const handleCode =
  (block: () => CodeBlockObjectResponse) => (): CodeContent => {
    const b = block();
    const code = b.code.rich_text.map((rt) => rt.plain_text).join("");
    return {
      code,
      language: b.code.language,
      caption: extractRichText(b.code.caption),
    };
  };

/**
 * Handle equation block
 */
export const handleEquation =
  (block: () => EquationBlockObjectResponse) => (): EquationContent => {
    const b = block();
    return {
      expression: b.equation.expression,
    };
  };

/**
 * Handle template block
 */
export const handleTemplate =
  (block: () => TemplateBlockObjectResponse) => (): TemplateContent => {
    return { type: "template" };
  };

/**
 * Handle synced block
 */
export const handleSyncedBlock =
  (block: () => SyncedBlockBlockObjectResponse) => (): SyncedBlockContent => {
    return { type: "synced_block" };
  };

/**
 * Handle unsupported block
 */
export const handleUnsupported =
  (block: () => UnsupportedBlockObjectResponse) => (): UnsupportedContent => {
    const b = block();
    return {
      type: b.type,
    };
  };
