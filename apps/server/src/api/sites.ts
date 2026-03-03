import { ApiResponse } from "@/lib/api";
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
});

const siteSettingSchema = z.object().optional();

const createSiteSchema = z.object({
  pageId: z.string().min(1, "Page ID is required"),
  siteName: z.string().min(1, "Site name is required").max(100),
  siteSetting: siteSettingSchema.optional(),
});

const updateSiteSchema = z.object({
  siteName: z.string().min(1).max(100).optional(),
  siteSetting: siteSettingSchema.optional(),
});

type CreateSiteInput = z.infer<typeof createSiteSchema>;
type UpdateSiteInput = z.infer<typeof updateSiteSchema>;

const sitesApp = new Hono<{ Variables: Vars }>()
  .use(authMiddleWare())
  .get("/", async (c) => {
    const userId = c.get("user")?.id;
    console.log("userId", userId);
    const sites = await Effect.runPromise(getSitesByUser(userId as string));

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

    return c.json(
      ApiResponse({
        data: site,
        message: "Site created successfully",
      }),
    );
  })
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
  .patch(
    "/:id",
    zValidator("param", siteParamsSchema),
    zValidator("json", updateSiteSchema),
    async (c) => {
      const { id } = c.req.valid("param");
      const input = c.req.valid("json") as UpdateSiteInput;

      const site = await Effect.runPromise(
        updateSite(id, {
          siteName: input.siteName,
          siteSetting: input.siteSetting as SiteSetting | undefined,
        }),
      );

      return c.json(
        ApiResponse({
          data: site,
          message: "Site updated successfully",
        }),
      );
    },
  )
  .delete("/:id", zValidator("param", siteParamsSchema), async (c) => {
    const { id } = c.req.valid("param");
    await Effect.runPromise(deleteSite(id));

    return c.json(
      ApiResponse({
        data: null,
        message: "Site deleted successfully",
      }),
    );
  });

export { sitesApp };
