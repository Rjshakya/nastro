import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { Effect } from "effect";
import { rateLimiter } from "hono-rate-limiter";
import { env } from "cloudflare:workers";
import { authMiddleWare } from "@/middlewares/auth";
import { ApiResponse } from "@/lib/api";
import type { Vars } from "@/lib/hono-types";
import {
  FileUploadService,
  FileUploadServiceLive,
  SiteAssetsBucketLive,
  TemplateAssetsBucketLive,
} from "@/services/file.upload";

const presignedUrlSchema = z.object({
  fileName: z.string().min(3),
  slug: z.string().min(3),
  expiresIn: z.number().min(60).max(3600).optional().default(600),
});

const uploadApp = new Hono<{ Variables: Vars }>()
  .use(authMiddleWare())
  .use(
    rateLimiter<{ Variables: Vars }>({
      binding: env.SITE_WRITE_LIMITER,
      keyGenerator(c) {
        const user = c.get("user");
        return user?.id || c.req.path;
      },
      message: "Rate limit exceeded",
    }),
  )
  .post("/site-asset", zValidator("json", presignedUrlSchema), async (c) => {
    const { fileName, slug, expiresIn } = c.req.valid("json");

    const program = Effect.gen(function* () {
      const fileService = yield* FileUploadService;
      return yield* fileService.getPresignedUrl({
        fileName: `${slug}/${fileName}`,
        expiresIn,
      });
    }).pipe(
      Effect.provide(FileUploadServiceLive),
      Effect.provide(SiteAssetsBucketLive),
    );

    const data = await Effect.runPromise(program);

    return c.json(
      ApiResponse({
        data,
        message: "Presigned URL generated successfully",
      }),
      200,
    );
  })
  .post(
    "/template-asset",
    zValidator("json", presignedUrlSchema),
    async (c) => {
      const { fileName, slug, expiresIn } = c.req.valid("json");

      const program = Effect.gen(function* () {
        const fileService = yield* FileUploadService;
        return yield* fileService.getPresignedUrl({
          fileName: `${slug}/${fileName}`,
          expiresIn,
        });
      }).pipe(
        Effect.provide(FileUploadServiceLive),
        Effect.provide(TemplateAssetsBucketLive),
      );

      const data = await Effect.runPromise(program);

      return c.json(
        ApiResponse({
          data,
          message: "Presigned URL generated successfully",
        }),
        200,
      );
    },
  );

export { uploadApp };
