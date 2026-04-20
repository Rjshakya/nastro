import { Command } from "commander";
import { resolveConfig } from "./config.js";
import { loadSchemasFromGlob } from "./schema-loader.js";
import type { NotionOrmConfig } from "./types.js";
import { convertSchemeToDataBaseParams, createDatabase } from "./utils.js";
import { createNotionApi } from "@nastro/notion-api";
import { loadMapping, writeMapping } from "./mapping.js";
import { compareProperties, hasDeletions, formatDiffs } from "./compare.js";

const pushCommand = new Command()
  .name("push")
  .description("Push the schema to Notion and create/update databases")
  .option("-f, --force", "Force push even if properties would be deleted", false)
  .action(async function (options) {
    const { force, ...cliOptions } = options;
    const config = await resolveConfig(cliOptions);
    await handlePush(config, force as boolean);
  });

export default pushCommand;

/**
 * Result of pushing a single table
 */
interface PushResult {
  tableTitle: string;
  status: "created" | "updated" | "skipped" | "error";
  databaseId?: string;
  message?: string;
}

/**
 * Handle the push command with change detection and mapping generation
 *
 * Flow:
 * 1. Load schemas from glob pattern
 * 2. Load existing mapping file (if exists)
 * 3. For each table:
 *    - If in mapping: fetch from Notion, compare properties
 *      - If not found: create new database
 *      - If found and deletions detected (no --force): skip
 *      - If found and no issues: keep existing, update mapping
 *    - If not in mapping: create new database
 * 4. Write updated mapping to notion-orm.generated.ts
 */
async function handlePush(config: NotionOrmConfig, force: boolean): Promise<void> {
  try {
    const { rootPage, schema: schemaPattern, token } = config;

    console.log("Starting push operation...\n");

    const schemas = await loadSchemasFromGlob(schemaPattern);
    const tables = schemas.map((s) => s.table);

    const notion = createNotionApi({ token });
    const existingMapping = await loadMapping();

    const results: PushResult[] = [];
    const skippedTables: Array<{ title: string; reason: string }> = [];
    const newMapping: Record<string, string> = { ...existingMapping };

    // Phase 1: Validate all tables before creating any
    const tablesToCreate: Array<{ table: (typeof tables)[0]; title: string }> = [];
    const tablesToUpdate: Array<{ table: (typeof tables)[0]; title: string; databaseId: string }> =
      [];

    for (const table of tables) {
      const title = table.title;
      if (!existingMapping[title]) {
        console.log(`New table "${title}", will create.`);
        tablesToCreate.push({ table, title });
      }

      const existingId = existingMapping[title];
      console.log(`Checking existing database "${title}"...`);

      try {
        const db = await notion.getDataBase(existingId);

        if (!db) {
          // Database not found or has no data sources, create new
          console.log(`Table not found in Notion, will create new.`);
          tablesToCreate.push({ table, title });
          continue;
        }

        // Database exists, get data source for property comparison
        const dataSourceId = db.data_sources[0].id;
        const dataSource = await notion.getDataSource(dataSourceId);
        const diffs = compareProperties(dataSource, table);

        if (diffs.length) {
          console.log(`  Changes detected:`);
          console.log(formatDiffs(diffs));
        }

        if (hasDeletions(diffs) && !force) {
          const reason = "Property deletions detected. Use --force to override.";
          console.log(`  Skipping: ${reason}\n`);
          skippedTables.push({ title, reason });
          continue;
        }

        // Keep existing database, just update mapping
        tablesToUpdate.push({ table, title, databaseId: existingId });
        console.log(`  Updating tables\n`);
      } catch (error) {
        // Database not found in Notion (likely deleted), create new
        const message = error instanceof Error ? error.message : String(error);
        console.log(`  Database check failed (${message}), will create new.`);
        tablesToCreate.push({ table, title });
      }
    }

    // Phase 2: Create new databases
    if (tablesToCreate.length > 0) {
      console.log(`\nCreating ${tablesToCreate.length} new database(s)...`);

      const createPromises = tablesToCreate.map(async ({ table, title }) => {
        try {
          const params = convertSchemeToDataBaseParams(table, rootPage);
          const id = await createDatabase(notion, params);
          newMapping[title] = id;
          results.push({ tableTitle: title, status: "created", databaseId: id });
          console.log(`  ✓ Created "${title}": ${id}`);
          return { title, id, success: true as const };
        } catch (error) {
          console.error(error);
          const message = error instanceof Error ? error.message : String(error);
          results.push({ tableTitle: title, status: "error", message });
          console.error(`  ✗ Error creating "${title}": ${message}`);
          return { title, message, success: false as const };
        }
      });

      const settled = await Promise.all(createPromises);
      const failed = settled.filter((r) => !r.success);

      if (failed.length > 0) {
        console.log(`\n${failed.length} database(s) failed to create.`);
      }
    }

    // Phase 3: Update mapping for existing databases
    for (const { title, databaseId } of tablesToUpdate) {
      newMapping[title] = databaseId;
      results.push({ tableTitle: title, status: "updated", databaseId });
    }

    // Phase 4: Write mapping file
    await writeMapping(newMapping);

    // Print summary
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
  } catch (error) {
    console.error("\nError during push operation:", error);
    throw error;
  }
}
