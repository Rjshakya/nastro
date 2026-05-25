export type Permission = "read" | "write";

export interface ApiKey {
  id: string;
  name: string;
  start: string;
  prefix: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
  permissions: Permission[];
}

export interface CreateApiKeyInput {
  name: string;
  permissions: Permission[];
}

export interface CreateApiKeyResult extends ApiKey {
  key: string;
}

export interface UpdateApiKeyInput {
  name?: string;
  permissions?: Permission[];
  enabled?: boolean;
}
