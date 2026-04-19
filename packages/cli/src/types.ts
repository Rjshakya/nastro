/**
 * Notion ORM CLI Configuration Types
 * Defines the structure for notion-orm.config.ts/js files
 */

/**
 * Main configuration interface for Notion ORM CLI
 */
export interface NotionOrmConfig {
  /**
   * Notion integration token
   * Required - can also be set via NOTION_TOKEN env var
   */
  token: string;

  /**
   * Notion root page ID where databases will be created
   * Required - databases will be created as subpages under this page
   */
  rootPage: string;

  /**
   * Path to the schema file(s) containing table definitions
   * Supports glob patterns
   * Required
   */
  schema: string;
}

/**
 * CLI options that can override config values
 */
export interface CliOptions {
  /** Path to config file */
  config?: string;
  /** Notion integration token (overrides config) */
  token?: string;
  /** Notion root page ID (overrides config) */
  rootPage?: string;
  /** Path to schema file (overrides config) */
  schema?: string;
}
