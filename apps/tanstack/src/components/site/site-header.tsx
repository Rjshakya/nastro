import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useNotionSettingsStore } from "#/stores/notion-settings";
import type { LayoutHeaderUI } from "#/types/notion-page-settings";
import { Button } from "../ui/button";
import { Link, useLocation } from "@tanstack/react-router";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { IconChevronDown } from "@tabler/icons-react";
import { Moon, Sun } from "lucide-react";
import { clientThemeToggle } from "#/lib/utils";

export const defaultAvatars = [
  "https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/blue.jpg",
  "https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/purple.jpg",
  "https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/red.jpg",
  "https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/orange.jpg",
];

export const SiteHeader = ({ header }: { header?: LayoutHeaderUI }) => {
  return (
    <header className="notion-header">
      <div className="flex items-center justify-between gap-1">
        <div className="flex gap-1 items-center px-2">
          <Avatar className={"size-5"}>
            <AvatarImage className={"rounded-sm"} src={header?.logo || defaultAvatars[0]} />
            <AvatarFallback />
          </Avatar>

          <p className="">{header?.text || "Header"}</p>
        </div>

        <div className="p-2 flex items-center gap-1.5">
          {header?.lists &&
            header.lists?.length > 0 &&
            header.lists.map((l, i) => {
              return (
                <DropdownMenu key={i}>
                  <DropdownMenuTrigger
                    render={
                      <Button variant={"link"} className={"notion-header-btn"} size={"sm"}>
                        {l?.text}
                        <IconChevronDown stroke={1} />
                      </Button>
                    }
                  />
                  <DropdownMenuContent>
                    <DropdownMenuGroup>
                      {l?.links &&
                        l.links.length > 0 &&
                        l.links.map((link) => {
                          return <DropdownMenuItem>{link.text}</DropdownMenuItem>;
                        })}
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            })}

          {header?.links &&
            header.links?.length > 0 &&
            header.links.map((l, i) => {
              return (
                <Link key={i} target="_blank" to={l?.url}>
                  <Button variant={l.variant} className={"notion-header-btn"} size={"sm"}>
                    {l?.text}
                  </Button>
                </Link>
              );
            })}

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

function ThemeToggle() {
  const { setIsDark, settings } = useNotionSettingsStore();

  function toggleTheme() {
    const bool = !settings?.general?.isDark;
    clientThemeToggle(bool);
    setIsDark(bool);
  }

  return (
    <Button variant="ghost" size="icon-xs" onClick={toggleTheme} aria-label="Toggle theme">
      {settings?.general?.isDark ? <Moon className="size-4" /> : <Sun className="size-4" />}
    </Button>
  );
}
