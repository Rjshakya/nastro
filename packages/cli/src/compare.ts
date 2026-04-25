import type { NotionTable } from "@nastro-dev/notion-orm";
import type { DataSourceObjectResponse } from "@notionhq/client";

/**
 * Represents a detected difference between existing and new schema properties
 */
export interface PropertyDiff {
  type: "added" | "removed" | "type_changed" | "renamed";
  property: string;
  oldType?: string;
  newType?: string;
  newName?: string;
}

/**
 * Compare existing database properties (from Notion API) with new schema definition
 * Compares property names and types, skipping the title property
 *
 * @param dataSource - The existing data source from Notion
 * @param newTable - The new table schema definition
 * @returns Array of detected differences
 */
export function compareProperties(
  dataSource: DataSourceObjectResponse,
  newTable: NotionTable,
): PropertyDiff[] {
  const diffs: PropertyDiff[] = [];

  // Build map of existing properties (name -> type), skip title
  const existingProps = new Map<string, string>();

  for (const [name, prop] of Object.entries(dataSource.properties)) {
    existingProps.set(name, prop.type);
  }

  // Build map of new properties (name -> type), skip title
  const newProps = new Map<string, string>();

  for (const [key, column] of Object.entries(newTable.properties)) {
    const propName = key ?? column.name;
    newProps.set(propName, column.type);
  }

  // Check for removed properties (in old but not in new)
  for (const [name, oldType] of existingProps) {
    if (!newProps.has(name)) {
      diffs.push({
        type: "removed",
        property: name,
        oldType,
      });
    }
  }

  // Check for added and type-changed properties (in new)
  for (const [name, newType] of newProps) {
    if (!existingProps.has(name)) {
      diffs.push({
        type: "added",
        property: name,
        newType,
      });
    } else {
      const oldType = existingProps.get(name);
      if (oldType !== newType) {
        diffs.push({
          type: "type_changed",
          property: name,
          oldType,
          newType,
        });
      }
    }
  }

  return diffs;
}

/**
 * Check if any deletions were detected in the diff list
 * @param diffs - Array of property differences
 * @returns True if any property deletions were found
 */
export function hasDeletions(diffs: PropertyDiff[]): boolean {
  return diffs.length ? diffs.some((d) => d.type === "removed") : false;
}

/**
 * Format differences for console output
 * @param diffs - Array of property differences
 * @returns Formatted string with change details
 */
export function formatDiffs(diffs: PropertyDiff[]): string {
  const lines: string[] = [];

  for (const diff of diffs) {
    switch (diff.type) {
      case "added":
        lines.push(`  + ${diff.property} (${diff.newType})`);
        break;
      case "removed":
        lines.push(`  - ${diff.property} (${diff.oldType})`);
        break;
      case "type_changed":
        lines.push(`  ~ ${diff.property}: ${diff.oldType} → ${diff.newType}`);
        break;
      case "renamed":
        lines.push(`  → ${diff.property} → ${diff.newName} (${diff.newType})`);
        break;
    }
  }

  return lines.join("\n");
}
