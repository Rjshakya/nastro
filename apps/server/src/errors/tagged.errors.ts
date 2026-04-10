import { Data } from "effect";

// Site Error Types
export type SiteErrorType =
  | "NOT_FOUND"
  | "ALREADY_EXISTS"
  | "INVALID_INPUT"
  | "UNKNOWN"
  | "NOT_PUBLIC"
  | "NOTION_ERROR";

export class SiteError extends Data.TaggedError("SiteError")<{
  message: string;
  type: SiteErrorType;
  code?: number;
}> {}

// Notion Error Types
export type NotionErrorType =
  | "ACCESS_TOKEN_MISSING"
  | "REQUEST_FAILED"
  | "PAGE_ERROR";

export class NotionError extends Data.TaggedError("NotionError")<{
  message: string;
  type: NotionErrorType;
  code?: number;
}> {}

// Repo Error Types
export type RepoErrorType =
  | "FAILED_TO_FIND_ALL"
  | "FAILED_TO_FIND_BY_ID"
  | "FAILED_TO_INSERT"
  | "FAILED_TO_UPDATE_BY_ID"
  | "FAILED_TO_DELETE_BY_ID"
  | "FAILED_TO_EXECUTE";

export class RepoError extends Data.TaggedError("RepoError")<{
  message: string;
  type: RepoErrorType;
  code?: number;
}> {}

// Slug Service Error Types
export type SlugServiceErrorType = "SIMILAR_SLUG_EXISTS";

export class SlugServiceError extends Data.TaggedError("SlugServiceError")<{
  message: string;
  type: SlugServiceErrorType;
  code?: number;
}> {}

// Database Error Types
export type DatabaseErrorType = "CONNECTION_FAILED" | "QUERY_FAILED";

export class DatabaseError extends Data.TaggedError("DatabaseError")<{
  message: string;
  type: DatabaseErrorType;
  code?: number;
}> {}

// KV Store Error Types
export type KVStoreErrorType = "GET_FAILED" | "SET_FAILED" | "DELETE_FAILED";

export class KVStoreError extends Data.TaggedError("KVStoreError")<{
  message: string;
  type: KVStoreErrorType;
  code?: number;
}> {}

// Cache Error Types
export type CacheErrorType = "CACHE_ERROR" | "DELETE_FAILED";

export class CacheError extends Data.TaggedError("CacheError")<{
  message: string;
  type: CacheErrorType;
  code?: number;
}> {}

export type FileUploadServiceErrorType = "PRESIGNED_URL_GENERATION_FAILED";

export class FileUploadServiceError extends Data.TaggedError(
  "FileUploadServiceError",
)<{
  message: string;
  type: FileUploadServiceErrorType;
  code?: number;
}> {}
