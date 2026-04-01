import { Effect, Layer, ServiceMap } from "effect";
import { KVStore, KVStoreError } from "./kv-store";
import { KeyManager } from "@/lib/cache";

import { SlugServiceError } from "@/errors/tagged.errors";

export class SlugService extends ServiceMap.Service<
  SlugService,
  {
    isAvailable: (slug: string) => Effect.Effect<boolean, KVStoreError, never>;
    /**
     *
     * @param slug
     * @returns slug
     */
    storeSlug: (
      slug: string,
    ) => Effect.Effect<string, KVStoreError | SlugServiceError, never>;
    deleteSlug: (slug: string) => Effect.Effect<string, KVStoreError, never>;
  }
>()("services/slug") {}

export const SlugServiceLive = Layer.effect(
  SlugService,
  Effect.gen(function* () {
    const kv = yield* KVStore;

    const isAvailable = (slug: string) =>
      Effect.gen(function* () {
        const existing = yield* kv.get<string>(KeyManager.getSlug(slug));
        if (!existing) return true;
        return false;
      });

    const storeSlug = (slug: string) =>
      Effect.gen(function* () {
        const key = KeyManager.getSlug(slug);
        const existing = yield* kv.get<string>(key);

        if (existing) {
          return yield* new SlugServiceError({
            message: "Slug already exists",
            type: "SIMILAR_SLUG_EXISTS",
            code: 409,
          });
        }

        yield* kv.set(key, slug);
        return slug;
      });

    const deleteSlug = (slug: string) =>
      Effect.gen(function* () {
        yield* kv.deleteKey(KeyManager.getSlug(slug));
        return slug;
      });

    return {
      isAvailable,
      storeSlug,
      deleteSlug,
    };
  }),
);
