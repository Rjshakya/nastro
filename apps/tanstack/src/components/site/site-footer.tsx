import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useNotionSettingsStore } from "#/stores/notion-settings";

export const SiteFooter = () => {
  const { settings } = useNotionSettingsStore((s) => s);

  return (
    <footer className="w-full">
      <div className=" max-w-4xl mx-auto">
        <div className="flex gap-1 items-center p-2">
          <Avatar className={"size-5"}>
            <AvatarImage
              className={"rounded-sm"}
              src={settings?.seo?.pageIcon || ""}
            />
            <AvatarFallback />
          </Avatar>

          <p className="">{settings?.seo?.pageTitle || "Footer"}</p>
        </div>
      </div>
    </footer>
  );
};
