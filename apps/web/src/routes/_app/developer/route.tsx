import { createFileRoute } from "@tanstack/react-router";
import { useNotionToken } from "@/hooks/use-notion";
import { Error } from "@/components/error";
import { CredentialCard } from "./-components/credential-card";
import { ApiKeyCard } from "./-components/apikey-card";

export const Route = createFileRoute("/_app/developer")({
  component: DeveloperPage,
  errorComponent: Error,
});

function DeveloperPage() {
  const { data: token, isLoading } = useNotionToken();

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="font-heading text-2xl font-medium">Developer</h1>
        <p className="text-muted-foreground">Manage your developer settings and integrations.</p>
      </div>

      <CredentialCard token={token} isLoading={isLoading} />
      <ApiKeyCard />
    </div>
  );
}
