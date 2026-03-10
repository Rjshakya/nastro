import { ApiResponse } from "@/lib/api";
import { KeyManager, withCache } from "@/lib/cache";
import { Vars } from "@/lib/hono-types";
import { authMiddleWare } from "@/middlewares/auth";
import {
  createSite,
  deleteSite,
  getSiteById,
  getSitesByUser,
  updateSite,
  type SiteSetting,
} from "@/services/site";
import { zValidator } from "@hono/zod-validator";
import { Effect } from "effect";
import { Hono } from "hono";
import { z } from "zod";

const siteParamsSchema = z.object({
  id: z.string().min(1, "Site ID is required"),
});

const getSiteQuerySchema = z.object({
  pageId: z.string().min(1, "Page ID is required"),
  fresh: z
    .preprocess((v) => {
      if (v === "true") return true;
      return false;
    }, z.boolean())
    .optional(),
});

const siteSettingSchema = z.object({}).loose().optional();

const createSiteSchema = z.object({
  pageId: z.string().min(1, "Page ID is required"),
  siteName: z.string().min(1, "Site name is required").max(100),
  siteSetting: siteSettingSchema.optional(),
});

const updateSiteSchema = z.object({
  siteName: z.string().min(1).max(100).optional(),
  siteSetting: siteSettingSchema.optional(),
  pageId: z.string().min(1),
});

type CreateSiteInput = z.infer<typeof createSiteSchema>;
type UpdateSiteInput = z.infer<typeof updateSiteSchema>;

const sitesApp = new Hono<{ Variables: Vars }>()
  .get(
    "/:id",
    zValidator("param", siteParamsSchema),
    zValidator("query", getSiteQuerySchema),
    async (c) => {
      const { id } = c.req.valid("param");
      const { pageId } = c.req.valid("query");
      const result = await Effect.runPromise(getSiteById(id, pageId));

      return c.json(
        ApiResponse({
          data: { ...result },
          message: "Site fetched successfully",
        }),
      );
    },
  )
  .use(authMiddleWare())
  .get("/", async (c) => {
    const userId = c.get("user")?.id;
    const sites = await Effect.runPromise(
      withCache({
        execute: getSitesByUser(userId as string),
        key: KeyManager.getUserSites(userId as string),
      }),
    );

    return c.json(
      ApiResponse({
        data: sites,
        message: "Sites fetched successfully",
      }),
    );
  })
  .post("/", zValidator("json", createSiteSchema), async (c) => {
    const userId = c.get("user")?.id;
    const input = c.req.valid("json") as CreateSiteInput;

    const site = await Effect.runPromise(
      createSite(userId as string, {
        pageId: input.pageId,
        siteName: input.siteName,
        siteSetting: input.siteSetting as SiteSetting | undefined,
      }),
    );
    await KeyManager.delete.getUserSites(userId as string);

    return c.json(
      ApiResponse({
        data: site,
        message: "Site created successfully",
      }),
    );
  })
  .patch(
    "/:id",
    zValidator("param", siteParamsSchema),
    zValidator("json", updateSiteSchema),
    async (c) => {
      const userId = c.get("user")?.id;
      const { id } = c.req.valid("param");
      const input = c.req.valid("json") as UpdateSiteInput;
      const site = await Effect.runPromise(updateSite(id, input));
      await KeyManager.delete.getUserSites(userId as string);

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
      await Effect.runPromise(deleteSite(id, pageId));
      await KeyManager.delete.getUserSites(userId as string);

      return c.json(
        ApiResponse({
          data: null,
          message: "Site deleted successfully",
        }),
      );
    },
  );

export { sitesApp };
