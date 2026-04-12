/**
 * Domain-specific errors for the CMS module
 * Using better-result TaggedError for type-safe error handling
 *
 * @example
 * Basic error handling:
 * ```typescript
 * import { run, NotionApiError, FileSystemError } from "@nastro/cms";
 *
 * const result = await run(token)(sourceId, "page");
 *
 * result.match({
 *   ok: (data) => console.log("Success:", data),
 *   err: (error) => console.error("Error:", error.message),
 * });
 * ```
 *
 * @example
 * Exhaustive error matching:
 * ```typescript
 * import { matchError } from "better-result";
 * import { NotionApiError, FileSystemError, DataSourceNotFoundError } from "@nastro/cms";
 *
 * result.match({
 *   ok: (data) => handleSuccess(data),
 *   err: (error) => {
 *     const message = matchError(error, {
 *       NotionApiError: (e) => `Notion API failed: ${e.operation}`,
 *       FileSystemError: (e) => `File operation failed: ${e.operation}`,
 *       DataSourceNotFoundError: (e) => `Not found: ${e.sourceType} ${e.sourceId}`,
 *       DatabaseDataSourceError: (e) => `Database config error: ${e.dbId}`,
 *     });
 *     console.error(message);
 *   },
 * });
 * ```
 *
 * @example
 * Type guards:
 * ```typescript
 * if (NotionApiError.is(error)) {
 *   console.log("Operation:", error.operation);
 *   console.log("Original cause:", error.cause);
 * }
 * ```
 */

import { TaggedError } from "better-result";

/**
 * Notion API communication errors
 *
 * Use this error when Notion API calls fail due to:
 * - Network issues
 * - Authentication problems
 * - Rate limiting
 * - Invalid requests
 */
export class NotionApiError extends TaggedError("NotionApiError")<{
  operation: string;
  message: string;
  cause: unknown;
}>() {
  constructor(args: { operation: string; cause: unknown }) {
    const causeMessage =
      args.cause instanceof Error ? args.cause.message : String(args.cause);
    super({
      ...args,
      message: `Notion API ${args.operation} failed: ${causeMessage}`,
    });
  }
}

/**
 * File system operation errors
 *
 * Use this error when file I/O operations fail:
 * - Writing files
 * - Reading files
 * - Path generation issues
 */
export class FileSystemError extends TaggedError("FileSystemError")<{
  operation: string;
  path: string;
  message: string;
  cause: unknown;
}>() {
  constructor(args: { operation: string; path: string; cause: unknown }) {
    const causeMessage =
      args.cause instanceof Error ? args.cause.message : String(args.cause);
    super({
      ...args,
      message: `File system ${args.operation} failed for '${args.path}': ${causeMessage}`,
    });
  }
}

/**
 * Data source not found error
 *
 * Thrown when the requested page or database cannot be found.
 */
export class DataSourceNotFoundError extends TaggedError(
  "DataSourceNotFoundError",
)<{
  sourceId: string;
  sourceType: "page" | "db";
  message: string;
}>() {
  constructor(args: { sourceId: string; sourceType: "page" | "db" }) {
    super({
      ...args,
      message: `${args.sourceType} with ID '${args.sourceId}' not found`,
    });
  }
}

/**
 * Database has no data sources error
 *
 * Thrown when a database doesn't have any data sources configured.
 */
export class DatabaseDataSourceError extends TaggedError(
  "DatabaseDataSourceError",
)<{
  dbId: string;
  message: string;
}>() {
  constructor(args: { dbId: string }) {
    super({
      ...args,
      message: `Database '${args.dbId}' has no data sources configured`,
    });
  }
}

/**
 * Union type of all CMS errors
 *
 * Use this type when your function can return any CMS error.
 * This enables exhaustive error handling with matchError.
 */
export type CmsError =
  | NotionApiError
  | FileSystemError
  | DataSourceNotFoundError
  | DatabaseDataSourceError;
