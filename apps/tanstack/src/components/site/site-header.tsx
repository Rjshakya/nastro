import type { ExtendedRecordMap } from "notion-types";

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useNotionSettingsStore } from "#/stores/notion-settings";
import type { LayoutHeaderUI } from "#/types/customization";
import { Button } from "../ui/button";
import { Link } from "@tanstack/react-router";
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

export const SiteHeader = ({ header }: { header?: LayoutHeaderUI }) => {
  return (
    <header className="notion-header">
      <div className="flex items-center justify-between gap-1">
        <div className="flex gap-1 items-center p-2">
          <Avatar className={"size-5"}>
            <AvatarImage className={"rounded-sm"} src={header?.logo || ""} />
            <AvatarFallback />
          </Avatar>

          <p className="">{header?.text || "Header"}</p>
        </div>

        <div className="p-2 flex items-center gap-1.5">
          {header?.list &&
            header.list?.length > 0 &&
            header.list.map((l, i) => {
              return (
                <DropdownMenu key={i}>
                  <DropdownMenuTrigger
                    render={
                      <Button
                        variant={"link"}
                        className={"notion-header-btn"}
                        size={"sm"}
                      >
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
                          return (
                            <DropdownMenuItem>{link.text}</DropdownMenuItem>
                          );
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
                  <Button
                    variant={l.variant}
                    className={"notion-header-btn"}
                    size={"sm"}
                  >
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
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label="Toggle theme"
    >
      {settings?.general?.isDark ? (
        <Moon className="h-4 w-4" />
      ) : (
        <Sun className="h-4 w-4" />
      )}
    </Button>
  );
}
