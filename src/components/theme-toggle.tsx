import { type LucideIcon, Moon, Sun, SunMoon } from "lucide-react";
import { useState } from "react";
import { CrossfadeIcon } from "#/components/crossfade-icon";
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

const modeOrder = Object.keys(themeModes) as ThemeMode[];

export function ThemeToggle() {
  const { mode, setThemeMode } = useThemeMode();
  // The stored mode is restored right after hydration; only animate the icon
  // once the user has toggled it.
  const [hasToggled, setHasToggled] = useState(false);
  const { label, next } = themeModes[mode];
  const ariaLabel = m.theme_toggle_label({ mode: label() });

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label={ariaLabel}
      title={ariaLabel}
      className="relative"
      onClick={() => {
        setHasToggled(true);
        setThemeMode(next);
      }}
    >
      {modeOrder.map((candidate) => (
        <CrossfadeIcon
          key={candidate}
          icon={themeModes[candidate].icon}
          visible={candidate === mode}
          animate={hasToggled}
          className="size-4"
        />
      ))}
    </Button>
  );
}
