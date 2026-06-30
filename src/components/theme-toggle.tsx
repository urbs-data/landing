import { Moon, Sun, SunMoon } from "lucide-react";
import { type ThemeMode, useThemeMode } from "#/hooks/use-theme-mode";
import { Button } from "@/components/ui/button";
import {
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { m } from "@/paraglide/messages";

export function ThemeToggle() {
  const { mode, setThemeMode } = useThemeMode();
  const label = m.theme_toggle_label({
    mode: getThemeModeLabel(mode),
  });

  const Icon = mode === "light" ? Sun : mode === "dark" ? Moon : SunMoon;

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label={label}
      title={label}
      onClick={() => setThemeMode(getNextThemeMode(mode))}
    >
      <Icon className="size-4" />
    </Button>
  );
}

function getNextThemeMode(mode: ThemeMode): ThemeMode {
  if (mode === "light") {
    return "dark";
  }

  if (mode === "dark") {
    return "auto";
  }

  return "light";
}

export function ThemeModeMenuSection() {
  const { mode, setThemeMode } = useThemeMode();
  const Icon = mode === "light" ? Sun : mode === "dark" ? Moon : SunMoon;

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <Icon className="size-4" />
        {m.theme_menu_label()}
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent className="min-w-40">
        <ThemeModeRadioGroup mode={mode} onModeChange={setThemeMode} />
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}

function ThemeModeRadioGroup({
  mode,
  onModeChange,
}: {
  mode: ThemeMode;
  onModeChange: (mode: ThemeMode) => void;
}) {
  return (
    <DropdownMenuRadioGroup
      value={mode}
      onValueChange={(value) => onModeChange(value as ThemeMode)}
    >
      <DropdownMenuRadioItem value="light">
        <Sun className="size-4" />
        {m.theme_mode_light()}
      </DropdownMenuRadioItem>
      <DropdownMenuRadioItem value="dark">
        <Moon className="size-4" />
        {m.theme_mode_dark()}
      </DropdownMenuRadioItem>
      <DropdownMenuRadioItem value="auto">
        <SunMoon className="size-4" />
        {m.theme_mode_auto()}
      </DropdownMenuRadioItem>
    </DropdownMenuRadioGroup>
  );
}

function getThemeModeLabel(mode: ThemeMode) {
  if (mode === "light") {
    return m.theme_mode_light();
  }

  if (mode === "dark") {
    return m.theme_mode_dark();
  }

  return m.theme_mode_auto();
}
