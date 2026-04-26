import { env } from "cloudflare:workers";
import { Effect } from "effect";

import { CacheError } from "@/errors/tagged.errors";
import { KVStore } from "@/services/kv-store";

/**
 * withCache : helper function for caching.
 *
 *  if value is in cache then return that ,
 *  otherwise execute the fn , and store it's result in cache
 *  and then return result.
 *
 *
 * ttl? : minimum of 60 seconds
 */
export const withCache = Effect.fn("withCache")(<T, E, R>({
  execute,
  key,
  ttl,
}: {
  execute: Effect.Effect<T, E, R>;
  key: string;
  forceFresh?: boolean;
  ttl?: number;
}) => {
  return Effect.gen(function* () {
    const store = yield* KVStore;
    const cached = yield* store.get<string>(key);

    if (cached) {
      return yield* Effect.sync<T>(() => JSON.parse(cached));
    }

    const res = yield* execute;
    const stringify = yield* Effect.sync(() => JSON.stringify(res));
    yield* store.set(key, stringify, ttl);
    return res;
  }).pipe(
    Effect.catchTag("KVStoreError", (e) => {
      console.error(e);
      return Effect.fail(
        new CacheError({
          message: "lib/withCache",
          type: "CACHE_ERROR",
          code: 500,
        }),
      );
    }),
  );
});

const deleteKeyFromCache = (key: string) =>
  Effect.tryPromise({
    try: async () => await env.NASTRO_KV.delete(key),
    catch: (e) =>
      new CacheError({
        message: "failed to delete :" + key,
        type: "DELETE_FAILED",
        code: 500,
      }),
  });

export const KeyManager = {
  getUserNotionPagesKey: (userId: string) => `notion:pages:${userId}`,
  getPageContentKey: (pageId: string) => `notion:page:content:${pageId}`,
  getSiteByIdKey: (siteId: string) => `notion:site:${siteId}`,
  getUserSitesKey: (userId: string) => `notion:sites:${userId}`,
  getSlugKey: (slug: string) => `notion:site:slug:${slug}`,
};
