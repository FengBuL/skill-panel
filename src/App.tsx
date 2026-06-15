import { invoke } from '@tauri-apps/api/core';
import { useEffect, useMemo, useRef, useState, type CSSProperties, type MouseEvent } from 'react';
import { isLanguage, useI18nRuntime, type TranslationKey } from './i18n';
import {
  type AppSettings,
  type ParseStatus,
  type SkillDetail,
  type SkillSource,
  type SkillSummary,
} from './types/skill';

type SourceIconName = 'all' | 'tag' | CategoryId;
type DetailErrorTitleKey = 'details.errorTitle' | 'details.actionErrorTitle';
type ScanOutcome = 'idle' | 'success' | 'partial-success' | 'failed';
type VisibleScanOutcome = 'not-scanned' | 'scanning' | Exclude<ScanOutcome, 'idle'>;
type SkillViewMode = 'cards' | 'list';
type CategoryId = 'data' | 'default' | 'finance' | 'writing';
type CategoryDefinition = {
  className: string;
  color: string;
  id: CategoryId;
  label: string;
};
type ColorChoice = {
  color: string;
  label: string;
};
type CategoryContextMenu = {
  categoryId: CategoryId;
  x: number;
  y: number;
};
type SkillTagContextMenu = {
  path: string;
  x: number;
  y: number;
};
type CustomSkillTag = {
  color: string;
  label: string;
};
type CustomTagCategory = CustomSkillTag & {
  count: number;
};
type CategoryColorMap = Record<CategoryId, string>;
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
const categoryDefaults: Record<CategoryId, CategoryDefinition> = {
  finance: { id: 'finance', label: '金融', className: 'category-finance', color: '#fff4d8' },
  data: { id: 'data', label: '表格', className: 'category-data', color: '#e8f0ff' },
  writing: { id: 'writing', label: '文案', className: 'category-writing', color: '#eaf3ff' },
  default: { id: 'default', label: '技能', className: 'category-default', color: '#eef4ff' },
};
const categoryNavItems: Array<{ category: CategoryDefinition | null; icon: SourceIconName; labelKey?: TranslationKey }> = [
  { category: null, icon: 'all', labelKey: 'sources.allSkills' },
  { category: categoryDefaults.finance, icon: 'finance' },
  { category: categoryDefaults.data, icon: 'data' },
  { category: categoryDefaults.writing, icon: 'writing' },
  { category: categoryDefaults.default, icon: 'default' },
];
const colorChoices: ColorChoice[] = [
  { label: '黄色', color: '#fff4d8' },
  { label: '蓝色', color: '#e0f2fe' },
  { label: '绿色', color: '#dcfce7' },
  { label: '紫色', color: '#f5e8ff' },
  { label: '粉色', color: '#ffe4ef' },
];
const defaultCustomTagColor = '#e0f2fe';

const stitchDemoBaseSkills: SkillSummary[] = [
  {
    path: 'C:\\Users\\12925\\.codex\\skills\\a-share-daily-update\\SKILL.md',
    name: 'a-share-daily-update',
    description: 'Standardizes daily updates for the local stock dataset in MarketData folder.',
    source: 'codex-user',
    parseStatus: 'parsed',
    modifiedAt: '2026-05-18T12:52:03Z',
  },
  {
    path: 'C:\\Users\\12925\\.codex\\skills\\pdf-analysis-core\\SKILL.md',
    name: 'pdf-analysis-core',
    description: 'High-fidelity reading and processing tool for financial PDF documents.',
    source: 'codex-user',
    parseStatus: 'parsed',
    modifiedAt: '2026-05-17T10:00:00Z',
  },
  {
    path: 'C:\\Users\\12925\\.codex\\skills\\playwright-scrapper\\SKILL.md',
    name: 'playwright-scrapper',
    description: 'Automated browser testing and data extraction logic for complex SPA.',
    source: 'codex-user',
    parseStatus: 'parsed',
    modifiedAt: '2026-05-17T09:30:00Z',
  },
  {
    path: 'C:\\Users\\12925\\.codex\\skills\\serenity-stock-analysis\\SKILL.md',
    name: 'serenity-stock-analysis',
    description: 'Algorithmic engine for multi-factor stock screening and analysis.',
    source: 'codex-user',
    parseStatus: 'parsed',
    modifiedAt: '2026-05-16T11:15:00Z',
  },
  {
    path: 'C:\\Users\\12925\\.agents\\skills\\lark-approval-bot\\SKILL.md',
    name: 'lark-approval-bot',
    description: 'Lark approval API integration for automated workflow handling.',
    source: 'agents-user',
    parseStatus: 'parsed',
    modifiedAt: '2026-05-15T08:20:00Z',
  },
  {
    path: 'C:\\Users\\12925\\.codex\\plugins\\cache\\browser\\skills\\control-in-app-browser\\SKILL.md',
    name: 'browser-control',
    description: 'Open, navigate, inspect, test, and screenshot local web targets.',
    source: 'plugin-cache',
    parseStatus: 'parsed',
    modifiedAt: '2026-05-14T07:00:00Z',
  },
];

