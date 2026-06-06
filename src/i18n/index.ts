export { dictionaries } from './resources';
export {
  defaultLanguage,
  findMismatchedTranslationPlaceholders,
  findMissingTranslationKeys,
  getSystemLanguages,
  getText,
  isLanguage,
  isLocale,
  languageOptions,
  resolveLocale,
} from './core';
export { useI18nRuntime } from './runtime';
export type {
  Language,
  Locale,
  MismatchedTranslationPlaceholders,
  MissingTranslationKey,
  TranslationKey,
} from './core';
