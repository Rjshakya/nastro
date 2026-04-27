import { DatabaseLive } from "@/db";
import { sitesInsertSchema } from "@/db/schema/site";
import { ApiResponse } from "@/lib/api";
import { Vars } from "@/lib/hono-types";
import { NotionClientLive } from "@/lib/notion";
import { authMiddleWare } from "@/middlewares/auth";
import { SiteRepo } from "@/repo/site";
import { KVStoreLive } from "@/services/kv-store";
import { NotionServiceLive } from "@/services/notion/main";
import { createSite, getSiteBySlugWithPage, isSlugAvailable } from "@/services/site";
import { SlugService, SlugServiceLive } from "@/services/slug";

import { zValidator } from "@hono/zod-validator";
import { Effect, Layer } from "effect";
import { Hono } from "hono";
import { z } from "zod";
import { rateLimiter } from "hono-rate-limiter";
import { env } from "cloudflare:workers";
import { BANNED_SUBDOMAINS, SLUG_REGEX } from "@/lib/utils";

const siteParamsSchema = z.object({
  id: z.string().min(1, "Site ID is required"),
});

const SlugSchema = z
  .string()
  .min(3, "minimum one char is required")
  .max(32)
  .regex(SLUG_REGEX)
  .refine((s) => !BANNED_SUBDOMAINS.has(s));

const getSiteQuerySchema = z.object({
  rootPageId: z.string().min(1, "Root Page ID is required"),
  slug: z.string().min(1, "Slug is required"),
  fresh: z
    .preprocess((v) => {
      if (v === "true") return true;
      return false;
    }, z.boolean())
    .optional(),
});

const sitesApp = new Hono<{ Variables: Vars }>()
  .get(
    "/",
    rateLimiter({
      binding: env.SITE_READ_LIMITER,
      keyGenerator(c) {
        return c.req.path;
      },
      message: "Rate limit exceeded",
    }),
    zValidator("query", getSiteQuerySchema),
    async (c) => {
      const { slug, rootPageId } = c.req.valid("query");

      const programLayer = Layer.mergeAll(
        DatabaseLive(),
        KVStoreLive,
        NotionServiceLive().pipe(Layer.provideMerge(Layer.mergeAll(NotionClientLive))),
      );
      const program = getSiteBySlugWithPage(slug, rootPageId).pipe(Effect.provide(programLayer));

      const site = await Effect.runPromise(program);
      return c.json(
        ApiResponse({
          data: { ...site },
          message: "Site fetched successfully",
        }),
      );
    },
  )
  .use(authMiddleWare())
  .get(
    "/all",
    rateLimiter<{ Variables: Vars }>({
      binding: env.SITE_READ_LIMITER,
      keyGenerator(c) {
        const user = c.get("user");
        return user?.id || c.req.path;
      },
      message: "Rate limit exceeded",
    }),
    async (c) => {
      const userId = c.get("user")?.id;

      const program = Effect.gen(function* () {
        const repo = yield* SiteRepo;
        const userSites = yield* repo.findById("userId", userId as string);
        return userSites;
      }).pipe(Effect.provide(DatabaseLive()));

      const sites = await Effect.runPromise(program);

      return c.json(
        ApiResponse({
          data: sites,
          message: "Sites fetched successfully",
        }),
      );
    },
  )
  .use(
    rateLimiter<{ Variables: Vars }>({
      binding: env.SITE_WRITE_LIMITER,
      keyGenerator(c) {
        const user = c.get("user");
        return user?.id || c.req.path;
      },
      message: "Rate limit exceeded",
    }),
  )
  .post("/", zValidator("json", sitesInsertSchema), async (c) => {
    const userId = c.get("user")?.id as string;
    const input = c.req.valid("json");

    const programLayer = Layer.mergeAll(
      DatabaseLive(),
      NotionServiceLive().pipe(Layer.provideMerge(Layer.mergeAll(NotionClientLive))),
      SlugServiceLive.pipe(Layer.provideMerge(Layer.mergeAll(KVStoreLive))),
    );
    const program = createSite({ ...input, userId }).pipe(Effect.provide(programLayer));

    const site = await Effect.runPromise(program);

    return c.json(
      ApiResponse({
        data: site,
        message: "Site created successfully",
      }),
    );
  })
  .post(
    "/slug/available",
    zValidator(
      "json",
      z.object({
        slug: SlugSchema,
      }),
    ),
    async (c) => {
      const { slug } = c.req.valid("json");

      const programLayer = Layer.mergeAll(SlugServiceLive.pipe(Layer.provideMerge(KVStoreLive)));

      const program = isSlugAvailable(slug).pipe(Effect.provide(programLayer));

      const res = await Effect.runPromise(program);
      return c.json(ApiResponse({ data: res, message: "success" }));
    },
  )
  .patch(
    "/:id",
    zValidator("param", siteParamsSchema),
    zValidator("json", sitesInsertSchema),
    async (c) => {
      const userId = c.get("user")?.id as string;
      const { id } = c.req.valid("param");
      const input = c.req.valid("json");

      const programLayer = Layer.mergeAll(
        DatabaseLive(),
        SlugServiceLive.pipe(Layer.provideMerge(Layer.mergeAll(KVStoreLive))),
      );

      const program = Effect.gen(function* () {
        const repo = yield* SiteRepo;
        const existing = yield* repo.findById("id", id);

        if (!existing || !existing.length) {
          return yield* Effect.fail("no site found with the provided id");
        }

        if (input.slug !== existing[0].slug) {
          const slugService = yield* SlugService;
          yield* slugService.storeSlug(input.slug);
          yield* slugService.deleteSlug(existing[0].slug);
        }

        const site = yield* repo.updateById("id", id, { ...input, userId });
        return site.length ? site[0] : null;
      }).pipe(Effect.provide(programLayer));

      const site = await Effect.runPromise(program);

      return c.json(
        ApiResponse({
          data: site,
          message: "Site updated successfully",
        }),
      );
    },
  )
  .delete(
    "/:id",
    zValidator("param", siteParamsSchema),
    zValidator("query", z.object({ pageId: z.string() })),
    async (c) => {
      // const userId = c.get("user")?.id;
      const { id } = c.req.valid("param");
      // const { pageId } = c.req.valid("query");

      const programLayer = Layer.mergeAll(
        DatabaseLive(),
        SlugServiceLive.pipe(Layer.provideMerge(Layer.mergeAll(KVStoreLive))),
      );

      const program = Effect.gen(function* () {
        const repo = yield* SiteRepo;
        const slugService = yield* SlugService;
        const site = yield* repo.deleteById("id", id);
        yield* slugService.deleteSlug(site[0].slug);
        return site.length ? site[0] : null;
      }).pipe(Effect.provide(programLayer));

      const site = await Effect.runPromise(program);

      return c.json(
        ApiResponse({
          data: site,
          message: "Site deleted successfully",
        }),
      );
    },
  );

export { sitesApp };
