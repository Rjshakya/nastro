import { DatabaseLive } from "@/db";
import { themeTableInsertSchema } from "@/db/schema/theme";
import { ApiResponse } from "@/lib/api";
import { Vars } from "@/lib/hono-types";
import { authMiddleWare } from "@/middlewares/auth";
import { ThemeRepo } from "@/repo/theme";
import { zValidator } from "@hono/zod-validator";
import { env } from "cloudflare:workers";
import { eq, lt } from "drizzle-orm";
import { Effect } from "effect";
import { Hono } from "hono";
import { rateLimiter } from "hono-rate-limiter";
import { z } from "zod";

const themeParamsSchema = z.object({
  id: z.string().min(1, "Theme ID is required"),
});

const getAllThemeParamsSchema = z.object({
  prev: z.coerce.date().optional(),
  limit: z.coerce.number(),
});

const themeApp = new Hono<{ Variables: Vars }>()
  .use("*", authMiddleWare())
  .get(
    "/",
    rateLimiter<{ Variables: Vars }>({
      binding: env.SITE_READ_LIMITER,
      keyGenerator(c) {
        const user = c.get("user");
        return user?.id || c.req.path;
      },
      message: "Rate limit exceeded",
    }),
    zValidator("query", getAllThemeParamsSchema),
    async (c) => {
      const { limit, prev } = c.req.valid("query");

      const program = Effect.gen(function* () {
        const repo = yield* ThemeRepo;

        const res = yield* repo.execute((db, table) =>
          Effect.tryPromise({
            try: async () => {
              const result = await db
                .select()
                .from(table)
                .where(prev ? lt(table.createdAt, prev) : undefined)
                .limit(limit);

              const prevToken = result.length > 0 ? result[result.length - 1].createdAt : undefined;

              return { result, prevToken };
            },
            catch: (e) => e,
          }),
        );

        return res;
      }).pipe(Effect.provide(DatabaseLive()));

      const themes = await Effect.runPromise(program);
      return c.json(ApiResponse({ data: themes, message: "success" }), 200);
    },
  )
  .get(
    "/:id",
    rateLimiter<{ Variables: Vars }>({
      binding: env.SITE_READ_LIMITER,
      keyGenerator(c) {
        const user = c.get("user");
        return user?.id || c.req.path;
      },
      message: "Rate limit exceeded",
    }),
    zValidator("param", themeParamsSchema),
    async (c) => {
      const { id } = c.req.valid("param");

      const program = Effect.gen(function* () {
        const repo = yield* ThemeRepo;
        const themes = yield* repo.findById("id", id);
        return themes.length ? themes[0] : null;
      }).pipe(Effect.provide(DatabaseLive()));

      const theme = await Effect.runPromise(program);

      if (!theme) {
        return c.json(
          ApiResponse({
            data: null,
            error: "Theme not found",
            message: "Theme not found",
          }),
          404,
        );
      }

      return c.json(
        ApiResponse({
          data: theme,
          message: "Theme fetched successfully",
        }),
        200,
      );
    },
  )
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
  .post("/", zValidator("json", themeTableInsertSchema.omit({ createdBy: true })), async (c) => {
    const userId = c.get("user")?.id as string;
    const input = c.req.valid("json");

    const program = Effect.gen(function* () {
      const repo = yield* ThemeRepo;
      const themes = yield* repo.insert({ ...input, createdBy: userId });
      return themes.length ? themes[0] : null;
    }).pipe(Effect.provide(DatabaseLive()));

    const theme = await Effect.runPromise(program);

    return c.json(
      ApiResponse({
        data: theme,
        message: "Theme created successfully",
      }),
      201,
    );
  })
  .patch(
    "/:id",
    zValidator("param", themeParamsSchema),
    zValidator("json", themeTableInsertSchema.omit({ createdBy: true }).partial()),
    async (c) => {
      const { id } = c.req.valid("param");
      const input = c.req.valid("json");

      const program = Effect.gen(function* () {
        const repo = yield* ThemeRepo;

        const themes = yield* repo.execute((db, table) =>
          Effect.tryPromise({
            try: async () => {
              return await db.update(table).set(input).where(eq(table.id, id)).returning();
            },
            catch: (error) => error,
          }),
        );
        return themes.length ? themes[0] : null;
      }).pipe(Effect.provide(DatabaseLive()));

      const theme = await Effect.runPromise(program);

      if (!theme) {
        return c.json(
          ApiResponse({
            data: null,
            error: "Theme not found",
            message: "Theme not found",
          }),
          404,
        );
      }

      return c.json(
        ApiResponse({
          data: theme,
          message: "Theme updated successfully",
        }),
        200,
      );
    },
  )
  .delete("/:id", zValidator("param", themeParamsSchema), async (c) => {
    const { id } = c.req.valid("param");

    const program = Effect.gen(function* () {
      const repo = yield* ThemeRepo;
      const themes = yield* repo.deleteById("id", id);
      return themes.length ? themes[0] : null;
    }).pipe(Effect.provide(DatabaseLive()));

    const theme = await Effect.runPromise(program);

    return c.json(
      ApiResponse({
        data: theme,
        message: "Theme deleted successfully",
      }),
      200,
    );
  });

export { themeApp };
