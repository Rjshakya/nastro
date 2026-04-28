import { IconMoon, IconSun } from "@tabler/icons-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Switch } from "./ui/switch";

export function ThemeToggle({
  onThemeChange,
}: {
  onThemeChange?: (theme: "light" | "dark") => void;
}) {
  const { theme, setTheme } = useTheme();

  function toggleTheme() {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    onThemeChange?.(newTheme);
  }

  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
      {theme === "dark" ? <IconMoon className="h-4 w-4" /> : <IconSun className="h-4 w-4" />}
    </Button>
  );
}

export function ThemeToggleSwitch({
  isDark,
  onThemeChange,
}: {
  isDark?: boolean;
  onThemeChange?: (theme: "light" | "dark") => void;
}) {
  const { setTheme } = useTheme();

  function toggleTheme(bool: boolean) {
    const newTheme = bool ? "dark" : "light";
    setTheme(newTheme);
    onThemeChange?.(newTheme);
  }

  return (
    <Switch
      checked={isDark}
      onCheckedChange={(c) => {
        toggleTheme(c);
      }}
    />
  );
}
