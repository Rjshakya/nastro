import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSiteSettingStore } from "@/stores/site.setting.store";
import type { NavConfig } from "@/types/site.setting";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "@tanstack/react-router";
import { ThemeToggle } from "./ThemeToggle";
import { cn } from "@/lib/utils";

const defaultAvatars = [
  "https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/blue.jpg",
];

export const SiteHeader = ({ header }: { header?: NavConfig }) => {
  const { setIsDark } = useSiteSettingStore();
  const links = header?.links ? Object.entries(header.links) : [];

  const location = useLocation();

  return (
    <header
      className={cn(
        "notion-header",
        `${location.pathname.includes("/site") ? "z-0" : "z-10"}`,
      )}
      style={{ zIndex: location.pathname.includes("/site") ? 0 : 10 }}
    >
      <div className="flex items-center justify-between gap-1">
        <div className="flex gap-1 items-center px-2">
          <Avatar className="size-5">
            <AvatarImage
              className="rounded-sm"
              src={header?.logo?.icon || defaultAvatars[0]}
            />
            <AvatarFallback />
          </Avatar>
          <p>{header?.logo?.text || "Header"}</p>
        </div>

        <div className="p-2 flex items-center gap-1.5">
          {links.map(([text, link]) => (
            <Link key={text} target="_blank" to={link.url}>
              <Button variant="ghost" size="sm" className="notion-header-btn">
                {text}
              </Button>
            </Link>
          ))}

          <ThemeToggle
            onThemeChange={(theme) => {
              setIsDark(theme === "dark");
            }}
          />
        </div>
      </div>
    </header>
  );
};
