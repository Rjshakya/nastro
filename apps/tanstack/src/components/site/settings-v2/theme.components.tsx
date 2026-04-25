import { Button } from "#/components/ui/button";
import { Checkbox } from "#/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "#/components/ui/dialog";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "#/components/ui/popover";
import {
  useCreateTheme,
  useUpdateTheme,
  useDeleteTheme,
} from "#/hooks/use-themes";
import type { CreateThemeInput, UpdateThemeInput } from "#/lib/site.theme";
import { useNotionSettingsStore } from "#/stores/notion-settings";
import type { Theme } from "#/types/theme";
import { useRef, useState } from "react";
import { useThemeStore } from "#/stores/theme-store";
import { toast } from "sonner";
import { cn } from "#/lib/utils";
import {
  IconCheck,
  IconChevronDown,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import { authClient } from "#/lib/auth-client";
import { getThemeRelatedSettingsOnly } from "./theme";
import { ButtonGroup } from "#/components/ui/button-group";
import { siteEditorRoute } from "../editor";

export const SelectThemes = ({
  onThemeChange,
}: {
  onThemeChange: (theme: Theme) => void;
}) => {
  const { themes, theme, setTheme, hasThemeChanged } = useThemeStore((s) => s);
  const { deleteTheme } = useDeleteTheme();
  const [open, setOpen] = useState(false);
  const popoverTriggerRef = useRef<HTMLButtonElement | null>(null);
  const { data: session } = authClient.useSession();

  const search = siteEditorRoute.useSearch();

  const [openSaveTheme, setOpenSaveTheme] = useState(false);
  const [openCreateTheme, setOpenCreateTheme] = useState(false);

  const handleSelectTheme = (t: Theme) => {
    onThemeChange(t);
    setTheme(t);
    setOpen(false);
  };

  const handleDeleteTheme = async (themeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteTheme({ themeId });
    setOpen(false);
  };

  const themeActionButtons = () => {
    const createThemeTrigger = (
      <Button
        size={"icon-xs"}
        variant={"secondary"}
        onClick={() => setOpenCreateTheme(true)}
      >
        <IconPlus stroke={2.5} />
      </Button>
    );

    const saveThemeTrigger = (
      <Button
        size={"xs"}
        variant={"secondary"}
        onClick={() => setOpenSaveTheme(true)}
      >
        Save
      </Button>
    );

    if (
      search?.themeId === theme?.id &&
      session?.user.id === theme?.createdBy &&
      hasThemeChanged
    ) {
      return [createThemeTrigger, saveThemeTrigger];
    }

    return [createThemeTrigger];
  };

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between gap-2">
        <Label>Theme</Label>
        <div>
          <ButtonGroup>
            {themeActionButtons().map((actions) => actions)}
          </ButtonGroup>
        </div>
      </div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              id="theme"
              variant="outline"
              className="w-full justify-between capitalize dark:border-border"
              role="combobox"
              aria-expanded={open}
              ref={popoverTriggerRef}
            >
              {theme?.name || "Select theme"}
              <IconChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          }
        />
        <PopoverContent
          style={{
            width: popoverTriggerRef.current?.offsetWidth + "px",
          }}
          className="p-0"
          align="start"
        >
          {themes.length > 0 ? (
            <div className="max-h-75 overflow-auto">
              {themes.map((t) => {
                const isSelected = theme?.id === t.id;
                return (
                  <div
                    key={t.id}
                    className={cn(
                      "flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-accent hover:text-accent-foreground",
                      isSelected && "bg-accent/50",
                      "rounded-md",
                    )}
                    onClick={() => handleSelectTheme(t)}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="capitalize truncate">{t.name}</span>
                      {isSelected && (
                        <IconCheck className="h-3 w-3 text-primary shrink-0" />
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      className={cn(
                        `shrink-0 text-muted-foreground hover:text-destructive`,
                      )}
                      onClick={(e) => handleDeleteTheme(t.id, e)}
                      disabled={session?.user.id !== t.createdBy}
                    >
                      <IconTrash className="size-3.5" />
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
        <CreateTheme open={openCreateTheme} onOpenChange={setOpenCreateTheme} />
        <SaveTheme
          open={openSaveTheme}
          onOpenChange={setOpenSaveTheme}
          themeId={search?.themeId ?? ""}
        />
      </Popover>
    </div>
  );
};

export const SaveTheme = ({
  themeId,
  open,
  onOpenChange,
}: {
  themeId: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) => {
  const [theme, setTheme] = useState<UpdateThemeInput>({
    name: "",
    isPublic: false,
    themeSetting: {},
  });

  const { isLoading, updateTheme } = useUpdateTheme();
  const { settings } = useNotionSettingsStore((s) => s);

  const handleSave = async () => {
    if (!theme.name) {
      toast.error("Theme name is required");
      return;
    }

    const themeSetting = getThemeRelatedSettingsOnly(settings);

    await updateTheme({
      themeId,
      input: { ...theme, themeSetting },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save as theme</DialogTitle>
          <DialogDescription>
            Save your current setting as theme
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 mb-4">
          <div className="grid gap-2">
            <Label>Name</Label>
            <Input
              placeholder="my-theme-new"
              value={theme.name}
              onChange={(e) => setTheme({ ...theme, name: e.target.value })}
            />
          </div>

          <div className="flex items-center gap-2">
            <Label className="flex-1" htmlFor="public:checkbox">
              Public
            </Label>
            <Checkbox
              id="public:checkbox"
              checked={!!theme.isPublic}
              onCheckedChange={(c) => setTheme({ ...theme, isPublic: c })}
            />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleSave}>
            {isLoading ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const CreateTheme = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) => {
  const [theme, setTheme] = useState<CreateThemeInput>({
    name: "",
    isPublic: false,
    themeSetting: {},
  });

  const { isLoading, createTheme } = useCreateTheme();
  const { settings } = useNotionSettingsStore((s) => s);

  const handleCreate = async () => {
    if (!theme.name) {
      toast.error("Theme name is required");
      return;
    }

    const themeSetting = getThemeRelatedSettingsOnly(settings);
    await createTheme({ ...theme, themeSetting });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={""}>
        <DialogHeader>
          <DialogTitle>Create theme</DialogTitle>
          <DialogDescription>
            Create theme from your current settings
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 mb-4">
          <div className="grid gap-2">
            <Label htmlFor="theme:name">Name</Label>
            <Input
              placeholder="my-theme"
              id="theme:name"
              value={theme?.name || ""}
              onChange={(e) => setTheme({ ...theme, name: e.target.value })}
            />
          </div>

          <div className="flex items-center  gap-2">
            <Label className="flex-1" htmlFor="public:checkbox">
              Public
            </Label>
            <Checkbox
              id="public:checkbox"
              checked={!!theme.isPublic}
              onCheckedChange={(c) => setTheme({ ...theme, isPublic: c })}
            />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleCreate}>
            {isLoading ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
