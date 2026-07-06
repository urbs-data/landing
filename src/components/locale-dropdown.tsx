import { useRouterState } from "@tanstack/react-router";
import { ChevronDownIcon, GlobeIcon } from "lucide-react";
import { useMemo } from "react";
import { getLocaleChangeAction } from "#/components/locale-change";
import { Button } from "#/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu";
import { type AppLocale, localeLabels, locales } from "@/i18n";
import { m } from "@/paraglide/messages";
import { getLocale, setLocale } from "@/paraglide/runtime";

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

export function LocaleMenuSection() {
  const currentLocale = getLocale();

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <GlobeIcon className="size-4" />
        {m.language_label()}
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent className="min-w-40">
        <LocaleRadioGroup currentLocale={currentLocale} />
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}

function LocaleRadioGroup({ currentLocale }: { currentLocale: string }) {
  const matches = useRouterState({ select: (state) => state.matches });
  const localizedPaths = useMemo(() => {
    const loaderData = matches.at(-1)?.loaderData;

    if (!hasLocalizedPaths(loaderData)) return undefined;

    return loaderData.localizedPaths;
  }, [matches]);

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

type LocalizedPathLoaderData = {
  localizedPaths?: Partial<Record<AppLocale, string>>;
};

function hasLocalizedPaths(value: unknown): value is LocalizedPathLoaderData {
  return Boolean(
    value &&
      typeof value === "object" &&
      "localizedPaths" in value &&
      value.localizedPaths &&
      typeof value.localizedPaths === "object",
  );
}
