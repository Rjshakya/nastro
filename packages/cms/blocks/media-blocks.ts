/**
 * Media block handlers
 * Image, Video, Audio, PDF, File
 */

import type {
  ImageBlockObjectResponse,
  VideoBlockObjectResponse,
  AudioBlockObjectResponse,
  PdfBlockObjectResponse,
  FileBlockObjectResponse,
} from "@notionhq/client";
import { extractRichText } from "./utils.js";
import type { MediaContent } from "../types.js";

/**
 * Extract URL from file source (external or file)
 */
const extractFileUrl = (
  source:
    | { type: "external"; external: { url: string } }
    | { type: "file"; file: { url: string; expiry_time: string } },
): string => {
  if (source.type === "external") {
    return source.external.url;
  }
  return source.file.url;
};

/**
 * Handle image block
 */
export const handleImage =
  (block: () => ImageBlockObjectResponse) => (): MediaContent => {
    const b = block();
    return {
      url: extractFileUrl(b.image),
      caption: extractRichText(b.image.caption),
    };
  };

/**
 * Handle video block
 */
export const handleVideo =
  (block: () => VideoBlockObjectResponse) => (): MediaContent => {
    const b = block();
    return {
      url: extractFileUrl(b.video),
      caption: extractRichText(b.video.caption),
    };
  };

/**
 * Handle audio block
 */
export const handleAudio =
  (block: () => AudioBlockObjectResponse) => (): MediaContent => {
    const b = block();
    return {
      url: extractFileUrl(b.audio),
      caption: extractRichText(b.audio.caption),
    };
  };

/**
 * Handle PDF block
 */
export const handlePdf =
  (block: () => PdfBlockObjectResponse) => (): MediaContent => {
    const b = block();
    return {
      url: extractFileUrl(b.pdf),
      caption: extractRichText(b.pdf.caption),
    };
  };

/**
 * Handle file block
 */
export const handleFile =
  (block: () => FileBlockObjectResponse) => (): MediaContent => {
    const b = block();
    return {
      url: extractFileUrl(b.file),
      caption: extractRichText(b.file.caption),
    };
  };