const stitchDemoSkills: SkillSummary[] = Array.from({ length: 66 }, (_, index) => {
  const baseSkill = stitchDemoBaseSkills[index % stitchDemoBaseSkills.length];

  if (index < stitchDemoBaseSkills.length) {
    return baseSkill;
  }

  const suffix = String(index + 1).padStart(2, '0');
  return {
    ...baseSkill,
    path: baseSkill.path.replace('\\SKILL.md', `-${suffix}\\SKILL.md`),
    name: `${baseSkill.name}-${suffix}`,
    modifiedAt: baseSkill.modifiedAt,
  };
});

const stitchDemoDetails: Record<string, SkillDetail> = {
  [stitchDemoBaseSkills[0].path]: {
    ...stitchDemoBaseSkills[0],
    markdown:
      '---\nname: a-share-daily-update\ndescription: Standardizes daily updates for the local stock dataset in MarketData folder.\n---\n\n# A-Share Daily Update\n\nThis skill standardizes daily updates for the local stock dataset in `D:\\Quant\\MarketData`.\n\n## When To Use\nUse this skill when the request includes any of:\n- Update all A-share CSV files to a target trading date\n- Rename files to `Ticker_Name.csv` format\n- Replace old dated folders\n- Run mandatory two-subagent verification after update\n\n## Required Inputs\n- Dataset parent directory: `D:\\Quant\\MarketData`\n- Workspace scripts: `D:\\Codex\\Internal`\n- Target date: `Default: Current Shanghai Date`\n\n## Source Strategy\nUse hybrid sources for maximum reliability:\n- `baostock` for price-volume daily aggregates.\n- `Sina Finance` for real-time 60-min K-line checks.',
    bodyMarkdown:
      '# A-Share Daily Update\n\nThis skill standardizes daily updates for the local stock dataset in `D:\\Quant\\MarketData`.\n\n## When To Use\nUse this skill when the request includes any of:\n- Update all A-share CSV files to a target trading date\n- Rename files to `Ticker_Name.csv` format\n- Replace old dated folders\n- Run mandatory two-subagent verification after update\n\n## Required Inputs\n- Dataset parent directory: `D:\\Quant\\MarketData`\n- Workspace scripts: `D:\\Codex\\Internal`\n- Target date: `Default: Current Shanghai Date`\n\n## Source Strategy\nUse hybrid sources for maximum reliability:\n- `baostock` for price-volume daily aggregates.\n- `Sina Finance` for real-time 60-min K-line checks.',
    rawContent:
      '---\nname: a-share-daily-update\ndescription: Standardizes daily updates for the local stock dataset in MarketData folder.\n---\n\n# A-Share Daily Update',
    frontmatter: {
      description: 'Standardizes daily updates for the local stock dataset in MarketData folder.',
      name: 'a-share-daily-update',
    },
  },
};

function isTauriUnavailable(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);

  return message.includes('invoke') || message.includes('__TAURI__') || message.includes('not available');
}

