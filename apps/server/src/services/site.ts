import { SiteTableInsert, SiteTableSelect } from "@/db/schema/site";
import { eq } from "drizzle-orm";
import { Effect } from "effect";
import { nanoid } from "nanoid";
import { KeyManager, withCache } from "@/lib/cache";
import { SiteRepo } from "@/repo/site";
import { NotionService } from "./notion/main";
import { SlugService } from "./slug";

import { SiteError } from "@/errors/tagged.errors";

export const getSiteBySlugWithPage = (slug: string, rootPageId: string) =>
  Effect.gen(function* () {
    const siteRepo = yield* SiteRepo;
    const site = yield* siteRepo.execute<SiteTableSelect | null, SiteError>((db, sites) =>
      Effect.tryPromise({
        try: async () => {
          const result = await db.select().from(sites).where(eq(sites.slug, slug)).limit(1);
          return result.length ? result[0] : null;
        },
        catch: (e) => new SiteError({ type: "NOT_FOUND", message: String(e), code: 404 }),
      }),
    );

    if (!site) {
      return yield* new SiteError({
        type: "NOT_FOUND",
        message: "no site found",
        code: 404,
      });
    }

    const notion = yield* NotionService;
    const getPage = notion.getPage(rootPageId);
    const page = yield* withCache({
      execute: getPage,
      key: KeyManager.getPageContentKey(rootPageId),
      ttl: 60 * 2,
    });
    return { site, page };
  });

export const createUniqueSlug = (baseSlug: string) => {
  return Effect.succeed(`${baseSlug}-${nanoid(5)}`);
};

export const createSite = Effect.fn("services/site/createSite")((data: SiteTableInsert) => {
  return Effect.gen(function* () {
    const pageId = data.rootPageId;
    yield* checkIsPagePublic(pageId);

    const slugService = yield* SlugService;
    const slug = yield* slugService.storeSlug(data.slug);

    const repo = yield* SiteRepo;
    return yield* repo.insert({ ...data, slug }).pipe(
      Effect.catch((e) =>
        Effect.gen(function* () {
          yield* slugService.deleteSlug(slug);
          return yield* e;
        }),
      ),
    );
  });
});

export const checkIsPagePublic = (pageId: string) =>
  Effect.gen(function* () {
    const notion = yield* NotionService;
    const page = yield* notion.getPage(pageId);
    return { page, pageId, isPublic: !!page };
  }).pipe(
    Effect.andThen((res) => {
      if (!res.isPublic) {
        return Effect.fail(
          new SiteError({
            type: "NOT_PUBLIC",
            message: "page is not public",
            code: 400,
          }),
        );
      }
      return Effect.succeed(res);
    }),
  );

export const isSlugAvailable = (slug: string) =>
  Effect.gen(function* () {
    const slugService = yield* SlugService;
    return yield* slugService.isAvailable(slug);
  });
