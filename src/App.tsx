import { invoke } from '@tauri-apps/api/core';
import { useEffect, useMemo, useRef, useState } from 'react';
import { isLanguage, useI18nRuntime, type TranslationKey } from './i18n';
import {
  type AppSettings,
  type ParseStatus,
  type SkillDetail,
  type SkillSource,
  type SkillSummary,
} from './types/skill';

type SourceFilter = 'all' | SkillSource;
type SourceIconName = 'agents' | 'all' | 'codex' | 'custom' | 'plugin';
type DetailErrorTitleKey = 'details.errorTitle' | 'details.actionErrorTitle';
type ScanOutcome = 'idle' | 'success' | 'partial-success' | 'failed';
type VisibleScanOutcome = 'not-scanned' | 'scanning' | Exclude<ScanOutcome, 'idle'>;
type CreateSkillDraft = {
  targetDirectory: string;
  name: string;
  description: string;
  markdown: string;
};

const skillsPerPage = 10;

const sourceLabelKeys: Record<SkillSource, TranslationKey> = {
  'agents-user': 'sources.agentsUser',
  'codex-user': 'sources.codexUser',
  custom: 'sources.custom',
  'plugin-cache': 'sources.pluginCache',
  system: 'sources.system',
  unknown: 'sources.unknown',
};

const parseStatusLabelKeys: Record<ParseStatus, TranslationKey> = {
  'invalid-frontmatter': 'status.invalidFrontmatter',
  'missing-skill-file': 'status.missingSkillFile',
  parsed: 'status.parsed',
  'read-error': 'status.readError',
};

const sourceNavItems: Array<{ value: SourceFilter; labelKey: TranslationKey; icon: SourceIconName }> = [
  { value: 'all', labelKey: 'sources.allSkills', icon: 'all' },
  { value: 'codex-user', labelKey: 'sources.codexShort', icon: 'codex' },
  { value: 'agents-user', labelKey: 'sources.agentsShort', icon: 'agents' },
  { value: 'plugin-cache', labelKey: 'sources.pluginSkills', icon: 'plugin' },
  { value: 'custom', labelKey: 'sources.customDirectories', icon: 'custom' },
];

const detailTagKeys = ['details.tagMcp', 'details.tagUi', 'details.tagLocal'] as const;

const dateTimeFormatOptions: Intl.DateTimeFormatOptions = {
  dateStyle: 'medium',
  timeStyle: 'medium',
};

const emptyCreateSkillDraft: CreateSkillDraft = {
  targetDirectory: '',
  name: '',
  description: '',
  markdown: '',
};

const defaultScanPathGroups: Array<{ labelKey: TranslationKey; paths: string[] }> = [
  {
    labelKey: 'settings.windowsDefaultPaths',
    paths: ['%USERPROFILE%\\.codex\\skills', '%USERPROFILE%\\.agents\\skills'],
  },
  {
    labelKey: 'settings.macosDefaultPaths',
    paths: ['~/.codex/skills', '~/.agents/skills'],
  },
];

const sidebarStoragePaths = ['%USERPROFILE%\\.codex\\skills', '%USERPROFILE%\\.agents\\skills'];

function getSkillSearchText(skill: SkillSummary) {
  return `${skill.name} ${skill.description} ${skill.path}`.toLocaleLowerCase();
}

function filterSkills(skills: SkillSummary[], query: string, sourceFilter: SourceFilter) {
  const normalizedQuery = query.trim().toLocaleLowerCase();

  return skills.filter((skill) => {
    const matchesSearch = normalizedQuery.length === 0 || getSkillSearchText(skill).includes(normalizedQuery);
    const matchesSource = sourceFilter === 'all' || skill.source === sourceFilter;

    return matchesSearch && matchesSource;
  });
}

