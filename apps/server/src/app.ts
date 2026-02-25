import { Hono } from "hono";
import { getAuth } from "./lib/auth";
import { cors } from "hono/cors";
import { env } from "cloudflare:workers";
import { api } from "./api";
import { ApiResponse } from "./lib/api";

export const app = new Hono()

  .use("*", cors({ origin: [env.CLIENT_URL], credentials: true }))
  .get("/", (c) => {
    return c.text("Hello Hono!");
  })
  .on(["POST", "GET"], "/api/auth/*", async (c) => {
    const auth = await getAuth();
    return auth.handler(c.req.raw);
  })
  .route("/api", api)
  .onError(async (e, c) => {
    console.log(e);
    return c.json(
      ApiResponse({
        data: null,
        error: "Internal Server Error",
        message: "Internal Server Error",
      }),
      500,
    );
  });

export default app;
