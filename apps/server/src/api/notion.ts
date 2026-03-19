import { ApiResponse } from "@/lib/api";
import { Vars } from "@/lib/hono-types";
import { authMiddleWare } from "@/middlewares/auth";
import { NotionClientLive } from "@/lib/notion";
import { getAccessToken } from "@/lib/tokens";
import { zValidator } from "@hono/zod-validator";
import { Effect } from "effect";
import { Hono } from "hono";
import { z } from "zod";
import { NotionService, NotionServiceLive } from "@/services/notion/main";

const pageParamsSchema = z.object({
  pageId: z.string().min(1, "Page ID is required"),
});

const notionApp = new Hono<{ Variables: Vars }>()
  .use(authMiddleWare())
  .get("/pages", async (c) => {
    const userId = c.get("user")?.id;

    const program = Effect.gen(function* () {
      const notion = yield* NotionService;
      return yield* notion.getNotionPages();
    }).pipe(
      Effect.provide(NotionServiceLive(getAccessToken(userId as string, "notion"))),
      Effect.provide(NotionClientLive),
    );

    const pages = await Effect.runPromise(program);

    return c.json(ApiResponse({ data: pages, message: "success" }));
  })
  .get("/pages/:pageId", zValidator("param", pageParamsSchema), async (c) => {
    // const userId = c.get("user")?.id;
    // const { pageId } = c.req.valid("param");

    return c.json(
      ApiResponse({
        data: {},
        message: "Page content fetched successfully",
      }),
    );
  });

export { notionApp };
