import { Skeleton } from "#/components/ui/skeleton";

export function SiteEditorLoading() {
  return (
    <main className="min-h-screen bg-background relative rounded-md">
      {/* Header skeleton */}
      <div className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-5 w-40" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-24 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
        {/* Title */}
        <Skeleton className="h-12 w-3/4 mb-8" />

        {/* Content blocks */}
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/5" />

          {/* Block quote */}
          <div className="py-4">
            <Skeleton className="h-20 w-full rounded-lg" />
          </div>

          {/* More paragraphs */}
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />

          {/* Image placeholder */}
          <div className="py-4">
            <Skeleton className="h-64 w-full rounded-lg" />
          </div>

          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    </main>
  );
}
