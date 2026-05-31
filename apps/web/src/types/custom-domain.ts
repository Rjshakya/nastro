import type { CustomDomainTableSelect } from "server/domain";

export type HostnameStatus =
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

export type SSLStatus =
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

export type CustomDomain = Omit<
  CustomDomainTableSelect,
  "createdAt" | "updatedAt"
> & {
  createdAt: string;
  updatedAt: string;
};

export interface DomainStatus {
  id: string;
  hostName: string;
  status?: HostnameStatus;
  sslStatus?: SSLStatus;
}

export interface CreateCustomDomainPayload {
  siteId: string;
  hostName: string;
}
