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

export type FileUploadServiceErrorType =
  | "PRESIGNED_URL_GENERATION_FAILED"
  | "OBJECT_DELETION_FAILED";

export class FileUploadServiceError extends Data.TaggedError(
  "FileUploadServiceError",
)<{
  message: string;
  type: FileUploadServiceErrorType;
  code?: number;
}> {}

// API Key Error Types
export type ApiKeyErrorType =
  | "KEY_NOT_FOUND"
  | "KEY_REVOKED"
  | "INVALID_FORMAT"
  | "UNAUTHORIZED"
  | "CREATE_FAILED"
  | "DELETE_FAILED"
  | "UPDATE_FAILED";

export class ApiKeyError extends Data.TaggedError("ApiKeyError")<{
  message: string;
  type: ApiKeyErrorType;
  code?: number;
}> {}

// Custom Domain Error Types
export type CustomDomainErrorType =
  | "CF_ERROR"
  | "NOT_FOUND"
  | "INVALID_HOSTNAME"
  | "ALREADY_EXISTS"
  | "MISSING_CF_ID"
  | "UNKNOWN";

export class CustomDomainError extends Data.TaggedError("CustomDomainError")<{
  message: string;
  type: CustomDomainErrorType;
  code?: number;
}> {}

// Analytics Error Types
export type AnalyticsErrorType = "TRACK_FAILED" | "QUERY_FAILED";

export class AnalyticsError extends Data.TaggedError("AnalyticsError")<{
  message: string;
  type: AnalyticsErrorType;
  code?: number;
}> {}

// Billing Error Types
export type BillingErrorType =
  | "SITE_LIMIT_REACHED"
  | "PRO_FEATURE_REQUIRED"
  | "CUSTOM_DOMAIN_LIMIT_REACHED"
  | "CUSTOMER_STATE_FAILED";

export class BillingError extends Data.TaggedError("BillingError")<{
  message: string;
  type: BillingErrorType;
  code?: number;
}> {}

export type JSONErrorType = "JSONStringify" | "JSONParsing";

export class JSONError extends Data.TaggedError("JSONError")<{
  message: string;
  type: JSONErrorType;
  code?: number;
}> {}
