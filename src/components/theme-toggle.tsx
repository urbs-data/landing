import { type LucideIcon, Moon, Sun, SunMoon } from "lucide-react";
import { Button } from "#/components/ui/button";
import { type ThemeMode, useThemeMode } from "#/hooks/use-theme-mode";
import { m } from "#/paraglide/messages";

const themeModes: Record<
  ThemeMode,
  { icon: LucideIcon; label: () => string; next: ThemeMode }
> = {
  light: { icon: Sun, label: m.theme_mode_light, next: "dark" },
  dark: { icon: Moon, label: m.theme_mode_dark, next: "auto" },
  auto: { icon: SunMoon, label: m.theme_mode_auto, next: "light" },
};

export function ThemeToggle() {
  const { mode, setThemeMode } = useThemeMode();
  const { icon: Icon, label, next } = themeModes[mode];
  const ariaLabel = m.theme_toggle_label({ mode: label() });

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label={ariaLabel}
      title={ariaLabel}
      onClick={() => setThemeMode(next)}
    >
      <Icon className="size-4" />
    </Button>
  );
}
