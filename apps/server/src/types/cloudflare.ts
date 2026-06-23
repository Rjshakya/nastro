// ─── Cloudflare API Types ───────────────────────────────────────────────────

type SSLStatus =
  | "initializing"
  | "pending_validation"
  | "deleted"
  | "pending_issuance"
  | "pending_deployment"
  | "pending_deletion"
  | "pending_expiration"
  | "expired"
  | "active"
  | "initializing_timed_out"
  | "validation_timed_out"
  | "issuance_timed_out"
  | "deployment_timed_out"
  | "deletion_timed_out"
  | "pending_cleanup"
  | "staging_deployment"
  | "staging_active"
  | "deactivating"
  | "inactive"
  | "backup_issued"
  | "holding_deployment";

type HostnameStatus =
  | "active"
  | "pending"
  | "active_redeploying"
  | "moved"
  | "pending_deletion"
  | "deleted"
  | "pending_blocked"
  | "pending_migration"
  | "pending_provisioned"
  | "test_pending"
  | "test_active"
  | "test_active_apex"
  | "test_blocked"
  | "test_failed"
  | "provisioned"
  | "blocked";

interface ApiMessage {
  code: number;
  message: string;
  documentation_url?: string;
  source?: { pointer?: string };
}

interface CustomHostnameSSL {
  id?: string;
  bundle_method?: string;
  certificate_authority?: string;
  custom_certificate?: string;
  custom_csr_id?: string;
  custom_key?: string;
  expires_on?: string;
  hosts?: string[];
  issuer?: string;
  method?: string;
  serial_number?: string;
  signature?: string;
  status?: SSLStatus;
  type?: string;
  uploaded_on?: string;
  validation_errors?: Array<{ message?: string }>;
  validation_records?: Array<{
    cname?: string;
    cname_target?: string;
    emails?: string[];
    http_body?: string;
    http_url?: string;
    status?: string;
    txt_name?: string;
    txt_value?: string;
  }>;
  wildcard?: boolean;
}

interface CustomHostnameResult {
  id: string;
  hostname: string;
  created_at?: string;
  custom_metadata?: Record<string, string>;
  custom_origin_server?: string;
  custom_origin_sni?: string;
  ownership_verification?: {
    name?: string;
    type?: "txt";
    value?: string;
  };
  ownership_verification_http?: {
    http_body?: string;
    http_url?: string;
  };
  ssl?: CustomHostnameSSL;
  status?: HostnameStatus;
  verification_errors?: string[];
}

type CfApiResponse<T> =
  | { success: true; result: T; errors: ApiMessage[]; messages: ApiMessage[] }
  | {
      success: false;
      result: undefined;
      errors: ApiMessage[];
      messages: ApiMessage[];
    };

export type {
  SSLStatus,
  HostnameStatus,
  ApiMessage,
  CfApiResponse,
  CustomHostnameSSL,
  CustomHostnameResult,
};
