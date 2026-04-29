import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpdateTheme } from "@/hooks/use-themes";
import { useSiteSettingStore } from "@/stores/site.setting.store";
import { useThemeStore } from "@/stores/theme-store";
import { getThemeRelatedSettingsOnly } from "@/lib/theme-settings";
import { toast } from "sonner";

interface SaveThemeDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  themeId: string;
}

export function SaveThemeDialog({
  open,
  onOpenChange,
  themeId,
}: SaveThemeDialogProps) {
  const [name, setName] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const { updateTheme, isLoading } = useUpdateTheme();
  const { settings } = useSiteSettingStore();
  const { theme: activeTheme } = useThemeStore();

  useEffect(() => {
    if (open && activeTheme) {
      setName(activeTheme.name);
      setIsPublic(activeTheme.isPublic ?? false);
    }
  }, [open, activeTheme]);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Theme name is required");
      return;
    }

    const setting = getThemeRelatedSettingsOnly(settings);
    await updateTheme({
      themeId,
      input: { name, isPublic, setting },
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save theme</DialogTitle>
          <DialogDescription>
            Update the theme preset with your current settings
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 mb-4">
          <div className="grid gap-2">
            <Label htmlFor="save-theme-name">Name</Label>
            <Input
              id="save-theme-name"
              placeholder="my-theme"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <Label className="flex-1" htmlFor="save-public-checkbox">
              Public
            </Label>
            <Checkbox
              id="save-public-checkbox"
              checked={isPublic}
              onCheckedChange={(c) => setIsPublic(!!c)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
