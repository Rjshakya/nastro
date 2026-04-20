import { Command } from "commander";
import { resolveConfig } from "./config";
import { loadSchemasFromGlob } from "./schema-loader";
import type { NotionOrmConfig } from "./types";
import { convertSchemeToDataBaseParams, createDatabase } from "./utils";
import { createNotionApi } from "@nastro/notion-api";

const pushCommand = new Command()
  .name("push")
  .description("Push the schema to Notion and create/update databases")
  .action(async function (options) {
    const config = await resolveConfig(options);
    await handlePush(config);
  });

export default pushCommand;

/**
 * Handle the push command
 * Loads schemas from glob pattern and pushes them to Notion
 */
async function handlePush(config: NotionOrmConfig): Promise<void> {
  try {
    const { rootPage, schema: schemaPattern, token } = config;

    console.log("Starting push operation...");

    const schemas = await loadSchemasFromGlob(schemaPattern);
    const tables = schemas.map((s) => s.table);

    const notion = createNotionApi({ token });
    const promises = await Promise.all(
      tables.map((table) => {
        const params = convertSchemeToDataBaseParams(table, rootPage);
        return createDatabase(notion, params);
      }),
    );

    promises.forEach((id) => console.log(id));
    console.log("Push operation completed successfully!");
  } catch (error) {
    console.error("Error during push operation:", error);
    throw error;
  }
}
