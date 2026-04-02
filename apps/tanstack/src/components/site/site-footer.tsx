import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import type { LayoutFooterUI } from "#/types/notion-page-settings";
import { Button } from "../ui/button";
import { Link } from "@tanstack/react-router";
import "@/styles/notion.css";
import { defaultAvatars } from "./site-header";

export const SiteFooter = ({ footer }: { footer?: LayoutFooterUI }) => {
  return (
    <footer className="w-full notion px-2  notion-footer ">
      <div className="grid">
        <div className="w-full flex items-center justify-center">
          {footer?.links &&
            footer?.links?.length > 0 &&
            footer?.links?.map((l) => {
              return (
                <Link target="_blank" to={l.url}>
                  <Button variant={"link"}>{l.text}</Button>
                </Link>
              );
            })}
        </div>

        <div className="flex gap-2 items-center py-2 ">
          <Avatar className={"size-5"}>
            <AvatarImage className={"rounded-sm"} src={footer?.logo || defaultAvatars[0]} />
            <AvatarFallback />
          </Avatar>

          <p className="">{footer?.text || "Footer"}</p>
        </div>
      </div>
    </footer>
  );
};
