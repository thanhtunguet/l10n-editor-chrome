export function getLocaleFromFilename(filename: string): string {
  return filename.match(/^.*_([A-Za-z]{2})\.(arb|json)$/)[1];
}

type LocaleKey = string;

type LanguageKey = string;

export function mapLocaleFilesToResources(
  locales: Record<LocaleKey, Record<LanguageKey, string>>,
): Record<LanguageKey, Record<LocaleKey, string>> {
  const result: Record<LanguageKey, Record<LocaleKey, string>> = {};

  Object.entries(locales).forEach(
    ([locale, localizationObject]: [
      LocaleKey,
      Record<LanguageKey, string>,
    ]) => {
      Object.entries(localizationObject).forEach(
        ([languageKey, languageString]) => {
          if (!result.hasOwnProperty(languageKey)) {
            result[languageKey] = {
              key: languageKey,
            };
          }
          result[languageKey][locale] = languageString;
        },
      );
    },
  );

  return result;
}
