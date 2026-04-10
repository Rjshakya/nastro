import { TemplateCard, TemplateCardSkeleton } from "./template-card";
import { useTemplates } from "@/hooks/use-templates";
import { IconTemplate } from "@tabler/icons-react";
import { EmptyState } from "@/components/empty";

export function TemplatesGrid() {
  const { data: templates, isLoading, error } = useTemplates();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <TemplateCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={IconTemplate}
        title="Error Loading Templates"
        description="Failed to load templates. Please try again later."
      />
    );
  }

  if (!templates || templates.length === 0) {
    return (
      <EmptyState
        icon={IconTemplate}
        title="No Templates Yet"
        description="Browse our collection of templates to get started with your site."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {templates.map((template) => (
        <TemplateCard key={template.id} template={template} />
      ))}
    </div>
  );
}