function getStitchDemoDetail(skill: SkillSummary): SkillDetail {
  return (
    stitchDemoDetails[skill.path] ?? {
      ...skill,
      markdown: `---\nname: ${skill.name}\ndescription: ${skill.description}\n---\n\n# ${skill.name}\n\n${skill.description}\n\n## Workflow\n- Inspect local context\n- Apply the skill instructions\n- Verify output before completion`,
      bodyMarkdown: `# ${skill.name}\n\n${skill.description}\n\n## Workflow\n- Inspect local context\n- Apply the skill instructions\n- Verify output before completion`,
      rawContent: `---\nname: ${skill.name}\ndescription: ${skill.description}\n---\n\n# ${skill.name}`,
      frontmatter: {
        description: skill.description,
        name: skill.name,
      },
    }
  );
}

function getSkillSearchText(skill: SkillSummary) {
  return `${skill.name} ${skill.description} ${skill.path}`.toLocaleLowerCase();
}

function filterSkills(skills: SkillSummary[], query: string) {
  const normalizedQuery = query.trim().toLocaleLowerCase();

  return skills.filter((skill) => {
    const matchesSearch = normalizedQuery.length === 0 || getSkillSearchText(skill).includes(normalizedQuery);

    return matchesSearch;
  });
}

function MaterialIcon({ name, size = 18 }: { name: string; size?: number }) {
  return (
    <span aria-hidden="true" className="material-symbols-outlined app-icon" style={{ fontSize: `${size}px` }}>
      {name}
    </span>
  );
}

function getSkillIcon(skill: SkillSummary) {
  const text = getSkillSearchText(skill);

  if (text.includes('pdf')) {
    return 'picture_as_pdf';
  }

  if (text.includes('browser') || text.includes('playwright') || text.includes('web')) {
    return 'open_in_browser';
  }

  if (text.includes('stock') || text.includes('share') || text.includes('finance') || text.includes('量化')) {
    return 'monitoring';
  }

  if (text.includes('lark') || text.includes('message') || text.includes('chat')) {
    return 'chat_bubble';
  }

  return 'schema';
}

function getSourceCode(source: SkillSource) {
  if (source === 'agents-user') {
    return 'AGENTS';
  }

  if (source === 'plugin-cache') {
    return 'PLUGIN';
  }

  if (source === 'custom') {
    return 'CUSTOM';
  }

  if (source === 'system') {
    return 'SYSTEM';
  }

  return 'CODEX';
}

function getSkillCategories(skill: SkillSummary) {
  const text = getSkillSearchText(skill);
  const categories: CategoryDefinition[] = [];

  if (text.includes('stock') || text.includes('share') || text.includes('finance') || text.includes('量化')) {
    categories.push(categoryDefaults.finance);
  }

  if (text.includes('sheet') || text.includes('csv') || text.includes('table') || text.includes('data')) {
    categories.push(categoryDefaults.data);
  }

  if (text.includes('doc') || text.includes('pdf') || text.includes('write') || text.includes('mail')) {
    categories.push(categoryDefaults.writing);
  }

  return categories.length > 0 ? categories : [categoryDefaults.default];
}

function getInitialCategoryColors(): CategoryColorMap {
  return {
    data: categoryDefaults.data.color,
    default: categoryDefaults.default.color,
    finance: categoryDefaults.finance.color,
    writing: categoryDefaults.writing.color,
  };
}

function getCategoryStyle(category: CategoryDefinition, categoryColors: CategoryColorMap): CSSProperties {
  return { '--category-color': categoryColors[category.id] ?? category.color } as CSSProperties;
}

function getTagStyle(color: string): CSSProperties {
  return { '--tag-color': color } as CSSProperties;
}

function normalizeSelectableLanguage(languageValue: AppSettings['language']): AppSettings['language'] {
  return languageValue === 'system' ? 'zh-CN' : languageValue;
}

function getSourceDotClass(source: SkillSource) {
  return `source-dot source-dot-${source.replace(/[^a-z]/g, '-')}`;
}

