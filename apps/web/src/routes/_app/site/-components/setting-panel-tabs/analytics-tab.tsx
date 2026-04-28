import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSiteSettingStore } from "@/stores/site.setting.store";
import { useState } from "react";

const GA4_REGEX = /^G-[A-Z0-9]{10}$/;

export function AnalyticsTab() {
  const { settings, updateAnalytics } = useSiteSettingStore();
  const analytics = settings.analytics;
  const [isValid, setIsValid] = useState(true);

  const handleChange = (value: string) => {
    const trimmed = value.trim();
    if (trimmed && !GA4_REGEX.test(trimmed)) {
      setIsValid(false);
    } else {
      setIsValid(true);
    }
    updateAnalytics({ trackingId: trimmed });
  };

  return (
    <div className="grid gap-4 py-4">
      <div className="w-full grid gap-2">
        <Label className="capitalize">Google Analytics Measurement ID</Label>
        <Input
          value={analytics.trackingId}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="G-XXXXXXXXXX"
          className={!isValid ? "border-red-500 focus-visible:ring-red-500" : ""}
        />
        {!isValid && (
          <p className="text-xs text-red-500">
            Invalid format. Should be G- followed by 10 characters (e.g., G-ABC123DEF0)
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          Go to analytics.google.com &rarr; Admin &rarr; Data Streams &rarr; Web &rarr; Copy Measurement ID
        </p>
      </div>
    </div>
  );
}
