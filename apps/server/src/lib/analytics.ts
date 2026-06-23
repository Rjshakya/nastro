import { AnalyticsService, AnalyticsServiceLive } from "@/services/analytics";
import { DatabaseLive } from "@/db";
import { Effect, Layer } from "effect";
import type { Context } from "hono";
import { getConnInfo } from "hono/cloudflare-workers";

interface TrackPageViewInput {
  pageId: string;
  slug: string;
}

export const trackPageView = (c: Context, input: TrackPageViewInput): void => {
  const info = getConnInfo(c);
  const ip =
    info.remote.address ?? c.req.header("CF-Connecting-IP") ?? "unknown";
  const userAgent = c.req.header("User-Agent") ?? "unknown";

  const cf = c.req.raw.cf;
  const country =
    typeof cf?.country === "string"
      ? cf.country
      : (c.req.header("CF-IPCountry") ?? undefined);
  const city = (cf?.city as string) ?? undefined;
  const lat = String(cf?.latitude);
  const long = String(cf?.latitude);

  const programLayer = AnalyticsServiceLive.pipe(
    Layer.provideMerge(Layer.mergeAll(DatabaseLive())),
  );

  const program = Effect.gen(function* () {
    const service = yield* AnalyticsService;
    return yield* service.trackVisitor({
      pageId: input.pageId,
      slug: input.slug,
      ip,
      userAgent,
      country,
      city,
      lat,
      long,
    });
  }).pipe(Effect.provide(programLayer));

  const promise = Effect.runPromise(program).catch((error) => {
    console.error("Failed to track page view:", error);
  });
  c.executionCtx.waitUntil(promise);
};
