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
  categoryLabels: {},
  categoryIcons: {},
  customCategories: {},
  skillCardColors: {},
  skillCategoryAssignments: {},
  skillCategoryOverrides: {},
  skillLocks: {},
  skillTags: {},
  skillViewMode: 'cards',
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
    categoryLabels:
      settings.categoryLabels && typeof settings.categoryLabels === 'object' && !Array.isArray(settings.categoryLabels)
        ? settings.categoryLabels
        : {},
    categoryIcons:
      settings.categoryIcons && typeof settings.categoryIcons === 'object' && !Array.isArray(settings.categoryIcons)
        ? settings.categoryIcons
        : {},
    customCategories:
      settings.customCategories && typeof settings.customCategories === 'object' && !Array.isArray(settings.customCategories)
        ? Object.fromEntries(
            Object.entries(settings.customCategories).filter(
              (entry): entry is [string, { color: string; icon: string; label: string }] => {
                const [, category] = entry;
                return (
                  category !== null &&
                  typeof category === 'object' &&
                  !Array.isArray(category) &&
                  typeof category.color === 'string' &&
                  typeof category.icon === 'string' &&
                  typeof category.label === 'string'
                );
              },
            ),
          )
        : {},
    categorySkillOrder:
      settings.categorySkillOrder && typeof settings.categorySkillOrder === 'object' && !Array.isArray(settings.categorySkillOrder)
        ? Object.fromEntries(
            Object.entries(settings.categorySkillOrder).filter((entry): entry is [string, string[]] => Array.isArray(entry[1])),
          )
        : {},
    detailPanelWidth:
      typeof settings.detailPanelWidth === 'number' && Number.isFinite(settings.detailPanelWidth)
        ? settings.detailPanelWidth
        : undefined,
    skillViewMode: settings.skillViewMode === 'list' ? 'list' : 'cards',
    skillTags:
      settings.skillTags && typeof settings.skillTags === 'object' && !Array.isArray(settings.skillTags)
        ? settings.skillTags
        : {},
    skillCardColors:
      settings.skillCardColors && typeof settings.skillCardColors === 'object' && !Array.isArray(settings.skillCardColors)
        ? settings.skillCardColors
        : {},
    skillCategoryOverrides:
      settings.skillCategoryOverrides && typeof settings.skillCategoryOverrides === 'object' && !Array.isArray(settings.skillCategoryOverrides)
        ? Object.fromEntries(
            Object.entries(settings.skillCategoryOverrides).filter(([, categoryId]) =>
              ['data', 'default', 'finance', 'writing'].includes(String(categoryId)),
            ),
          )
        : {},
    skillCategoryAssignments:
      settings.skillCategoryAssignments && typeof settings.skillCategoryAssignments === 'object' && !Array.isArray(settings.skillCategoryAssignments)
        ? Object.fromEntries(
            Object.entries(settings.skillCategoryAssignments)
              .filter((entry): entry is [string, string[]] => Array.isArray(entry[1]))
              .map(([path, categoryIds]) => [
                path,
                Array.from(new Set(categoryIds.filter((categoryId) => typeof categoryId === 'string' && categoryId.trim()).map((categoryId) => categoryId.trim()))),
              ])
              .filter(([, categoryIds]) => categoryIds.length > 0),
          )
        : Object.fromEntries(
            Object.entries(settings.skillCategoryOverrides ?? {}).flatMap(([path, categoryId]) =>
              typeof categoryId === 'string' && categoryId.trim() ? [[path, [categoryId.trim()]]] : [],
            ),
          ),
    skillLocks:
      settings.skillLocks && typeof settings.skillLocks === 'object' && !Array.isArray(settings.skillLocks)
        ? Object.fromEntries(Object.entries(settings.skillLocks).filter(([path, locked]) => Boolean(path.trim()) && locked === true))
        : {},
  };
}

function getPersistableSettings(settings: AppSettings): AppSettings {
  const persistableSettings = { ...settings };

  if (!persistableSettings.categorySkillOrder || Object.keys(persistableSettings.categorySkillOrder).length === 0) {
    delete persistableSettings.categorySkillOrder;
  }

  if (!persistableSettings.categoryIcons || Object.keys(persistableSettings.categoryIcons).length === 0) {
    delete persistableSettings.categoryIcons;
  }

  if (!persistableSettings.customCategories || Object.keys(persistableSettings.customCategories).length === 0) {
    delete persistableSettings.customCategories;
  }

  if (!persistableSettings.skillCardColors || Object.keys(persistableSettings.skillCardColors).length === 0) {
    delete persistableSettings.skillCardColors;
  }

  if (!persistableSettings.skillCategoryAssignments || Object.keys(persistableSettings.skillCategoryAssignments).length === 0) {
    delete persistableSettings.skillCategoryAssignments;
  }

  if (!persistableSettings.skillCategoryOverrides || Object.keys(persistableSettings.skillCategoryOverrides).length === 0) {
    delete persistableSettings.skillCategoryOverrides;
  }

  if (!persistableSettings.skillLocks || Object.keys(persistableSettings.skillLocks).length === 0) {
    delete persistableSettings.skillLocks;
  }

  if (persistableSettings.detailPanelWidth === undefined) {
    delete persistableSettings.detailPanelWidth;
  }

  if (persistableSettings.skillViewMode === 'cards') {
    delete persistableSettings.skillViewMode;
  }

  return persistableSettings;
}

export function useI18nRuntime() {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [language, setLanguage] = useState<Language>(defaultLanguage);
  const [settingsLoadError, setSettingsLoadError] = useState<string | null>(null);
  const [settingsSaveError, setSettingsSaveError] = useState<string | null>(null);
  const [settingsSaveStatus, setSettingsSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [systemLanguages] = useState(() => getSystemLanguages(window.navigator));
  const hasUserSelectedLanguage = useRef(false);
  const saveRequestIdRef = useRef(0);

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
    const requestId = saveRequestIdRef.current + 1;
    saveRequestIdRef.current = requestId;
    setSettingsSaveError(null);
    setSettingsSaveStatus('saving');

    try {
      await invoke<AppSettings>('save_app_settings', { settings: getPersistableSettings(normalizedSettings) });
      if (requestId === saveRequestIdRef.current) {
        setSettings(normalizedSettings);
        setLanguage(normalizedSettings.language);
        setSettingsSaveStatus('saved');
      }
      return normalizedSettings;
    } catch (error) {
      if (requestId === saveRequestIdRef.current) {
        setSettingsSaveError(getErrorMessage(error));
        setSettingsSaveStatus('idle');
      }
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
