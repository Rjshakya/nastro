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
import { rateLimiter } from "hono-rate-limiter";
import { env } from "cloudflare:workers";

const pageParamsSchema = z.object({
  pageId: z.string().min(1, "Page ID is required"),
});

const notionApp = new Hono<{ Variables: Vars }>()
  .use(authMiddleWare())
  .use(
    rateLimiter<{ Variables: Vars }>({
      binding: env.NOTION_PAGES_API_READ_LIMITER,
      keyGenerator(c) {
        const user = c.get("user");
        return user?.id || c.req.path;
      },
      message: "Rate limit exceed",
    }),
  )
  .get("/page", async (c) => {
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
  });

export { notionApp };
