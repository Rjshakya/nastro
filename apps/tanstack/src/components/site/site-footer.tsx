import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import type { LayoutFooterUI } from "#/types/customization";
import { Button } from "../ui/button";
import { Link } from "@tanstack/react-router";
import "@/styles/notion.css";
import { Separator } from "../ui/separator";

export const SiteFooter = ({ footer }: { footer?: LayoutFooterUI }) => {
  return (
    <footer className="w-full p-4 notion  notion-footer-custom ">
      <div className=" max-w-4xl mx-auto grid gap-4">
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

        <div className="flex gap-2 items-center justify-center p-2">
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