function SourceNavIcon({ name }: { name: SourceIconName }) {
  const commonProps = {
    'aria-hidden': true,
    className: 'source-nav-icon',
    fill: 'none',
    focusable: false,
    stroke: 'currentColor',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    strokeWidth: 1.9,
    viewBox: '0 0 24 24',
  } as const;

  if (name === 'all') {
    return (
      <svg {...commonProps}>
        <path d="M4 6.5h7.5" />
        <path d="M4 12h16" />
        <path d="M4 17.5h12" />
        <path d="M15.5 5.5 18 8l3-4" />
      </svg>
    );
  }

  if (name === 'codex') {
    return (
      <svg {...commonProps}>
        <rect x="4" y="5" width="16" height="14" rx="2.5" />
        <path d="M8 9.5h8" />
        <path d="M8 14.5h5" />
      </svg>
    );
  }

  if (name === 'agents') {
    return (
      <svg {...commonProps}>
        <circle cx="8" cy="8.5" r="2.5" />
        <circle cx="16" cy="8.5" r="2.5" />
        <path d="M4.5 18c.8-2.5 2.2-3.8 4.2-3.8" />
        <path d="M19.5 18c-.8-2.5-2.2-3.8-4.2-3.8" />
        <path d="M9.5 18h5" />
      </svg>
    );
  }

  if (name === 'plugin') {
    return (
      <svg {...commonProps}>
        <path d="M9 4h6v5h5v6h-5v5H9v-5H4V9h5z" />
      </svg>
    );
  }

  return (
    <svg {...commonProps}>
      <path d="M3.5 7.5h7l2 2h8v8.5a2 2 0 0 1-2 2h-15z" />
      <path d="M3.5 7.5V5.8a1.8 1.8 0 0 1 1.8-1.8h4.2l2 2h7.2a1.8 1.8 0 0 1 1.8 1.8v1.7" />
    </svg>
  );
}

function dateFromTimestamp(value: string) {
  const trimmedValue = value.trim();
  if (!/^\d+$/.test(trimmedValue)) {
    return null;
  }

  const timestamp = Number(trimmedValue);
  if (!Number.isFinite(timestamp)) {
    return null;
  }

  return new Date(timestamp < 1_000_000_000_000 ? timestamp * 1000 : timestamp);
}

