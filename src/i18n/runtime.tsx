import { invoke } from '@tauri-apps/api/core';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { AppSettings } from '../types/skill';
import {
  defaultLanguage,
  getSystemLanguages,
  getText,
  isLanguage,
  languageOptions,
  resolveLocale,
  type Language,
} from './core';

const defaultSettings: AppSettings = {
  language: defaultLanguage,
  customScanDirectories: [],
  showDefaultScanDirectories: true,
};

function normalizeSettings(settings: AppSettings): AppSettings {
  return {
    ...defaultSettings,
    ...settings,
    language: isLanguage(settings.language) ? settings.language : defaultLanguage,
  };
}

export function useI18nRuntime() {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [language, setLanguage] = useState<Language>(defaultLanguage);
  const [systemLanguages] = useState(() => getSystemLanguages(window.navigator));
  const hasUserSelectedLanguage = useRef(false);

  const locale = useMemo(() => resolveLocale(language, systemLanguages), [language, systemLanguages]);
  const t = useCallback((key: Parameters<typeof getText>[1]) => getText(locale, key), [locale]);

  useEffect(() => {
    let isMounted = true;

    invoke<AppSettings>('load_app_settings')
      .then((loadedSettings) => {
        if (!isMounted || hasUserSelectedLanguage.current) {
          return;
        }

        const normalizedSettings = normalizeSettings(loadedSettings);
        setSettings(normalizedSettings);
        setLanguage(normalizedSettings.language);
      })
      .catch(() => {
        // The settings command is a persistence boundary and the UI can run without it.
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const updateLanguage = useCallback(
    (nextLanguage: string) => {
      if (!isLanguage(nextLanguage)) {
        return;
      }

      hasUserSelectedLanguage.current = true;
      const nextSettings = { ...settings, language: nextLanguage };
      setLanguage(nextLanguage);
      setSettings(nextSettings);

      invoke<AppSettings>('save_app_settings', { settings: nextSettings }).catch(() => {
        // Keep the optimistic local language if persistence is unavailable.
      });
    },
    [settings],
  );

  return {
    language,
    locale,
    t,
    languageOptions,
    updateLanguage,
    settings,
  };
}
