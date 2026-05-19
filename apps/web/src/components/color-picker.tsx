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
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "./ui/input-group";
import { CopyIcon } from "lucide-react";
import { toast } from "sonner";

interface ColorPickerProps {
  label: string;
  value?: string;
  onChange: (value: string) => void;
}

export function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  const normalColorValue = value ?? "#000000";
  const [color, setColor] = useColor(normalColorValue);

  const handleChange = (newColor: IColor) => {
    const hex = newColor.hex.slice(0, 7);
    setColor({ ...newColor, hex });
    onChange(hex);
  };

  const handleInputChange = (input: string) => {
    if (!input.startsWith("#")) {
      input = `#${input}`;
    }

    const hex = input.slice(0, 7);
    setColor({
      hex,
      hsv: color.hsv,
      rgb: color.rgb,
    });

    onChange(hex);
  };

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast.success("copied");
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

        <PopoverContent side="left" className="p-2">
          <ReactColorPicker
            color={color}
            onChange={handleChange}
            height={120}
            hideAlpha={true}
            hideInput={true}
          />

          <InputGroup>
            <InputGroupInput
              value={color.hex}
              onChange={(e) => handleInputChange(e.target.value)}
            />
            <InputGroupAddon align={"inline-end"}>
              <InputGroupButton onClick={() => handleCopy(color.hex)}>
                <CopyIcon size={4} />
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </PopoverContent>
      </Popover>
    </div>
  );
}
