import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useThemeStore } from "@/stores/theme-store";
import { useSiteSettingStore } from "@/stores/site.setting.store";
import { useThemes, useDeleteTheme } from "@/hooks/use-themes";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { IconCheck, IconChevronDown, IconPlus, IconTrash } from "@tabler/icons-react";
import { CreateThemeDialog } from "./create-theme-dialog";
import { SaveThemeDialog } from "./save-theme-dialog";
import { loadFont } from "@/lib/fonts";

export function ThemeSelector() {
  const { themes, theme: activeTheme, setTheme } = useThemeStore();
  const { hasThemeChanged, appliedTheme } = useSiteSettingStore();
  const { data: allThemes, isLoading } = useThemes();
  const { deleteTheme } = useDeleteTheme();
  const { data: session } = authClient.useSession();

  const [open, setOpen] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [openSave, setOpenSave] = useState(false);

  const themeList = allThemes ?? themes;

  const handleSelect = (t: typeof activeTheme) => {
    if (!t) return;
    // both set the settings
    // have to look into it
    useSiteSettingStore.getState().applyTheme(t);
    setTheme(t);
    if (t.setting.typography.font?.primary) {
      loadFont(t.setting.typography.font.primary);
    }

    if (t.setting.typography.font?.secondary) {
      loadFont(t.setting.typography.font.secondary);
    }
    setOpen(false);
  };

  const handleDelete = async (themeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteTheme({ themeId });
    setOpen(false);
  };

  const canSave = appliedTheme && session?.user?.id === appliedTheme.createdBy && hasThemeChanged;

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
          render={
            <Button
              variant="outline"
              className="w-full justify-between capitalize"
              role="combobox"
              aria-expanded={open}
            >
              {isLoading ? "Loading..." : (activeTheme?.name ?? "Select theme")}
              <IconChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          }
        />
        <PopoverContent className="p-0 w-72" align="start">
          {themeList.length > 0 ? (
            <div className="max-h-72 overflow-auto">
              {themeList.map((t) => {
                const isSelected = activeTheme?.id === t.id;
                return (
                  <div
                    key={t.id}
                    className={cn(
                      "flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-accent hover:text-accent-foreground",
                      isSelected && "bg-accent/50",
                      "rounded-md",
                    )}
                    onClick={() => handleSelect(t)}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="capitalize truncate">{t.name}</span>
                      {isSelected && <IconCheck className="h-3 w-3 text-primary shrink-0" />}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
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
        themeId={appliedTheme?.id ?? ""}
      />
    </div>
  );
}
