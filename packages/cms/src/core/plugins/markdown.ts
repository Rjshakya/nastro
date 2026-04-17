import type {
  Page,
  PageBlock,
  PageBlockContentOnly,
  ParagraphContent,
  HeadingContent,
  QuoteContent,
  CalloutContent,
  ListItemContent,
  ToDoContent,
  ToggleContent,
  MediaContent,
  CodeContent,
  EquationContent,
  TableContent,
  TableRowContent,
  ChildPageContent,
  ChildDatabaseContent,
  LinkToPageContent,
  EmbedContent,
  BookmarkContent,
} from "../types";

/**
 * Escape special markdown characters in text content
 * Only escapes characters that would break markdown parsing
 */
function escapeMarkdown(text: string): string {
  if (!text) return "";
  // Only escape when necessary - preserve readability
  return text.replace(/\*/g, "\\*").replace(/_/g, "\\_");
}

/**
 * Convert YouTube URL to embed URL
 */
function convertYouTubeToEmbed(url: string): string | null {
  // Handle youtu.be short URLs
  if (url.includes("youtu.be/")) {
    const videoId = url.split("youtu.be/")[1]?.split("?")[0];
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }
  }

  // Handle youtube.com URLs
  if (url.includes("youtube.com/watch")) {
    const videoId = url.split("v=")[1]?.split("&")[0];
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }
  }

  // Handle youtube.com/embed URLs (already embed format)
  if (url.includes("youtube.com/embed/")) {
    return url;
  }

  return null;
}

/**
 * Convert Spotify URL to embed URL
 */
function convertSpotifyToEmbed(url: string): string | null {
  // Convert open.spotify.com URLs to embed format
  if (url.includes("open.spotify.com/")) {
    return url.replace("open.spotify.com/", "open.spotify.com/embed/");
  }
  return null;
}

/**
 * Check if URL is a YouTube video URL
 */
function isYouTubeUrl(url: string): boolean {
  return url.includes("youtube.com") || url.includes("youtu.be");
}

/**
 * Render rich text array to markdown
 * Handles links by converting to markdown format
 */
function renderRichText(texts: Array<{ text: string; href: string | null }> | undefined): string {
  if (!texts?.length) return "";

  return texts
    .map((t) => {
      if (t.href) {
        return `[${t.text}](${t.href})`;
      }
      return t.text;
    })
    .join("");
}

/**
 * Check if block type is a list item
 */
function isListItem(type: string): boolean {
  return type === "bulleted_list_item" || type === "numbered_list_item";
}

/**
 * Get list type
 */
function getListType(type: string): "ul" | "ol" {
  return type === "bulleted_list_item" ? "ul" : "ol";
}

/**
 * Render icon to markdown string
 */
function renderIcon(icon: { type: string; value: string; name?: string } | null): string {
  if (!icon) return "";

  if (icon.type === "emoji") {
    return icon.value;
  }

  if (icon.type === "custom_emoji") {
    return `:${icon.name}:`;
  }

  // external or file - return empty string for markdown (images in blockquotes don't render well)
  return "";
}

/**
 * Render a single block to markdown
 */
