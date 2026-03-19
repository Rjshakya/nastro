import { DatabaseLive } from "@/db";
import { sitesInsertSchema } from "@/db/schema/site";
import { ApiResponse } from "@/lib/api";
import { KeyManager } from "@/lib/cache";
import { Vars } from "@/lib/hono-types";
import { NotionClientLive } from "@/lib/notion";
import { authMiddleWare } from "@/middlewares/auth";
import { SiteRepo } from "@/repo/site";
import { NotionServiceLive } from "@/services/notion/main";
import { createSite, getSiteBySlugWithPage } from "@/services/site";

import { zValidator } from "@hono/zod-validator";
import { Effect, pipe } from "effect";
import { Hono } from "hono";
import { z } from "zod";

const siteParamsSchema = z.object({
  id: z.string().min(1, "Site ID is required"),
});

const getSiteQuerySchema = z.object({
  slug: z.string().min(1, "Slug is required"),
  pageId: z.string().min(1, "Page ID is required"),
  fresh: z
    .preprocess((v) => {
      if (v === "true") return true;
      return false;
    }, z.boolean())
    .optional(),
});

const sitesApp = new Hono<{ Variables: Vars }>()
  .get("/", zValidator("query", getSiteQuerySchema), async (c) => {
    const { pageId, slug } = c.req.valid("query");

    const program = pipe(
      getSiteBySlugWithPage(slug, pageId),
      Effect.provide(DatabaseLive),
      Effect.provide(NotionServiceLive()),
      Effect.provide(NotionClientLive),
    );

    const site = await Effect.runPromise(program);
    return c.json(
      ApiResponse({
        data: { ...site },
        message: "Site fetched successfully",
      }),
    );
  })
  .use(authMiddleWare())
  .get("/all", async (c) => {
    const userId = c.get("user")?.id;

    const program = Effect.gen(function* () {
      const repo = yield* SiteRepo();
      const userSites = yield* repo.findById("userId", userId as string);
      return userSites;
    }).pipe(Effect.provide(DatabaseLive));

    const sites = await Effect.runPromise(program);

    return c.json(
      ApiResponse({
        data: sites,
        message: "Sites fetched successfully",
      }),
    );
  })
  .post(
    "/",
    zValidator("json", sitesInsertSchema.omit({ userId: true })),
    async (c) => {
      const userId = c.get("user")?.id as string;
      const input = c.req.valid("json");
      const program = createSite({ ...input, userId }).pipe(
        Effect.provide(DatabaseLive),
      );

      const site = await Effect.runPromise(program);
      await KeyManager.delete.getUserSites(userId as string);

      return c.json(
        ApiResponse({
          data: site,
          message: "Site created successfully",
        }),
      );
    },
  )
  .patch(
    "/:id",
    zValidator("param", siteParamsSchema),
    zValidator("json", sitesInsertSchema.omit({ userId: true })),
    async (c) => {
      const userId = c.get("user")?.id as string;
      const { id } = c.req.valid("param");
      const input = c.req.valid("json");

      const program = Effect.gen(function* () {
        const repo = yield* SiteRepo();
        const site = yield* repo.updateById("id", id, { ...input, userId });
        return site.length ? site[0] : null;
      }).pipe(Effect.provide(DatabaseLive));

      const site = await Effect.runPromise(program);
      await KeyManager.delete.getUserSites(userId as string);
      await KeyManager.delete.getSiteById(input.pageId ?? "");
      await KeyManager.delete.getPageContent(input.pageId ?? "");

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
      const userId = c.get("user")?.id;
      const { id } = c.req.valid("param");
      const { pageId } = c.req.valid("query");

      const program = Effect.gen(function* () {
        const repo = yield* SiteRepo();
        const site = yield* repo.deleteById("id", id);
        return site.length ? site[0] : null;
      }).pipe(Effect.provide(DatabaseLive));

      const site = await Effect.runPromise(program);
      await KeyManager.delete.getUserSites(userId as string);
      await KeyManager.delete.getSiteById(id);
      await KeyManager.delete.getPageContent(pageId);

      return c.json(
        ApiResponse({
          data: site,
          message: "Site deleted successfully",
        }),
      );
    },
  );

export { sitesApp };
