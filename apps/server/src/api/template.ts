import { DatabaseLive } from "@/db";
import { templateTableInsetSchema } from "@/db/schema/template";
import { ApiResponse } from "@/lib/api";
import { Vars } from "@/lib/hono-types";
import { authMiddleWare } from "@/middlewares/auth";
import { TemplateRepo } from "@/repo/template";
import { zValidator } from "@hono/zod-validator";
import { eq, lt } from "drizzle-orm";
import { Effect } from "effect";
import { Hono } from "hono";
import { z } from "zod";

const templateParamsSchema = z.object({
  id: z.string().min(1, "Template ID is required"),
});

const getAllTemplateParamsSchema = z.object({
  prev: z.coerce.date().optional(),
  limit: z.coerce.number(),
});

export const templateApp = new Hono<{ Variables: Vars }>()
  .use("*", authMiddleWare())
  .get("/", zValidator("query", getAllTemplateParamsSchema), async (c) => {
    const { limit, prev } = c.req.valid("query");

    const program = Effect.gen(function* () {
      const repo = yield* TemplateRepo();

      const res = yield* repo.execute((db, table) =>
        Effect.tryPromise({
          try: async () => {
            const result = await db
              .select()
              .from(table)
              .where(prev ? lt(table.createdAt, prev) : undefined)
              .limit(limit);

            const prevToken =
              result.length > 0
                ? result[result.length - 1].createdAt
                : undefined;

            return { result, prevToken };
          },
          catch: (e) => e,
        }),
      );

      return res;
    }).pipe(Effect.provide(DatabaseLive));

    const templates = await Effect.runPromise(program);

    return c.json(
      ApiResponse({
        data: templates,
        message: "success",
      }),
    );
  })
  .get("/:id", zValidator("param", templateParamsSchema), async (c) => {
    const { id } = c.req.valid("param");

    const program = Effect.gen(function* () {
      const repo = yield* TemplateRepo();
      const templates = yield* repo.findById("id", id);
      return templates.length ? templates[0] : null;
    }).pipe(Effect.provide(DatabaseLive));

    const template = await Effect.runPromise(program);

    if (!template) {
      return c.json(
        ApiResponse({
          data: null,
          error: "Template not found",
          message: "Template not found",
        }),
        404,
      );
    }

    return c.json(
      ApiResponse({
        data: template,
        message: "Template fetched successfully",
      }),
      200,
    );
  })
  .post(
    "/",
    zValidator("json", templateTableInsetSchema.omit({ createdBy: true })),
    async (c) => {
      const userId = c.get("user")?.id as string;
      const input = c.req.valid("json");

      const program = Effect.gen(function* () {
        const repo = yield* TemplateRepo();
        const templates = yield* repo.insert({ ...input, createdBy: userId });
        return templates.length ? templates[0] : null;
      }).pipe(Effect.provide(DatabaseLive));

      const template = await Effect.runPromise(program);

      return c.json(
        ApiResponse({
          data: template,
          message: "Template created successfully",
        }),
        201,
      );
    },
  )
  .patch(
    "/:id",
    zValidator("param", templateParamsSchema),
    zValidator(
      "json",
      templateTableInsetSchema.omit({ createdBy: true }).partial(),
    ),
    async (c) => {
      const { id } = c.req.valid("param");
      const input = c.req.valid("json");

      const program = Effect.gen(function* () {
        const repo = yield* TemplateRepo();
        const templates = yield* repo.execute((db, table) =>
          Effect.tryPromise({
            try: async () => {
              return await db
                .update(table)
                .set(input)
                .where(eq(table.id, id))
                .returning();
            },
            catch: (error) => error,
          }),
        );
        return templates.length ? templates[0] : null;
      }).pipe(Effect.provide(DatabaseLive));

      const template = await Effect.runPromise(program);

      if (!template) {
        return c.json(
          ApiResponse({
            data: null,
            error: "Template not found",
            message: "Template not found",
          }),
          404,
        );
      }

      return c.json(
        ApiResponse({
          data: template,
          message: "Template updated successfully",
        }),
        200,
      );
    },
  )
  .delete("/:id", zValidator("param", templateParamsSchema), async (c) => {
    const { id } = c.req.valid("param");

    const program = Effect.gen(function* () {
      const repo = yield* TemplateRepo();
      const templates = yield* repo.deleteById("id", id);
      return templates.length ? templates[0] : null;
    }).pipe(Effect.provide(DatabaseLive));

    const template = await Effect.runPromise(program);

    if (!template) {
      return c.json(
        ApiResponse({
          data: null,
          error: "Template not found",
          message: "Template not found",
        }),
        404,
      );
    }

    return c.json(
      ApiResponse({
        data: template,
        message: "Template deleted successfully",
      }),
      200,
    );
  });
