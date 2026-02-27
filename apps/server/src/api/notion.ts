import { ApiResponse } from "@/lib/api";
import { Vars } from "@/lib/hono-types";
import { authMiddleWare } from "@/middlewares/auth";
import { getUserNotionPages } from "@/services/notion/main";
import { NotionWebsiteService } from "@/services/notion/website";
import { getNotionRendererClient } from "@/lib/notion";
import { getAccessToken } from "@/lib/tokens";
import { zValidator } from "@hono/zod-validator";
import { Effect } from "effect";
import { Hono } from "hono";
import { z } from "zod";

const pageParamsSchema = z.object({
  pageId: z.string().min(1, "Page ID is required"),
});

const notionApp = new Hono<{ Variables: Vars }>()
  .use(authMiddleWare())
  .get("/pages", async (c) => {
    const userId = c.get("user")?.id;
    const pages = await Effect.runPromise(getUserNotionPages(userId as string));
    return c.json(ApiResponse({ data: pages, message: "success" }));
  })
  .get("/pages/:pageId", zValidator("param", pageParamsSchema), async (c) => {
    const userId = c.get("user")?.id;
    const { pageId } = c.req.valid("param");

    const { accessToken } = await Effect.runPromise(
      getAccessToken(userId as string, "notion"),
    );

    if (!accessToken) {
      return c.json(
        ApiResponse({
          data: null,
          error: "Notion not connected",
          message: "Please connect your Notion account",
        }),
        401,
      );
    }

    const notionClient = getNotionRendererClient(accessToken as string);
    const notionService = new NotionWebsiteService(notionClient);

    const pageContent = await Effect.runPromise(notionService.getPage(pageId));

    return c.json(
      ApiResponse({
        data: pageContent,
        message: "Page content fetched successfully",
      }),
    );
  });

export { notionApp };
