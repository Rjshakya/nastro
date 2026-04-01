import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "#/components/ui/empty";
import { Button } from "#/components/ui/button";
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
export function Error({ message, code, onRetry }: ErrorProps) {
  return (
    <main className="w-full min-h-screen flex   items-center justify-center px-4">
      <Empty className="max-w-4xl mx-auto rounded-lg p-8 mb-24">
        <EmptyContent className="  shadow-md border-2 border-destructive/25 dark:border-red-600/25  ring ring-destructive/30 dark:ring-red-600/30 px-0 gap-1 rounded-md p-1 ">
          <EmptyHeader className="bg-muted dark:bg-secondary/20 px-0 py-4 w-full rounded-md">
            <EmptyMedia variant="icon" className="bg-destructive/10">
              <IconAlertCircle className="size-6 text-destructive" />
            </EmptyMedia>
            <EmptyTitle className="text-destructive">
              {code ? `Error ${code}` : "Something went wrong"}
            </EmptyTitle>
            <EmptyDescription className="w-full px-2 ">
              <div className="bg-background p-2 rounded-md border-2  border-input/50 dark:border-secondary/50 ring ring-input dark:bg-secondary shadow-sm ">
                <p className="w-full text-pretty">{message}</p>
              </div>
            </EmptyDescription>
          </EmptyHeader>

          {onRetry && (
            <Button
              variant="secondary"
              className={"w-full shadow-none  dark:bg-secondary/20 "}
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
