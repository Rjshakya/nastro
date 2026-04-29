import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Icon } from "@tabler/icons-react";

interface EmptyStateAction {
  /** Button label/text */
  label: string;
  /** Click handler */
  onClick?: () => void;
  /** Button variant - defaults to "default" for primary, "outline" for secondary */
  variant?: "default" | "outline" | "ghost" | "link";
  /** Optional href for link buttons */
  href?: string;
  /** Optional icon component */
  icon?: Icon;
}

interface EmptyStateProps {
  /** Main heading/title - required */
  title: string;
  /** Optional description text */
  description?: string;
  /** Tabler icon component to display */
  icon: Icon;
  /** Primary action button */
  primaryAction?: EmptyStateAction;
  /** Secondary action button */
  secondaryAction?: EmptyStateAction;
  /** Additional className for the container */
  className?: string;
}

/**
 * Empty state component with Tabler icons and action buttons.
 *
 * @example
 * ```tsx
 * <EmptyState
 *   icon={IconFolderCode}
 *   title="No Projects Yet"
 *   description="You haven't created any projects yet."
 *   primaryAction={{ label: "Create Project", onClick: handleCreate }}
 *   secondaryAction={{ label: "Import Project", variant: "outline" }}
 * />
 * ```
 */
function EmptyState({
  title,
  description,
  icon: IconComponent,
  primaryAction,
  secondaryAction,
  className,
}: EmptyStateProps) {
  const actions = [primaryAction, secondaryAction].filter(Boolean);

  return (
    <Empty className={className}>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <IconComponent className="size-6" />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        {description && <EmptyDescription>{description}</EmptyDescription>}
      </EmptyHeader>
      {actions.length > 0 && (
        <EmptyContent
          className={cn(
            "flex-row justify-center gap-2",
            actions.length === 1 && "flex-col",
          )}
        >
          {primaryAction && (
            <Button
              variant={primaryAction.variant || "default"}
              onClick={primaryAction.onClick}
              {...(primaryAction.href
                ? {
                    render: (
                      <a href={primaryAction.href}>{primaryAction.label}</a>
                    ),
                  }
                : {})}
            >
              {primaryAction.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              variant={secondaryAction.variant || "outline"}
              onClick={secondaryAction.onClick}
              {...(secondaryAction.href
                ? {
                    render: (
                      <a href={secondaryAction.href}>{secondaryAction.label}</a>
                    ),
                  }
                : {})}
            >
              {secondaryAction.label}
            </Button>
          )}
        </EmptyContent>
      )}
    </Empty>
  );
}

export {
  EmptyState,
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
};
export type { EmptyStateProps, EmptyStateAction };
