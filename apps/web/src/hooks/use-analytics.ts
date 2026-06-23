import useSWR from "swr";

import type { AnalyticsRange } from "@/lib/analytics";
import {
  getCountryMetrics,
  getUniqueVisitorsMetrics,
  getVisitorsMetrics,
  type CountryMetricPoint,
  type UniqueVisitorsMetricPoint,
  type VisitorsMetricPoint,
} from "@/lib/analytics";

interface UseAnalyticsInput {
  slug: string;
  range: AnalyticsRange;
}

interface AnalyticsData {
  visitors: VisitorsMetricPoint[];
  uniqueVisitors: UniqueVisitorsMetricPoint[];
  countries: CountryMetricPoint[];
}

export const useAnalytics = ({ slug, range }: UseAnalyticsInput) => {
  const key = slug
    ? `/analytics/${slug}/${range.from}/${range.to}/${range.interval}`
    : null;

  const fetcher = async (): Promise<AnalyticsData> => {
    const [visitorsRes, uniqueVisitorsRes, countriesRes] = await Promise.all([
      getVisitorsMetrics(slug, range),
      getUniqueVisitorsMetrics(slug, range),
      getCountryMetrics(slug, range),
    ]);

    return {
      visitors: visitorsRes.data,
      uniqueVisitors: uniqueVisitorsRes.data,
      countries: countriesRes.data,
    };
  };

  const swr = useSWR<AnalyticsData>(key, fetcher);

  return {
    data: swr.data,
    error: swr.error,
    isLoading: swr.isLoading,
    mutate: swr.mutate,
  };
};
