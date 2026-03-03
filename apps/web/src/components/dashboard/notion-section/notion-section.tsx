import { IconBrandNotion } from "@tabler/icons-react";
import { useMemo } from "react";
import { Button } from "../../ui/button";
import type { NotionPages } from "@/types/notion";
import { authClient } from "@/lib/auth-client";
import { NotionPages as NotionPagesComp } from "./notion-pages";
import type { KeyedMutator } from "swr";

export const DashboardNotionSection = ({
  notionPages,
  isLoadingNotion,
  notionError,
  mutate,
}: {
  notionPages: NotionPages;
  isLoadingNotion: boolean;
  notionError: any;
  mutate: KeyedMutator<any>;
}) => {
  const isNotionConnected = useMemo(
    () => !notionError && (notionPages !== undefined || isLoadingNotion),
    [notionPages],
  );

  const handleConnect = async () => {
    await authClient.linkSocial({
      provider: "notion",
      callbackURL: import.meta.env.PUBLIC_CLIENT_URL + "/dashboard",
    });
  };

  const handleRetry = () => {
    mutate();
  };

  return (
    <div className="rounded-lg border bg-card p-2">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Button variant={"ghost"} size={"icon"}>
            <IconBrandNotion className="size-5 text-white" />
          </Button>
          <div>
            <h3 className="font-medium">Notion Pages</h3>
            <p className="text-sm text-muted-foreground">
              {isNotionConnected
                ? `${notionPages?.length ?? 0} pages synced`
                : "Connect your workspace"}
            </p>
          </div>
        </div>
        {!isNotionConnected ? (
          <Button onClick={handleConnect}>Connect Notion</Button>
        ) : (
          <Button size={"sm"} variant="outline" onClick={handleConnect}>
            Reconnect
          </Button>
        )}
      </div>

      <NotionPagesComp
        data={notionPages}
        isLoading={isLoadingNotion}
        error={notionError}
        onRetry={handleRetry}
      />
    </div>
  );
};