function renderBlock(block: PageBlockContentOnly, depth: number = 0): string {
  const type = block.type;
  const indent = "  ".repeat(depth);
  let markdown = "";

  // Text blocks
  if (type === "paragraph") {
    const content = block.content as ParagraphContent;
    const text = renderRichText(content.text);
    if (text.trim()) {
      markdown = `${indent}${text}\n\n`;
    } else {
      markdown = "\n";
    }
  } else if (type === "heading_1") {
    const content = block.content as HeadingContent;
    markdown = `${indent}# ${renderRichText(content.text)}\n\n`;
  } else if (type === "heading_2") {
    const content = block.content as HeadingContent;
    markdown = `${indent}## ${renderRichText(content.text)}\n\n`;
  } else if (type === "heading_3") {
    const content = block.content as HeadingContent;
    markdown = `${indent}### ${renderRichText(content.text)}\n\n`;
  } else if (type === "heading_4") {
    const content = block.content as HeadingContent;
    markdown = `${indent}#### ${renderRichText(content.text)}\n\n`;
  } else if (type === "quote") {
    const content = block.content as QuoteContent;
    const text = renderRichText(content.text);
    if (text.trim()) {
      // Add > to each line, preserving the blockquote as a single unit
      const lines = text
        .split("\n")
        .map((line) => `${indent}> ${line}`)
        .join("\n");
      markdown = `${lines}\n\n`;
    }
  } else if (type === "callout") {
    const content = block.content as CalloutContent;
    const icon = renderIcon(content.icon);
    const text = renderRichText(content.text);

    if (text.trim() || icon) {
      // Callout becomes a styled blockquote with icon
      const prefix = icon ? `${icon} ` : "";
      const lines = text
        .split("\n")
        .map((line) => `${indent}> ${prefix}${line}`)
        .join("\n");

      markdown = `${lines}\n`;

      // Add children if they exist - render them indented inside the callout
      if (block.childBlocks?.length && block.childBlocks.length > 0) {
        const childrenMarkdown = renderBlocks(block.childBlocks, depth + 1);
        // Indent children and add to callout
        const indentedChildren = childrenMarkdown
          .split("\n")
          .filter((line) => line.trim())
          .map((line) => `${indent}> ${line}`)
          .join("\n");
        if (indentedChildren) {
          markdown += `${indent}>\n${indentedChildren}\n`;
        }
      }
      markdown += "\n";
    }
  }

  // List blocks
  else if (type === "bulleted_list_item") {
    const content = block.content as ListItemContent;
    markdown = `${indent}- ${renderRichText(content.text)}\n`;
  } else if (type === "numbered_list_item") {
    const content = block.content as ListItemContent;
    markdown = `${indent}1. ${renderRichText(content.text)}\n`;
  } else if (type === "to_do") {
    const content = block.content as ToDoContent;
    const checkbox = content.checked ? "[x]" : "[ ]";
    markdown = `${indent}- ${checkbox} ${renderRichText(content.text)}\n`;
  } else if (type === "toggle") {
    const content = block.content as ToggleContent;
    const text = renderRichText(content.text);
    // Toggle becomes a heading with indented content
    markdown = `${indent}**${text}**\n\n`;
    if (block.childBlocks?.length) {
      const children = renderBlocks(block.childBlocks, depth + 1);
      markdown += children;
    }
  }

  // Media blocks
  else if (type === "image") {
    const content = block.content as MediaContent;
    const caption = renderRichText(content.caption);
    markdown = `${indent}![${caption}](${content.url})\n\n`;
  } else if (type === "video") {
    const content = block.content as MediaContent;
    const url = content.url;

    // Check if it's a YouTube video - use iframe embed
    if (isYouTubeUrl(url)) {
      markdown = `${indent}[youtube](${url})\n\n`;
    } else {
      markdown = `${indent}[video](${url})\n\n`;
    }
  } else if (type === "audio") {
    const content = block.content as MediaContent;
    markdown = `${indent}[audio](${content.url})\n\n`;
  } else if (type === "pdf" || type === "file") {
    const content = block.content as MediaContent;
    const caption = renderRichText(content.caption) || "Download File";
    markdown = `${indent}[${caption}](${content.url})\n\n`;
  }

  // Code block
  else if (type === "code") {
    const content = block.content as CodeContent;
    const language = content.language || "";
    const code = content.code;
    markdown = `${indent}\`\`\`${language}\n${code}\n${indent}\`\`\`\n\n`;
  }

  // Equation - use LaTeX math block
  else if (type === "equation") {
    const content = block.content as EquationContent;
    markdown = `${indent}$$\n${indent}${content.expression}\n${indent}$$\n\n`;
  }

  // Table blocks
  else if (type === "table") {
    const content = block.content as TableContent;
    const children = block.childBlocks?.length ? renderBlocks(block.childBlocks, depth, true) : "";
    markdown = children ? `${children}\n` : "";
  } else if (type === "table_row") {
    const content = block.content as TableRowContent;
    const cells = content.cells.map((cell) => renderRichText(cell)).join(" | ");
    markdown = `${indent}| ${cells} |\n`;
  }

  // Structure blocks
  else if (type === "column_list") {
    // Render column_list as markdown table
    // Count columns
    const columnCount = block.childBlocks?.length || 0;
    if (columnCount === 0) {
      markdown = "";
    } else {
      // Build table: empty header row + separator + content row
      const emptyCells = "| ".repeat(columnCount) + "|";
      const separatorCells = "|" + " --- |".repeat(columnCount);

      // Render each column's content
      const columnContents: string[] = [];
      for (const columnBlock of block.childBlocks || []) {
        // Render column children
        const colContent = renderColumnContent(columnBlock as PageBlockContentOnly);
        columnContents.push(colContent);
      }

      // Build the content row with all columns
      const contentRow = "| " + columnContents.join(" | ") + " |";

      markdown = `${emptyCells}\n${separatorCells}\n${contentRow}\n\n`;
    }
  } else if (type === "column") {
    // Column content is handled by column_list renderer
    // Skip individual column rendering
    markdown = "";
  } else if (type === "divider") {
    markdown = `${indent}---\n\n`;
  } else if (type === "breadcrumb") {
    // Breadcrumb not really supported in markdown
    markdown = "";
  } else if (type === "table_of_contents") {
    // TOC not supported in markdown output
    markdown = "";
  }

  // Navigation blocks
  else if (type === "child_page") {
    const content = block.content as ChildPageContent;
    const url = content.publicUrl || content.url;
    markdown = `${indent}[${content.title}](${url})\n\n`;
  } else if (type === "child_database") {
    const content = block.content as ChildDatabaseContent;
    if (content.pages?.length) {
      const pages = content.pages
        .map((page) => {
          const pageUrl = page.publicUrl || page.url;
          return `${indent}- [${page.title?.fullText || "Untitled"}](${pageUrl})`;
        })
        .join("\n");
      markdown = `${pages}\n\n`;
    }
  } else if (type === "link_to_page") {
    const content = block.content as LinkToPageContent;
    const url =
      content.type === "page_id"
        ? `/page/${content.id}`
        : content.type === "database_id"
          ? `/database/${content.id}`
          : `#${content.id}`;
    markdown = `${indent}[View ${content.type.replace("_", " ")}](${url})\n\n`;
  }

  // Embed blocks
  else if (type === "bookmark") {
    const content = block.content as BookmarkContent;
    markdown = `${indent}[${content.url}](${content.url})\n\n`;
  } else if (type === "embed") {
    const content = block.content as EmbedContent;
    const url = content.url;

    // Check for embeddable URLs
    if (isYouTubeUrl(url)) {
      markdown = `${indent}[youtube](${url})\n\n`;
    } else if (url.includes("open.spotify.com")) {
      markdown = `${indent}[spotify](${url})\n\n`;
    } else {
      markdown = `${indent}[Embedded content](${url})\n\n`;
    }
  } else if (type === "link_preview") {
    const content = block.content as EmbedContent;
    markdown = `${indent}[Link preview](${content.url})\n\n`;
  }

  // Special blocks
  else if (type === "template") {
    markdown = "";
  } else if (type === "synced_block") {
    const children = block.childBlocks?.length ? renderBlocks(block.childBlocks, depth) : "";
    markdown = children;
  } else if (type === "unsupported") {
    markdown = "";
  }

  // Fallback for unknown types
  else {
    markdown = "";
  }

  // Handle childBlocks for blocks that don't already handle them
  // Blocks that already handle children: toggle, column_list, column, synced_block, table, callout
  const blocksWithChildHandling = [
    "toggle",
    "column_list",
    "column",
    "synced_block",
    "table",
    "child_page",
    "child_database",
    "callout",
  ];
  if (!blocksWithChildHandling.includes(type) && block.childBlocks?.length) {
    const childrenMarkdown = renderBlocks(block.childBlocks, depth + 1);
    markdown += childrenMarkdown;
  }

  return markdown;
}

