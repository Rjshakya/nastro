import { env } from "cloudflare:workers";
import { Effect, Layer, ServiceMap } from "effect";
import { KVStoreError } from "@/errors/tagged.errors";

export const getKV = () => Effect.succeed(env.NASTRO_KV);
export { KVStoreError };

export class KVStore extends ServiceMap.Service<
  KVStore,
  {
    get: <T>(key: string) => Effect.Effect<T | null, KVStoreError, never>;
    set: (key: string, value: string, ttl?: number) => Effect.Effect<void, KVStoreError, never>;
    deleteKey: (key: string) => Effect.Effect<void, KVStoreError, never>;
  }
>()("services/kv-store") {}

export const KVStoreLive = Layer.effect(
  KVStore,
  Effect.gen(function* () {
    const kv = yield* getKV();

    const get = <T>(key: string) =>
      Effect.tryPromise({
        try: async () => {
          return await kv.get<T>(key);
        },
        catch: (e) => {
          console.error(e);
          return new KVStoreError({
            message: "failed to get from kv",
            type: "GET_FAILED",
            code: 500,
          });
        },
      });

    const set = (key: string, value: string, ttl?: number) =>
      Effect.tryPromise({
        try: async () => {
          return await kv.put(key, value , {expirationTtl:ttl});
        },
        catch: (e) => {
          console.error(e);
          return new KVStoreError({
            message: "failed to set in kv",
            type: "SET_FAILED",
            code: 500,
          });
        },
      });

    const deleteKey = (key: string) =>
      Effect.tryPromise({
        try: async () => {
          return await kv.delete(key);
        },
        catch: (e) => {
          console.error(e);
          return new KVStoreError({
            message: "failed to delete from kv",
            type: "DELETE_FAILED",
            code: 500,
          });
        },
      });

    return {
      set,
      get,
      deleteKey,
    };
  }),
);
