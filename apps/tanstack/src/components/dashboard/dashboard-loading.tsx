import { Skeleton } from "#/components/ui/skeleton";

export function DashboardLoading() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2 max-w-4xl mx-auto w-full">
        <div className="flex flex-col gap-6 p-4 md:p-6">
          {/* Header skeleton */}
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <Skeleton className="h-8 w-40" />
              <Skeleton className="h-4 w-56" />
            </div>
            <Skeleton className="h-9 w-9 rounded-md" />
          </div>

          {/* Sites Section skeleton */}
          <div className="rounded-lg bg-muted p-1.5 grid gap-2">
            <div className="flex items-center justify-between pt-1 px-1">
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-md" />
                <Skeleton className="h-5 w-16" />
              </div>
              <Skeleton className="h-8 w-24 rounded-md" />
            </div>

            <div className="grid gap-2 rounded-md p-1 bg-card">
              {/* Site card skeletons */}
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-md"
                >
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
