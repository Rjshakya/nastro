import { Hono } from "hono";
import { getAuth } from "./lib/auth";
import { cors } from "hono/cors";
import { env } from "cloudflare:workers";
import { api } from "./api";
import { ApiResponse } from "./lib/api";
import {
  SiteError,
  NotionError,
  SlugServiceError,
} from "@/errors/tagged.errors";
import { ContentfulStatusCode } from "hono/utils/http-status";

export const app = new Hono()

  .use(
    "*",
    cors({
      origin: (origin) => {
        if (origin.includes(".nastro.xyz")) {
          return origin;
        }

        return env.CLIENT_URL;
      },
      credentials: true,
    }),
  )
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

    const getCode = (code: number | undefined) => {
      if (!code) return 500;
      return code as ContentfulStatusCode;
    };

    if (e instanceof SiteError && e._tag === "SiteError") {
      return c.json(
        ApiResponse({
          data: null,
          error: e.type,
          message: e.message,
        }),
        getCode(e.code),
      );
    }

    if (e instanceof NotionError && e._tag === "NotionError") {
      return c.json(
        ApiResponse({
          data: null,
          error: e.type,
          message: e.message,
        }),
        getCode(e.code),
      );
    }

    if (e instanceof SlugServiceError) {
      return c.json(
        ApiResponse({
          data: null,
          error: e.type,
          message: e.message,
        }),
        getCode(e.code),
      );
    }

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
