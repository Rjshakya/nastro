import type { CustomDomain } from "@/types/custom-domain";
import { DomainItem } from "./domain-item";
import { ItemGroup } from "@/components/ui/item";
import { EmptyState } from "@/components/empty";
import { IconLinkOff } from "@tabler/icons-react";

interface DomainListProps {
  domains: CustomDomain[];
  isLoading: boolean;
  onDelete: (id: string) => void;
}

export function DomainList({ domains, isLoading, onDelete }: DomainListProps) {
  if (isLoading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Loading domains...
      </div>
    );
  }

  if (domains.length === 0) {
    return (
      <EmptyState
        className="py-8"
        icon={IconLinkOff}
        title="No Custom Domains"
        description="You haven't added any custom domains yet. Add one to get started."
      />
    );
  }

  return (
    <ItemGroup className="gap-1 p-1">
      {domains.map((domain) => (
        <DomainItem
          key={domain.id}
          domain={domain}
          onDelete={onDelete}
        />
      ))}
    </ItemGroup>
  );
}
