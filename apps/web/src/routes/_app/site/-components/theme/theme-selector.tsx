import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useThemeStore } from "@/stores/theme-store";
import { useDeleteTheme } from "@/hooks/use-themes";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import {
  IconChevronDown,
  IconCircleCheckFilled,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import { CreateThemeDialog } from "./create-theme-dialog";
import { SaveThemeDialog } from "./save-theme-dialog";
import type { Theme } from "@/types/theme";

export function ThemeSelector() {
  const { themes, theme: activeTheme, setTheme, unsetTheme } = useThemeStore();
  const { deleteTheme } = useDeleteTheme();
  const { data: session } = authClient.useSession();

  const [open, setOpen] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [openSave, setOpenSave] = useState(false);
  const popoverTriggerRef = useRef<HTMLButtonElement>(null);

  const handleSelect = (t: Theme | null) => {
    if (!t) {
      return unsetTheme();
    }
    setTheme(t);
  };

  const handleDelete = async (themeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteTheme({ themeId });
    setOpen(false);
  };

  const canSave = activeTheme && session?.user?.id === activeTheme.createdBy;

  return (
    <div className="grid gap-2 px-4 pt-4">
      <div className="flex items-center justify-between gap-2">
        <Label>Theme</Label>
        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="secondary"
            className="h-7 w-7"
            onClick={() => setOpenCreate(true)}
          >
            <IconPlus className="h-3.5 w-3.5" />
          </Button>
          {canSave && (
            <Button
              size="sm"
              variant="secondary"
              className="h-7 text-xs"
              onClick={() => setOpenSave(true)}
            >
              Save
            </Button>
          )}
        </div>
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          ref={popoverTriggerRef}
          render={
            <Button
              variant="outline"
              className="w-full justify-between capitalize"
              role="combobox"
              aria-expanded={open}
            >
              {activeTheme?.name ?? "Select theme"}
              <IconChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          }
        />
        <PopoverContent
          className={"p-1"}
          style={{
            width: `${popoverTriggerRef.current?.clientWidth}px`,
          }}
        >
          {themes.length > 0 ? (
            <div className="max-h-72 overflow-x-auto">
              {themes.map((t) => {
                const isSelected = activeTheme?.id === t.id;
                return (
                  <div
                    key={t.id}
                    className={cn(
                      "flex items-center justify-between px-2 cursor-pointer hover:bg-accent hover:text-accent-foreground",
                      isSelected && "bg-accent/50",
                      "rounded-2xl",
                    )}
                    onClick={() =>
                      handleSelect(t.id === activeTheme?.id ? null : t)
                    }
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {isSelected && (
                        <IconCircleCheckFilled className=" size-4 text-primary shrink-0" />
                      )}
                      <span className="capitalize truncate">{t.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={(e) => handleDelete(t.id, e)}
                      disabled={session?.user?.id !== t.createdBy}
                    >
                      <IconTrash className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="px-3 py-4 text-sm text-muted-foreground text-center">
              No themes available
            </div>
          )}
        </PopoverContent>
      </Popover>

      <CreateThemeDialog open={openCreate} onOpenChange={setOpenCreate} />
      <SaveThemeDialog
        open={openSave}
        onOpenChange={setOpenSave}
        themeId={activeTheme?.id ?? ""}
      />
    </div>
  );
}
