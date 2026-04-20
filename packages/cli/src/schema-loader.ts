/**
 * Schema Loader Module
 *
 * Handles loading and deserialization of schema files.
 * Supports glob patterns for finding schema files and extracts
 * NotionTable definitions from module exports.
 */

import { glob } from "glob";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import type { NotionTable } from "notion-orm/core";

/**
 * Represents a loaded table schema with its export name and source file
 */
export interface LoadedSchema {
  /** The export name from the schema file (e.g., "tasksTable") */
  name: string;
  /** The table definition */
  table: NotionTable;
  /** Absolute path to the source file */
  filePath: string;
}

/**
 * Check if a value is a valid NotionTable object
 * Validates by checking for the _type: "table" property
 */
function isNotionTable(value: unknown): value is NotionTable {
  return (
    typeof value === "object" &&
    value !== null &&
    "_type" in value &&
    (value as Record<string, unknown>)._type === "table" &&
    "title" in value &&
    typeof (value as Record<string, unknown>).title === "string" &&
    "properties" in value &&
    typeof (value as Record<string, unknown>).properties === "object"
  );
}

/**
 * Extract NotionTable exports from a loaded module
 * Filters out non-table exports and returns structured data
 */
function extractTablesFromModule(
  moduleExports: Record<string, unknown>,
  filePath: string,
): LoadedSchema[] {
  const schemas: LoadedSchema[] = [];

  for (const [exportName, exportValue] of Object.entries(moduleExports)) {
    // Skip default exports and internal properties
    if (exportName === "default" || exportName.startsWith("__")) {
      continue;
    }

    // Check if the export is a NotionTable
    if (isNotionTable(exportValue)) {
      schemas.push({
        name: exportName,
        table: exportValue,
        filePath,
      });
    }
  }

  return schemas;
}

/**
 * Load a single schema file and extract NotionTable exports
 *
 * @param filePath - Absolute path to the schema file
 * @returns Array of loaded schemas from this file
 * @throws Error if the file cannot be loaded or parsed
 */
async function loadSchemaFile(filePath: string): Promise<LoadedSchema[]> {
  try {
    // Convert to file URL for proper ESM imports
    // This works with tsx for .ts files and native ESM for .js/.mjs
    const fileUrl = pathToFileURL(resolve(filePath)).href;

    // Dynamically import the schema file
    const module = await import(fileUrl);

    // Extract NotionTable exports
    return extractTablesFromModule(module, filePath);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to load schema file "${filePath}": ${message}`);
  }
}

export async function loadSchemasFromGlob(
  pattern: string,
  cwd: string = process.cwd(),
): Promise<LoadedSchema[]> {
  // Resolve glob pattern to find all matching files
  const files = await glob(pattern, {
    ignore: "node_modules/**",
  });

  if (!files.length) {
    throw new Error(`No schema files found matching pattern: ${pattern} (cwd: ${cwd})`);
  }

  // Load all schema files in parallel
  const results = await Promise.all(
    files.map(async (filePath) => {
      const schemas = await loadSchemaFile(filePath);
      return { filePath, schemas };
    }),
  );

  // Collect all schemas
  const allSchemas: LoadedSchema[] = [];
  for (const { filePath, schemas } of results) {
    if (schemas.length === 0) {
      console.warn(`No table exports found in schema file: "${filePath}"`);
      continue;
    }
    allSchemas.push(...schemas);
  }

  if (!allSchemas.length) {
    throw new Error(
      `No NotionTable exports found in any schema files matching pattern: "${pattern}"`,
    );
  }

  return allSchemas;
}

/**
 * Group loaded schemas by their source file
 * Useful for displaying organized output during push operations
 */
export function groupSchemasByFile(schemas: LoadedSchema[]): Map<string, LoadedSchema[]> {
  const grouped = new Map<string, LoadedSchema[]>();

  for (const schema of schemas) {
    const existing = grouped.get(schema.filePath) || [];
    existing.push(schema);
    grouped.set(schema.filePath, existing);
  }

  return grouped;
}

/**
 * Get all unique table names from loaded schemas
 * Useful for detecting duplicates
 */
export function getTableTitles(schemas: LoadedSchema[]): string[] {
  const titles = new Set<string>();
  for (const schema of schemas) {
    titles.add(schema.table.title);
  }
  return Array.from(titles);
}

/**
 * Find duplicate table titles in the loaded schemas
 * Returns a map of duplicate titles to the files they appear in
 */
export function findDuplicateTableTitles(schemas: LoadedSchema[]): Map<string, string[]> {
  const titleToFiles = new Map<string, Set<string>>();

  for (const schema of schemas) {
    const files = titleToFiles.get(schema.table.title) || new Set<string>();
    files.add(schema.filePath);
    titleToFiles.set(schema.table.title, files);
  }

  // Filter to only duplicates
  const duplicates = new Map<string, string[]>();
  for (const [title, files] of titleToFiles) {
    if (files.size > 1) {
      duplicates.set(title, Array.from(files));
    }
  }

  return duplicates;
}

/**
 * Build a mapping of export names to table titles
 * Useful for resolving relations during push
 */
export function buildExportNameToTitleMap(schemas: LoadedSchema[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const schema of schemas) {
    map.set(schema.name, schema.table.title);
  }
  return map;
}
