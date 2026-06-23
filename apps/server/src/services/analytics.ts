import { Effect, Layer, ServiceMap } from "effect";
import { and, desc, eq, gte, lte, count, sql } from "drizzle-orm";

import { AnalyticsRepo } from "@/repo/analytics";
import { visitors } from "@/db/schema/analytics";
import {
  AnalyticsError,
  DatabaseError,
  RepoError,
} from "@/errors/tagged.errors";
import type {
  VisitorTableInsert,
  VisitorTableSelect,
} from "@/db/schema/analytics";
import { SiteRepo } from "@/repo/site";
import { DataBase } from "@/db";

export interface TrackVisitorInput {
  pageId: string;
  slug: string;
  ip: string;
  userAgent: string;
  country?: string;
  city?: string;
  lat?: string;
  long?: string;
}

export interface GetVisitorMetricsInput {
  slug: string;
  from: Date;
  to: Date;
  interval: "hour" | "day" | "week" | "month";
}

export interface VisitorsMetricPoint {
  slug: string;
  interval: string;
  count: number;
}

export interface UniqueVisitorsMetricPoint {
  slug: string;
  interval: string;
  uniqueCount: number;
}

export interface CountryMetricPoint {
  slug: string;
  country: string | null;
  count: number;
}

const computeUniqueId = (
  ip: string,
  userAgent: string,
): Effect.Effect<string, never, never> =>
  Effect.promise(async () => {
    const data = new TextEncoder().encode(`${ip}:${userAgent}`);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  });

const getIntervalSql = (interval: GetVisitorMetricsInput["interval"]) => {
  switch (interval) {
    case "hour":
      return sql<string>`date_trunc('hour', ${visitors.createdAt})`;
    case "day":
      return sql<string>`date_trunc('day', ${visitors.createdAt})`;
    case "week":
      return sql<string>`date_trunc('week', ${visitors.createdAt})`;
    case "month":
      return sql<string>`date_trunc('month', ${visitors.createdAt})`;
  }
};

export class AnalyticsService extends ServiceMap.Service<
  AnalyticsService,
  {
    trackVisitor: (
      input: TrackVisitorInput,
    ) => Effect.Effect<VisitorTableSelect, AnalyticsError | RepoError>;

    getVisitorsMetrics: (
      input: GetVisitorMetricsInput,
    ) => Effect.Effect<VisitorsMetricPoint[], AnalyticsError | RepoError>;

    getUniqueVisitorsMetrics: (
      input: GetVisitorMetricsInput,
    ) => Effect.Effect<UniqueVisitorsMetricPoint[], AnalyticsError | RepoError>;

    getVisitorsCountryWiseMetrics: (
      input: Omit<GetVisitorMetricsInput, "interval">,
    ) => Effect.Effect<CountryMetricPoint[], AnalyticsError | RepoError>;

    checkSiteOwnership: (
      slug: string,
      userId: string,
    ) => Effect.Effect<boolean, DatabaseError, DataBase>;
  }
>()("services/analytics") {}

