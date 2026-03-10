import { env } from "cloudflare:workers";
import { Data, Effect } from "effect";

class CacheError extends Data.TaggedError("CacheError")<{
  message: string;
  error?: any;
}> {}

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
export const withCache = Effect.fn("withCache")(<T, E>({
  execute,
  key,
  ttl,
  forceFresh,
}: {
  execute: Effect.Effect<T, E>;
  key: string;
  forceFresh?: boolean;
  ttl?: number;
}) => {
  return Effect.gen(function* () {
    if (forceFresh) {
      const res = yield* execute;
      yield* Effect.tryPromise(
        async () =>
          await env.NASTRO_KV.put(key, JSON.stringify(res), {
            expirationTtl: ttl,
          }),
      );
      return res;
    }

    const cached = yield* Effect.tryPromise(
      async () => await env.NASTRO_KV.get<string>(key),
    );

    if (cached) {
      return yield* Effect.sync<T>(() => JSON.parse(cached));
    }

    const res = yield* execute;
    yield* Effect.tryPromise(
      async () =>
        await env.NASTRO_KV.put(key, JSON.stringify(res), {
          expirationTtl: ttl,
        }),
    );
    return res;
  }).pipe(
    Effect.catchTag("UnknownError", (e) =>
      Effect.fail(new CacheError({ message: "Cache Error", error: e })),
    ),
    Effect.catchTag("CacheError", (e) => Effect.fail(e)),
  );
});

const deleteKeyFromCache = (key: string) =>
  Effect.tryPromise({
    try: async () => await env.NASTRO_KV.delete(key),
    catch: (e) =>
      new CacheError({ message: "failed to delete :" + key, error: e }),
  });

export const KeyManager = {
  getUserNotionPages: (userId: string) => `notion:pages:${userId}`,
  getPageContent: (pageId: string) => `notion:page:content:${pageId}`,
  getSiteById: (siteId: string) => `notion:site:${siteId}`,
  getUserSites: (userId: string) => `notion:sites:${userId}`,

  delete: {
    getSiteById: (siteId: string) =>
      Effect.runPromise(deleteKeyFromCache(KeyManager.getSiteById(siteId))),
    getPageContent: (pageId: string) =>
      Effect.runPromise(deleteKeyFromCache(KeyManager.getPageContent(pageId))),
    getUserNotionPages: (userId: string) =>
      Effect.runPromise(
        deleteKeyFromCache(KeyManager.getUserNotionPages(userId)),
      ),
    getUserSites: (userId: string) =>
      Effect.runPromise(deleteKeyFromCache(KeyManager.getUserSites(userId))),
  },
};
