import {
  IconTrash,
  IconWorld,
  IconLoader2,
  IconCheck,
  IconX,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  Item,
  ItemContent,
  ItemTitle,
  ItemDescription,
  ItemActions,
} from "@/components/ui/item";
import { useDomainStatus } from "@/hooks/use-custom-domains";
import type { CustomDomain } from "@/types/custom-domain";

interface DomainItemProps {
  domain: CustomDomain;
  onDelete: (id: string) => void;
}

function StatusBadge({ status }: { status?: string }) {
  if (!status) return null;

  const isActive = status === "active";
  const isPending = status === "pending";
  const isError = status === "blocked" || status === "test_failed";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
        isActive
          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
          : isError
            ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
            : isPending
              ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
              : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
      }`}
    >
      {isActive && <IconCheck className="size-3" />}
      {isPending && <IconLoader2 className="size-3 animate-spin" />}
      {isError && <IconX className="size-3" />}
      {status}
    </span>
  );
}

export function DomainItem({ domain, onDelete }: DomainItemProps) {
  const { status, isLoading: isStatusLoading } = useDomainStatus(domain.id);

  return (
    <Item className="rounded-xl bg-card hover:bg-accent">
      <ItemContent>
        <div className="flex items-center gap-2">
          <ItemTitle className="text-base">{domain.hostName}</ItemTitle>
          <StatusBadge status={status?.status || domain.status} />
          {status?.sslStatus && (
            <span className="text-xs text-muted-foreground">
              SSL: {status.sslStatus}
            </span>
          )}
        </div>
        <ItemDescription>
          {isStatusLoading
            ? "Checking status..."
            : status?.status
              ? `Cloudflare status: ${status.status}`
              : `Database status: ${domain.status}`}
        </ItemDescription>
      </ItemContent>
      <ItemActions>
        <Button
          size="icon"
          variant="destructive"
          onClick={() => onDelete(domain.id)}
        >
          <IconTrash className="size-4" />
        </Button>
      </ItemActions>
    </Item>
  );
}
