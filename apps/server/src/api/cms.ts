import { ApiResponse } from "@/lib/api";
import { Vars } from "@/lib/hono-types";
import { authMiddleWare } from "@/middlewares/auth";
import { zValidator } from "@hono/zod-validator";
import { Effect } from "effect";
import { Hono } from "hono";
import z from "zod";

export const getPageSchema = z.object({
  format: z.enum(["html", "md", "full"]),
});

export const notionCmsApi = new Hono<{ Variables: Vars }>()
  .use(authMiddleWare())
  .post(
    "/page/:pageId",
    zValidator("param", z.object({ pageId: z.string() })),
    zValidator("json", getPageSchema),
    async (c) => {
      const { format } = c.req.valid("json");
      const { pageId } = c.req.valid("param");
      const user = c.get("user");

      return c.json(ApiResponse({ data: {}, message: "Success" }), 200);
    },
  );
