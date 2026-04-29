import {
  IconExternalLink,
  IconPhoto,
  IconDownload,
  IconArrowLeft,
  IconLoader2,
} from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SlugInput } from "@/components/slug-input";
import { useTemplateInstall } from "@/hooks/use-template-install";
import { useIsSiteSlugAvailable } from "@/hooks/use-sites";

interface TemplateInstallPageProps {
  templateId: string;
}

export const TemplateInstallPage = ({
  templateId,
}: TemplateInstallPageProps) => {
  const {
    template,
    isLoadingTemplate,
    state,
    setUserNotionUrl,
    setSiteName,
    setSlug,
    installTemplate,
    isSubmitting,
    error,
  } = useTemplateInstall({ templateId });

  const { isAvailable, setValue, isLoading } = useIsSiteSlugAvailable(
    state.slug,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await installTemplate({
      userNotionUrl: state.userNotionUrl,
      siteName: state.siteName,
      slug: state.slug,
    });
  };

  // Show skeleton while loading template
  if (isLoadingTemplate) {
    return (
      <div className="mx-auto max-w-2xl p-8 w-full">
        <div className="mb-6 flex items-center gap-4">
          <Skeleton className="h-20 w-full rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <div className="space-y-4 w-full">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  // If template is paid, show coming soon message
  if (template?.isPaid) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <Link
          to="/templates"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <IconArrowLeft className="h-4 w-4" />
          Back to Templates
        </Link>

        <Card>
          <CardContent className="p-8 text-center">
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-muted p-4">
                <IconDownload className="h-8 w-8 text-muted-foreground" />
              </div>
            </div>
            <h2 className="mb-2 text-xl font-semibold">Paid Template</h2>
            <p className="text-muted-foreground">
              This is a paid template. Payment and checkout will be available
              soon.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <p>this install page</p>
      {/* Back Link */}
      <Link
        to="/templates"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <IconArrowLeft className="h-4 w-4" />
        Back to Templates
      </Link>

      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <div className="relative h-20 w-20 overflow-hidden rounded-lg bg-muted">
          {template?.thumbnail ? (
            <img
              src={template.thumbnail}
              alt={template.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <IconPhoto className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {template?.name}
          </h1>
          <p className="text-muted-foreground">
            Install this template to your workspace
          </p>
        </div>
      </div>

      {/* Instructions Link */}
      {template?.instructionsPageUrl && (
        <Card className="mb-6">
          <CardContent className="p-4">
            <p className="text-sm">
              For more detailed instructions, visit:{" "}
              <Link
                to={template.instructionsPageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-1 inline-flex items-center gap-1 text-primary hover:underline"
              >
                Template Installation Guide
                <IconExternalLink className="h-3 w-3" />
              </Link>
            </p>
          </CardContent>
        </Card>
      )}

      {/* Installation Steps */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Visit Template Page */}
        <div className="space-y-2">
          <h3 className="font-medium">Step 1: Visit the Template Page</h3>
          <p className="text-sm text-muted-foreground">
            Open the template in Notion to begin the installation process.
          </p>
          <Link
            to={template?.notionPageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className=""
          >
            <Button variant={"outline"} className={"dark:border-border"}>
              Open in Notion
              <IconExternalLink className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Step 2: Duplicate */}
        <div className="space-y-2">
          <h3 className="font-medium">Step 2: Duplicate to Your Workspace</h3>
          <p className="text-sm text-muted-foreground">
            Click the &quot;Duplicate&quot; button at the top right of the
            Notion page to add it to your workspace.
          </p>
        </div>

        {/* Step 3: Make Public */}
        <div className="space-y-2">
          <h3 className="font-medium">Step 3: Make the Page Public</h3>
          <p className="text-sm text-muted-foreground">
            Click &quot;Share&quot; → &quot;Publish to web&quot; → Enable
            &quot;Publish to web&quot; → Copy the public link.
          </p>
        </div>

        {/* Step 4: Paste Your Public Page URL */}
        <div className="space-y-2">
          <Label htmlFor="notionUrl" className="font-medium">
            Step 4: Paste Your Public Notion Page URL
          </Label>
          <Input
            id="notionUrl"
            placeholder="https://yourusername.notion.site/..."
            value={state.userNotionUrl}
            onChange={(e) => setUserNotionUrl(e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        {/* Step 5: Site Name */}
        <div className="space-y-2">
          <Label htmlFor="siteName" className="font-medium">
            Step 5: Site Name
          </Label>
          <Input
            id="siteName"
            placeholder="My New Site"
            value={state.siteName}
            onChange={(e) => setSiteName(e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        {/* Step 6: Slug */}
        <div className="space-y-2">
          <h3 className="font-medium">Step 6: Choose Your Site URL</h3>
          <SlugInput
            value={state.slug}
            onChange={(slug) => {
              setSlug(slug);
              setValue(slug);
            }}
            isAvailable={isAvailable}
            isLoading={isLoading}
            placeholder="your-site-name"
          />
          <p className="text-xs text-muted-foreground">
            This will be your site&apos;s subdomain: https://
            {state.slug || "your-site"}
            .nastro.io
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={
            isSubmitting ||
            !state.userNotionUrl.trim() ||
            !state.siteName.trim() ||
            !state.slug.trim() ||
            !isAvailable
          }
          className="w-full"
        >
          {isSubmitting ? (
            <>
              <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Site...
            </>
          ) : (
            <>
              <IconDownload className="mr-2 h-4 w-4" />
              Create Site from Template
            </>
          )}
        </Button>
      </form>
    </div>
  );
};
