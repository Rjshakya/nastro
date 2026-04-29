import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { SliderInput } from "@/components/ui/slider-input";
import { SlugInput } from "@/components/slug-input";
import { useSiteSettingStore } from "@/stores/site.setting.store";
import type { GeneralConfig } from "@/types/site.setting";
import { useIsSiteSlugAvailable } from "@/hooks/use-sites";
import { IconMoon, IconSun } from "@tabler/icons-react";
import { ThemeToggle, ThemeToggleSwitch } from "@/components/ThemeToggle";

interface GeneralTabProps {
  siteName: string;
  slug: string;
  onSiteNameChange: (name: string) => void;
  onSlugChange: (slug: string) => void;
}

export function GeneralTab({
  siteName,
  slug,
  onSiteNameChange,
  onSlugChange,
}: GeneralTabProps) {
  const { settings, updateGeneral, setIsDark } = useSiteSettingStore();
  const general = settings.general;

  const { isAvailable, isLoading, value, setValue } =
    useIsSiteSlugAvailable(slug);

  const handleSlugChange = (newSlug: string) => {
    setValue(newSlug);
    onSlugChange(newSlug);
  };

  const isSlugValid = value === slug || isAvailable;
  const showAvailability = value.length > 0 && value !== slug;

  const update = (partial: Partial<GeneralConfig>) => {
    updateGeneral({ ...general, ...partial });
  };

  return (
    <div className="grid gap-6 py-4">
      {/* Site Name */}
      <div className="w-full grid gap-2">
        <Label className="capitalize">Site Name</Label>
        <Input
          value={siteName}
          onChange={(e) => onSiteNameChange(e.target.value)}
          placeholder="My Awesome Site"
        />
      </div>

      {/* Slug */}
      <SlugInput
        value={value}
        onChange={handleSlugChange}
        isAvailable={isSlugValid}
        isLoading={isLoading}
        showAvailablityIndicator={showAvailability}
        placeholder="my-site"
      />

      {/* Color Mode */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Label htmlFor="color-mode" className="flex-1">
            Dark Mode
          </Label>
        </div>
        <div className="flex items-center gap-2">
          {/* <ThemeToggle
            onThemeChange={(theme) => {
              setIsDark(theme === "dark");
            }}
          /> */}

          <ThemeToggleSwitch
            isDark={general.isDark}
            onThemeChange={(theme) => {
              setIsDark(theme === "dark");
            }}
          />
        </div>
      </div>

      {/* Content Width */}
      <SliderInput
        label="Content Width"
        min={600}
        max={1200}
        value={general.pageWidth}
        onChange={(v) => update({ pageWidth: v })}
        valueFormatter={(v) => `${v}px`}
      />

      {/* Cover Height */}
      <SliderInput
        label="Cover Height"
        min={0}
        max={100}
        value={general.pageCoverHeight}
        onChange={(v) => update({ pageCoverHeight: v })}
        valueFormatter={(v) => `${v}vh`}
      />
    </div>
  );
}
