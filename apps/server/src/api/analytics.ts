import { DatabaseLive } from "@/db";
import { ApiResponse } from "@/lib/api";
import { Vars } from "@/lib/hono-types";
import { trackPageView } from "@/lib/analytics";
import { authMiddleWare } from "@/middlewares/auth";
import { AnalyticsService, AnalyticsServiceLive } from "@/services/analytics";
import { zValidator } from "@hono/zod-validator";
import { Effect, Layer } from "effect";
import { Hono } from "hono";
import { z } from "zod";
import { rateLimiter } from "hono-rate-limiter";
import { env } from "cloudflare:workers";
import { getConnInfo } from "hono/cloudflare-workers";

const intervalSchema = z.enum(["hour", "day", "week", "month"]);

const metricsQuerySchema = z.object({
  slug: z.string().min(1, "Slug is required"),
  from: z.coerce.number(),
  to: z.coerce.number(),
  interval: intervalSchema,
});

const countryQuerySchema = z.object({
  slug: z.string().min(1, "Slug is required"),
  from: z.coerce.number(),
  to: z.coerce.number(),
});

const trackSchema = z.object({
  pageId: z.string().min(1, "Page ID is required"),
  slug: z.string().min(1, "Slug is required"),
  path: z.string().optional(),
  referrer: z.string().optional(),
});

const programLayer = AnalyticsServiceLive.pipe(
  Layer.provideMerge(Layer.mergeAll(DatabaseLive())),
);

const analyticsApp = new Hono<{ Variables: Vars }>()
  .post(
    "/track",
    rateLimiter<{ Variables: Vars }>({
      binding: env.SITE_READ_LIMITER,
      keyGenerator(c) {
        const info = getConnInfo(c);
        return info.remote.address ?? c.req.path;
      },
      message: "Rate limit exceeded",
    }),
    zValidator("json", trackSchema),
    async (c) => {
      const { pageId, slug } = c.req.valid("json");
      trackPageView(c, { pageId, slug });
      return c.json(
        ApiResponse({
          data: { tracked: true },
          message: "Page view tracked successfully",
        }),
      );
    },
  )
  .use(authMiddleWare())
  .use(
    rateLimiter<{ Variables: Vars }>({
      binding: env.SITE_READ_LIMITER,
      keyGenerator(c) {
        const user = c.get("user");
        return user?.id || c.req.path;
      },
      message: "Rate limit exceeded",
    }),
  )
  .get("/visitors", zValidator("query", metricsQuerySchema), async (c) => {
    const userId = c.get("user")?.id as string;
    const { slug, from, to, interval } = c.req.valid("query");

    console.log("interval", interval);

    const program = Effect.gen(function* () {
      const service = yield* AnalyticsService;

      const isOwner = yield* service.checkSiteOwnership(slug, userId);
      if (!isOwner) {
        return yield* Effect.fail("Not Allowed");
      }

      return yield* service.getVisitorsMetrics({
        slug,
        from: new Date(from),
        to: new Date(to),
        interval,
      });
    }).pipe(Effect.provide(programLayer));

    const data = await Effect.runPromise(program);

    return c.json(
      ApiResponse({
        data,
        message: "Visitor metrics fetched successfully",
      }),
    );
  })
  .get(
    "/unique-visitors",
    zValidator("query", metricsQuerySchema),
    async (c) => {
      const userId = c.get("user")?.id as string;
      const { slug, from, to, interval } = c.req.valid("query");

      const program = Effect.gen(function* () {
        const service = yield* AnalyticsService;

        const isOwner = yield* service.checkSiteOwnership(slug, userId);
        if (!isOwner) {
          return yield* Effect.fail("Not Allowed");
        }

        return yield* service.getUniqueVisitorsMetrics({
          slug,
          from: new Date(from),
          to: new Date(to),
          interval,
        });
      }).pipe(Effect.provide(programLayer));

      const data = await Effect.runPromise(program);

      return c.json(
        ApiResponse({
          data,
          message: "Unique visitor metrics fetched successfully",
        }),
      );
    },
  )
  .get("/countries", zValidator("query", countryQuerySchema), async (c) => {
    const userId = c.get("user")?.id as string;
    const { slug, from, to } = c.req.valid("query");

    const program = Effect.gen(function* () {
      const service = yield* AnalyticsService;

      const isOwner = yield* service.checkSiteOwnership(slug, userId);
      if (!isOwner) {
        return yield* Effect.fail("Not Allowed");
      }

      return yield* service.getVisitorsCountryWiseMetrics({
        slug,
        from: new Date(from),
        to: new Date(to),
      });
    }).pipe(Effect.provide(programLayer));

    const data = await Effect.runPromise(program);

    return c.json(
      ApiResponse({
        data,
        message: "Country-wise metrics fetched successfully",
      }),
    );
  });

export { analyticsApp };
