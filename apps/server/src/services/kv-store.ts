import { env } from "cloudflare:workers";
import { Data, Effect, Layer, ServiceMap } from "effect";

export const getKV = () => Effect.succeed(env.NASTRO_KV);

export class KVStoreError extends Data.TaggedError("KVStoreError")<{
  msg: string;
  _err: unknown;
}> {}

export class KVStore extends ServiceMap.Service<
  KVStore,
  {
    get: <T>(key: string) => Effect.Effect<T | null, KVStoreError, never>;
    set: (
      key: string,
      value: string,
      ttl?: number,
    ) => Effect.Effect<void, KVStoreError, never>;
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
        catch: (e) =>
          new KVStoreError({ msg: "failed to get from kv", _err: e }),
      });

    const set = (key: string, value: string, ttl?: number) =>
      Effect.tryPromise({
        try: async () => {
          return await kv.put(key, value);
        },
        catch: (e) => new KVStoreError({ msg: "failed to set in kv", _err: e }),
      });

    const deleteKey = (key: string) =>
      Effect.tryPromise({
        try: async () => {
          return await kv.delete(key);
        },
        catch: (e) =>
          new KVStoreError({ _err: e, msg: "failed to delete from kv" }),
      });

    return {
      set,
      get,
      deleteKey,
    };
  }),
);