/**
 * Render multiple blocks with list grouping
 * When isTable is true, tracks row index for adding separator after header row
 */
function renderBlocks(
  blocks: PageBlockContentOnly[] | PageBlock[],
  depth: number = 0,
  isTable: boolean = false,
): string {
  const result: string[] = [];
  let currentList: { type: "ul" | "ol"; items: string[] } | null = null;
  let listIndex = 1;
  let tableRowIndex = 0;

  for (const block of blocks) {
    // Handle list items - group consecutive ones
    if (isListItem(block.type) || block.type === "to_do") {
      const listType = block.type === "to_do" ? "ul" : getListType(block.type);

      if (!currentList || currentList.type !== listType) {
        // Flush previous list
        if (currentList) {
          result.push(currentList.items.join(""));
          result.push("\n"); // Add spacing after list
        }

        currentList = { type: listType, items: [] };
        listIndex = 1;
      }

      if (block.type === "numbered_list_item") {
        // For numbered lists, we need to track the actual number
        const content = block.content as ListItemContent;
        const indent = "  ".repeat(depth);
        currentList.items.push(`${indent}${listIndex}. ${renderRichText(content.text)}\n`);
        listIndex++;
      } else if (block.type === "to_do") {
        const content = block.content as ToDoContent;
        const checkbox = content.checked ? "[x]" : "[ ]";
        const indent = "  ".repeat(depth);
        currentList.items.push(`${indent}- ${checkbox} ${renderRichText(content.text)}\n`);
      } else {
        currentList.items.push(renderBlock(block, depth));
      }
    } else {
      // Flush list if exists
      if (currentList) {
        result.push(currentList.items.join(""));
        result.push("\n"); // Add spacing after list
        currentList = null;
        listIndex = 1;
      }

      // Handle table rows specially
      if (isTable && block.type === "table_row") {
        const content = block.content as TableRowContent;
        const cells = content.cells.map((cell) => renderRichText(cell)).join(" | ");
        const indent = "  ".repeat(depth);
        result.push(`${indent}| ${cells} |\n`);

        // Add separator after first row (header row)
        if (tableRowIndex === 0) {
          const separator = `${indent}|${content.cells.map(() => " --- ").join("|")}|\n`;
          result.push(separator);
        }
        tableRowIndex++;
      } else {
        result.push(renderBlock(block, depth));
      }
    }
  }

  // Flush remaining list
  if (currentList) {
    result.push(currentList.items.join(""));
    result.push("\n"); // Add spacing after list
  }

  return result.join("");
}

