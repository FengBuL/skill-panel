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
  categoryColors: {},
  skillTags: {},
};

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function normalizeSettings(settings: AppSettings): AppSettings {
  return {
    ...defaultSettings,
    ...settings,
    language: isLanguage(settings.language) ? settings.language : defaultLanguage,
    customScanDirectories: Array.isArray(settings.customScanDirectories) ? settings.customScanDirectories : [],
    showDefaultScanDirectories:
      typeof settings.showDefaultScanDirectories === 'boolean'
        ? settings.showDefaultScanDirectories
        : defaultSettings.showDefaultScanDirectories,
    categoryColors:
      settings.categoryColors && typeof settings.categoryColors === 'object' && !Array.isArray(settings.categoryColors)
        ? settings.categoryColors
        : {},
    skillTags:
      settings.skillTags && typeof settings.skillTags === 'object' && !Array.isArray(settings.skillTags)
        ? settings.skillTags
        : {},
  };
}

export function useI18nRuntime() {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [language, setLanguage] = useState<Language>(defaultLanguage);
  const [settingsLoadError, setSettingsLoadError] = useState<string | null>(null);
  const [settingsSaveError, setSettingsSaveError] = useState<string | null>(null);
  const [settingsSaveStatus, setSettingsSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [systemLanguages] = useState(() => getSystemLanguages(window.navigator));
  const hasUserSelectedLanguage = useRef(false);

  const locale = useMemo(() => resolveLocale(language, systemLanguages), [language, systemLanguages]);
  const t = useCallback(
    (key: Parameters<typeof getText>[1], replacements?: Parameters<typeof getText>[2]) =>
      getText(locale, key, replacements),
    [locale],
  );

  useEffect(() => {
    let isMounted = true;

    setSettingsLoadError(null);
    invoke<AppSettings>('load_app_settings')
      .then((loadedSettings) => {
        if (!isMounted || hasUserSelectedLanguage.current) {
          return;
        }

        const normalizedSettings = normalizeSettings(loadedSettings);
        setSettings(normalizedSettings);
        setLanguage(normalizedSettings.language);
      })
      .catch((error) => {
        if (isMounted) {
          setSettingsLoadError(getErrorMessage(error));
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const saveSettings = useCallback(async (nextSettings: AppSettings) => {
    const normalizedSettings = normalizeSettings(nextSettings);
    setSettingsSaveError(null);
    setSettingsSaveStatus('saving');

    try {
      await invoke<AppSettings>('save_app_settings', { settings: normalizedSettings });
      setSettings(normalizedSettings);
      setLanguage(normalizedSettings.language);
      setSettingsSaveStatus('saved');
      return normalizedSettings;
    } catch (error) {
      setSettingsSaveError(getErrorMessage(error));
      setSettingsSaveStatus('idle');
      throw error;
    }
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

      saveSettings(nextSettings).catch(() => {
        // Keep the optimistic local language if persistence is unavailable.
      });
    },
    [saveSettings, settings],
  );

  return {
    language,
    locale,
    t,
    languageOptions,
    updateLanguage,
    saveSettings,
    settings,
    settingsLoadError,
    settingsSaveError,
    settingsSaveStatus,
  };
}
