#!/usr/bin/env node

import { Command } from "commander";
import pushCommand from "./push.js";
import { loadEnvFile } from "node:process";
loadEnvFile();

const program = new Command()
  .name("notion-orm")
  .description("A CLI for managing Notion databases using notion-orm")
  .version("0.1.0")
  .option("-c, --config <path>", "Path to the configuration file")
  .option("-t, --token <token>", "Notion integration token (overrides config)")
  .option(
    "--root-page <id>",
    "Notion root page ID where databases will be created (overrides config)",
  )
  .option("-s , --schema <path>", "Path to schema file(s) with glob support (overrides config)")
  .addCommand(pushCommand)
  .parse();

export default program;
