import { Command } from "commander";
import { resolveConfig } from "./config.js";
import { loadSchemasFromGlob } from "./schema-loader.js";
import type { NotionOrmConfig } from "./types.js";
import { convertSchemeToDataBaseParams, createDatabase, buildUpdateProperty } from "./utils.js";
import { createNotionApi } from "@nastro-dev/notion-api";
import { loadMapping, writeMapping } from "./mapping.js";
import { compareProperties, hasDeletions, formatDiffs, type PropertyDiff } from "./compare.js";
import type { NotionTable } from "@nastro-dev/notion-orm";
import type { UpdateDataSourceParameters } from "@notionhq/client";

const pushCommand = new Command()
  .name("push")
  .description("Push the schema to Notion and create/update databases")
  .option("-f, --force", "Force push even if properties would be deleted", false)
  .option(
    "-r, --rename <renames...>",
    'Rename properties in format "oldName=newName". Can be used multiple times.',
  )
  .action(async function (options) {
    const { force, rename, ...cliOptions } = options;
    const config = await resolveConfig(cliOptions);
    await handlePush(config, force as boolean, rename);
  });

export default pushCommand;

interface PushResult {
  tableTitle: string;
  status: "created" | "updated" | "skipped" | "error";
  databaseId?: string;
  dataSourceId?: string;
  message?: string;
}

interface TableToCreate {
  table: NotionTable;
  title: string;
}

interface TableToUpdate {
  table: NotionTable;
  title: string;
  databaseId: string;
  dataSourceId: string;
  diffs: PropertyDiff[];
}

// ==================== Parse Renames ====================

function parseRenames(flags: string[] | undefined): Map<string, string> {
  const renames = new Map<string, string>();
  if (!flags) return renames;

  for (const flag of flags) {
    const [oldName, newName] = flag.split("=");
    if (oldName && newName) {
      renames.set(oldName, newName);
    } else {
      console.warn(`  ⚠ Invalid rename format: "${flag}". Expected "oldName=newName".`);
    }
  }
  return renames;
}

// ==================== Apply Renames to Diffs ====================

function applyRenames(diffs: PropertyDiff[], renames: Map<string, string>): PropertyDiff[] {
  const result: PropertyDiff[] = [];
  const handledNewNames = new Set<string>();

  for (const diff of diffs) {
    if (diff.type === "removed" && renames.has(diff.property)) {
      const newName = renames.get(diff.property)!;
      const addedDiff = diffs.find((d) => d.type === "added" && d.property === newName);

      if (addedDiff) {
        result.push({
          type: "renamed",
          property: diff.property,
          oldType: diff.oldType,
          newType: addedDiff.newType,
          newName,
        });
        handledNewNames.add(newName);
        continue;
      }
    }

    if (diff.type === "added" && handledNewNames.has(diff.property)) {
      continue;
    }

    result.push(diff);
  }

  return result;
}

// ==================== Classify Tables ====================

/**
 *
 * @description It will check for each table ; whether the table
 * exist in databaseMapping ; if not then push it to toCreate,
 * and then checks whether table exist in notion also ? if not then also
 * push it toCreate.
 *
 * if both these conditions do not met; then this is the case for
 * update.
 *
 *
 * @param notion
 * @param tables
 * @param existingMapping
 * @param force
 * @param renames
 * @returns
 */
