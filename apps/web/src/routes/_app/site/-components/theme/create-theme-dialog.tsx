import { useState } from "react";
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
import { useCreateTheme } from "@/hooks/use-themes";
import { useSiteSettingStore } from "@/stores/site.setting.store";
import { getThemeRelatedSettingsOnly } from "@/lib/theme-settings";
import { toast } from "sonner";

interface CreateThemeDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function CreateThemeDialog({ open, onOpenChange }: CreateThemeDialogProps) {
  const [name, setName] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const { createTheme, isLoading } = useCreateTheme();
  const { settings } = useSiteSettingStore();

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error("Theme name is required");
      return;
    }

    const setting = getThemeRelatedSettingsOnly(settings);
    await createTheme({ name, isPublic, setting });
    setName("");
    setIsPublic(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create theme</DialogTitle>
          <DialogDescription>Create a theme preset from your current settings</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 mb-4">
          <div className="grid gap-2">
            <Label htmlFor="theme-name">Name</Label>
            <Input
              id="theme-name"
              placeholder="my-theme"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <Label className="flex-1" htmlFor="public-checkbox">
              Public
            </Label>
            <Checkbox
              id="public-checkbox"
              checked={isPublic}
              onCheckedChange={(c) => setIsPublic(!!c)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleCreate} disabled={isLoading}>
            {isLoading ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
