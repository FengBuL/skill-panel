import { describe, expect, it } from 'vitest';
import {
  defaultLanguage,
  dictionaries,
  findMissingTranslationKeys,
  findMismatchedTranslationPlaceholders,
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

  it('keeps placeholder names aligned for translated strings', () => {
    expect(findMismatchedTranslationPlaceholders(dictionaries)).toEqual([]);
  });

  it('keeps critical runtime translation keys present in every locale', () => {
    const referencedKeys = [
      'app.title',
      'language.label',
      'language.system',
      'language.zhCN',
      'language.enUS',
      'settings.removeDirectory',
      'skills.tableLabel',
      'status.invalidFrontmatter',
    ];

    for (const locale of Object.keys(dictionaries) as Locale[]) {
      const dictionaryKeys = new Set(Object.keys(dictionaries[locale]));
      expect(
        referencedKeys
          .filter((key) => !dictionaryKeys.has(key))
          .sort()
          .map((key) => ({ locale, key })),
      ).toEqual([]);
    }
  });

  it('detects mismatched translation placeholders in a dictionary set', () => {
    expect(
      findMismatchedTranslationPlaceholders({
        'zh-CN': {
          'settings.removeDirectory': 'Remove {{directory}}',
        },
        'en-US': {
          'settings.removeDirectory': 'Remove {{path}}',
        },
      }),
    ).toEqual([
      {
        key: 'settings.removeDirectory',
        locale: 'en-US',
        placeholders: ['path'],
        referenceLocale: 'zh-CN',
        referencePlaceholders: ['directory'],
      },
    ]);
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