async function classifyTables(
  notion: ReturnType<typeof createNotionApi>,
  tables: NotionTable[],
  existingMapping: Record<string, string>,
  force: boolean,
  renames: Map<string, string>,
): Promise<{
  toCreate: TableToCreate[];
  toUpdate: TableToUpdate[];
  skipped: Array<{ title: string; reason: string }>;
}> {
  const toCreate: TableToCreate[] = [];
  const toUpdate: TableToUpdate[] = [];
  const skipped: Array<{ title: string; reason: string }> = [];

  for (const table of tables) {
    const title = table.title;

    if (!existingMapping[title]) {
      console.log(`New table "${title}", will create.`);
      toCreate.push({ table, title });
      continue;
    }

    const existingId = existingMapping[title];
    console.log(`Checking existing database "${title}"...`);

    try {
      const db = await notion.getDataBase(existingId);

      if (!db) {
        console.log(`  Table not found in Notion, will create new.`);
        toCreate.push({ table, title });
        continue;
      }

      const dataSourceId = db.data_sources[0].id;
      const dataSource = await notion.getDataSource(dataSourceId);
      let diffs = compareProperties(dataSource, table);
      diffs = applyRenames(diffs, renames);

      if (diffs.length) {
        console.log(`  Changes detected:`);
        console.log(formatDiffs(diffs));
      }

      if (hasDeletions(diffs) && !force) {
        const reason = "Property deletions detected. Use --force to override.";
        console.log(`  Skipping: ${reason}\n`);
        skipped.push({ title, reason });
        continue;
      }

      toUpdate.push({ table, title, databaseId: existingId, dataSourceId, diffs });
      console.log(`  Will update\n`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.log(`  Database check failed (${message}), will create new.`);
      toCreate.push({ table, title });
    }
  }

  return { toCreate, toUpdate, skipped };
}

// ==================== Create Databases ====================

async function createDatabases(
  notion: ReturnType<typeof createNotionApi>,
  toCreate: TableToCreate[],
  rootPage: string,
): Promise<PushResult[]> {
  if (toCreate.length === 0) return [];

  console.log(`\nCreating ${toCreate.length} new database(s)...`);

  const results: PushResult[] = [];

  const promises = toCreate.map(async ({ table, title }) => {
    try {
      const params = convertSchemeToDataBaseParams(table, rootPage);
      const { id, dataSourceId } = await createDatabase(notion, params);
      results.push({ tableTitle: title, status: "created", databaseId: id, dataSourceId });
      console.log(`  ✓ Created "${title}": ${id}`);
      return { success: true as const };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      results.push({ tableTitle: title, status: "error", message });
      console.error(`  ✗ Error creating "${title}": ${message}`);
      return { success: false as const };
    }
  });

  await Promise.all(promises);
  return results;
}

// ==================== Update Databases ====================

async function updateDatabases(
  notion: ReturnType<typeof createNotionApi>,
  toUpdate: TableToUpdate[],
): Promise<PushResult[]> {
  if (toUpdate.length === 0) return [];

  console.log(`\nUpdating ${toUpdate.length} existing database(s)...`);

  const results: PushResult[] = [];

  for (const { table, title, dataSourceId, diffs, databaseId } of toUpdate) {
    try {
      const properties = buildUpdateProperties(table, diffs);

      if (Object.keys(properties).length > 0) {
        await notion.updateDataSource({
          data_source_id: dataSourceId,
          properties: properties,
        });
      }

      results.push({ tableTitle: title, status: "updated", databaseId: databaseId, dataSourceId });
      console.log(`  ✓ Updated "${title}"`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      results.push({ tableTitle: title, status: "error", message });
      console.error(`  ✗ Error updating "${title}": ${message}`);
    }
  }

  return results;
}

// ==================== Build Update Properties Payload ====================

function buildUpdateProperties(
  table: NotionTable,
  diffs: PropertyDiff[],
): NonNullable<UpdateDataSourceParameters["properties"]> {
  const properties = {} as NonNullable<UpdateDataSourceParameters["properties"]>;

  for (const diff of diffs) {
    switch (diff.type) {
      case "removed": {
        properties[diff.property] = null;
        break;
      }
      case "added": {
        const column = findColumnByName(table, diff.property);
        if (column) {
          const payload = buildUpdateProperty(column);
          if (payload) {
            properties[diff.property] = payload;
          } else {
            console.warn(`  ⚠ Skipping unsupported property "${diff.property}" (${column.type})`);
          }
        }
        break;
      }
      case "type_changed": {
        const column = findColumnByName(table, diff.property);
        if (column) {
          const payload = buildUpdateProperty(column);
          if (payload) {
            properties[diff.property] = payload;
          } else {
            console.warn(`  ⚠ Skipping unsupported property "${diff.property}" (${column.type})`);
          }
        }
        break;
      }
      case "renamed": {
        if (diff.newName) {
          properties[diff.property] = { name: diff.newName };
        }
        break;
      }
    }
  }

  return properties;
}

function findColumnByName(table: NotionTable, name: string) {
  for (const [key, column] of Object.entries(table.properties)) {
    const propName = column.name || key;
    if (propName === name) {
      return column;
    }
  }
  return null;
}

// ==================== Print Summary ====================

function printSummary(
  results: PushResult[],
  skippedTables: Array<{ title: string; reason: string }>,
): void {
  console.log("\n" + "=".repeat(50));
  console.log("Push Summary");
  console.log("=".repeat(50));
  console.log(`  Created: ${results.filter((r) => r.status === "created").length}`);
  console.log(`  Updated: ${results.filter((r) => r.status === "updated").length}`);
  console.log(`  Skipped: ${skippedTables.length}`);
  console.log(`  Errors:  ${results.filter((r) => r.status === "error").length}`);

  if (skippedTables.length > 0) {
    console.log("\nSkipped tables:");
    for (const { title, reason } of skippedTables) {
      console.log(`  - ${title}: ${reason}`);
    }
  }

  if (results.some((r) => r.status === "error")) {
    console.log("\nErrors occurred during push. Check logs above.");
    process.exit(1);
  }

  console.log("\nPush operation completed successfully!");
}

// ==================== Entry Point ====================

async function handlePush(
  config: NotionOrmConfig,
  force: boolean,
  renameFlags: string[] | undefined,
): Promise<void> {
  try {
    const { rootPage, schema: schemaPattern, token } = config;
    const renames = parseRenames(renameFlags);

    console.log("Starting push operation...\n");

    const schemas = await loadSchemasFromGlob(schemaPattern);
    const tables = schemas.map((s) => s.table);

    const notion = createNotionApi({ token });
    const existingMapping = await loadMapping();
    const newMapping: Record<string, string> = { ...existingMapping };

    const { toCreate, toUpdate, skipped } = await classifyTables(
      notion,
      tables,
      existingMapping,
      force,
      renames,
    );

    const createResults = await createDatabases(notion, toCreate, rootPage);
    const updateResults = await updateDatabases(notion, toUpdate);

    for (const { databaseId, dataSourceId, tableTitle } of createResults) {
      if (databaseId && dataSourceId) {
        newMapping[tableTitle] = databaseId;
        newMapping[databaseId] = dataSourceId;
      }
    }

    await writeMapping(newMapping);

    printSummary([...createResults, ...updateResults], skipped);
  } catch (error) {
    console.error("\nError during push operation:", error);
    throw error;
  }
}
