export { dictionaries } from './resources';
export {
  defaultLanguage,
  findMissingTranslationKeys,
  getSystemLanguages,
  getText,
  isLanguage,
  isLocale,
  languageOptions,
  resolveLocale,
} from './core';
export { useI18nRuntime } from './runtime';
export type { Language, Locale, MissingTranslationKey, TranslationKey } from './core';
