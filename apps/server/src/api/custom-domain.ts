import { DatabaseLive } from "@/db";
import { ApiResponse } from "@/lib/api";
import { Vars } from "@/lib/hono-types";
import { NotionClientLive } from "@/lib/notion";
import { authMiddleWare } from "@/middlewares/auth";
import { CustomDomainRepo } from "@/repo/custom-domain";
import {
  ClouflareConfigLive,
  CustomDomainService,
  CustomDomainServiceLive,
} from "@/services/custom-domain";
import { KVStoreLive } from "@/services/kv-store";
import { NotionServiceLive } from "@/services/notion/main";
import { zValidator } from "@hono/zod-validator";
import { Effect, Layer } from "effect";
import { Hono } from "hono";
import { z } from "zod";
import { rateLimiter } from "hono-rate-limiter";
import { env } from "cloudflare:workers";
import { getConnInfo } from "hono/cloudflare-workers";

const createCustomDomainSchema = z.object({
  siteId: z.string().min(1, "Site ID is required"),
  hostName: z.string().min(1, "Hostname is required"),
});

const getSiteQuerySchema = z.object({
  hostname: z.string().min(1, "Hostname is required"),
  pageId: z.string().optional(),
});

const customDomainApp = new Hono<{ Variables: Vars }>()
  .get(
    "/site",
    rateLimiter({
      binding: env.SITE_READ_LIMITER,
      keyGenerator(c) {
        const info = getConnInfo(c);
        return info.remote.address ?? c.req.path;
      },
      message: "Rate limit exceeded",
    }),
    zValidator("query", getSiteQuerySchema),
    async (c) => {
      const { hostname, pageId } = c.req.valid("query");

      const programLayer = Layer.mergeAll(
        KVStoreLive,
        NotionServiceLive().pipe(
          Layer.provideMerge(Layer.mergeAll(NotionClientLive)),
        ),
        CustomDomainServiceLive.pipe(
          Layer.provideMerge(
            Layer.mergeAll(ClouflareConfigLive, DatabaseLive()),
          ),
        ),
      );

      const program = Effect.gen(function* () {
        const service = yield* CustomDomainService;
        return yield* service.getSiteByCustomDomain({
          hostname,
          pageId,
        });
      }).pipe(Effect.provide(programLayer));

      const result = await Effect.runPromise(program);

      return c.json(
        ApiResponse({
          data: result,
          message: "Custom domain site retrieved successfully",
        }),
      );
    },
  )
  .use(authMiddleWare())
  .get("/", async (c) => {
    const userId = c.get("user")?.id as string;

    const program = Effect.gen(function* () {
      const repo = yield* CustomDomainRepo;
      return yield* repo.findById("userId", userId);
    }).pipe(Effect.provide(DatabaseLive()));

    const domains = await Effect.runPromise(program);

    return c.json(
      ApiResponse({
        data: domains,
        message: "Custom domains fetched successfully",
      }),
    );
  })
  .post("/", zValidator("json", createCustomDomainSchema), async (c) => {
    const userId = c.get("user")?.id as string;
    const input = c.req.valid("json");

    const programLayer = CustomDomainServiceLive.pipe(
      Layer.provideMerge(Layer.mergeAll(ClouflareConfigLive, DatabaseLive())),
    );

    const program = Effect.gen(function* () {
      const service = yield* CustomDomainService;
      return yield* service.createCustomDomain({
        userId,
        siteId: input.siteId,
        hostName: input.hostName,
      });
    }).pipe(Effect.provide(programLayer));

    const result = await Effect.runPromise(program);

    return c.json(
      ApiResponse({
        data: result,
        message: "Custom domain created successfully",
      }),
      201,
    );
  })
  .get("/cname", async (c) => {
    const programLayer = CustomDomainServiceLive.pipe(
      Layer.provideMerge(Layer.mergeAll(ClouflareConfigLive, DatabaseLive())),
    );

    const program = Effect.gen(function* () {
      const service = yield* CustomDomainService;
      return service.getDomainCname();
    }).pipe(Effect.provide(programLayer));

    const cname = await Effect.runPromise(program);

    return c.json(
      ApiResponse({
        data: { cname },
        message: "CNAME target retrieved successfully",
      }),
    );
  })
  .get("/:id", async (c) => {
    const id = c.req.param("id");

    const programLayer = CustomDomainServiceLive.pipe(
      Layer.provideMerge(Layer.mergeAll(ClouflareConfigLive, DatabaseLive())),
    );

    const program = Effect.gen(function* () {
      const service = yield* CustomDomainService;
      return yield* service.getDomainStatus({ id });
    }).pipe(Effect.provide(programLayer));

    const status = await Effect.runPromise(program);

    return c.json(
      ApiResponse({
        data: status,
        message: "Domain status retrieved successfully",
      }),
    );
  })
  .delete("/:id", async (c) => {
    const id = c.req.param("id");

    const programLayer = CustomDomainServiceLive.pipe(
      Layer.provideMerge(Layer.mergeAll(ClouflareConfigLive, DatabaseLive())),
    );

    const program = Effect.gen(function* () {
      const service = yield* CustomDomainService;
      return yield* service.deleteCustomDomain({ id });
    }).pipe(Effect.provide(programLayer));

    const result = await Effect.runPromise(program);

    return c.json(
      ApiResponse({
        data: result,
        message: "Custom domain deleted successfully",
      }),
    );
  });

export { customDomainApp };