/**
 * Render column content for table cells
 * Flattens block content into inline format suitable for table cells
 */
function renderColumnContent(block: PageBlockContentOnly): string {
  if (block.type !== "column") {
    return "";
  }

  const children = block.childBlocks || [];
  if (children.length === 0) {
    return "";
  }

  // Render all children as markdown
  const content = renderBlocks(children, 0);

  // Flatten for table cell: replace newlines with <br>
  // First, remove excessive whitespace
  const flattened = content
    .replace(/\n\n+/g, "<br><br>") // Multiple newlines -> double break
    .replace(/\n/g, "<br>") // Single newlines -> break
    .trim()
    .replace(/^<br>+/, "") // Remove leading <br>
    .replace(/<br>+$/, ""); // Remove trailing <br>

  return flattened;
}

/**
 * Convert Page or PageContentOnly to Markdown string
 *
 * @param page - The page to convert
 * @returns Markdown string
 *
 * @example
 * const markdown = toMarkdown(page);
 * // Returns: "# Page Title\n\nContent..."
 */
export function toMarkdown() {
  return (page: Page): string => {
    const blocks = page.blocks || [];
    const contentMarkdown = renderBlocks(blocks);

    const title = page.title?.fullText || "Untitled";

    // Build frontmatter
    let markdown = ``;

    // Add cover image at the top if exists (rendered as actual image)
    if (page.cover) {
      markdown += `![cover](${page.cover})\n\n`;
    }

    if (page.icon) {
      if (page.icon.type === "emoji") {
        markdown += `icon: "${page.icon.value}"`;
      } else {
        markdown += `icon: "${page.icon.value}"\n`;
      }
    }

    // Add title as heading
    markdown += `# ${title}\n\n`;

    // Add content
    markdown += contentMarkdown;

    return markdown.trim();
  };
}
