import { DatabaseLive } from "@/db";
import { ApiResponse } from "@/lib/api";
import { Vars } from "@/lib/hono-types";
import { authMiddleWare } from "@/middlewares/auth";
import {
  ApiKeyService,
  ApiKeyServiceLive,
  Permission,
} from "@/services/apikey";
import { zValidator } from "@hono/zod-validator";
import { Effect, Layer } from "effect";
import { Hono } from "hono";
import { z } from "zod";

const createApiKeySchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  permissions: z
    .array(z.enum(["read", "write"]))
    .min(1, "At least one permission is required"),
});

const updateApiKeySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  permissions: z.array(z.enum(["read", "write"])).optional(),
  enabled: z.boolean().optional(),
});

const apikeyApp = new Hono<{ Variables: Vars }>()
  .use(authMiddleWare())
  .get("/", async (c) => {
    const userId = c.get("user")?.id as string;

    const programLayer = ApiKeyServiceLive.pipe(
      Layer.provideMerge(DatabaseLive()),
    );

    const program = Effect.gen(function* () {
      const apiKeyService = yield* ApiKeyService;
      return yield* apiKeyService.listApiKeys(userId);
    }).pipe(Effect.provide(programLayer));

    const keys = await Effect.runPromise(program);

    // Remove sensitive data before sending to client
    const sanitizedKeys = keys.map((key) => ({
      id: key.id,
      name: key.name,
      start: key.start,
      prefix: key.prefix,
      enabled: key.enabled,
      createdAt: key.createdAt,
      updatedAt: key.updatedAt,
      permissions: (key.permissions?.split(",") || []) as Permission[],
    }));

    return c.json(
      ApiResponse({
        data: sanitizedKeys,
        message: "API keys fetched successfully",
      }),
    );
  })
  .post("/", zValidator("json", createApiKeySchema), async (c) => {
    const userId = c.get("user")?.id as string;
    const input = c.req.valid("json");

    const programLayer = ApiKeyServiceLive.pipe(
      Layer.provideMerge(DatabaseLive()),
    );

    const program = Effect.gen(function* () {
      const apiKeyService = yield* ApiKeyService;
      return yield* apiKeyService.createApiKey({
        userId,
        name: input.name,
        permissions: input.permissions,
      });
    }).pipe(Effect.provide(programLayer));

    const result = await Effect.runPromise(program);

    return c.json(
      ApiResponse({
        data: result,
        message:
          "API key created successfully. Save this key now - it won't be shown again.",
      }),
      201,
    );
  })
  .patch("/:id", zValidator("json", updateApiKeySchema), async (c) => {
    const userId = c.get("user")?.id as string;
    const keyId = c.req.param("id");
    const input = c.req.valid("json");

    const programLayer = ApiKeyServiceLive.pipe(
      Layer.provideMerge(DatabaseLive()),
    );

    const program = Effect.gen(function* () {
      const apiKeyService = yield* ApiKeyService;
      yield* apiKeyService.updateApiKey(keyId, userId, input);
    }).pipe(Effect.provide(programLayer));

    await Effect.runPromise(program);

    return c.json(
      ApiResponse({
        data: null,
        message: "API key updated successfully",
      }),
    );
  })
  .delete("/:id", async (c) => {
    const userId = c.get("user")?.id as string;
    const keyId = c.req.param("id");

    const programLayer = ApiKeyServiceLive.pipe(
      Layer.provideMerge(DatabaseLive()),
    );

    const program = Effect.gen(function* () {
      const apiKeyService = yield* ApiKeyService;
      yield* apiKeyService.deleteApiKey(keyId, userId);
    }).pipe(Effect.provide(programLayer));

    await Effect.runPromise(program);

    return c.json(
      ApiResponse({
        data: null,
        message: "API key deleted successfully",
      }),
    );
  });

export { apikeyApp };
