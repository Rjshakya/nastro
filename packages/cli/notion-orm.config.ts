import type { NotionOrmConfig } from "./src/types.js";

const config: NotionOrmConfig = {
  // Required: Notion integration token
  // Can also be set via NOTION_TOKEN env var
  // @ts-ignore
  token: process.env.NOTION_API_TOKEN,

  // Required: Root page ID where databases will be created
  // Databases will be created as subpages under this page
  rootPage: "34885bde25938063a17adbd36e86c96e",

  // Required: Path to schema file(s) containing table definitions
  // Supports glob patterns like "./src/schema/**/*.ts"
  schema: "./src/schema/*.ts",
};

export default config;
