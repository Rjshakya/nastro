import type {
  Page,
  PageBlock,
  BlockEntry,
  BlockMap,
  PageWithBlockMap,
  PageWithBlockMapInDatabase,
  ChildDatabaseContent,
  ChildDatabaseContentWithBlockMap,
} from "../types";

function convertPageToBlockMapInDatabase(page: Page): PageWithBlockMapInDatabase {
  return {
    ...page,
    blocks: convertToBlockMap(page.blocks),
  };
}

function convertToBlockMap(blocks: PageBlock[]): BlockMap {
  const map: BlockMap = {};

  for (const block of blocks) {
    let content = block.content;

    // Special case: child_database - convert pages to Record with BlockMap
    if (block.type === "child_database") {
      const dbContent = content as ChildDatabaseContent;
      const pagesRecord: Record<string, PageWithBlockMapInDatabase> = {};

      for (const page of dbContent.pages) {
        pagesRecord[page.id] = convertPageToBlockMapInDatabase(page);
      }

      content = {
        properties: dbContent.properties,
        pages: pagesRecord,
        nextCursor: dbContent.nextCursor,
      } as ChildDatabaseContentWithBlockMap;
    }

    const entry: BlockEntry = {
      id: block.id,
      type: block.type,
      content,
      hasChildren: block.hasChildren,
    };

    // Recursively convert children if they exist
    if (block.childBlocks && block.childBlocks.length > 0) {
      entry.children = convertToBlockMap(block.childBlocks);
    }

    map[block.id] = entry;
  }

  return map;
}

export function toBlockMap() {
  return (page: Page): PageWithBlockMap => ({
    ...page,
    blocks: convertToBlockMap(page.blocks),
  });
}
