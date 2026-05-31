import { describe, expect, it } from 'vitest';
import { defaultLanguage, dictionaries, getText, languageOptions, type Language } from './i18n';

describe('i18n dictionaries', () => {
  it('keeps zh-CN and en-US keys complete', () => {
    const languages = Object.keys(dictionaries) as Language[];
    const keySets = languages.map((language) => Object.keys(dictionaries[language]).sort());

    expect(languages.sort()).toEqual(['en-US', 'zh-CN']);
    expect(keySets[0]).toEqual(keySets[1]);
  });

  it('returns localized text for the configured shell language', () => {
    expect(defaultLanguage).toBe('zh-CN');
    expect(getText('zh-CN', 'app.title')).toBe('Skill 面板');
    expect(getText('en-US', 'app.title')).toBe('Skill Panel');
    expect(languageOptions.map((option) => option.value)).toEqual(['zh-CN', 'en-US']);
  });
});
