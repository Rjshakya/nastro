import { Button } from "#/components/ui/button";
import { Checkbox } from "#/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "#/components/ui/dialog";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#/components/ui/select";
import { useCreateTheme, useUpdateTheme } from "#/hooks/use-themes";
import type { CreateThemeInput, UpdateThemeInput } from "#/lib/site.theme";
import { useNotionSettingsStore } from "#/stores/notion-settings";
import type { Theme } from "#/types/theme";
import { useState } from "react";
import { useThemeStore } from "#/stores/theme-store";
import { getSettingsWithOutSeo } from "#/lib/utils";
import { getPureDefaultSettings } from "#/lib/settings-defaults";
import { toast } from "sonner";

export const SelectThemes = ({ onThemeChange }: { onThemeChange: (theme: Theme) => void }) => {
  const { themes, theme, setTheme } = useThemeStore((s) => s);

  return (
    <div className="grid gap-2">
      <Label htmlFor="theme">Theme</Label>
      <Select id="theme" value={theme?.name}>
        <SelectTrigger className={"w-full"}>
          <SelectValue className={" capitalize"} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {themes.length > 0 ? (
              themes.map((t) => {
                return (
                  <SelectItem
                    className={" capitalize"}
                    onClick={() => {
                      onThemeChange(t);
                      setTheme(t);
                    }}
                    value={t.name}
                  >
                    {t.name}
                  </SelectItem>
                );
              })
            ) : (
              <SelectItem>No theme</SelectItem>
            )}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export const SaveTheme = ({ themeId }: { themeId: string }) => {
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

    const settingsWithDefaults = getPureDefaultSettings(settings);
    const settingsWithoutSeo = getSettingsWithOutSeo(settingsWithDefaults);

    await updateTheme({ themeId, input: { ...theme, themeSetting: settingsWithoutSeo } });
  };

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button className={"w-full justify-start "} size={"sm"} variant={"ghost"}>
            Save theme
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save as theme</DialogTitle>
          <DialogDescription>Save your current setting as theme</DialogDescription>

          <div className="grid gap-4 mb-4">
            <div className="grid gap-2">
              <Label>Name</Label>
              <Input
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
            <Button onClick={handleSave}>{isLoading ? "Saving..." : "Save"}</Button>
          </DialogFooter>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export const CreateTheme = () => {
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

    const settingsWithDefaults = getPureDefaultSettings(settings);
    const settingsWithoutSeo = getSettingsWithOutSeo(settingsWithDefaults);
    await createTheme({ ...theme, themeSetting: settingsWithoutSeo });
  };

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button className={"w-full justify-start"} size={"sm"} variant={"ghost"}>
            Create theme
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create theme</DialogTitle>
          <DialogDescription>Create theme from your current settings</DialogDescription>

          <div className="grid gap-4 mb-4">
            <div className="grid gap-2">
              <Label>Name</Label>
              <Input
                value={theme.name}
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
            <Button onClick={handleCreate}>{isLoading ? "Creating..." : "Create"}</Button>
          </DialogFooter>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};
