import { client } from "@/lib/api-client";
import { handleHttpError } from "@/lib/error";

export interface AnalyticsRange {
  from: number;
  to: number;
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
  uniqueCount: string | number;
}

export interface CountryMetricPoint {
  slug: string;
  country: string | null;
  count: number;
}

interface ApiResponse<T> {
  data: T;
  message: string;
  error: unknown;
}

export const getVisitorsMetrics = async (
  slug: string,
  range: AnalyticsRange,
): Promise<ApiResponse<VisitorsMetricPoint[]>> => {
  const res = await client.api.analytics.visitors.$get({
    query: {
      slug,
      from: String(range.from),
      to: String(range.to),
      interval: range.interval,
    },
  });

  if (!res.ok) {
    const error = await res.json();
    handleHttpError()({
      message: error?.message || "Failed to load visitor metrics",
      statusCode: res.status,
      error,
      throwError: true,
      showToast: true,
    });
  }

  return res.json();
};

export const getUniqueVisitorsMetrics = async (
  slug: string,
  range: AnalyticsRange,
): Promise<ApiResponse<UniqueVisitorsMetricPoint[]>> => {
  const res = await client.api.analytics["unique-visitors"].$get({
    query: {
      slug,
      from: String(range.from),
      to: String(range.to),
      interval: range.interval,
    },
  });

  if (!res.ok) {
    const error = await res.json();
    handleHttpError()({
      message: error?.message || "Failed to load unique visitor metrics",
      statusCode: res.status,
      error,
      throwError: true,
      showToast: true,
    });
  }

  return res.json();
};

export const getCountryMetrics = async (
  slug: string,
  range: Omit<AnalyticsRange, "interval">,
): Promise<ApiResponse<CountryMetricPoint[]>> => {
  const res = await client.api.analytics.countries.$get({
    query: {
      slug,
      from: String(range.from),
      to: String(range.to),
    },
  });

  if (!res.ok) {
    const error = await res.json();
    handleHttpError()({
      message: error?.message || "Failed to load country metrics",
      statusCode: res.status,
      error,
      throwError: true,
      showToast: true,
    });
  }

  return res.json();
};