function dateFromDateTimeValue(value: string) {
  const timestampDate = dateFromTimestamp(value);
  const date = timestampDate ?? new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDateTime(value: string | Date | null, locale: string) {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? value : dateFromDateTimeValue(value);
  if (!date) {
    return null;
  }

  return new Intl.DateTimeFormat(locale, dateTimeFormatOptions).format(date);
}

function getScanOutcome(skills: SkillSummary[]): ScanOutcome {
  return skills.some((skill) => skill.parseStatus !== 'parsed') ? 'partial-success' : 'success';
}

function PathButton({
  className = 'path-button',
  onOpen,
  path,
}: {
  className?: string;
  onOpen: (path: string) => void | Promise<void>;
  path: string;
}) {
  return (
    <button
      type="button"
      className={className}
      title={path}
      onClick={(event) => {
        event.stopPropagation();
        void onOpen(path);
      }}
      onKeyDown={(event) => {
        event.stopPropagation();
      }}
    >
      {path}
    </button>
  );
}

export function App() {
  const {
    language,
    languageOptions,
    locale,
    saveSettings,
    settings,
    settingsLoadError,
    settingsSaveError,
    settingsSaveStatus,
    t,
    updateLanguage,
  } = useI18nRuntime();
  const [skills, setSkills] = useState<SkillSummary[]>([]);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<SkillDetail | null>(null);
  const [detailName, setDetailName] = useState('');
  const [detailDescription, setDetailDescription] = useState('');
  const [detailMarkdown, setDetailMarkdown] = useState('');
  const [detailMode, setDetailMode] = useState<'preview' | 'edit'>('edit');
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [detailErrorTitleKey, setDetailErrorTitleKey] = useState<DetailErrorTitleKey>('details.errorTitle');
  const [isSavingDetail, setIsSavingDetail] = useState(false);
  const [isDeletingDetail, setIsDeletingDetail] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmPath, setDeleteConfirmPath] = useState<string | null>(null);
  const detailRequestIdRef = useRef(0);
  const selectedPathRef = useRef<string | null>(null);
  const confirmDeleteButtonRef = useRef<HTMLButtonElement>(null);
  const createTargetDirectoryRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingSkills, setIsLoadingSkills] = useState(true);
  const [scanError, setScanError] = useState<string | null>(null);
  const [lastScanAt, setLastScanAt] = useState<Date | null>(null);
  const [scanOutcome, setScanOutcome] = useState<ScanOutcome>('idle');
  const [showSettings, setShowSettings] = useState(false);
  const [settingsDraft, setSettingsDraft] = useState<AppSettings>(settings);
  const [customDirectoryInput, setCustomDirectoryInput] = useState('');
  const [showCreateSkill, setShowCreateSkill] = useState(false);
  const [createSkillDraft, setCreateSkillDraft] = useState<CreateSkillDraft>(emptyCreateSkillDraft);
  const [createSkillError, setCreateSkillError] = useState<string | null>(null);
  const [isCreatingSkill, setIsCreatingSkill] = useState(false);

  const filteredSkills = useMemo(
    () => filterSkills(skills, searchQuery, sourceFilter),
    [searchQuery, skills, sourceFilter],
  );
  const totalPages = Math.max(1, Math.ceil(filteredSkills.length / skillsPerPage));
  const normalizedCurrentPage = Math.min(currentPage, totalPages);
  const paginatedSkills = useMemo(() => {
    const pageStartIndex = (normalizedCurrentPage - 1) * skillsPerPage;
    return filteredSkills.slice(pageStartIndex, pageStartIndex + skillsPerPage);
  }, [filteredSkills, normalizedCurrentPage]);

  const sourceCounts = useMemo(() => {
    const counts: Record<SourceFilter, number> = {
      all: skills.length,
      'agents-user': 0,
      'codex-user': 0,
      custom: 0,
      'plugin-cache': 0,
      system: 0,
      unknown: 0,
    };

    for (const skill of skills) {
      counts[skill.source] += 1;
    }

    return counts;
  }, [skills]);

  const formattedLastScan = formatDateTime(lastScanAt, locale);
  const visibleScanOutcome: VisibleScanOutcome = isLoadingSkills ? 'scanning' : scanOutcome === 'idle' ? 'not-scanned' : scanOutcome;
  const scanOutcomeLabelKey: TranslationKey =
    visibleScanOutcome === 'scanning'
      ? 'sources.scanning'
      : visibleScanOutcome === 'success'
        ? 'sources.success'
        : visibleScanOutcome === 'partial-success'
          ? 'sources.partialSuccess'
          : visibleScanOutcome === 'failed'
            ? 'sources.failed'
            : 'sources.notScanned';

  const scanSkills = async () => {
    setIsLoadingSkills(true);
    setScanError(null);

    try {
      const scannedSkills = await invoke<SkillSummary[]>('scan_skills');
      setSkills(scannedSkills);
      setScanOutcome(getScanOutcome(scannedSkills));
    } catch (error) {
      setScanError(error instanceof Error ? error.message : String(error));
      setScanOutcome('failed');
    } finally {
      setLastScanAt(new Date());
      setIsLoadingSkills(false);
    }
  };

  useEffect(() => {
    void scanSkills();
  }, []);

  useEffect(() => {
    setSettingsDraft(settings);
  }, [settings]);

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  useEffect(() => {
    if (showDeleteConfirm) {
      confirmDeleteButtonRef.current?.focus();
    }
  }, [showDeleteConfirm]);

  useEffect(() => {
    if (showCreateSkill) {
      createTargetDirectoryRef.current?.focus();
    }
  }, [showCreateSkill]);

  const syncDetailForm = (detail: SkillDetail) => {
    setSelectedDetail(detail);
    setDetailName(detail.name);
    setDetailDescription(detail.description);
    setDetailMarkdown(detail.bodyMarkdown);
  };

  const mergeDetailIntoSkills = (detail: SkillDetail) => {
    setSkills((currentSkills) =>
      currentSkills.map((skill) =>
        skill.path === detail.path
          ? {
              path: detail.path,
              name: detail.name,
              description: detail.description,
              source: detail.source,
              parseStatus: detail.parseStatus,
              modifiedAt: detail.modifiedAt,
            }
          : skill,
      ),
    );
  };

  const upsertDetailIntoSkills = (detail: SkillDetail) => {
    const summary: SkillSummary = {
      path: detail.path,
      name: detail.name,
      description: detail.description,
      source: detail.source,
      parseStatus: detail.parseStatus,
      modifiedAt: detail.modifiedAt,
    };

    setSkills((currentSkills) => {
      const existingIndex = currentSkills.findIndex((skill) => skill.path === detail.path);
      if (existingIndex === -1) {
        return [...currentSkills, summary];
      }

      return currentSkills.map((skill) => (skill.path === detail.path ? summary : skill));
    });
  };

  const openCreateSkillDialog = () => {
    setCreateSkillDraft(emptyCreateSkillDraft);
    setCreateSkillError(null);
    setShowCreateSkill(true);
  };

  const closeCreateSkillDialog = () => {
    if (isCreatingSkill) {
      return;
    }

    setShowCreateSkill(false);
    setCreateSkillError(null);
    setIsCreatingSkill(false);
  };

  const updateCreateSkillDraft = (field: keyof CreateSkillDraft, value: string) => {
    setCreateSkillDraft((currentDraft) => ({
      ...currentDraft,
      [field]: value,
    }));
  };

  const selectSkill = async (skill: SkillSummary) => {
    const requestId = detailRequestIdRef.current + 1;
    detailRequestIdRef.current = requestId;
    selectedPathRef.current = skill.path;
    setSelectedPath(skill.path);
    setSelectedDetail(null);
    setDetailError(null);
    setIsLoadingDetail(true);

    try {
      const detail = await invoke<SkillDetail>('read_skill', { path: skill.path });
      if (detailRequestIdRef.current === requestId) {
        syncDetailForm(detail);
      }
    } catch (error) {
      if (detailRequestIdRef.current === requestId) {
        setDetailErrorTitleKey('details.errorTitle');
        setDetailError(error instanceof Error ? error.message : String(error));
      }
    } finally {
      if (detailRequestIdRef.current === requestId) {
        setIsLoadingDetail(false);
      }
    }
  };

  const saveSelectedSkill = async () => {
    if (!selectedDetail) {
      return;
    }

    setIsSavingDetail(true);
    setDetailError(null);

    try {
      const updatedDetail = await invoke<SkillDetail>('update_skill', {
        input: {
          path: selectedDetail.path,
          name: detailName,
          description: detailDescription,
          markdown: detailMarkdown,
        },
      });
      if (selectedPathRef.current === updatedDetail.path) {
        syncDetailForm(updatedDetail);
      }
      mergeDetailIntoSkills(updatedDetail);
    } catch (error) {
      setDetailErrorTitleKey('details.actionErrorTitle');
      setDetailError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsSavingDetail(false);
    }
  };

  const createSkill = async () => {
    setIsCreatingSkill(true);
    setCreateSkillError(null);

    try {
      const createdDetail = await invoke<SkillDetail>('create_skill', {
        input: {
          name: createSkillDraft.name.trim(),
          description: createSkillDraft.description.trim(),
          source: 'codex-user',
          targetDirectory: createSkillDraft.targetDirectory.trim(),
          markdown: createSkillDraft.markdown,
        },
      });
      selectedPathRef.current = createdDetail.path;
      setSelectedPath(createdDetail.path);
      setDetailError(null);
      setDetailErrorTitleKey('details.errorTitle');
      setIsLoadingDetail(false);
      syncDetailForm(createdDetail);
      setShowCreateSkill(false);
      await scanSkills();
      upsertDetailIntoSkills(createdDetail);
    } catch (error) {
      setCreateSkillError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsCreatingSkill(false);
    }
  };

  const deleteSelectedSkill = async () => {
    const targetPath = deleteConfirmPath ?? selectedDetail?.path;

    if (!targetPath) {
      return;
    }

    setIsDeletingDetail(true);
    setDetailError(null);

    try {
      await invoke('delete_skill', { path: targetPath });
      setShowDeleteConfirm(false);
      setDeleteConfirmPath(null);
      if (selectedPathRef.current === targetPath) {
        selectedPathRef.current = null;
        setSelectedPath(null);
        setSelectedDetail(null);
      }
      await scanSkills();
    } catch (error) {
      setDetailErrorTitleKey('details.actionErrorTitle');
      setDetailError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsDeletingDetail(false);
    }
  };

  const openSkillFolder = async (path: string) => {
    setDetailError(null);

    try {
      await invoke('open_skill_folder', { path });
    } catch (error) {
      setDetailErrorTitleKey('details.actionErrorTitle');
      setDetailError(error instanceof Error ? error.message : String(error));
    }
  };

  const openSelectedSkillFolder = async () => {
    if (!selectedDetail) {
      return;
    }

    await openSkillFolder(selectedDetail.path);
  };

  const addCustomDirectory = () => {
    const nextDirectory = customDirectoryInput.trim();

    if (!nextDirectory || settingsDraft.customScanDirectories.includes(nextDirectory)) {
      return;
    }

    setSettingsDraft((currentSettings) => ({
      ...currentSettings,
      customScanDirectories: [...currentSettings.customScanDirectories, nextDirectory],
    }));
    setCustomDirectoryInput('');
  };

  const removeCustomDirectory = (directory: string) => {
    setSettingsDraft((currentSettings) => ({
      ...currentSettings,
      customScanDirectories: currentSettings.customScanDirectories.filter((currentDirectory) => currentDirectory !== directory),
    }));
  };

  const saveSettingsDraft = async () => {
    try {
      await saveSettings(settingsDraft);
    } catch {
      // Error state is stored by the i18n runtime for the settings panel.
    }
  };

  const listState = (() => {
    if (isLoadingSkills) {
      return 'loading';
    }

    if (scanError) {
      return 'error';
    }

    if (skills.length === 0) {
      return 'empty';
    }

    if (filteredSkills.length === 0) {
      return 'filtered-empty';
    }

    return 'ready';
  })();

  return (
    <main className="app-shell fluid-app-shell">
      <header className="top-bar top-command-bar">
        <div className="brand-block command-brand">
          <h1>{t('topBar.productName')}</h1>
        </div>
        <div className={`scan-summary-chip command-status scan-summary-${visibleScanOutcome}`} aria-label={t('topBar.scanStatusAria')}>
          <span>{`${t('sources.scanState')}: ${t(scanOutcomeLabelKey)}`}</span>
          <strong>{`${t('sources.lastScan')}: ${formattedLastScan ?? t('sources.notScanned')}`}</strong>
        </div>
        <div className="toolbar-actions command-actions">
          <button type="button" className="primary-action" onClick={() => void scanSkills()}>
            {t('actions.rescan')}
          </button>
          <button type="button" onClick={openCreateSkillDialog}>
            {t('actions.newSkill')}
          </button>
          <label className="locale-switcher">
            <span>{t('language.label')}</span>
            <select
              aria-label={t('language.label')}
              value={language}
              onChange={(event) => {
                if (isLanguage(event.target.value)) {
                  updateLanguage(event.target.value);
                }
              }}
            >
              {languageOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {t(option.labelKey)}
                </option>
              ))}
            </select>
          </label>
          <button type="button" className={showSettings ? 'active-action' : undefined} onClick={() => setShowSettings((current) => !current)}>
            {t('actions.settings')}
          </button>
        </div>
      </header>

      {showSettings ? (
        <section className="settings-panel" aria-label={t('settings.ariaLabel')}>
          <div className="settings-heading">
            <div>
              <h2>{t('settings.title')}</h2>
              <p>{t('settings.description')}</p>
            </div>
            <button type="button" onClick={() => setShowSettings(false)}>
              {t('actions.close')}
            </button>
          </div>

          {settingsLoadError ? (
            <div className="settings-message error-state" role="status">
              <strong>{t('settings.loadErrorTitle')}</strong>
              <p>{settingsLoadError}</p>
            </div>
          ) : null}
          {settingsSaveError ? (
            <div className="settings-message error-state" role="status">
              <strong>{t('settings.saveErrorTitle')}</strong>
              <p>{settingsSaveError}</p>
            </div>
          ) : null}
          {settingsSaveStatus === 'saved' && !settingsSaveError ? (
            <div className="settings-message success-state" role="status">
              <strong>{t('settings.savedTitle')}</strong>
            </div>
          ) : null}

          <div className="settings-grid">
            <section className="settings-card" aria-label={t('settings.languageSection')}>
              <h3>{t('settings.languageSection')}</h3>
              <label className="field-stack">
                <span>{t('settings.languageLabel')}</span>
                <select
                  aria-label={t('settings.languageLabel')}
                  value={settingsDraft.language}
                  onChange={(event) => {
                    const nextLanguage = event.currentTarget.value;
                    if (isLanguage(nextLanguage)) {
                      setSettingsDraft((currentSettings) => ({ ...currentSettings, language: nextLanguage }));
                    }
                  }}
                >
                  {languageOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {t(option.labelKey)}
                    </option>
                  ))}
                </select>
              </label>
            </section>

            <section className="settings-card" aria-label={t('settings.defaultPathsSection')}>
              <h3>{t('settings.defaultPathsSection')}</h3>
              <label className="toggle-row">
                <input
                  type="checkbox"
                  checked={settingsDraft.showDefaultScanDirectories}
                  onChange={(event) =>
                    setSettingsDraft((currentSettings) => ({
                      ...currentSettings,
                      showDefaultScanDirectories: event.target.checked,
                    }))
                  }
                />
                <span>{t('settings.showDefaultScanDirectories')}</span>
              </label>
              {settingsDraft.showDefaultScanDirectories ? (
                <div className="default-path-grid">
                  {defaultScanPathGroups.map((group) => (
                    <section key={group.labelKey} className="default-path-group" aria-label={t(group.labelKey)}>
                      <h4>{t(group.labelKey)}</h4>
                      <ul>
                        {group.paths.map((path) => (
                          <li key={path}>{path}</li>
                        ))}
                      </ul>
                    </section>
                  ))}
                </div>
              ) : null}
            </section>

            <section className="settings-card custom-directory-card" aria-label={t('settings.customDirectoriesSection')}>
              <h3>{t('settings.customDirectoriesSection')}</h3>
              <div className="custom-directory-form">
                <label className="field-stack">
                  <span>{t('settings.customDirectoryPath')}</span>
                  <input
                    aria-label={t('settings.customDirectoryPath')}
                    value={customDirectoryInput}
                    onChange={(event) => setCustomDirectoryInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        addCustomDirectory();
                      }
                    }}
                  />
                </label>
                <button type="button" onClick={addCustomDirectory}>
                  {t('settings.addDirectory')}
                </button>
              </div>
              {settingsDraft.customScanDirectories.length > 0 ? (
                <ul className="custom-directory-list">
                  {settingsDraft.customScanDirectories.map((directory) => (
                    <li key={directory}>
                      <span>{directory}</span>
                      <button
                        type="button"
                        aria-label={t('settings.removeDirectory', { directory })}
                        onClick={() => removeCustomDirectory(directory)}
                      >
                        {t('settings.removeDirectoryButton')}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="muted">{t('settings.noCustomDirectories')}</p>
              )}
            </section>
          </div>

          <div className="settings-actions">
            <button type="button" className="primary-action" disabled={settingsSaveStatus === 'saving'} onClick={() => void saveSettingsDraft()}>
              {settingsSaveStatus === 'saving' ? t('settings.saving') : t('settings.save')}
            </button>
          </div>
        </section>
      ) : null}

      <section className="dashboard-grid fluid-dashboard-grid" aria-label={t('layout.dashboard')}>
        <aside className="panel sidebar fluid-sidebar-panel" aria-label={t('sources.title')}>
          <div className="panel-heading">
            <h2>{t('sources.title')}</h2>
            <span className="count-badge">{skills.length}</span>
          </div>
          <nav aria-label={t('sources.title')}>
            {sourceNavItems.map((item) => (
              <button
                key={item.value}
                type="button"
                aria-label={`${t(item.labelKey)} ${sourceCounts[item.value]}`}
                className={`source-nav-button ${sourceFilter === item.value ? 'active' : ''}`}
                onClick={() => {
                  setSourceFilter(item.value);
                  setCurrentPage(1);
                }}
              >
                <SourceNavIcon name={item.icon} />
                <span className="source-nav-label">{t(item.labelKey)}</span>
                <span className="source-nav-count">{sourceCounts[item.value]}</span>
              </button>
            ))}
          </nav>

          <section className="sidebar-section" aria-label={t('sources.statusTitle')}>
            <h3>{t('sources.statusTitle')}</h3>
            <dl className="status-grid">
              <div>
                <dt>{t('sources.lastScan')}</dt>
                <dd>{formattedLastScan ?? t('sources.notScanned')}</dd>
              </div>
              <div>
                <dt>{t('sources.scanState')}</dt>
                <dd>{t(scanOutcomeLabelKey)}</dd>
              </div>
            </dl>
          </section>

          <section className="sidebar-section storage-section" aria-label={t('sources.storageTitle')}>
            <div className="storage-heading">
              <h3>{t('sources.storageTitle')}</h3>
              <button type="button" onClick={() => setShowSettings(true)}>
                {t('sources.manageStorage')}
              </button>
            </div>
            <ul className="storage-path-list">
              {sidebarStoragePaths.map((path) => (
                <li key={path}>{path}</li>
              ))}
              {settings.customScanDirectories.map((directory) => (
                <li key={directory}>{directory}</li>
              ))}
            </ul>
          </section>

        </aside>

        <section className="panel list-panel fluid-list-panel" aria-label={t('skills.title')}>
          <div className="section-heading">
            <div>
              <h2>{t('skills.title')}</h2>
              <p>{`${filteredSkills.length} ${t('skills.countUnit')}`}</p>
            </div>
            <div className="list-controls">
              <input
                type="search"
                aria-label={t('search.skillsLabel')}
                placeholder={t('search.placeholder')}
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>
          {listState === 'ready' ? (
            <div className="skill-table-wrap fluid-table-region">
              <table aria-label={t('skills.tableLabel')} className="skill-table">
                <thead>
                  <tr>
                    <th scope="col">{t('skills.columnName')}</th>
                    <th scope="col">{t('skills.columnSource')}</th>
                    <th scope="col">{t('skills.columnDescription')}</th>
                    <th scope="col">{t('skills.columnModified')}</th>
                    <th scope="col">{t('skills.columnPath')}</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedSkills.map((skill) => (
                    <tr
                      key={skill.path}
                      className={selectedPath === skill.path ? 'selected-row' : undefined}
                      aria-selected={selectedPath === skill.path}
                      tabIndex={0}
                      onClick={() => void selectSkill(skill)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          void selectSkill(skill);
                        }
                      }}
                    >
                      <td>
                        <strong>{skill.name}</strong>
                      </td>
                      <td>
                        <span className="status-pill">{t(sourceLabelKeys[skill.source])}</span>
                      </td>
                      <td>
                        <span className="skill-description">{skill.description}</span>
                      </td>
                      <td>{formatDateTime(skill.modifiedAt, locale) ?? t('skills.modifiedUnknown')}</td>
                      <td>
                        <PathButton path={skill.path} onOpen={openSkillFolder} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="pagination-controls" aria-label={t('pagination.label')}>
                <button
                  type="button"
                  disabled={normalizedCurrentPage === 1}
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                >
                  {t('pagination.previous')}
                </button>
                <span>{t('pagination.status', { currentPage: String(normalizedCurrentPage), totalPages: String(totalPages) })}</span>
                <button
                  type="button"
                  disabled={normalizedCurrentPage === totalPages}
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                >
                  {t('pagination.next')}
                </button>
              </div>
            </div>
          ) : (
            <div className={`empty-state ${listState === 'error' ? 'error-state' : ''}`}>
              <strong>
                {listState === 'loading'
                  ? t('skills.loadingTitle')
                  : listState === 'error'
                    ? t('skills.errorTitle')
                    : listState === 'filtered-empty'
                      ? t('skills.noMatchesTitle')
                      : t('skills.emptyTitle')}
              </strong>
              <p>
                {listState === 'loading'
                  ? t('skills.loadingDescription')
                  : listState === 'error'
                    ? scanError
                    : listState === 'filtered-empty'
                      ? t('skills.noMatchesDescription')
                      : t('skills.emptyDescription')}
              </p>
            </div>
          )}
        </section>

        <aside className="panel detail-panel fluid-detail-panel" aria-label={t('details.ariaLabel')}>
          <div className="panel-heading">
            <h2>{t('details.title')}</h2>
            <span className="status-pill">
              {selectedDetail ? t(parseStatusLabelKeys[selectedDetail.parseStatus]) : t('details.placeholderStatus')}
            </span>
          </div>
          {detailError ? (
            <section className="detail-section error-state" aria-label={t(detailErrorTitleKey)}>
              <strong>{t(detailErrorTitleKey)}</strong>
              <p>{detailError}</p>
            </section>
          ) : null}
          {selectedDetail ? (
            <>
              <section className="detail-section" aria-label={t('details.metadata')}>
                <h3>{t('details.metadata')}</h3>
                <label className="field-stack">
                  <span>{t('details.name')}</span>
                  <input value={detailName} onChange={(event) => setDetailName(event.target.value)} />
                </label>
                <label className="field-stack">
                  <span>{t('details.description')}</span>
                  <textarea
                    className="detail-description-input"
                    value={detailDescription}
                    onChange={(event) => setDetailDescription(event.target.value)}
                  />
                </label>
                <dl>
                  <div>
                    <dt>{t('details.source')}</dt>
                    <dd>{t(sourceLabelKeys[selectedDetail.source])}</dd>
                  </div>
                  <div>
                    <dt>{t('details.modified')}</dt>
                    <dd>{formatDateTime(selectedDetail.modifiedAt, locale) ?? t('skills.modifiedUnknown')}</dd>
                  </div>
                </dl>
              </section>
              <section className="detail-section" aria-label={t('details.path')}>
                <h3>{t('details.path')}</h3>
                <PathButton className="path-button path-placeholder" path={selectedDetail.path} onOpen={openSkillFolder} />
              </section>
              <section className="detail-section detail-markdown-section fluid-markdown-region">
                <div className="detail-markdown-heading">
                  <h3>{t('details.markdownBody')}</h3>
                  <div className="detail-mode-tabs" role="tablist" aria-label={t('details.markdownMode')}>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={detailMode === 'preview'}
                      className={detailMode === 'preview' ? 'active' : undefined}
                      onClick={() => setDetailMode('preview')}
                    >
                      {t('details.preview')}
                    </button>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={detailMode === 'edit'}
                      className={detailMode === 'edit' ? 'active' : undefined}
                      onClick={() => setDetailMode('edit')}
                    >
                      {t('details.edit')}
                    </button>
                  </div>
                </div>
                {detailMode === 'preview' ? (
                  <pre className="markdown-preview">{detailMarkdown.trim() || t('details.markdownEmpty')}</pre>
                ) : (
                  <label className="field-stack detail-markdown-field">
                    <span className="visually-hidden">{t('details.markdownBody')}</span>
                    <textarea
                      className="detail-markdown-input fluid-markdown-input"
                      value={detailMarkdown}
                      onChange={(event) => setDetailMarkdown(event.target.value)}
                    />
                  </label>
                )}
              </section>
            </>
          ) : (
            <>
              <section className="detail-section" aria-label={t('details.metadata')}>
                <h3>{t('details.metadata')}</h3>
                <dl>
                  <div>
                    <dt>{t('details.name')}</dt>
                    <dd>{isLoadingDetail ? t('details.loading') : t('details.placeholder')}</dd>
                  </div>
                  <div>
                    <dt>{t('details.source')}</dt>
                    <dd>{isLoadingDetail ? t('details.loading') : t('details.placeholder')}</dd>
                  </div>
                  <div>
                    <dt>{t('details.modified')}</dt>
                    <dd>{isLoadingDetail ? t('details.loading') : t('details.placeholder')}</dd>
                  </div>
                </dl>
              </section>
              <section className="detail-section" aria-label={t('details.path')}>
                <h3>{t('details.path')}</h3>
                <p className="path-placeholder">{isLoadingDetail ? t('details.loading') : t('details.placeholder')}</p>
              </section>
              <section className="detail-section" aria-label={t('details.description')}>
                <h3>{t('details.description')}</h3>
                <p>{t('details.descriptionPlaceholder')}</p>
              </section>
              <section className="detail-section split-section">
                <div>
                  <h3>{t('details.tools')}</h3>
                  <p className="muted">{t('details.noTools')}</p>
                </div>
                <div>
                  <h3>{t('details.tags')}</h3>
                  <div className="tag-row">
                    {detailTagKeys.map((tagKey) => (
                      <span key={tagKey}>{t(tagKey)}</span>
                    ))}
                  </div>
                </div>
              </section>
            </>
          )}
          <div className="detail-actions">
            <button type="button" disabled={!selectedDetail || isSavingDetail} onClick={() => void saveSelectedSkill()}>
              {t('actions.save')}
            </button>
            <button
              type="button"
              disabled={!selectedDetail}
              onClick={() => {
                setDeleteConfirmPath(selectedDetail?.path ?? null);
                setShowDeleteConfirm(true);
              }}
            >
              {t('actions.delete')}
            </button>
            <button type="button" disabled={!selectedDetail} onClick={() => void openSelectedSkillFolder()}>
              {selectedDetail ? t('actions.openFolder') : t('actions.openPath')}
            </button>
          </div>
        </aside>
      </section>
      {showDeleteConfirm && deleteConfirmPath ? (
        <div className="dialog-backdrop">
          <div role="dialog" aria-modal="true" aria-labelledby="delete-skill-title" className="confirm-dialog">
            <h2 id="delete-skill-title">{t('actions.delete')}</h2>
            <p>{t('details.deleteConfirm')}</p>
            <div className="dialog-actions">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteConfirmPath(null);
                }}
              >
                {t('actions.cancel')}
              </button>
              <button
                type="button"
                ref={confirmDeleteButtonRef}
                className="danger-action"
                disabled={isDeletingDetail}
                onClick={() => void deleteSelectedSkill()}
              >
                {t('actions.confirmDelete')}
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {showCreateSkill ? (
        <div className="dialog-backdrop">
          <div role="dialog" aria-modal="true" aria-labelledby="create-skill-title" className="create-dialog">
            <div className="dialog-heading">
              <h2 id="create-skill-title">{t('actions.newSkill')}</h2>
              <button type="button" disabled={isCreatingSkill} onClick={closeCreateSkillDialog}>
                {t('actions.close')}
              </button>
            </div>
            {createSkillError ? (
              <div className="settings-message error-state" role="alert">
                <strong>{t('create.errorTitle')}</strong>
                <p>{createSkillError}</p>
              </div>
            ) : null}
            <div className="create-form-grid">
              <label className="field-stack">
                <span>{t('create.targetDirectory')}</span>
                <input
                  ref={createTargetDirectoryRef}
                  list="create-skill-directory-suggestions"
                  value={createSkillDraft.targetDirectory}
                  onChange={(event) => updateCreateSkillDraft('targetDirectory', event.target.value)}
                />
              </label>
              <label className="field-stack">
                <span>{t('details.name')}</span>
                <input value={createSkillDraft.name} onChange={(event) => updateCreateSkillDraft('name', event.target.value)} />
              </label>
              <label className="field-stack create-description-field">
                <span>{t('details.description')}</span>
                <input
                  value={createSkillDraft.description}
                  onChange={(event) => updateCreateSkillDraft('description', event.target.value)}
                />
              </label>
              <label className="field-stack create-markdown-field">
                <span>{t('details.markdownBody')}</span>
                <textarea value={createSkillDraft.markdown} onChange={(event) => updateCreateSkillDraft('markdown', event.target.value)} />
              </label>
            </div>
            <datalist id="create-skill-directory-suggestions">
              {settings.customScanDirectories.map((directory) => (
                <option key={directory} value={directory} />
              ))}
              {defaultScanPathGroups.flatMap((group) =>
                group.paths.map((path) => <option key={`${group.labelKey}-${path}`} value={path} />),
              )}
            </datalist>
            <div className="dialog-actions">
              <button type="button" disabled={isCreatingSkill} onClick={closeCreateSkillDialog}>
                {t('actions.cancel')}
              </button>
              <button type="button" className="primary-action" disabled={isCreatingSkill} onClick={() => void createSkill()}>
                {isCreatingSkill ? t('create.creating') : t('create.submit')}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
