import { ApiResponse } from "@/lib/api";
import { getAuth } from "@/lib/auth";
import { type MiddlewareHandler } from "hono";
import { DatabaseLive } from "@/db";
import { Cause, Effect, Exit, Layer, Option } from "effect";
import { ApiKeyService, ApiKeyServiceLive } from "@/services/apikey";

export const authMiddleWare: () => MiddlewareHandler = () => {
  return async (c, next) => {
    const auth = await getAuth();
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session) {
      c.set("user", null);
      c.set("session", null);

      return c.json(
        ApiResponse({
          data: null,
          error: "Unauthorized" as const,
          message: "please authenticate",
        }),
        400,
      );
    }
    c.set("user", session.user);
    c.set("session", session.session);
    await next();
  };
};

export const verifyApiKeyMiddleware: () => MiddlewareHandler = () => {
  return async (c, next) => {
    const authHeader = c.req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return c.json(
        ApiResponse({
          data: null,
          error: "Unauthorized",
          message:
            "Missing or invalid Authorization header. Expected: Bearer <api-key>",
        }),
        401,
      );
    }

    const rawKey = authHeader.replace("Bearer ", "").trim();
    const programLayer = Layer.mergeAll(
      ApiKeyServiceLive.pipe(
        Layer.provideMerge(Layer.mergeAll(DatabaseLive())),
      ),
    );

    const program = Effect.gen(function* () {
      const service = yield* ApiKeyService;

      const verified = yield* service.verifyApiKey(rawKey);
      return verified;
    }).pipe(Effect.provide(programLayer));

    const exit = await Effect.runPromiseExit(program);

    if (Exit.isFailure(exit)) {
      c.set("userId", null);
      c.set("permission", null);

      console.error(Cause.pretty(exit.cause));
      const opt = Cause.findErrorOption(exit.cause);
      // Option<ApiKeyError | DatabaseError | RepoError>

      if (Option.isSome(opt)) {
        const err = opt.value; // fully typed
        if (err._tag === "ApiKeyError") {
          return c.json({ error: err.message }, 401);
        }
      }

      return c.json(
        ApiResponse({ data: null, message: "internal server error" }),
        500,
      );
    }

    const value = exit.value;

    c.set("userId", value.userId);
    c.set("permission", value.permissions.join(","));
    await next();
  };
};
