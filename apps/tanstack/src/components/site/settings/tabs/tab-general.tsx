import { useNotionSettingsStore } from "#/stores/notion-settings";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function TabGeneral() {
  const { settings, updateSettings } = useNotionSettingsStore();

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="siteName">Site Name</Label>
        <Input
          id="siteName"
          value={settings?.general?.siteName}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            updateSettings({
              ...settings,
              general: { ...settings?.general, siteName: e.target.value },
            })
          }
          placeholder="My Awesome Site"
        />
      </div>
    </div>
  );
}
