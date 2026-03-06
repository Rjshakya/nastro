
import type { ExtendedRecordMap } from "notion-types";

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useNotionSettingsStore } from "#/stores/notion-settings";

export const SiteHeader = () => {
  const { settings } = useNotionSettingsStore((s) => s);

  return (
    <header className="">
      <div className="flex gap-1 items-center p-2">
        <Avatar className={"size-5"}>
          <AvatarImage
            className={"rounded-sm"}
            src={settings?.seo?.pageIcon || ""}
          />
          <AvatarFallback />
        </Avatar>

        <p className="">{settings?.seo?.pageTitle || "Header"}</p>
      </div>
    </header>
  );
};
