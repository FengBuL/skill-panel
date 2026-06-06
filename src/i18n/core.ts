import { dictionaries, type Locale, type TranslationKey } from './resources';

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

export interface MismatchedTranslationPlaceholders {
  key: string;
  locale: string;
  placeholders: string[];
  referenceLocale: string;
  referencePlaceholders: string[];
}

type DictionarySet = Record<string, Record<string, string>>;

export function getText(locale: Locale, key: TranslationKey, replacements: Record<string, string> = {}): string {
  let text: string = dictionaries[locale][key];

  for (const [name, value] of Object.entries(replacements)) {
    text = text.replaceAll(`{{${name}}}`, value);
  }

  return text;
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

export function findMismatchedTranslationPlaceholders(
  dictionarySet: DictionarySet,
): MismatchedTranslationPlaceholders[] {
  const locales = Object.keys(dictionarySet).sort();
  const referenceLocale = locales.includes('zh-CN') ? 'zh-CN' : locales[0];
  if (!referenceLocale) {
    return [];
  }

  const allKeys = [...new Set(locales.flatMap((locale) => Object.keys(dictionarySet[locale])))].sort();
  const mismatches: MismatchedTranslationPlaceholders[] = [];

  for (const key of allKeys) {
    const referencePlaceholders = extractPlaceholders(dictionarySet[referenceLocale][key] ?? '');

    for (const locale of locales.filter((locale) => locale !== referenceLocale)) {
      const placeholders = extractPlaceholders(dictionarySet[locale][key] ?? '');
      if (!sameStringSet(placeholders, referencePlaceholders)) {
        mismatches.push({
          key,
          locale,
          placeholders,
          referenceLocale,
          referencePlaceholders,
        });
      }
    }
  }

  return mismatches;
}

function extractPlaceholders(text: string): string[] {
  const placeholders = [...text.matchAll(/\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g)].map((match) => match[1]);
  return [...new Set(placeholders)].sort();
}

function sameStringSet(left: string[], right: string[]): boolean {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}
