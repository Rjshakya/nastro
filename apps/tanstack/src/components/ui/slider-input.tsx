import * as React from "react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface SliderInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  showValue?: boolean;
  valueFormatter?: (value: number) => string;
}

/**
 * SliderInput - A labeled slider component with value display
 *
 * Features:
 * - Label on the left
 * - Current value display on the right
 * - Slider in the middle (or full width)
 * - Min/max range support
 * - Optional value formatter (e.g., for adding "px", "%", etc.)
 *
 * Usage:
 * <SliderInput
 *   label="Font Size"
 *   value={16}
 *   onChange={(v) => setFontSize(v)}
 *   min={12}
 *   max={72}
 *   valueFormatter={(v) => `${v}px`}
 * />
 */
export function SliderInput({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  className,
  showValue = true,
  valueFormatter = (v) => String(v),
}: SliderInputProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">{label}</Label>
        {showValue && (
          <span className="text-sm text-muted-foreground font-mono">
            {valueFormatter(value)}
          </span>
        )}
      </div>
      <Slider
        value={value}
        onValueChange={(v) => onChange(v as number)}
        min={min}
        max={max}
        step={step}
        className={`mx-auto w-full `}
        orientation="horizontal"
      />
    </div>
  );
}

export type { SliderInputProps };
