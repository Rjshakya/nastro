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
 * Escape HTML special characters to prevent XSS
 */
export function escapeHtml(text: string): string {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Convert YouTube URL to embed URL
 * Supports youtube.com and youtu.be formats
 */
function convertYouTubeToEmbed(url: string): string {
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

  return url;
}

/**
 * Convert Spotify URL to embed URL
 */
function convertSpotifyToEmbed(url: string): string {
  // If already embed URL, return as-is
  if (url.includes("open.spotify.com/embed/")) {
    return url;
  }

  // Convert open.spotify.com URLs to embed format
  if (url.includes("open.spotify.com/")) {
    return url.replace("open.spotify.com/", "open.spotify.com/embed/");
  }

  return url;
}

/**
 * Check if URL is a YouTube video URL
 */
function isYouTubeUrl(url: string): boolean {
  return url.includes("youtube.com") || url.includes("youtu.be");
}

/**
 * Render rich text array to HTML
 * Handles links by converting href to <a> tags
 */
function renderRichText(texts: Array<{ text: string; href: string | null }> | undefined): string {
  if (!texts?.length) return "";

  return texts
    .map((t) => {
      const escapedText = escapeHtml(t.text);
      if (t.href) {
        return `<a href="${escapeHtml(t.href)}" class="notion-link" target="_blank" rel="noopener noreferrer">${escapedText}</a>`;
      }
      return escapedText;
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
 * Get list type (ul for bulleted, ol for numbered)
 */
function getListType(type: string): "ul" | "ol" {
  return type === "bulleted_list_item" ? "ul" : "ol";
}

/**
 * Render icon to HTML
 */
function renderIcon(icon: { type: string; value: string; name?: string } | null): string {
  if (!icon) return "";

  if (icon.type === "emoji") {
    return `<span class="notion-icon notion-icon-emoji">${icon.value}</span>`;
  }

  if (icon.type === "custom_emoji") {
    return `<img class="notion-icon notion-icon-custom" src="${escapeHtml(icon.value)}" alt="${escapeHtml(icon.name || "")}" />`;
  }

  // external or file
  return `<img class="notion-icon notion-icon-image" src="${escapeHtml(icon.value)}" alt="" />`;
}

/**
 * Render caption text
 */
function renderCaption(caption: Array<{ text: string; href: string | null }> | undefined): string {
  if (!caption?.length) return "";
  return caption.map((c) => c.text).join("");
}

/**
 * Render a single block to HTML
 */
function renderBlock(block: PageBlockContentOnly): string {
  const type = block.type;
  let html = "";

  // Text blocks
  if (type === "paragraph") {
    const content = block.content as ParagraphContent;
    html = `<p class="notion-paragraph">${renderRichText(content.text)}</p>`;
  } else if (type === "heading_1") {
    const content = block.content as HeadingContent;
    html = `<h1 class="notion-heading notion-heading-1">${renderRichText(content.text)}</h1>`;
  } else if (type === "heading_2") {
    const content = block.content as HeadingContent;
    html = `<h2 class="notion-heading notion-heading-2">${renderRichText(content.text)}</h2>`;
  } else if (type === "heading_3") {
    const content = block.content as HeadingContent;
    html = `<h3 class="notion-heading notion-heading-3">${renderRichText(content.text)}</h3>`;
  } else if (type === "heading_4") {
    const content = block.content as HeadingContent;
    html = `<h4 class="notion-heading notion-heading-4">${renderRichText(content.text)}</h4>`;
  } else if (type === "quote") {
    const content = block.content as QuoteContent;
    html = `<blockquote class="notion-quote">${renderRichText(content.text)}</blockquote>`;
  } else if (type === "callout") {
    const content = block.content as CalloutContent;
    const iconHtml = content.icon
      ? `<span class="notion-callout-icon">${renderIcon(content.icon)}</span>`
      : "";

    const iconName = content.icon?.type === "custom_emoji" ? content.icon.name : "";

    html = `
    <div data-callout-icon="${iconName}" class="notion-callout">
      ${iconHtml}
      <div class="notion-callout-content">${renderRichText(content.text)}</div>
    </div>`;
  }

  // List blocks
  else if (type === "bulleted_list_item" || type === "numbered_list_item") {
    const content = block.content as ListItemContent;
    html = `<li class="notion-list-item">${renderRichText(content.text)}</li>`;
  } else if (type === "to_do") {
    const content = block.content as ToDoContent;
    const checked = content.checked ? " checked" : "";
    const checkedClass = content.checked ? " notion-to-do-checked" : "";
    html = `
    <div class="notion-to-do${checkedClass}">
      <input type="checkbox" ${checked} disabled />
      <span class="notion-to-do-text">${renderRichText(content.text)}</span>
    </div>`;
  } else if (type === "toggle") {
    const content = block.content as ToggleContent;
    const children = block.childBlocks?.length ? renderBlocks(block.childBlocks) : "";
    html = `
    <details class="notion-toggle">
      <summary class="notion-toggle-summary">${renderRichText(content.text)}</summary>
      <div class="notion-toggle-content">${children}</div>
    </details>`;
  }

  // Media blocks
  else if (type === "image") {
    const content = block.content as MediaContent;
    html = `
    <figure class="notion-image-block">

      <div class="notion-image-wrapper" style="position: relative; width: 100%; aspect-ratio: 16/9; overflow: hidden;">
        <img class="notion-image" src="${escapeHtml(content.url)}" alt="${escapeHtml(renderCaption(content.caption))}" loading="lazy" style="width: 100%; height: 100%; object-fit: cover;" />
      </div>

      <figcaption class="notion-image-caption">${renderRichText(content.caption)}</figcaption>

    </figure>`;
  } else if (type === "video") {
    const content = block.content as MediaContent;
    const url = content.url;

    // Check if it's a YouTube URL - use iframe embed instead of video tag
    if (isYouTubeUrl(url)) {
      const embedUrl = convertYouTubeToEmbed(url);
      html = `<div class="notion-video-embed" style="position: relative; width: 100%; padding-bottom: 56.25%; border-radius: 8px; overflow: hidden;">
        <iframe src="${escapeHtml(embedUrl)}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe>
      </div>`;
    } else {
      // Regular video file
      html = `<video class="notion-video" src="${escapeHtml(url)}" controls></video>`;
    }
  } else if (type === "audio") {
    const content = block.content as MediaContent;
    html = `<audio class="notion-audio" src="${escapeHtml(content.url)}" controls></audio>`;
  } else if (type === "pdf" || type === "file") {
    const content = block.content as MediaContent;
    html = `<a href="${escapeHtml(content.url)}" class="notion-file" target="_blank" rel="noopener noreferrer">${escapeHtml(renderCaption(content.caption) || "Download File")}</a>`;
  }

  // Code block
  else if (type === "code") {
    const content = block.content as CodeContent;
    const language = content.language || "text";
    const captionHtml = content.caption?.length
      ? `<figcaption class="notion-code-caption">${renderRichText(content.caption)}</figcaption>`
      : "";
    html = `
    <figure class="notion-code-block">

      ${captionHtml}
      <pre class="notion-code"><code class="language-${language}">${escapeHtml(content.code)}</code></pre>

     </figure>`;
  }

  // Equation
  else if (type === "equation") {
    const content = block.content as EquationContent;
    html = `<div class="notion-equation">$$${escapeHtml(content.expression)}$$</div>`;
  }

  // Table blocks
  else if (type === "table") {
    const content = block.content as TableContent;
    const children = block.childBlocks?.length ? renderBlocks(block.childBlocks) : "";
    html = `
    <table class="notion-table" data-width="${content.width}" data-has-column-header="${content.hasColumnHeader}" data-has-row-header="${content.hasRowHeader}">

      ${children}

    </table>`;
  } else if (type === "table_row") {
    const content = block.content as TableRowContent;
    const cells = content.cells
      .map((cell) => `<td class="notion-table-cell">${renderRichText(cell)}</td>`)
      .join("");
    html = `<tr class="notion-table-row">${cells}</tr>`;
  }

  // Structure blocks
  else if (type === "column_list") {
    const children = block.childBlocks?.length ? renderBlocks(block.childBlocks) : "";
    html = `<div class="notion-column-list">${children}</div>`;
  } else if (type === "column") {
    const children = block.childBlocks?.length ? renderBlocks(block.childBlocks) : "";
    html = `<div class="notion-column">${children}</div>`;
  } else if (type === "divider") {
    html = `<hr class="notion-divider" />`;
  } else if (type === "breadcrumb") {
    html = `<nav class="notion-breadcrumb"></nav>`;
  } else if (type === "table_of_contents") {
    html = `<div class="notion-table-of-contents"></div>`;
  }

  // Navigation blocks
  else if (type === "child_page") {
    const content = block.content as ChildPageContent;
    const url = content.publicUrl || content.url;
    const iconHtml = content.icon ? renderIcon(content.icon) : "📄";

    html = `
    <a href="${escapeHtml(url)}" target="_blank" class="notion-child-page-link" data-notion-url="${escapeHtml(content.url)}">
      <span class="notion-child-page-icon">${iconHtml}</span>
      <span class="notion-child-page-title">${escapeHtml(content.title)}</span>
    </a>`;
  } else if (type === "child_database") {
    const content = block.content as ChildDatabaseContent;

    if (!content.pages?.length) {
      html = `<div class="notion-child-database notion-child-database-empty"></div>`;
    } else {
      // Render links to database pages instead of full content
      const pages = content.pages
        .map((page) => {
          const pageUrl = page.publicUrl || page.url;
          return `
          <a href="${escapeHtml(pageUrl)}" class="notion-database-page-link" data-page-id="${page.id}" data-notion-url="${escapeHtml(page.url)}">
          
          ${escapeHtml(page.title?.fullText || "Untitled")}
          
          </a>`;
        })
        .join("");
      html = `<div class="notion-child-database"><div class="notion-database-pages">${pages}</div></div>`;
    }
  } else if (type === "link_to_page") {
    const content = block.content as LinkToPageContent;
    const url =
      content.type === "page_id"
        ? `/page/${content.id}`
        : content.type === "database_id"
          ? `/database/${content.id}`
          : `#${content.id}`;
    html = `<a href="${url}" class="notion-link-to-page" data-type="${content.type}" data-id="${content.id}">View ${content.type.replace("_", " ")}</a>`;
  }

  // Embed blocks
  else if (type === "bookmark") {
    const content = block.content as BookmarkContent;
    html = `<a href="${escapeHtml(content.url)}" role="link"  class="notion-bookmark" target="_blank" rel="noopener noreferrer"><div class="notion-bookmark-url">${escapeHtml(content.url)}</div></a>`;
  } else if (type === "embed") {
    const content = block.content as EmbedContent;
    let url = content.url;

    // Fix Spotify URLs to use embed format
    if (url.includes("open.spotify.com")) {
      url = convertSpotifyToEmbed(url);
    }

    // Fix YouTube URLs if someone pasted a watch URL in an embed block
    if (isYouTubeUrl(url) && !url.includes("/embed/")) {
      url = convertYouTubeToEmbed(url);
    }

    html = `<div class="notion-embed"><iframe src="${escapeHtml(url)}" frameborder="0" allowfullscreen></iframe></div>`;
  } else if (type === "link_preview") {
    const content = block.content as EmbedContent;
    html = `<div class="notion-link-preview"><iframe src="${escapeHtml(content.url)}" frameborder="0"></iframe></div>`;
  }

  // Special blocks
  else if (type === "template") {
    html = `<div class="notion-template"></div>`;
  } else if (type === "synced_block") {
    const children = block.childBlocks?.length ? renderBlocks(block.childBlocks) : "";
    html = `<div class="notion-synced-block">${children}</div>`;
  } else if (type === "unsupported") {
    html = `<p class="notion-unknown"></p>`;
  }

  // Fallback for unknown types
  else {
    html = `<p class="notion-unknown"></p>`;
  }

  // Handle childBlocks for blocks that don't already handle them
  // Blocks that already handle children: toggle, column_list, column, synced_block
  const blocksWithChildHandling = [
    "toggle",
    "column_list",
    "column",
    "synced_block",
    "table",
    "child_page",
    "child_database",
  ];
  if (!blocksWithChildHandling.includes(type) && block.childBlocks?.length) {
    const childrenHtml = renderBlocks(block.childBlocks);
    // Insert children before closing tag for container elements
    if (html.includes("</div>")) {
      html = html.replace(/<\/div>$/, `<div class="notion-children">${childrenHtml}</div></div>`);
    } else if (html.includes("</blockquote>")) {
      html = html.replace(
        /<\/blockquote>$/,
        `<div class="notion-children">${childrenHtml}</div></blockquote>`,
      );
    } else if (html.includes("</li>")) {
      html = html.replace(/<\/li>$/, `<div class="notion-children">${childrenHtml}</div></li>`);
    } else {
      // For other elements, append after
      html = `${html}<div class="notion-children">${childrenHtml}</div>`;
    }
  }

  return html;
}

/**
 * Render multiple blocks with list grouping
 */
function renderBlocks(blocks: PageBlockContentOnly[] | PageBlock[]): string {
  const result: string[] = [];
  let currentList: { type: "ul" | "ol"; items: string[] } | null = null;

  for (const block of blocks) {
    // Handle list items - group consecutive ones
    if (isListItem(block.type)) {
      const listType = getListType(block.type);

      if (!currentList || currentList.type !== listType) {
        // Flush previous list
        if (currentList) {
          result.push(
            `<${currentList.type} class="notion-list notion-${currentList.type}">${currentList.items.join("")}</${currentList.type}>`,
          );
        }

        currentList = { type: listType, items: [] };
      }

      currentList.items.push(renderBlock(block));
    } else {
      // Flush list if exists
      if (currentList) {
        result.push(
          `<${currentList.type} class="notion-list notion-${currentList.type}">${currentList.items.join("")}</${currentList.type}>`,
        );

        currentList = null;
      }

      result.push(renderBlock(block));
    }
  }

  // Flush remaining list
  if (currentList) {
    result.push(
      `<${currentList.type} class="notion-list notion-${currentList.type}">${currentList.items.join("")}</${currentList.type}>`,
    );
  }

  return result.join("\n");
}

/**
 * Render database page to HTML
 */
function renderDatabasePage(page: Page): string {
  const blocks = renderBlocks(page.blocks);
  const title = page.title?.fullText || "Untitled";

  return `
  <article class="notion-database-page" data-page-id="${page.id}">
      <header class="notion-database-page-header">
        <h3 class="notion-database-page-title">${escapeHtml(title)}</h3>
      </header>
      <div class="notion-database-page-content">
        ${blocks}
      </div>
  </article>
  `.trim();
}

/**
 * Extract first paragraph for meta description
 */
function extractFirstParagraph(blocks: PageBlockContentOnly[] | PageBlock[]): string {
  const para = blocks.find(
    (b) =>
      b.type === "paragraph" &&
      Array.isArray((b.content as ParagraphContent).text) &&
      (b.content as ParagraphContent).text.length > 0,
  );
  if (para) {
    const content = para.content as ParagraphContent;
    const fullText = content.fullText || "";
    return fullText.substring(0, 160);
  }
  return "";
}

/**
 * Wrap content with SEO-friendly container
 */
function wrapWithContainer(content: string, page: Page ): string {
  const title = page.title?.fullText || "Untitled";

  return `
  <article class="notion-page" data-page-id="${page.id}">
    <header class="notion-header">
      ${page.icon ? renderIcon(page.icon) : ""}
      <h1 class="notion-title">${escapeHtml(title)}</h1>
      ${page.cover ? `<div class="notion-cover"><img src="${escapeHtml(page.cover)}" alt="" loading="lazy" /></div>` : ""}
    </header>
    
    <main class="notion-content">
      ${content}
    </main>
  </article>
  `.trim();
}

/**
 * Convert Page or PageContentOnly to HTML string
 *
 * @param page - The page to convert
 * @returns HTML string
 *
 * @example
 * const html = toHTML(page);
 * // Returns: <article class="notion-page">...</article>
 */

export function toHTML() {
  return (page: Page) => {
    const blocks = page.blocks || [];
    const contentHTML = renderBlocks(blocks);
    return wrapWithContainer(contentHTML, page);
  };
}