function SourceNavIcon({ name }: { name: SourceIconName }) {
  const iconNames: Record<SourceIconName, string> = {
    all: 'list_alt',
    data: 'table_chart',
    default: 'extension',
    finance: 'monitoring',
    tag: 'label',
    writing: 'edit_note',
  };

  return (
    <span aria-hidden="true" className="material-symbols-outlined source-nav-icon">
      {iconNames[name]}
    </span>
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
  const [skillViewMode, setSkillViewMode] = useState<SkillViewMode>('cards');
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
  const [activeCategoryId, setActiveCategoryId] = useState<CategoryId | null>(null);
  const [activeTagLabel, setActiveTagLabel] = useState<string | null>(null);
  const [categoryColors, setCategoryColors] = useState<CategoryColorMap>(() => getInitialCategoryColors());
  const [categoryContextMenu, setCategoryContextMenu] = useState<CategoryContextMenu | null>(null);
  const [skillTagContextMenu, setSkillTagContextMenu] = useState<SkillTagContextMenu | null>(null);
  const [skillTags, setSkillTags] = useState<Record<string, CustomSkillTag[]>>({});
  const [tagDraft, setTagDraft] = useState('');
  const [tagColor, setTagColor] = useState(defaultCustomTagColor);

  const selectableLanguageOptions = useMemo(() => languageOptions.filter((option) => option.value !== 'system'), [languageOptions]);
  const visibleLanguage = normalizeSelectableLanguage(language);
  const visibleSettingsLanguage = normalizeSelectableLanguage(settingsDraft.language);
  const categorySidebarLabel = visibleLanguage === 'en-US' ? 'Categories' : '类目';

  const filteredSkills = useMemo(() => {
    const searchMatches = filterSkills(skills, searchQuery);

    if (activeTagLabel) {
      return searchMatches.filter((skill) => skillTags[skill.path]?.some((tag) => tag.label === activeTagLabel));
    }

    if (!activeCategoryId) {
      return searchMatches;
    }

    return searchMatches.filter((skill) =>
      getSkillCategories(skill).some((category) => category.id === activeCategoryId),
    );
  }, [activeCategoryId, activeTagLabel, searchQuery, skillTags, skills]);
  const totalPages = Math.max(1, Math.ceil(filteredSkills.length / skillsPerPage));
  const normalizedCurrentPage = Math.min(currentPage, totalPages);
  const paginatedSkills = useMemo(() => {
    const pageStartIndex = (normalizedCurrentPage - 1) * skillsPerPage;
    return filteredSkills.slice(pageStartIndex, pageStartIndex + skillsPerPage);
  }, [filteredSkills, normalizedCurrentPage]);

  const categoryCounts = useMemo(() => {
    const counts: Record<CategoryId, number> = {
      data: 0,
      default: 0,
      finance: 0,
      writing: 0,
    };

    for (const skill of skills) {
      for (const category of getSkillCategories(skill)) {
        counts[category.id] += 1;
      }
    }

    return counts;
  }, [skills]);

  const customTagCategories = useMemo(() => {
    const tagMap = new Map<string, CustomTagCategory>();

    for (const tags of Object.values(skillTags)) {
      const countedLabels = new Set<string>();

      for (const tag of tags) {
        const label = tag.label.trim();

        if (!label || countedLabels.has(label)) {
          continue;
        }

        countedLabels.add(label);
        const existingTag = tagMap.get(label);
        tagMap.set(label, {
          color: existingTag?.color ?? tag.color,
          count: (existingTag?.count ?? 0) + 1,
          label,
        });
      }
    }

    return Array.from(tagMap.values()).sort((leftTag, rightTag) => leftTag.label.localeCompare(rightTag.label, 'zh-CN'));
  }, [skillTags]);

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
      if (isTauriUnavailable(error)) {
        const demoDetail = getStitchDemoDetail(stitchDemoSkills[0]);
        setSkills(stitchDemoSkills);
        setScanOutcome('success');
        selectedPathRef.current = demoDetail.path;
        setSelectedPath(demoDetail.path);
        syncDetailForm(demoDetail);
        setDetailMode('preview');
        return;
      }

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
    setSettingsDraft({
      ...settings,
      language: normalizeSelectableLanguage(settings.language),
    });
  }, [settings]);

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategoryId, activeTagLabel]);

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
      if (isTauriUnavailable(error) && stitchDemoSkills.some((demoSkill) => demoSkill.path === skill.path)) {
        syncDetailForm(getStitchDemoDetail(skill));
        setDetailMode('preview');
        return;
      }

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

  const openCategoryContextMenu = (event: MouseEvent, categoryId: CategoryId) => {
    event.preventDefault();
    setSkillTagContextMenu(null);
    setCategoryContextMenu({ categoryId, x: event.clientX, y: event.clientY });
  };

  const updateCategoryColor = (categoryId: CategoryId, color: string) => {
    setCategoryColors((currentColors) => ({
      ...currentColors,
      [categoryId]: color,
    }));
    setCategoryContextMenu(null);
  };

  const openSkillTagContextMenu = (event: MouseEvent, path: string) => {
    event.preventDefault();
    setCategoryContextMenu(null);
    setTagDraft('');
    setTagColor(defaultCustomTagColor);
    setSkillTagContextMenu({ path, x: event.clientX, y: event.clientY });
  };

  const addSkillTag = () => {
    const label = tagDraft.trim();

    if (!label || !skillTagContextMenu) {
      return;
    }

    setSkillTags((currentTags) => ({
      ...currentTags,
      [skillTagContextMenu.path]: [...(currentTags[skillTagContextMenu.path] ?? []), { color: tagColor, label }],
    }));
    setSkillTagContextMenu(null);
    setTagDraft('');
    setTagColor(defaultCustomTagColor);
  };

  const saveSettingsDraft = async () => {
    try {
      await saveSettings({
        ...settingsDraft,
        language: normalizeSelectableLanguage(settingsDraft.language),
      });
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
          <div className="global-search-shell">
            <MaterialIcon name="search" />
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
        <div className={`scan-summary-chip command-status scan-summary-${visibleScanOutcome}`} aria-label={t('topBar.scanStatusAria')}>
          <MaterialIcon name={visibleScanOutcome === 'failed' ? 'error' : visibleScanOutcome === 'scanning' ? 'sync' : 'check_circle'} size={16} />
          <span>{`${t('sources.scanState')}: ${t(scanOutcomeLabelKey)}`}</span>
          <strong>{`${t('sources.lastScan')}: ${formattedLastScan ?? t('sources.notScanned')}`}</strong>
        </div>
        <div className="toolbar-actions command-actions">
          <button type="button" className="secondary-action" onClick={() => void scanSkills()}>
            <MaterialIcon name="refresh" />
            {t('actions.rescan')}
          </button>
          <button type="button" className="primary-action" onClick={openCreateSkillDialog}>
            <MaterialIcon name="add" />
            {t('actions.newSkill')}
          </button>
          <label className="locale-switcher">
            <span className="visually-hidden">{t('language.label')}</span>
            <select
              aria-label={t('language.label')}
              value={visibleLanguage}
              onChange={(event) => {
                if (isLanguage(event.target.value)) {
                  updateLanguage(event.target.value);
                }
              }}
            >
              {selectableLanguageOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {t(option.labelKey)}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            className={`icon-action ${showSettings ? 'active-action' : ''}`}
            aria-label={t('actions.settings')}
            onClick={() => setShowSettings((current) => !current)}
          >
            <MaterialIcon name="settings" size={20} />
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
                  value={visibleSettingsLanguage}
                  onChange={(event) => {
                    const nextLanguage = event.currentTarget.value;
                    if (isLanguage(nextLanguage)) {
                      setSettingsDraft((currentSettings) => ({ ...currentSettings, language: nextLanguage }));
                    }
                  }}
                >
                  {selectableLanguageOptions.map((option) => (
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
        <aside className="panel sidebar fluid-sidebar-panel" aria-label={categorySidebarLabel}>
          <div className="sidebar-kicker">
            <h2>{categorySidebarLabel}</h2>
            <p>{`${skills.length} Total Skills`}</p>
          </div>
          <nav aria-label={categorySidebarLabel}>
            {categoryNavItems.map((item) => {
              const label = item.category ? item.category.label : t(item.labelKey ?? 'sources.allSkills');
              const count = item.category ? categoryCounts[item.category.id] : skills.length;
              const isActive = item.category
                ? activeTagLabel === null && activeCategoryId === item.category.id
                : activeCategoryId === null && activeTagLabel === null;

              return (
                <button
                  key={item.category?.id ?? 'all'}
                  type="button"
                  aria-label={`${label} ${count}`}
                  className={`source-nav-button category-nav-button ${isActive ? 'active' : ''}`}
                  style={item.category ? getCategoryStyle(item.category, categoryColors) : undefined}
                  onClick={() => {
                    setActiveCategoryId(item.category?.id ?? null);
                    setActiveTagLabel(null);
                    setCurrentPage(1);
                  }}
                  onContextMenu={(event) => {
                    if (item.category) {
                      openCategoryContextMenu(event, item.category.id);
                    }
                  }}
                >
                  <SourceNavIcon name={item.icon} />
                  <span className="source-nav-label">{label}</span>
                  <span className="source-nav-count">{count}</span>
                </button>
              );
            })}
            {customTagCategories.map((tag) => {
              const isActive = activeTagLabel === tag.label;

              return (
                <button
                  key={`tag-${tag.label}`}
                  type="button"
                  aria-label={`${tag.label} ${tag.count}`}
                  className={`source-nav-button category-nav-button custom-tag-nav-button ${isActive ? 'active' : ''}`}
                  style={{ '--category-color': tag.color } as CSSProperties}
                  onClick={() => {
                    setActiveCategoryId(null);
                    setActiveTagLabel(tag.label);
                    setCurrentPage(1);
                  }}
                >
                  <SourceNavIcon name="tag" />
                  <span className="source-nav-label">{tag.label}</span>
                  <span className="source-nav-count">{tag.count}</span>
                </button>
              );
            })}
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

          <div className="sidebar-footer-status" aria-hidden="true">
            <span />
            <strong>Online</strong>
          </div>

        </aside>

        <section className="panel list-panel fluid-list-panel" aria-label={t('skills.title')}>
          <div className="section-heading">
            <div>
              <h2>{t('skills.title')}</h2>
              <p>{`Showing ${filteredSkills.length} ${t('skills.countUnit')}`}</p>
              <span className="visually-hidden">{`${filteredSkills.length} ${t('skills.countUnit')}`}</span>
            </div>
            <div className="list-toolbar">
              <div className="view-switcher" role="tablist" aria-label="Skill view">
                <button
                  type="button"
                  role="tab"
                  aria-selected={skillViewMode === 'list'}
                  className={skillViewMode === 'list' ? 'active' : undefined}
                  title="List View"
                  onClick={() => setSkillViewMode('list')}
                >
                  <MaterialIcon name="format_list_bulleted" />
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={skillViewMode === 'cards'}
                  className={skillViewMode === 'cards' ? 'active' : undefined}
                  title="Card View"
                  onClick={() => setSkillViewMode('cards')}
                >
                  <MaterialIcon name="grid_view" />
                </button>
              </div>
              <button type="button" className="icon-button" aria-label="Sort skills">
                <MaterialIcon name="sort" />
              </button>
              <button type="button" className="icon-button" aria-label="Filter skills">
                <MaterialIcon name="filter_list" />
              </button>
            </div>
          </div>
          {listState === 'ready' ? (
            <div className="skill-list-scroll fluid-table-region">
              <div className={skillViewMode === 'cards' ? 'skill-card-grid active' : 'skill-card-grid'}>
                {paginatedSkills.map((skill) => {
                  const selected = selectedPath === skill.path;
                  const customTags = skillTags[skill.path] ?? [];
                  return (
                    <button
                      key={skill.path}
                      type="button"
                      className={`skill-card ${selected ? 'selected-card' : ''}`}
                      aria-pressed={selected}
                      onClick={() => void selectSkill(skill)}
                      onContextMenu={(event) => openSkillTagContextMenu(event, skill.path)}
                    >
                      <span className="skill-card-topline">
                        <span className="skill-card-icon">
                          <MaterialIcon name={getSkillIcon(skill)} size={24} />
                        </span>
                        <span className={`source-code source-code-${skill.source.replace(/[^a-z]/g, '-')}`}>{getSourceCode(skill.source)}</span>
                      </span>
                      <span className="skill-card-body">
                        <strong>{skill.name}</strong>
                        <span className="skill-description">{skill.description}</span>
                      </span>
                      <span className="skill-card-tags">
                        {getSkillCategories(skill).map((category) => (
                          <span
                            key={`${skill.path}-${category.id}`}
                            className={`category-chip ${category.className}`}
                            data-testid={`skill-category-${skill.path}-${category.id}`}
                            style={getCategoryStyle(category, categoryColors)}
                            aria-hidden="true"
                          >
                            {category.label}
                          </span>
                        ))}
                        {customTags.map((tag, index) => (
                          <span
                            key={`${skill.path}-${tag.label}-${index}`}
                            className="category-chip custom-skill-tag"
                            style={getTagStyle(tag.color)}
                            aria-hidden="true"
                          >
                            {tag.label}
                          </span>
                        ))}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className={skillViewMode === 'list' ? 'skill-table-wrap fluid-table-region active' : 'skill-table-wrap fluid-table-region semantic-table'}>
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
                        onContextMenu={(event) => openSkillTagContextMenu(event, skill.path)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            void selectSkill(skill);
                          }
                        }}
                      >
                        <td>
                          <span className="table-skill-name">
                            <span className="table-skill-icon">
                              <MaterialIcon name={getSkillIcon(skill)} />
                            </span>
                            <strong>{skill.name}</strong>
                            <span className="source-code compact">{getSourceCode(skill.source)}</span>
                          </span>
                        </td>
                        <td>
                          <span className="status-pill">{t(sourceLabelKeys[skill.source])}</span>
                        </td>
                        <td>
                          {skillViewMode === 'list' ? <span className="skill-description">{skill.description}</span> : null}
                        </td>
                        <td>{formatDateTime(skill.modifiedAt, locale) ?? t('skills.modifiedUnknown')}</td>
                        <td>
                          <PathButton path={skill.path} onOpen={openSkillFolder} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="pagination-controls" aria-label={t('pagination.label')}>
                <span>
                  {`Showing ${paginatedSkills.length === 0 ? 0 : (normalizedCurrentPage - 1) * skillsPerPage + 1}-${Math.min(
                    normalizedCurrentPage * skillsPerPage,
                    filteredSkills.length,
                  )} of ${filteredSkills.length} ${t('skills.countUnit')}`}
                </span>
                <div className="pagination-stepper">
                  <span>{t('pagination.status', { currentPage: String(normalizedCurrentPage), totalPages: String(totalPages) })}</span>
                <button
                  type="button"
                  disabled={normalizedCurrentPage === 1}
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                >
                    <MaterialIcon name="chevron_left" />
                  {t('pagination.previous')}
                </button>
                <button
                  type="button"
                  disabled={normalizedCurrentPage === totalPages}
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                >
                  {t('pagination.next')}
                    <MaterialIcon name="chevron_right" />
                </button>
                </div>
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
          <div className="detail-panel-heading">
            <div className="detail-title-row">
              <span className="detail-eyebrow">{t('details.title')}</span>
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
            <div className="detail-content detail-content-selected">
              <section className="detail-hero-section" aria-label={t('details.metadata')}>
                <label className="field-stack detail-name-field title-field">
                  <span>{t('details.name')}</span>
                  <input value={detailName} onChange={(event) => setDetailName(event.target.value)} />
                </label>
                <div className="detail-tag-row">
                  {getSkillCategories(selectedDetail).map((category) => (
                    <span key={`${selectedDetail.path}-${category.label}`} className={`category-chip ${category.className}`}>
                      {category.label}
                    </span>
                  ))}
                  <button type="button" className="tag-edit-button" aria-label={t('details.tags')}>
                    <MaterialIcon name="edit" size={14} />
                  </button>
                </div>
                <dl className="detail-meta-strip">
                  <div>
                    <dt>{t('details.source')}</dt>
                    <dd>
                      <span className={getSourceDotClass(selectedDetail.source)} />
                      {t(sourceLabelKeys[selectedDetail.source])}
                    </dd>
                  </div>
                  <div>
                    <dt>{t('details.modified')}</dt>
                    <dd>{formatDateTime(selectedDetail.modifiedAt, locale) ?? t('skills.modifiedUnknown')}</dd>
                  </div>
                  <div className="detail-path-meta">
                    <dt>{t('details.path')}</dt>
                    <dd>
                      <span className="detail-path-shell">
                        <PathButton className="path-button path-placeholder" path={selectedDetail.path} onOpen={openSkillFolder} />
                        <button type="button" className="copy-path-button" aria-label={t('details.path')} onClick={() => void openSkillFolder(selectedDetail.path)}>
                          <MaterialIcon name="folder_open" size={16} />
                        </button>
                      </span>
                    </dd>
                  </div>
                </dl>
              </section>

              <section className="detail-description-section">
                {detailMode === 'preview' ? (
                  <div className="field-stack">
                    <span>{t('details.description')}</span>
                    <p className="detail-description-preview">{detailDescription || t('details.placeholder')}</p>
                  </div>
                ) : (
                  <label className="field-stack">
                    <span>{t('details.description')}</span>
                    <textarea
                      className="detail-description-input"
                      value={detailDescription}
                      onChange={(event) => setDetailDescription(event.target.value)}
                    />
                  </label>
                )}
              </section>
              <section className="detail-markdown-section detail-body-section fluid-markdown-region">
                {detailMode === 'preview' ? (
                  <pre className="markdown-preview markdown-content">{detailMarkdown.trim() || t('details.markdownEmpty')}</pre>
                ) : (
                  <label className="field-stack detail-markdown-field">
                    <span>{t('details.markdownBody')}</span>
                    <textarea
                      className="detail-markdown-input fluid-markdown-input"
                      value={detailMarkdown}
                      onChange={(event) => setDetailMarkdown(event.target.value)}
                    />
                  </label>
                )}
              </section>
            </div>
          ) : (
            <div className="detail-content detail-content-empty">
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
            </div>
          )}
          <div className="detail-actions detail-actions-pinned">
            <button type="button" className="primary-action" disabled={!selectedDetail || isSavingDetail} onClick={() => void saveSelectedSkill()}>
              <MaterialIcon name="save" />
              {t('actions.save')}
            </button>
            <button
              type="button"
              className="secondary-action"
              disabled={!selectedDetail}
              onClick={() => {
                setDeleteConfirmPath(selectedDetail?.path ?? null);
                setShowDeleteConfirm(true);
              }}
            >
              <MaterialIcon name="delete" />
              {t('actions.delete')}
            </button>
            <button type="button" className="secondary-action" disabled={!selectedDetail} onClick={() => void openSelectedSkillFolder()}>
              <MaterialIcon name="folder_open" />
              {selectedDetail ? t('actions.openFolder') : t('actions.openPath')}
            </button>
          </div>
        </aside>
      </section>
      {categoryContextMenu ? (
        <div
          className="context-menu color-context-menu"
          role="menu"
          style={{ left: categoryContextMenu.x, top: categoryContextMenu.y }}
        >
          <strong>{categoryDefaults[categoryContextMenu.categoryId].label}</strong>
          {colorChoices.map((choice) => (
            <button
              key={choice.color}
              type="button"
              aria-label={`将 ${categoryDefaults[categoryContextMenu.categoryId].label} 设置为${choice.label}`}
              onClick={() => updateCategoryColor(categoryContextMenu.categoryId, choice.color)}
            >
              <span className="color-swatch" style={{ background: choice.color }} />
              {choice.label}
            </button>
          ))}
        </div>
      ) : null}
      {skillTagContextMenu ? (
        <div
          className="context-menu tag-context-menu"
          role="dialog"
          aria-label="添加标签"
          style={{ left: skillTagContextMenu.x, top: skillTagContextMenu.y }}
        >
          <label className="field-stack">
            <span>标签名称</span>
            <input aria-label="标签名称" value={tagDraft} onChange={(event) => setTagDraft(event.target.value)} />
          </label>
          <div className="tag-color-picker" aria-label="标签颜色">
            {colorChoices.map((choice) => (
              <button
                key={choice.color}
                type="button"
                className={tagColor === choice.color ? 'active-color' : undefined}
                aria-label={`标签颜色 ${choice.label}`}
                onClick={() => setTagColor(choice.color)}
              >
                <span className="color-swatch" style={{ background: choice.color }} />
              </button>
            ))}
          </div>
          <div className="context-menu-actions">
            <button type="button" onClick={() => setSkillTagContextMenu(null)}>
              取消
            </button>
            <button type="button" className="primary-action" onClick={addSkillTag}>
              添加标签
            </button>
          </div>
        </div>
      ) : null}
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
