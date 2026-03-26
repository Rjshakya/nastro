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
import { useEffect, useMemo, useState } from "react";
import { siteEditorRoute } from "../editor";

export const SelectThemes = ({
  themes,
  onThemeChange,
}: {
  themes: Theme[];
  onThemeChange: (theme: Theme) => void;
}) => {
  const { themeId } = siteEditorRoute.useSearch();
  const { updateSettings } = useNotionSettingsStore((s) => s);
  const { settings: defaultSettings } = siteEditorRoute.useLoaderData();
  const [theme, setTheme] = useState<Theme>({
    name: "default",
    createdAt: "",
    createdBy: "",
    id: "",
    isPublic: true,
    themeSetting: defaultSettings,
    updatedAt: "",
  });

  const defaulTheme = useMemo(
    () => ({
      name: "default",
      createdAt: "",
      createdBy: "",
      id: "",
      isPublic: true,
      themeSetting: defaultSettings,
      updatedAt: "",
    }),
    [],
  );

  useEffect(() => {
    if (!themeId || themeId?.length < 4) return;

    const findTheme = themes.find((t) => t.id === themeId);
    if (!findTheme) return;
    // updateSettings(findTheme?.themeSetting)
    setTheme(findTheme);
  }, [themeId]);

  return (
    <Select value={theme?.name}>
      <SelectTrigger className={"w-full"}>
        <SelectValue className={" capitalize"} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {themes.length > 0 ? (
            [...themes, defaulTheme].map((t) => {
              return (
                <SelectItem
                  className={" capitalize"}
                  onClick={() => {
                    updateSettings(t?.themeSetting);
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
  );
};

export const SaveTheme = ({ themeId }: { themeId: string }) => {
  const [theme, setTheme] = useState<UpdateThemeInput>({
    name: "",
    isPublic: false,
    themeSetting: {},
  });

  const { isLoading, updateTheme } = useUpdateTheme();

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button size={"sm"} variant={"secondary"}>
            Sava theme
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save as theme</DialogTitle>
          <DialogDescription>
            Save your current setting as theme
          </DialogDescription>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Name</Label>
              <Input
                value={theme.name}
                onChange={(e) => setTheme({ ...theme, name: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label>Public</Label>
              <Checkbox
                checked={!!theme.isPublic}
                onCheckedChange={(c) => setTheme({ ...theme, isPublic: c })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={() =>
                updateTheme({
                  themeId,
                  input: {
                    ...theme,
                    themeSetting: useNotionSettingsStore.getState().settings,
                  },
                })
              }
            >
              {isLoading ? "Saving..." : "Save"}
            </Button>
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

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button size={"sm"} variant={"secondary"}>
            Create theme
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create theme</DialogTitle>
          <DialogDescription>
            Create theme from your current settings
          </DialogDescription>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Name</Label>
              <Input
                value={theme.name}
                onChange={(e) => setTheme({ ...theme, name: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label>Public</Label>
              <Checkbox
                checked={!!theme.isPublic}
                onCheckedChange={(c) => setTheme({ ...theme, isPublic: c })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={() =>
                createTheme({
                  ...theme,
                  themeSetting: useNotionSettingsStore.getState().settings,
                })
              }
            >
              {isLoading ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};
