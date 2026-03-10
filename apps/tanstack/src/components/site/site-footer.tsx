import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useNotionSettingsStore } from "#/stores/notion-settings";
import type { LayoutFooterUI } from "#/types/customization";

export const SiteFooter = ({ footer }: { footer?: LayoutFooterUI }) => {

  return (
    <footer className="w-full notion-footer">
      <div className=" max-w-4xl mx-auto">
        <div className="flex gap-1 items-center p-2">
          <Avatar className={"size-5"}>
            <AvatarImage className={"rounded-sm"} src={footer?.logo || ""} />
            <AvatarFallback />
          </Avatar>

          <p className="">{footer?.text || "Footer"}</p>
        </div>
      </div>
    </footer>
  );
};
