import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import { IconAlertCircle } from "@tabler/icons-react";

interface ErrorProps {
  /** Error message to display */
  message: string;
  /** Optional error code (HTTP status or custom code) */
  code?: string | number;
  /** Optional retry handler */
  onRetry?: () => void;
}

/**
 * Error state component for displaying errors across the app.
 * Displays a clean error message with optional error code and retry action.
 *
 * @example
 * ```tsx
 * <Error
 *   message="Failed to load data"
 *   code={500}
 *   onRetry={() => window.location.reload()}
 * />
 * ```
 */
export function Error({ message, code: _code, onRetry }: ErrorProps) {
  return (
    <main className="w-full min-h-screen flex   items-center justify-center px-4">
      <Empty className="max-w-4xl mx-auto rounded-lg p-8 mb-24">
        <EmptyContent className="shadow-md border-2 border-input dark:border-input/50 ring ring-ring/70 dark:ring-input px-0 gap-1 rounded-md p-1 ">
          <div className="w-full flex items-center gap-1 text-muted-foreground ">
            <IconAlertCircle className="size-3.5 " />
            <p className="text-xs ">Something went wrong</p>
          </div>
          <EmptyHeader className="bg-muted dark:bg-secondary/20 px-0 py-4 w-full rounded-md">
            <EmptyDescription className="w-full px-2 ">
              <div className="rounded-sm p-0 border border-input/50 dark:border-secondary/50 ring ring-input dark:bg-secondary shadow-sm ">
                <p className=" text-destructive text-pretty bg-background size-full p-2 rounded-sm ">
                  {message}
                </p>
              </div>
            </EmptyDescription>
          </EmptyHeader>

          {onRetry && (
            <Button
              variant="secondary"
              className={
                "w-full shadow-none text-muted-foreground dark:bg-secondary/20 "
              }
              onClick={onRetry}
            >
              Try Again
            </Button>
          )}
        </EmptyContent>
      </Empty>
    </main>
  );
}
