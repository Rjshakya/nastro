import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

type SlugInputProps = {
  value: string;
  isAvailable: boolean;
  isLoading: boolean;
  showAvailablityIndicator?: boolean;
  placeholder?: string;
  onChange: (value: string) => void;
};

export const SlugInput = ({
  isAvailable,
  isLoading,
  onChange,
  value,
  showAvailablityIndicator,
  placeholder,
}: SlugInputProps) => {
  return (
    <div className="w-full grid gap-2 ">
      <Label
        className="capitalize flex items-center justify-between gap-2"
        htmlFor="slug"
      >
        <p>Slug</p>
        {showAvailablityIndicator !== undefined
          ? showAvailablityIndicator &&
            value.length > 0 &&
            (isLoading ? (
              <Badge variant={"outline"}>checking...</Badge>
            ) : isAvailable ? (
              <Badge className="bg-green-500" variant={"default"}>
                available
              </Badge>
            ) : (
              <Badge className="" variant={"destructive"}>
                unavailable
              </Badge>
            ))
          : value.length > 0 &&
            (isLoading ? (
              <Badge variant={"outline"}>checking...</Badge>
            ) : isAvailable ? (
              <Badge className="bg-green-500" variant={"default"}>
                available
              </Badge>
            ) : (
              <Badge className="" variant={"destructive"}>
                unavailable
              </Badge>
            ))}
      </Label>

      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};
