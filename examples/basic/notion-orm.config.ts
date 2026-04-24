import type { NotionOrmConfig } from "@nastro/notion-orm-cli";

/**
 * Notion ORM Configuration
 *
 * Required environment variable:
 *   NOTION_TOKEN=your_integration_token
 *
 * To get a Notion integration token:
 *   https://www.notion.so/my-integrations
 *
 * To get a root page ID:
 *   Open any Notion page in your browser and copy the 32-character ID from the URL.
 *   Example: https://www.notion.so/workspace/12345678-1234-1234-1234-123456789abc
 *                                          ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 */
const config: NotionOrmConfig = {
  // @ts-ignore
  token: process.env.NOTION_API_TOKEN,
  rootPage: "34885bde25938063a17adbd36e86c96e",
  schema: "src/schemas/**/*.ts",
};

export default config;
