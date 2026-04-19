import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import type { CliOptions, NotionOrmConfig } from "./types.js";

/**
 * Default config file names to look for
 */
const DEFAULT_CONFIG_FILES = [
  "notion-orm.config.ts",
  "notion-orm.config.js",
  "notion-orm.config.mjs",
];

/**
 * Find config file in the current directory
 * @param cwd - Current working directory
 * @returns Path to config file or null if not found
 */
export function findConfigFile(cwd: string = process.cwd()): string | null {
  for (const file of DEFAULT_CONFIG_FILES) {
    const fullPath = resolve(cwd, file);
    if (existsSync(fullPath)) {
      return fullPath;
    }
  }
  return null;
}

/**
 * Load config from a file path
 * Supports .ts, .js, and .mjs files
 * Uses pathToFileURL for proper ESM imports
 * @param configPath - Path to config file
 * @returns Loaded config object
 */
export async function loadConfigFile(configPath: string): Promise<NotionOrmConfig> {
  try {
    // Convert to file URL for proper ESM imports
    // This works with tsx for .ts files and native ESM for .js/.mjs
    const fileUrl = pathToFileURL(resolve(configPath)).href;
    const configModule = await import(fileUrl);
    console.log(configModule);
    const config = configModule.default || configModule;

    if (!config || typeof config !== "object") {
      throw new Error(`Config file at ${configPath} must export a valid object`);
    }

    return config as NotionOrmConfig;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to load config file at ${configPath}: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Resolve final configuration by merging config file and CLI options
 * CLI options take precedence over config file values
 * Environment variables are used as fallback
 * @param cliOptions - Options from CLI flags
 * @param configFilePath - Path to config file (optional, will auto-discover if not provided)
 * @returns Resolved configuration
 */
export async function resolveConfig(cliOptions: CliOptions): Promise<NotionOrmConfig> {
  // Load config from file if path provided, otherwise auto-discover
  let config: Partial<NotionOrmConfig> | undefined;

  if (!(cliOptions.config?.endsWith(".ts") || cliOptions.config?.endsWith(".js"))) {
    throw new Error("Invalid config file extension. Supported extensions are .ts and .js");
  }

  if (cliOptions.config) {
    config = await loadConfigFile(cliOptions.config);
  } else {
    const discoveredPath = findConfigFile();
    config = await loadConfigFile(discoveredPath ?? "");
  }

  if (!config) {
    throw new Error("no config file is found");
  }

  // Merge config: CLI options override file config, env vars as fallback
  const token = cliOptions.token ?? config.token ?? process.env.NOTION_TOKEN;
  const rootPage = cliOptions.rootPage ?? config.rootPage;
  const schema = cliOptions.schema ?? config.schema;

  // Validate required fields
  if (!token) {
    throw new Error(
      "Missing required field: token. Provide it via config file, --token flag, or NOTION_TOKEN env var.",
    );
  }

  if (!rootPage) {
    throw new Error(
      "Missing required field: rootPageId. Provide it via config file or --root-page flag.",
    );
  }

  if (!schema) {
    throw new Error(
      "Missing required field: schemaPath. Provide it via config file or --schema flag.",
    );
  }

  return {
    token,
    rootPage,
    schema,
  };
}
