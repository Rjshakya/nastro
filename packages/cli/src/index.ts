#!/usr/bin/env node

import { Command } from "commander";
import { resolveConfig } from "./config.js";
import type { CliOptions } from "./types.js";

const program = new Command()
  .name("notion-orm")
  .description("A CLI for managing Notion databases using notion-orm")
  .version("0.1.0")
  .option("-c, --config <path>", "Path to the configuration file")
  .option("--token <token>", "Notion integration token (overrides config)")
  .option(
    "--root-page <id>",
    "Notion root page ID where databases will be created (overrides config)",
  )
  .option("--schema <path>", "Path to schema file(s) with glob support (overrides config)")
  .option("--dry-run", "Preview changes without applying them", false)
  .option("--force", "Force recreate databases (destructive)", false)
  .parse();

async function main() {
  const cliOptions: CliOptions = program.opts();

  try {
    // Resolve config by merging file config and CLI options

    const config = await resolveConfig(cliOptions);

    console.log("✓ Config loaded successfully");
    console.log("  Token:", config.token.slice(0, 8) + "...");
    console.log("  Root Page ID:", config.rootPage);
    console.log("  Schema Path:", config.schema);

    // TODO: Implement push command
    console.log("\nConfig is ready! Push command coming soon...");
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error:", error.message);
    } else {
      console.error("Unknown error:", error);
    }
    process.exit(1);
  }
}

main();
