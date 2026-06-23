"use client";

import {
  IconArrowLeft,
  IconExternalLink,
  IconEye,
  IconUsers,
  IconWorld,
} from "@tabler/icons-react";
import { getRouteApi, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import AreaChart, { Area } from "@/components/charts/area-chart";
import Grid from "@/components/charts/grid";
import { ChartTooltip } from "@/components/charts/tooltip";
import XAxis from "@/components/charts/x-axis";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAnalytics } from "@/hooks/use-analytics";
import {
  type AnalyticsDateRange,
  type ChartPoint,
  type DateRangePreset,
  fillBuckets,
  formatNumber,
  formatPresetLabel,
  getDefaultRange,
  getPresetRange,
} from "@/lib/analytics-dates";
import { Env } from "@/lib/env";
import { cn, createSlugUrl } from "@/lib/utils";

const routeApi = getRouteApi("/_app/analytics/$slug");

const PRESETS: DateRangePreset[] = ["24h", "7d", "30d", "90d"];

interface StatCardProps {
  title: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  isLoading: boolean;
  subtitle?: React.ReactNode;
}

function StatCard({ title, value, isLoading }: StatCardProps) {
  return (
    <Card className=" bg-muted dark:bg-card p-1 gap-2">
      <CardContent className="bg-background rounded-2xl h-full py-8 ">
        {isLoading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <div className=" text-2xl md:text-3xl  font-bold">{value}</div>
        )}
      </CardContent>
      <CardHeader className="px-3 py-1">
        <CardTitle className="text-sm  font-semibold">{title}</CardTitle>
      </CardHeader>
    </Card>
  );
}

interface AnalyticsChartProps {
  title: string;
  data: ChartPoint[];
  dataKey: string;
  label: string;
  isLoading: boolean;
}

function AnalyticsChart({
  title,
  data,
  dataKey,
  label,
  isLoading,
}: AnalyticsChartProps) {
  return (
    <Card className="bg-muted dark:bg-card p-2 gap-2">
      <CardHeader className="px-2 py-1">
        <CardTitle className=" text-sm font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="bg-background py-10 rounded-2xl">
        {isLoading ? (
          <Skeleton className="h-[250px] w-full" />
        ) : data.length === 0 ? (
          <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">
            No data available
          </div>
        ) : (
          <AreaChart data={data} aspectRatio="2 / 1.2">
            <Grid horizontal />
            <Area dataKey={dataKey} fill="var(--chart-line-primary)" />
            <XAxis numTicks={10} />
            <ChartTooltip
              showDatePill={true}
              rows={(point) => [
                {
                  color: "var(--chart-line-primary)",
                  label,
                  value: (point[dataKey] as number) ?? 0,
                },
              ]}
            />
          </AreaChart>
        )}
      </CardContent>
    </Card>
  );
}

interface AnalyticsCountriesProps {
  countries: Array<{ country: string | null; count: number }>;
  isLoading: boolean;
}

function AnalyticsCountries({ countries, isLoading }: AnalyticsCountriesProps) {
  return (
    <Card className="bg-muted dark:bg-card p-2 gap-2">
      <CardHeader className="px-2 py-1">
        <CardTitle className="text-sm font-semibold">Countries</CardTitle>
      </CardHeader>
      <CardContent className="bg-background py-10 rounded-2xl">
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-8 w-full" />
            ))}
          </div>
        ) : countries.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No country data available
          </div>
        ) : (
          <div className="divide-y">
            {countries.map((item, index) => (
              <div
                key={`${item.country ?? "unknown"}-${index}`}
                className="flex items-center justify-between py-3"
              >
                <span>{item.country ?? "Unknown"}</span>
                <span className="font-medium">{formatNumber(item.count)}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function DateRangePresets({
  value,
  onChange,
}: {
  value: DateRangePreset;
  onChange: (range: AnalyticsDateRange) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {PRESETS.map((preset) => (
        <Button
          key={preset}
          onClick={() => onChange(getPresetRange(preset))}
          size="sm"
          variant={value === preset ? "default" : "outline"}
        >
          {formatPresetLabel(preset)}
        </Button>
      ))}
    </div>
  );
}

export function AnalyticsPage() {
  const { slug } = routeApi.useParams();
  const { name, pageId } = routeApi.useSearch();
  const [range, setRange] = useState<AnalyticsDateRange>(getDefaultRange());
  const { data, isLoading } = useAnalytics({ slug, range });

  const viewsData = useMemo<ChartPoint[]>(() => {
    if (!data) return [];
    return fillBuckets(
      data.visitors,
      range.from,
      range.to,
      range.interval,
      "count",
    );
  }, [data, range]);

  const uniqueData = useMemo<ChartPoint[]>(() => {
    if (!data) return [];
    return fillBuckets(
      data.uniqueVisitors,
      range.from,
      range.to,
      range.interval,
      "uniqueCount",
    );
  }, [data, range]);

  const totalViews = useMemo(() => {
    return (
      data?.visitors.reduce((sum, item) => sum + Number(item.count), 0) ?? 0
    );
  }, [data]);

  const totalUnique = useMemo(() => {
    return (
      data?.uniqueVisitors.reduce(
        (sum, item) => sum + Number(item.uniqueCount),
        0,
      ) ?? 0
    );
  }, [data]);

  const topCountry = data?.countries[0];

  const liveSiteUrl = useMemo(() => {
    if (!pageId) return undefined;
    return Env.isDev
      ? `${Env.clientUrl}/${pageId}?slug=${slug}`
      : `${createSlugUrl(slug)}${pageId}`;
  }, [pageId, slug]);

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Link
            to="/dashboard"
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon-sm" }),
            )}
          >
            <IconArrowLeft className="size-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {name || slug}
            </h1>
            <p className="text-sm text-muted-foreground">{slug}</p>
          </div>
        </div>
        {liveSiteUrl && (
          <a
            href={liveSiteUrl}
            rel="noopener noreferrer"
            target="_blank"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "inline-flex items-center gap-2",
            )}
          >
            <IconExternalLink className="size-4" />
            Live site
          </a>
        )}
      </div>

      <DateRangePresets value={range.label} onChange={setRange} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={<IconEye className="size-4 text-muted-foreground" />}
          isLoading={isLoading}
          title="Total views"
          value={formatNumber(totalViews)}
        />
        <StatCard
          icon={<IconUsers className="size-4 text-muted-foreground" />}
          isLoading={isLoading}
          title="Unique visitors"
          value={formatNumber(totalUnique)}
        />
        <StatCard
          icon={<IconWorld className="size-4 text-muted-foreground" />}
          isLoading={isLoading}
          subtitle={`${formatNumber(topCountry?.count ?? 0)} views`}
          title="Top country"
          value={topCountry?.country ?? "—"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <AnalyticsChart
          data={viewsData}
          dataKey="count"
          isLoading={isLoading}
          label="Views"
          title="Views over time"
        />
        <AnalyticsChart
          data={uniqueData}
          dataKey="uniqueCount"
          isLoading={isLoading}
          label="Unique visitors"
          title="Unique visitors over time"
        />
      </div>

      <AnalyticsCountries
        countries={data?.countries ?? []}
        isLoading={isLoading}
      />
    </div>
  );
}
