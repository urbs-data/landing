import { type AppLocale, isLocale } from "#/i18n";

export type LocaleChangeAction =
  | {
      kind: "navigate";
      href: string;
    }
  | {
      kind: "set-locale";
      locale: AppLocale;
    };

export function getLocaleChangeAction(
  value: string,
  localizedPaths?: Partial<Record<AppLocale, string>>,
): LocaleChangeAction | undefined {
  if (!isLocale(value)) return undefined;

  const localizedPath = localizedPaths?.[value];

  if (localizedPath) {
    return {
      kind: "navigate",
      href: localizedPath,
    };
  }

  return {
    kind: "set-locale",
    locale: value,
  };
}
