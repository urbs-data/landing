import { useRouterState } from "@tanstack/react-router";
import { ChevronDownIcon, GlobeIcon } from "lucide-react";
import { getLocaleChangeAction } from "#/components/locale-change";
import { Button } from "#/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu";
import { type LocalizedPaths, localeLabels, locales } from "#/i18n";
import { m } from "#/paraglide/messages";
import { getLocale, setLocale } from "#/paraglide/runtime";

type LocaleDropdownProps = {
  variant?: "compact" | "default";
};

export function LocaleDropdown({ variant = "default" }: LocaleDropdownProps) {
  const currentLocale = getLocale();
  const showLabel = variant === "default";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size={showLabel ? "sm" : "icon-sm"}
            title={m.language_label()}
          />
        }
        aria-label={m.language_label()}
      >
        <GlobeIcon data-icon={showLabel ? "inline-start" : undefined} />
        {showLabel ? (
          <>
            <span className="uppercase">{currentLocale}</span>
            <ChevronDownIcon data-icon="inline-end" />
          </>
        ) : null}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <LocaleRadioGroup currentLocale={currentLocale} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function LocaleRadioGroup({ currentLocale }: { currentLocale: string }) {
  const localizedPaths = useRouterState({
    select: (state) => {
      const loaderData = state.matches.at(-1)?.loaderData;

      return hasLocalizedPaths(loaderData)
        ? loaderData.localizedPaths
        : undefined;
    },
  });

  return (
    <DropdownMenuRadioGroup
      value={currentLocale}
      onValueChange={(value) => {
        const action = getLocaleChangeAction(value, localizedPaths);

        if (action?.kind === "navigate") {
          window.location.assign(action.href);
          return;
        }

        if (action?.kind === "set-locale") {
          setLocale(action.locale);
        }
      }}
    >
      {locales.map((locale) => (
        <DropdownMenuRadioItem key={locale} value={locale}>
          {localeLabels[locale]}
        </DropdownMenuRadioItem>
      ))}
    </DropdownMenuRadioGroup>
  );
}

function hasLocalizedPaths(
  value: unknown,
): value is { localizedPaths: LocalizedPaths } {
  return Boolean(
    value &&
      typeof value === "object" &&
      "localizedPaths" in value &&
      value.localizedPaths &&
      typeof value.localizedPaths === "object",
  );
}
