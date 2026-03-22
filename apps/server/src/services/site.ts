import { SiteInsert, SiteSelect } from "@/db/schema/site";
import { eq } from "drizzle-orm";
import { Data, Effect } from "effect";
import { nanoid } from "nanoid";
import { KeyManager, withCache } from "@/lib/cache";
import { SiteRepo } from "@/repo/site";
import { NotionService } from "./notion/main";

class SiteError extends Data.TaggedError("SiteError")<{
  message: string;
  code: "NOT_FOUND" | "ALREADY_EXISTS" | "INVALID_INPUT" | "UNKNOWN";
}> {}

export const getSiteBySlugWithPage = (slug: string, pageId: string) =>
  Effect.gen(function* () {
    const siteRepo = yield* SiteRepo();
    const site = yield* siteRepo.execute<SiteSelect | null, SiteError>(
      (db, sites) =>
        Effect.tryPromise({
          try: async () => {
            const result = await db
              .select()
              .from(sites)
              .where(eq(sites.slug, slug))
              .limit(1);
            return result.length ? result[0] : null;
          },
          catch: (e) => new SiteError({ code: "UNKNOWN", message: `${e}` }),
        }),
    );

    // const site = yield* withCache({
    //   execute: getSite,
    //   key: KeyManager.getSiteById(pageId),
    //   ttl: 60 * 60,
    // });

    if (!site) {
      return yield* new SiteError({
        code: "NOT_FOUND",
        message: "no site found",
      });
    }

    const notion = yield* NotionService;
    const getPage = notion.getPageOfSite(pageId);
    const page = yield* withCache({
      execute: getPage,
      key: KeyManager.getPageContent(pageId),
      ttl: 60 * 60,
    });
    return { site, page };
  }).pipe(
    Effect.mapError((e) => new SiteError({ code: "UNKNOWN", message: `${e}` })),
  );

export const createUniqueSlug = (baseSlug: string) => {
  return Effect.succeed(`${baseSlug}-${nanoid(5)}`);
};

export const createSite = Effect.fn("services/site/createSite")((
  data: SiteInsert,
) => {
  return Effect.gen(function* () {
    const repo = yield* SiteRepo();
    const site = yield* repo.insert({ ...data }).pipe(
      Effect.catchTags({
        RepoError: (e) =>
          Effect.gen(function* () {
            if (e.msg == "FAILED TO INSERT") {
              const slug = yield* createUniqueSlug(data.slug as string);
              const _site = yield* repo.insert({ ...data, slug });
              return yield* Effect.succeed(_site);
            }
            return yield* e;
          }),
      }),
    );

    return site;
  });
});
