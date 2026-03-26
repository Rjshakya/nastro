import { IconBrandNotion } from "@tabler/icons-react";
import { useMemo } from "react";
import { Button } from "../../ui/button";
import { authClient } from "@/lib/auth-client";
import { NotionPages as NotionPagesComp } from "./notion-pages";
import { Env } from "env";
import { useNotionPages } from "#/hooks/use-notion";

export const DashboardNotionSection = () => {
  const { data: notionPages } = useNotionPages();
  const isNotionConnected = useMemo(
    () => notionPages && notionPages.length > 0,
    [notionPages],
  );

  const handleConnect = async () => {
    await authClient.linkSocial({
      provider: "notion",
      callbackURL: Env.clientUrl + "/dashboard",
    });
  };

  return (
    <div className="rounded-lg border bg-card p-2">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Button variant={"secondary"} size={"icon-sm"}>
            <IconBrandNotion className="size-6 " />
          </Button>
          <h3 className="font-medium">Notion Pages</h3>
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
