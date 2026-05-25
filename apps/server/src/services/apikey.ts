import { Effect, Layer, ServiceMap } from "effect";
import { ApiKeyRepo } from "@/repo/apikey";
import type { ApiKeyInsert, ApiKeySelect } from "@/db/schema/auth-schema";
import { ApiKeyError, DatabaseError, RepoError } from "@/errors/tagged.errors";
import { generateApiKey, hashApiKey, validateApiKeyFormat } from "@/lib/crypto";
import { eq } from "drizzle-orm";

export type Permission = "read" | "write";

export interface CreateApiKeyInput {
  userId: string;
  name: string;
  permissions: Permission[];
}

export interface CreateApiKeyResult {
  id: string;
  key: string;
  name: string;
  permissions: Permission[];
  createdAt: Date;
}

export interface VerifyApiKeyResult {
  keyId: string;
  userId: string;
  permissions: Permission[];
  name: string;
}

export interface UpdateApiKeyInput {
  name?: string;
  permissions?: Permission[];
  enabled?: boolean;
}

export class ApiKeyService extends ServiceMap.Service<
  ApiKeyService,
  {
    createApiKey: (
      input: CreateApiKeyInput,
    ) => Effect.Effect<
      CreateApiKeyResult,
      ApiKeyError | DatabaseError | RepoError
    >;
    verifyApiKey: (
      rawKey: string,
    ) => Effect.Effect<
      VerifyApiKeyResult,
      ApiKeyError | DatabaseError | RepoError
    >;
    deleteApiKey: (
      keyId: string,
      userId: string,
    ) => Effect.Effect<void, ApiKeyError | DatabaseError | RepoError>;
    updateApiKey: (
      keyId: string,
      userId: string,
      input: UpdateApiKeyInput,
    ) => Effect.Effect<void, ApiKeyError | DatabaseError | RepoError>;
    listApiKeys: (
      userId: string,
    ) => Effect.Effect<ApiKeySelect[], DatabaseError | RepoError>;
  }
>()("services/apikey") { }

export const ApiKeyServiceLive = Layer.effect(
  ApiKeyService,
  Effect.gen(function*() {
    const repo = yield* ApiKeyRepo;

    const createApiKey = (
      input: CreateApiKeyInput,
    ): Effect.Effect<
      CreateApiKeyResult,
      ApiKeyError | DatabaseError | RepoError
    > =>
      Effect.gen(function*() {
        const { keyId, rawKey, keyHash } = yield* generateApiKey();

        const now = new Date();
        const apiKeyData: ApiKeyInsert = {
          id: keyId,
          userId: input.userId,
          configId: "default",
          name: input.name,
          start: rawKey.slice(0, 7),
          prefix: "nas",
          key: keyHash,
          enabled: true,
          expiresAt: null,
          createdAt: now,
          updatedAt: now,
          permissions: input.permissions.join(","),
          metadata: null,
        };

        const result = yield* repo.insert(apiKeyData);

        if (!result || result.length === 0) {
          return yield* new ApiKeyError({
            message: "Failed to create API key",
            type: "CREATE_FAILED",
            code: 500,
          });
        }

        return {
          id: keyId,
          key: rawKey,
          name: input.name,
          permissions: input.permissions,
          createdAt: now,
        };
      });

    const verifyApiKey = (
      rawKey: string,
    ): Effect.Effect<
      VerifyApiKeyResult,
      ApiKeyError | DatabaseError | RepoError
    > =>
      Effect.gen(function*() {
        if (!validateApiKeyFormat(rawKey)) {
          return yield* new ApiKeyError({
            message: "Invalid API key format",
            type: "INVALID_FORMAT",
            code: 400,
          });
        }

        const keyHash = yield* hashApiKey(rawKey);

        const keys = yield* repo.execute((db, table) =>
          Effect.tryPromise({
            try: async () => {
              return await db
                .select()
                .from(table)
                .where(eq(table.key, keyHash));
            },
            catch: (e) =>
              new ApiKeyError({
                message: `Failed to verify API key: ${String(e)}`,
                type: "KEY_NOT_FOUND",
                code: 500,
              }),
          }),
        );

        if (!keys || keys.length === 0) {
          return yield* new ApiKeyError({
            message: "API key not found",
            type: "KEY_NOT_FOUND",
            code: 404,
          });
        }

        const keyRecord = keys[0];

        if (!keyRecord.enabled) {
          return yield* new ApiKeyError({
            message: "API key has been revoked",
            type: "KEY_REVOKED",
            code: 403,
          });
        }

        const permissions = keyRecord.permissions?.split(",") as Permission[];

        const [updatedRecord] = yield* repo.updateById("id", keyRecord.id, {
          updatedAt: new Date(),
        });

        return {
          keyId: updatedRecord.id,
          userId: updatedRecord.userId,
          permissions,
          name: updatedRecord.name || "",
        };
      });

    const deleteApiKey = (
      keyId: string,
      userId: string,
    ): Effect.Effect<void, ApiKeyError | DatabaseError | RepoError> =>
      Effect.gen(function*() {
        const keys = yield* repo.findById("id", keyId);

        if (!keys || keys.length === 0) {
          return yield* new ApiKeyError({
            message: "API key not found",
            type: "KEY_NOT_FOUND",
            code: 404,
          });
        }

        const keyRecord = keys[0];

        if (keyRecord.userId !== userId) {
          return yield* new ApiKeyError({
            message: "Unauthorized to delete this API key",
            type: "UNAUTHORIZED",
            code: 403,
          });
        }

        yield* repo.deleteById("id", keyId);
      });

    const updateApiKey = (
      keyId: string,
      userId: string,
      input: UpdateApiKeyInput,
    ): Effect.Effect<void, ApiKeyError | DatabaseError | RepoError> =>
      Effect.gen(function*() {
        const keys = yield* repo.findById("id", keyId);

        if (!keys || keys.length === 0) {
          return yield* new ApiKeyError({
            message: "API key not found",
            type: "KEY_NOT_FOUND",
            code: 404,
          });
        }

        const keyRecord = keys[0];

        if (keyRecord.userId !== userId) {
          return yield* new ApiKeyError({
            message: "Unauthorized to update this API key",
            type: "UNAUTHORIZED",
            code: 403,
          });
        }

        const updateData: Partial<ApiKeyInsert> = {
          updatedAt: new Date(),
        };

        if (input.name !== undefined) {
          updateData.name = input.name;
        }

        if (input.permissions !== undefined) {
          updateData.permissions = input.permissions.join(",");
        }

        if (input.enabled !== undefined) {
          updateData.enabled = input.enabled;
        }

        yield* repo.updateById("id", keyId, updateData);
      });

    const listApiKeys = (
      userId: string,
    ): Effect.Effect<ApiKeySelect[], DatabaseError | RepoError> =>
      Effect.gen(function*() {
        return yield* repo.findById("userId", userId);
      });

    return {
      createApiKey,
      verifyApiKey,
      deleteApiKey,
      updateApiKey,
      listApiKeys,
    };
  }),
);
