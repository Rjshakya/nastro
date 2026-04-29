import {
  ColorPicker as ReactColorPicker,
  useColor,
  type IColor,
} from "react-color-palette";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface ColorPickerProps {
  label: string;
  value?: string;
  onChange: (value: string) => void;
}

export function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  const normalizedValue = value || "#000000";
  const [color, setColor] = useColor(normalizedValue);

  const handleChange = (newColor: IColor) => {
    const hex = newColor.hex.slice(0, 7);
    setColor({ ...newColor, hex });
    onChange(hex);
  };

  return (
    <div className="flex items-center justify-between py-2">
      <Label className="text-sm font-medium">{label}</Label>

      <Popover>
        <PopoverTrigger
          render={
            <button
              type="button"
              className={cn(
                "w-8 h-8 rounded-md border-2 border-border shadow-sm",
                "hover:scale-105 active:scale-95 transition-transform",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                "cursor-pointer",
              )}
              style={{ backgroundColor: color.hex }}
              aria-label={`${label}: ${color.hex}. Click to change color.`}
            />
          }
        />

        <PopoverContent side="left" className="m-4">
          <ReactColorPicker
            color={color}
            onChange={handleChange}
            height={100}
            hideAlpha={true}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
