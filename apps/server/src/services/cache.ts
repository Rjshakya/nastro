import { Effect, Layer, ServiceMap } from "effect";
import { KVStore, KVStoreLive } from "@/services/kv-store";
import { JSONError, KVStoreError } from "@/errors/tagged.errors";

/**
 * Centralized cache key builders.
 * All server cache keys should be defined here so they are easy to audit and invalidate.
 */
export const CacheKeys = {
  customerState: (userId: string) => `billing:customer_state:${userId}`,
} as const;

/**
 * A thin typed wrapper around KVStore that centralizes key management.
 */
export class CacheService extends ServiceMap.Service<CacheService>()(
  "services/cache",
  {
    make: Effect.gen(function* () {
      const kv = yield* KVStore;

      const get = <T>(key: string) => kv.get<T>(key);

      const set = (key: string, value: unknown, ttl?: number) =>
        Effect.gen(function* () {
          if (typeof value === "string") {
            return yield* kv.set(key, value, ttl);
          }

          const serialized = yield* Effect.try({
            try: () => JSON.stringify(value),
            catch: (e) =>
              new JSONError({
                message: String(e),
                type: "JSONStringify",
                code: 500,
              }),
          });

          return yield* kv.set(key, serialized, ttl);
        });

      const deleteKey = (key: string) => kv.deleteKey(key);

      return {
        keys: CacheKeys,
        get,
        set,
        delete: deleteKey,
      };
    }),
  },
) {}

export const CacheServiceLive = Layer.effect(CacheService, CacheService.make);
