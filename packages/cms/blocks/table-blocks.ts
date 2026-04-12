/**
 * Table block handlers
 * Table, Table Row
 */

import type {
  TableBlockObjectResponse,
  TableRowBlockObjectResponse,
} from "@notionhq/client";
import { extractRichText } from "./utils.js";
import type { TableContent, TableRowContent } from "../types.js";

/**
 * Handle table block
 */
export const handleTable =
  (block: () => TableBlockObjectResponse) => (): TableContent => {
    const b = block();
    return {
      width: b.table.table_width,
      hasColumnHeader: b.table.has_column_header,
      hasRowHeader: b.table.has_row_header,
    };
  };

/**
 * Handle table row block
 */
export const handleTableRow =
  (block: () => TableRowBlockObjectResponse) => (): TableRowContent => {
    const b = block();
    return {
      cells: b.table_row.cells.map((cell) => extractRichText(cell)),
    };
  };
