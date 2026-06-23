import {
  eachDayOfInterval,
  eachHourOfInterval,
  eachMonthOfInterval,
  eachWeekOfInterval,
  parseISO,
  startOfDay,
  startOfHour,
  startOfMonth,
  startOfWeek,
  subDays,
  subHours,
} from "date-fns";

export type AnalyticsInterval = "hour" | "day" | "week" | "month";
export type DateRangePreset = "24h" | "7d" | "30d" | "90d";

export interface AnalyticsDateRange {
  from: number;
  to: number;
  interval: AnalyticsInterval;
  label: DateRangePreset;
}

export interface ChartPoint {
  date: Date;
  [key: string]: number | Date;
}

const MS_PER_HOUR = 60 * 60 * 1000;
const MS_PER_DAY = 24 * MS_PER_HOUR;
const WEEK_STARTS_ON = 1; // Monday

const PRESET_DURATIONS: Record<DateRangePreset, number> = {
  "24h": MS_PER_HOUR * 24,
  "7d": MS_PER_DAY * 7,
  "30d": MS_PER_DAY * 30,
  "90d": MS_PER_DAY * 90,
};

const floorToInterval: Record<AnalyticsInterval, (date: Date) => Date> = {
  hour: startOfHour,
  day: startOfDay,
  week: (date) => startOfWeek(date, { weekStartsOn: WEEK_STARTS_ON }),
  month: startOfMonth,
};

const eachInterval: Record<
  AnalyticsInterval,
  (interval: { start: Date; end: Date }) => Date[]
> = {
  hour: eachHourOfInterval,
  day: eachDayOfInterval,
  week: (interval) =>
    eachWeekOfInterval(interval, { weekStartsOn: WEEK_STARTS_ON }),
  month: eachMonthOfInterval,
};

const parseInterval = (interval: string): Date => {
  const iso = `${interval.replace(" ", "T")}Z`;
  return parseISO(iso);
};

export const getPresetRange = (preset: DateRangePreset): AnalyticsDateRange => {
  const interval: AnalyticsInterval = preset === "24h" ? "hour" : "day";
  const now = new Date();
  const to = floorToInterval[interval](now).getTime();
  const from =
    interval === "hour"
      ? subHours(new Date(to), 24).getTime()
      : subDays(
          new Date(to),
          PRESET_DURATIONS[preset] / MS_PER_DAY,
        ).getTime();

  return { from, to, interval, label: preset };
};

export const getDefaultRange = (): AnalyticsDateRange =>
  getPresetRange("24h");

export const fillBuckets = <
  T extends { interval: string },
  K extends keyof T,
>(
  data: T[],
  from: number,
  to: number,
  interval: AnalyticsInterval,
  valueKey: K,
): ChartPoint[] => {
  const floor = floorToInterval[interval];
  const getBuckets = eachInterval[interval];

  const values = new Map<number, number>();
  for (const row of data) {
    const bucketTime = floor(parseInterval(row.interval)).getTime();
    const raw = row[valueKey];
    const value = typeof raw === "number" ? raw : Number(raw);
    values.set(bucketTime, (values.get(bucketTime) ?? 0) + value);
  }

  const buckets = getBuckets({
    start: floor(new Date(from)),
    end: floor(new Date(to)),
  });

  return buckets.map((date) => ({
    date,
    [valueKey as string]: values.get(date.getTime()) ?? 0,
  }));
};

export const formatPresetLabel = (preset: DateRangePreset): string => {
  const labels: Record<DateRangePreset, string> = {
    "24h": "Last 24 hours",
    "7d": "Last 7 days",
    "30d": "Last 30 days",
    "90d": "Last 90 days",
  };
  return labels[preset];
};

export const formatNumber = (value: number): string =>
  new Intl.NumberFormat("en-US").format(value);
