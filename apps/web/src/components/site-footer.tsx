import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { NavConfig } from "@/types/site.setting";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";

const defaultAvatars = ["https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/blue.jpg"];

export const SiteFooter = ({ footer }: { footer?: NavConfig }) => {
  const links = footer?.links ? Object.entries(footer.links) : [];

  return (
    <footer className="w-full notion px-2 notion-footer">
      <div className="grid">
        <div className="w-full flex items-center justify-center">
          {links.map(([text, link]) => (
            <Link key={text} target="_blank" to={link.url}>
              <Button variant="link">{text}</Button>
            </Link>
          ))}
        </div>

        <div className="flex gap-2 items-center py-2">
          <Avatar className="size-5">
            <AvatarImage className="rounded-sm" src={footer?.logo?.icon || defaultAvatars[0]} />
            <AvatarFallback />
          </Avatar>
          <p>{footer?.logo?.text || "Footer"}</p>
        </div>
      </div>
    </footer>
  );
};
