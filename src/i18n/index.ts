import { dictionaries, type Locale, type TranslationKey } from './resources';

export { dictionaries };
export type Language = Locale | 'system';
export type { Locale, TranslationKey };

export const defaultLanguage: Language = 'system';

export const languageOptions: Array<{ value: Language; labelKey: TranslationKey }> = [
  { value: 'system', labelKey: 'language.system' },
  { value: 'zh-CN', labelKey: 'language.zhCN' },
  { value: 'en-US', labelKey: 'language.enUS' },
];

export interface MissingTranslationKey {
  locale: string;
  key: string;
}

type DictionarySet = Record<string, Record<string, string>>;

export function getText(locale: Locale, key: TranslationKey): string {
  return dictionaries[locale][key];
}

export function isLanguage(value: string): value is Language {
  return value === 'system' || isLocale(value);
}

export function isLocale(value: string): value is Locale {
  return value === 'zh-CN' || value === 'en-US';
}

export function resolveLocale(language: Language, systemLanguages: readonly string[] = []): Locale {
  if (language !== 'system') {
    return language;
  }

  const preferredLanguage = systemLanguages[0]?.toLowerCase() ?? '';
  return preferredLanguage.startsWith('zh') ? 'zh-CN' : 'en-US';
}

export function getSystemLanguages(navigatorLike: Pick<Navigator, 'language' | 'languages'>): string[] {
  if (navigatorLike.languages.length > 0) {
    return [...navigatorLike.languages];
  }

  return navigatorLike.language ? [navigatorLike.language] : [];
}

export function findMissingTranslationKeys(dictionarySet: DictionarySet): MissingTranslationKey[] {
  const locales = Object.keys(dictionarySet);
  const allKeys = new Set(locales.flatMap((locale) => Object.keys(dictionarySet[locale])));
  const missing: MissingTranslationKey[] = [];

  for (const locale of locales.sort()) {
    for (const key of [...allKeys].sort()) {
      if (!(key in dictionarySet[locale])) {
        missing.push({ locale, key });
      }
    }
  }

  return missing;
}
