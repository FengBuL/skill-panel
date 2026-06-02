import { describe, expect, it } from 'vitest';
import {
  defaultLanguage,
  dictionaries,
  findMissingTranslationKeys,
  getText,
  languageOptions,
  resolveLocale,
  type Locale,
} from './i18n';

describe('i18n dictionaries', () => {
  it('keeps zh-CN and en-US keys complete', () => {
    const locales = Object.keys(dictionaries) as Locale[];
    const keySets = locales.map((locale) => Object.keys(dictionaries[locale]).sort());

    expect(locales.sort()).toEqual(['en-US', 'zh-CN']);
    expect(keySets[0]).toEqual(keySets[1]);
    expect(findMissingTranslationKeys(dictionaries)).toEqual([]);
  });

  it('detects missing translation keys in a dictionary set', () => {
    expect(
      findMissingTranslationKeys({
        'zh-CN': {
          'app.title': 'Skill 面板',
          'actions.scan': '手动扫描',
        },
        'en-US': {
          'app.title': 'Skill Panel',
        },
      }),
    ).toEqual([{ locale: 'en-US', key: 'actions.scan' }]);
  });

  it('returns localized text for the configured shell language', () => {
    expect(defaultLanguage).toBe('system');
    expect(getText('zh-CN', 'app.title')).toBe('Skill 面板');
    expect(getText('en-US', 'app.title')).toBe('Skill Panel');
    expect(getText('zh-CN', 'language.system')).toBe('跟随系统');
    expect(languageOptions.map((option) => option.value)).toEqual(['system', 'zh-CN', 'en-US']);
  });

  it('resolves system language with English default for non-Chinese languages', () => {
    expect(resolveLocale('zh-CN', ['en-US'])).toBe('zh-CN');
    expect(resolveLocale('en-US', ['zh-CN'])).toBe('en-US');
    expect(resolveLocale('system', ['en-US', 'zh-CN'])).toBe('en-US');
    expect(resolveLocale('system', ['zh-Hans-CN'])).toBe('zh-CN');
    expect(resolveLocale('system', ['fr-FR'])).toBe('en-US');
  });
});
