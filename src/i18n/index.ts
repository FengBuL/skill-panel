import { dictionaries, type Locale, type TranslationKey } from './resources';

export { dictionaries };
export type Language = Locale;
export type { TranslationKey };

export const defaultLanguage: Locale = 'zh-CN';

export const languageOptions: Array<{ value: Locale; labelKey: TranslationKey }> = [
  { value: 'zh-CN', labelKey: 'language.zhCN' },
  { value: 'en-US', labelKey: 'language.enUS' },
];

export function getText(locale: Locale, key: TranslationKey): string {
  return dictionaries[locale][key];
}

export function isLanguage(value: string): value is Locale {
  return value === 'zh-CN' || value === 'en-US';
}
