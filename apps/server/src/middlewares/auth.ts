import { ApiResponse } from "@/lib/api";
import { getAuth } from "@/lib/auth";
import { type MiddlewareHandler } from "hono";

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
