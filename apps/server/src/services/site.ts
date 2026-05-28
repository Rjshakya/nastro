import { SiteTableInsert, SiteTableSelect } from "@/db/schema/site";
import { eq } from "drizzle-orm";
import { Cause, Effect, Schedule } from "effect";
import { nanoid } from "nanoid";
import { KeyManager, withCache } from "@/lib/cache";
import { SiteRepo } from "@/repo/site";
import { NotionService } from "./notion/main";
import { SlugService } from "./slug";

import { RepoError, SiteError } from "@/errors/tagged.errors";
import { SeoRepo } from "@/repo/seo";
import { SeoConfig, SiteSetting } from "@/types/site.setting";
import { seoTable, SeoTableInsert } from "@/db/schema/seo";
import { PgTransaction } from "drizzle-orm/pg-core";

export const getSiteBySlugWithPage = (slug: string, rootPageId: string) =>
  Effect.gen(function* () {
    const siteRepo = yield* SiteRepo;
    const site = yield* siteRepo.execute<SiteTableSelect | null, SiteError>(
      (db, sites) =>
        Effect.tryPromise({
          try: async () => {
            const result = await db.transaction(async (tx) => {
              const siteRecords = await tx
                .select()
                .from(sites)
                .where(eq(sites.slug, slug))
                .limit(1);

              const pageSeoRecords = await tx
                .select()
                .from(seoTable)
                .where(eq(seoTable.pageId, rootPageId));

              if (!siteRecords.length) {
                return null;
              }

              const siteRecord = siteRecords[0];

              if (!pageSeoRecords.length) {
                return siteRecord;
              }

              const siteSetting = siteRecord.setting as SiteSetting;
              const pageSeoRecord = pageSeoRecords[0];

              siteSetting.seo = {
                title: pageSeoRecord.title,
                description: pageSeoRecord.description as string,
                ogImage: pageSeoRecord.ogImageLink as string,
                url: pageSeoRecord.pageUrl as string,
              };

              siteRecord.setting = siteSetting;
              return siteRecord;
            });

            return result;
          },
          catch: (e) =>
            new SiteError({ type: "NOT_FOUND", message: String(e), code: 404 }),
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

export const createSite = Effect.fn("services/site/createSite")((
  data: SiteTableInsert,
) => {
  return Effect.gen(function* () {
    const pageId = data.rootPageId;
    yield* checkIsPagePublic(pageId);

    const slugService = yield* SlugService;

    const siteRepo = yield* SiteRepo;
    const seoRepo = yield* SeoRepo;

    const siteSetting = data.setting as SiteSetting;
    const seoSetting = siteSetting.seo as SeoConfig;

    const [seoRecord] = yield* seoRepo.insert({
      userId: data.userId,
      ...seoSetting,
      title: seoSetting?.title ?? "",
      pageId,
    });

    const slug = yield* slugService.storeSlug(data.slug);
    const siteRecords = yield* siteRepo
      .insert({ ...data, slug })
      .pipe(Effect.catch(onSiteInsertError));

    function onSiteInsertError(e: RepoError) {
      return Effect.gen(function* () {
        yield* slugService.deleteSlug(slug);
        yield* seoRepo.deleteById("id", seoRecord.id);
        return yield* e;
      });
    }

    return siteRecords;
  });
});

export const updateSite = Effect.fn("/services/site/updateSite")(({
  id,
  input,
  pageId,
}: {
  id: string;
  input: Partial<SiteTableInsert>;
  pageId: string;
}) => {
  return Effect.gen(function* () {
    const repo = yield* SiteRepo;
    const existing = yield* repo.findById("id", id);
    const slugService = yield* SlugService;

    if (!existing || !existing.length) {
      return yield* Effect.fail("no site found with the provided id");
    }

    const isSlugChanged = input?.slug && input?.slug !== existing[0].slug;

    if (isSlugChanged) {
      yield* slugService.storeSlug(input.slug as string);
      yield* slugService.deleteSlug(existing[0].slug);
    }

    const siteSetting = input.setting as SiteSetting;
    const seoInput = siteSetting.seo;

    const handleSeoUpdate = async (
      tx: PgTransaction<any>,
      input: SeoTableInsert,
      pageId: string,
    ) => {
      const existingRecords = await tx
        .select({ id: seoTable.id })
        .from(seoTable)
        .where(eq(seoTable.pageId, pageId));

      if (existingRecords?.length) {
        const record = await tx
          .update(seoTable)
          .set(input)
          .where(eq(seoTable.pageId, pageId))
          .returning();
        return record;
      }

      const record = await tx.insert(seoTable).values(input).returning();
      return record;
    };

    const onUpdateSiteError = <T>(e: Cause.Cause<T>) =>
      Effect.gen(function* () {
        Cause.pretty(e);

        if (!isSlugChanged) return;
        yield* slugService.deleteSlug(input.slug as string);
        yield* slugService.storeSlug(existing[0].slug);
      }).pipe(
        Effect.tapError((e) => {
          console.error("failed to cleanup on UpdatedSite Record", e);
          return Effect.succeed(null);
        }),
        Effect.retry(Schedule.recurs(2)),
        Effect.ignore,
      );

    const updatedSite = yield* repo
      .execute((db, table) => {
        // updating both site and seo
        const transaction = db.transaction(async (tx) => {
          const [updatedSiteRecord] = await tx
            .update(table)
            .set({ ...input, setting: { ...siteSetting, seo: {} } })
            .where(eq(table.id, id))
            .returning();

          await handleSeoUpdate(
            tx as PgTransaction<any>,
            {
              title: seoInput?.title as string,
              userId: updatedSiteRecord.userId,
              pageId,
              description: seoInput?.description,
              ogImageLink: seoInput?.ogImage,
              pageUrl: seoInput?.url,
            },
            pageId,
          );

          return updatedSiteRecord;
        });

        return Effect.tryPromise({
          try: async () => {
            return await transaction;
          },
          catch: (e) => {
            console.error(e);
            return new RepoError({
              message: String(e),
              type: "FAILED_TO_EXECUTE",
            });
          },
        });
      })
      .pipe(Effect.onError(onUpdateSiteError));

    return updatedSite;
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
