import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { useNotionSettingsStore } from "#/stores/notion-settings";
import type { AnalyticsSettingsUI } from "#/types/notion-page-settings";
import { useState } from "react";

// GA4 Measurement ID regex: G-XXXXXXXXXX (G- followed by 10 alphanumeric characters)
const GA4_REGEX = /^G-[A-Z0-9]{10}$/;

export const TabAnalytics = ({ analytics }: { analytics: AnalyticsSettingsUI }) => {
  const { settings, updateSettings } = useNotionSettingsStore();
  const [isValid, setIsValid] = useState<boolean>(true);

  const handleTrackingIdChange = (value: string) => {
    const trimmedValue = value.trim();

    // Validate if value is not empty
    if (trimmedValue && !GA4_REGEX.test(trimmedValue)) {
      setIsValid(false);
    } else {
      setIsValid(true);
    }

    updateSettings({
      ...settings,
      analytics: {
        ...settings?.analytics,
        trackingId: trimmedValue,
        type: "analytics",
      },
    });
  };

  return (
    <div className="grid gap-4 py-4">
      <div className="w-full grid gap-2">
        <Label className="capitalize">Google Analytics Measurement ID</Label>
        <Input
          value={settings?.analytics?.trackingId || ""}
          onChange={(e) => handleTrackingIdChange(e.target.value)}
          placeholder="G-XXXXXXXXXX"
          className={!isValid ? "border-red-500 focus-visible:ring-red-500" : ""}
        />
        {!isValid && (
          <p className="text-xs text-red-500">
            Invalid format. Should be G- followed by 10 characters (e.g., G-ABC123DEF0)
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          Go to analytics.google.com → Admin → Data Streams → Web → Copy Measurement ID
        </p>
      </div>
    </div>
  );
};
