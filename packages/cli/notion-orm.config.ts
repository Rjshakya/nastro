import type { NotionOrmConfig } from "./src/types.js";

const config: NotionOrmConfig = {
  // Required: Notion integration token
  // Can also be set via NOTION_TOKEN env var
  //   @ts-ignore
  token: process.env.NOTION_TOKEN || "your-token-here",

  // Required: Root page ID where databases will be created
  // Databases will be created as subpages under this page
  rootPageId: "your-root-page-id-here",

  // Required: Path to schema file(s) containing table definitions
  // Supports glob patterns like "./src/schema/**/*.ts"
  schemaPath: "./schema.ts",

  // Optional: Preview changes without applying them
  // Can be overridden with --dry-run flag
  dryRun: false,
};

export default config;