export const AnalyticsServiceLive = Layer.effect(
  AnalyticsService,
  Effect.gen(function* () {
    const repo = yield* AnalyticsRepo;

    const trackVisitor = (
      input: TrackVisitorInput,
    ): Effect.Effect<VisitorTableSelect, AnalyticsError | RepoError> =>
      Effect.gen(function* () {
        const uniqueId = yield* computeUniqueId(input.ip, input.userAgent);

        const visitorData: VisitorTableInsert = {
          uniqueId,
          pageId: input.pageId,
          slug: input.slug,
          ip: input.ip,
          userAgent: input.userAgent,
          country: input.country ?? null,
          city: input.city ?? null,
          lat: input.lat ?? null,
          long: input.long ?? null,
        };

        const result = yield* repo.insert(visitorData);

        if (!result || result.length === 0) {
          return yield* new AnalyticsError({
            message: "Failed to track visitor",
            type: "TRACK_FAILED",
            code: 500,
          });
        }

        return result[0];
      });

    const buildBaseFilters = (input: { slug: string; from: Date; to: Date }) =>
      and(
        eq(visitors.slug, input.slug),
        gte(visitors.createdAt, input.from),
        lte(visitors.createdAt, input.to),
      );

    const getVisitorsMetrics = (
      input: GetVisitorMetricsInput,
    ): Effect.Effect<VisitorsMetricPoint[], AnalyticsError | RepoError> =>
      repo.execute((db) =>
        Effect.tryPromise({
          try: async () => {
            const intervalSql = getIntervalSql(input.interval);
            const rows = await db
              .select({
                interval: intervalSql,
                count: count(),
              })
              .from(visitors)
              .where(buildBaseFilters(input))
              .groupBy(intervalSql)
              .orderBy(intervalSql);

            return rows.map((row) => ({
              slug: input.slug,
              interval: row.interval,
              count: Number(row.count),
            }));
          },
          catch: (error) =>
            new AnalyticsError({
              message: `Failed to get visitor metrics: ${String(error)}`,
              type: "QUERY_FAILED",
              code: 500,
            }),
        }),
      );

    const getUniqueVisitorsMetrics = (
      input: GetVisitorMetricsInput,
    ): Effect.Effect<UniqueVisitorsMetricPoint[], AnalyticsError | RepoError> =>
      repo.execute((db) =>
        Effect.tryPromise({
          try: async () => {
            const intervalSql = getIntervalSql(input.interval);
            const rows = await db
              .select({
                interval: intervalSql,
                uniqueCount: sql<number>`COUNT(DISTINCT ${visitors.uniqueId})`,
              })
              .from(visitors)
              .where(buildBaseFilters(input))
              .groupBy(intervalSql)
              .orderBy(intervalSql);

            return rows.map((row) => ({
              slug: input.slug,
              interval: row.interval,
              uniqueCount: row.uniqueCount,
            }));
          },
          catch: (error) =>
            new AnalyticsError({
              message: `Failed to get unique visitor metrics: ${String(error)}`,
              type: "QUERY_FAILED",
              code: 500,
            }),
        }),
      );

    const getVisitorsCountryWiseMetrics = (
      input: Omit<GetVisitorMetricsInput, "interval">,
    ): Effect.Effect<CountryMetricPoint[], AnalyticsError | RepoError> =>
      repo.execute((db) =>
        Effect.tryPromise({
          try: async () => {
            const rows = await db
              .select({
                country: visitors.country,
                count: count(),
              })
              .from(visitors)
              .where(buildBaseFilters(input))
              .groupBy(visitors.country)
              .orderBy(desc(count()));

            return rows.map((row) => ({
              slug: input.slug,
              country: row.country ?? null,
              count: row.count,
            }));
          },
          catch: (error) =>
            new AnalyticsError({
              message: `Failed to get country-wise metrics: ${String(error)}`,
              type: "QUERY_FAILED",
              code: 500,
            }),
        }),
      );

    const checkSiteOwnership = (slug: string, userId: string) => {
      return Effect.gen(function* () {
        const siteRepo = yield* SiteRepo;
        return yield* siteRepo.execute((db, table) =>
          Effect.tryPromise({
            try: async () => {
              const result = await db
                .select({ id: table.id })
                .from(table)
                .where(and(eq(table.userId, userId), eq(table.slug, slug)))
                .limit(1);
              return result.length > 0;
            },
            catch: (e) =>
              new DatabaseError({
                message: String(e),
                type: "QUERY_FAILED",
                code: 500,
              }),
          }),
        );
      });
    };

    return {
      trackVisitor,
      getVisitorsMetrics,
      getUniqueVisitorsMetrics,
      getVisitorsCountryWiseMetrics,
      checkSiteOwnership,
    };
  }),
);
