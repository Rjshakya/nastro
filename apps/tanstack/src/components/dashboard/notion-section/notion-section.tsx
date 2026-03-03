import { IconBrandNotion } from "@tabler/icons-react";
import { useMemo } from "react";
import { Button } from "../../ui/button";
import { authClient } from "@/lib/auth-client";
import { NotionPages as NotionPagesComp } from "./notion-pages";
import { dashboardHomeApi } from "../home";

export const DashboardNotionSection = () => {
  const { pages: notionPages } = dashboardHomeApi.useLoaderData();
  const isNotionConnected = useMemo(
    () => notionPages && notionPages.length > 0,
    [notionPages],
  );

  const handleConnect = async () => {
    await authClient.linkSocial({
      provider: "notion",
      callbackURL: import.meta.env.PUBLIC_CLIENT_URL + "/dashboard",
    });
  };

  return (
    <div className="rounded-lg border bg-card p-2">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Button variant={"secondary"} size={"icon-lg"}>
            <IconBrandNotion className="size-5 " />
          </Button>
          <div>
            <h3 className="font-medium">Notion Pages</h3>
            <p className="text-xs text-muted-foreground">
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

      <NotionPagesComp data={notionPages} />
    </div>
  );
};
