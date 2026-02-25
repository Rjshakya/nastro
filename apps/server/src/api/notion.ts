import { ApiResponse } from "@/lib/api";
import { Vars } from "@/lib/hono-types";
import { authMiddleWare } from "@/middlewares/auth";
import { getUserNotionPages } from "@/services/notion/main";
import { zValidator } from "@hono/zod-validator";
import { Effect } from "effect";
import { Hono } from "hono";
import z from "zod";

const notionApp = new Hono<{ Variables: Vars }>()
  .use(authMiddleWare())
  .get("/pages", async (c) => {
    const userId = c.get("user")?.id;
    const pages = await Effect.runPromise(getUserNotionPages(userId as string));
    return c.json(ApiResponse({ data: pages, message: "success" }));
  });

export { notionApp };
