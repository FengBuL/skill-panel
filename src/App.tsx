import { invoke } from '@tauri-apps/api/core';
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type DragEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
  type RefObject,
  type UIEvent,
} from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { isLanguage, useI18nRuntime, type TranslationKey } from './i18n';
import {
  type AppSettings,
  type CustomCategorySetting,
  type ParseStatus,
  type SkillDetail,
  type SkillSource,
  type SkillSummary,
  type WritableSkillSource,
} from './types/skill';

type SourceIconName = 'all' | 'tag' | CategoryId | string;
type DetailErrorTitleKey = 'details.errorTitle' | 'details.actionErrorTitle';
type ScanOutcome = 'idle' | 'success' | 'partial-success' | 'failed';
type VisibleScanOutcome = 'not-scanned' | 'scanning' | Exclude<ScanOutcome, 'idle'>;
type SkillViewMode = 'cards' | 'list';
type BuiltInCategoryId = 'data' | 'default' | 'finance' | 'writing';
type CategoryId = string;
type GovernanceFilter = 'read-only-plugins' | 'user-editable';
type SortMode = 'original' | 'name' | 'modified';
type CategoryDefinition = {
  className: string;
  color: string;
  icon?: string;
  id: CategoryId;
  label: string;
  labelKey?: TranslationKey;
};
type ColorChoice = {
  color: string;
  label: string;
  labelKey?: TranslationKey;
};
type IconChoice = {
  icon: string;
  labelKey: TranslationKey;
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
type PointerCardDrag = {
  categoryId: CategoryId;
  hasMoved: boolean;
  path: string;
  startX: number;
  startY: number;
};
type CustomSkillTag = {
  color: string;
  label: string;
};
type CustomTagCategory = CustomSkillTag & {
  count: number;
};
const tagCategoryPrefix = 'tag:';
type CategoryColorMap = Record<CategoryId, string>;
type CategoryIconMap = Record<CategoryId, string>;
type CategoryLabelMap = Record<CategoryId, string>;
type CategorySkillOrderMap = Partial<Record<CategoryId, string[]>>;
type SkillCardColorMap = Record<string, string>;
type SkillCategoryAssignmentMap = Partial<Record<string, CategoryId[]>>;
type SkillLockMap = Record<string, boolean>;
type CustomCategoryMap = Record<string, CustomCategorySetting>;
type TranslateFn = (key: TranslationKey, replacements?: Record<string, string>) => string;
type CategorySection = {
  category: CategoryDefinition;
  label: string;
  skills: SkillSummary[];
};
type CreateSkillDraft = {
  targetDirectory: string;
  name: string;
  description: string;
  markdown: string;
  source: WritableSkillSource;
};
type EditorWorkspaceMode = 'library' | 'editor';
type EditorDraftKind = 'new' | 'existing' | 'copy';
type SaveCompletionState = 'idle' | 'saved';
type SkillEditorDraft = {
  description: string;
  kind: EditorDraftKind;
  markdown: string;
  name: string;
  path: string | null;
  source: WritableSkillSource;
  sourcePath: string | null;
  targetDirectory: string;
};
type ParsedEditorMarkdown = {
  bodyMarkdown: string;
  description: string;
  name: string;
};
type FrontmatterConflict = {
  markdown: string;
  parsed: ParsedEditorMarkdown;
};

const skillsPerPage = 10;
const defaultDetailPanelWidth = 400;
const minDetailPanelWidth = 320;
const maxDetailPanelWidth = 1080;

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
  source: 'codex-user',
};
const editorDraftStorageKey = 'skill-panel:v3-editor-draft';
const recentEditorStorageKey = 'skill-panel:v3-editor-recent';
const defaultEditorMarkdown =
  '---\nname: new-skill\ndescription: Describe when this skill should be used.\n---\n\n# New Skill\n\n## When To Use\nUse when the user asks for this workflow.\n';
const emptyEditorDraft: SkillEditorDraft = {
  description: 'Describe when this skill should be used.',
  kind: 'new',
  markdown: defaultEditorMarkdown,
  name: 'new-skill',
  path: null,
  source: 'codex-user',
  sourcePath: null,
  targetDirectory: '',
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
const builtInCategoryIds: BuiltInCategoryId[] = ['finance', 'data', 'writing', 'default'];
const categoryDefaults: Record<BuiltInCategoryId, CategoryDefinition> = {
  finance: { id: 'finance', label: 'Finance', labelKey: 'category.finance', className: 'category-finance', color: '#fff4d8' },
  data: { id: 'data', label: 'Data', labelKey: 'category.data', className: 'category-data', color: '#e8f0ff' },
  writing: { id: 'writing', label: 'Writing', labelKey: 'category.writing', className: 'category-writing', color: '#eaf3ff' },
  default: { id: 'default', label: 'Skills', labelKey: 'category.default', className: 'category-default', color: '#eef4ff' },
};
const colorChoices: ColorChoice[] = [
  { label: 'Yellow', labelKey: 'color.yellow', color: '#fff4d8' },
  { label: 'Blue', labelKey: 'color.blue', color: '#e0f2fe' },
  { label: 'Green', labelKey: 'color.green', color: '#dcfce7' },
  { label: 'Purple', labelKey: 'color.purple', color: '#f5e8ff' },
  { label: 'Pink', labelKey: 'color.pink', color: '#ffe4ef' },
];
const defaultCustomTagColor = '#e0f2fe';
const categoryLabelKeys: Record<BuiltInCategoryId, TranslationKey> = {
  data: 'category.data',
  default: 'category.default',
  finance: 'category.finance',
  writing: 'category.writing',
};
const categoryDefaultIcons: Record<BuiltInCategoryId, string> = {
  data: 'table_chart',
  default: 'extension',
  finance: 'monitoring',
  writing: 'edit_note',
};
const skillCardColorChoices: ColorChoice[] = [
  { label: 'Default', labelKey: 'color.default', color: '' },
  { label: 'Red', labelKey: 'color.red', color: '#fee2e2' },
  { label: 'Yellow', labelKey: 'color.yellow', color: '#fef3c7' },
  { label: 'Green', labelKey: 'color.green', color: '#dcfce7' },
  { label: 'Blue', labelKey: 'color.blue', color: '#dbeafe' },
  { label: 'Purple', labelKey: 'color.purple', color: '#ede9fe' },
];
const categoryIconChoices: IconChoice[] = [
  { icon: 'monitoring', labelKey: 'icon.chart' },
  { icon: 'table_chart', labelKey: 'icon.table' },
  { icon: 'edit_note', labelKey: 'icon.write' },
  { icon: 'extension', labelKey: 'icon.skill' },
  { icon: 'star', labelKey: 'icon.star' },
  { icon: 'bolt', labelKey: 'icon.bolt' },
  { icon: 'folder_open', labelKey: 'icon.folder' },
  { icon: 'psychology', labelKey: 'icon.brain' },
];

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

function getInferredSkillCategories(skill: SkillSummary) {
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

function getInitialCategoryColors(customCategories: CustomCategoryMap = {}): CategoryColorMap {
  return {
    ...Object.fromEntries(Object.entries(customCategories).map(([categoryId, category]) => [categoryId, category.color])),
    data: categoryDefaults.data.color,
    default: categoryDefaults.default.color,
    finance: categoryDefaults.finance.color,
    writing: categoryDefaults.writing.color,
  };
}

function getInitialCategoryLabels(customCategories: CustomCategoryMap = {}): CategoryLabelMap {
  return {
    ...Object.fromEntries(Object.entries(customCategories).map(([categoryId, category]) => [categoryId, category.label])),
    data: '',
    default: '',
    finance: '',
    writing: '',
  };
}

function isBuiltInCategoryId(value: string): value is BuiltInCategoryId {
  return Object.prototype.hasOwnProperty.call(categoryDefaults, value);
}

function normalizeCustomCategories(categories: AppSettings['customCategories']): CustomCategoryMap {
  const normalizedCategories: CustomCategoryMap = {};

  for (const [categoryId, category] of Object.entries(categories ?? {})) {
    if (
      categoryId &&
      typeof category.label === 'string' &&
      category.label.trim() &&
      typeof category.color === 'string' &&
      category.color.trim() &&
      typeof category.icon === 'string' &&
      category.icon.trim()
    ) {
      normalizedCategories[categoryId] = {
        color: category.color.trim(),
        icon: category.icon.trim(),
        label: category.label.trim(),
      };
    }
  }

  return normalizedCategories;
}

function normalizeCategoryColors(colors: AppSettings['categoryColors'], customCategories: CustomCategoryMap = {}): CategoryColorMap {
  const normalizedColors = getInitialCategoryColors(customCategories);

  for (const [categoryId, color] of Object.entries(colors ?? {})) {
    if (categoryId && typeof color === 'string' && color.trim()) {
      normalizedColors[categoryId] = color;
    }
  }

  return normalizedColors;
}

function normalizeCategoryLabels(labels: AppSettings['categoryLabels'], customCategories: CustomCategoryMap = {}): CategoryLabelMap {
  const normalizedLabels = getInitialCategoryLabels(customCategories);

  for (const [categoryId, label] of Object.entries(labels ?? {})) {
    if (categoryId && typeof label === 'string' && label.trim()) {
      normalizedLabels[categoryId] = label.trim();
    }
  }

  return normalizedLabels;
}

function getPersistedCategoryLabels(labels: CategoryLabelMap, customCategories: CustomCategoryMap): Record<string, string> {
  const defaultLabels = getInitialCategoryLabels(customCategories);
  const persistedLabels: Record<string, string> = {};

  for (const categoryId of Object.keys(labels)) {
    if (labels[categoryId] !== defaultLabels[categoryId]) {
      persistedLabels[categoryId] = labels[categoryId];
    }
  }

  return persistedLabels;
}

function getInitialCategoryIcons(customCategories: CustomCategoryMap = {}): CategoryIconMap {
  return {
    ...Object.fromEntries(Object.entries(customCategories).map(([categoryId, category]) => [categoryId, category.icon])),
    ...categoryDefaultIcons,
  };
}

function normalizeCategoryIcons(icons: AppSettings['categoryIcons'], customCategories: CustomCategoryMap = {}): CategoryIconMap {
  const normalizedIcons = getInitialCategoryIcons(customCategories);

  for (const [categoryId, icon] of Object.entries(icons ?? {})) {
    if (categoryId && typeof icon === 'string' && icon.trim()) {
      normalizedIcons[categoryId] = icon.trim();
    }
  }

  return normalizedIcons;
}

function getPersistedCategoryIcons(icons: CategoryIconMap, customCategories: CustomCategoryMap): Record<string, string> {
  const defaultIcons = getInitialCategoryIcons(customCategories);
  const persistedIcons: Record<string, string> = {};

  for (const categoryId of Object.keys(icons)) {
    if (icons[categoryId] !== defaultIcons[categoryId]) {
      persistedIcons[categoryId] = icons[categoryId];
    }
  }

  return persistedIcons;
}

function normalizeSkillCardColors(colors: AppSettings['skillCardColors']): SkillCardColorMap {
  const normalizedColors: SkillCardColorMap = {};

  for (const [path, color] of Object.entries(colors ?? {})) {
    if (path && typeof color === 'string' && color.trim()) {
      normalizedColors[path] = color.trim();
    }
  }

  return normalizedColors;
}

function normalizeSkillCategoryAssignments(
  assignments: AppSettings['skillCategoryAssignments'],
  overrides: AppSettings['skillCategoryOverrides'],
): SkillCategoryAssignmentMap {
  const normalizedAssignments: SkillCategoryAssignmentMap = {};

  for (const [path, categoryIds] of Object.entries(assignments ?? {})) {
    if (!path || !Array.isArray(categoryIds)) {
      continue;
    }

    const cleanCategoryIds = Array.from(
      new Set(
        categoryIds
          .filter((categoryId): categoryId is string => typeof categoryId === 'string' && categoryId.trim().length > 0)
          .map((categoryId) => categoryId.trim()),
      ),
    );
    if (cleanCategoryIds.length > 0) {
      normalizedAssignments[path] = cleanCategoryIds;
    }
  }

  for (const [path, categoryId] of Object.entries(overrides ?? {})) {
    if (path && !normalizedAssignments[path] && typeof categoryId === 'string' && categoryId.trim()) {
      normalizedAssignments[path] = [categoryId.trim()];
    }
  }

  return normalizedAssignments;
}

function getPersistedSkillCategoryAssignments(assignments: SkillCategoryAssignmentMap): Record<string, string[]> {
  const persistedAssignments: Record<string, string[]> = {};

  for (const [path, categoryIds] of Object.entries(assignments)) {
    if (path && Array.isArray(categoryIds) && categoryIds.length > 0) {
      persistedAssignments[path] = categoryIds;
    }
  }

  return persistedAssignments;
}

function normalizeSkillTags(tagsBySkill: AppSettings['skillTags']): Record<string, CustomSkillTag[]> {
  const normalizedTags: Record<string, CustomSkillTag[]> = {};

  for (const [path, tags] of Object.entries(tagsBySkill ?? {})) {
    if (!path || !Array.isArray(tags)) {
      continue;
    }

    const cleanTags = tags
      .filter((tag) => typeof tag.label === 'string' && tag.label.trim() && typeof tag.color === 'string' && tag.color.trim())
      .map((tag) => ({ color: tag.color, label: tag.label.trim() }));

    if (cleanTags.length > 0) {
      normalizedTags[path] = cleanTags;
    }
  }

  return normalizedTags;
}

function normalizeSkillLocks(locksBySkill: AppSettings['skillLocks']): SkillLockMap {
  return Object.fromEntries(Object.entries(locksBySkill ?? {}).filter(([path, locked]) => Boolean(path.trim()) && locked === true));
}

function normalizeCategorySkillOrder(orderByCategory: AppSettings['categorySkillOrder']): CategorySkillOrderMap {
  const normalizedOrder: CategorySkillOrderMap = {};

  for (const [categoryId, order] of Object.entries(orderByCategory ?? {})) {
    if (!categoryId || !Array.isArray(order)) {
      continue;
    }

    const cleanOrder = order.filter((path): path is string => typeof path === 'string' && path.trim().length > 0);
    if (cleanOrder.length > 0) {
      normalizedOrder[categoryId] = Array.from(new Set(cleanOrder));
    }
  }

  return normalizedOrder;
}

function getPersistedCategorySkillOrder(orderByCategory: CategorySkillOrderMap): Record<string, string[]> {
  const persistedOrder: Record<string, string[]> = {};

  for (const [categoryId, order] of Object.entries(orderByCategory)) {
    if (categoryId && Array.isArray(order) && order.length > 0) {
      persistedOrder[categoryId] = order;
    }
  }

  return persistedOrder;
}

function clampDetailPanelWidth(width: number) {
  return Math.min(maxDetailPanelWidth, Math.max(minDetailPanelWidth, Math.round(width)));
}

function normalizeDetailPanelWidth(width: AppSettings['detailPanelWidth']) {
  return typeof width === 'number' && Number.isFinite(width) ? clampDetailPanelWidth(width) : defaultDetailPanelWidth;
}

function normalizeSkillViewMode(viewMode: AppSettings['skillViewMode']): SkillViewMode {
  return viewMode === 'list' ? 'list' : 'cards';
}

function getPersistedDetailPanelWidth(width: number, persistedWidth: AppSettings['detailPanelWidth']) {
  if (width === defaultDetailPanelWidth && persistedWidth === undefined) {
    return undefined;
  }

  return width;
}

function applyCategorySkillOrder(skills: SkillSummary[], order: string[] | undefined) {
  if (!order || order.length === 0) {
    return skills;
  }

  const skillByPath = new Map(skills.map((skill) => [skill.path, skill]));
  const orderedSkills = order.flatMap((path) => {
    const skill = skillByPath.get(path);
    if (!skill) {
      return [];
    }
    skillByPath.delete(path);
    return [skill];
  });

  return [...orderedSkills, ...skills.filter((skill) => skillByPath.has(skill.path))];
}

function buildCategoryDefinition(
  categoryId: CategoryId,
  categoryLabels: CategoryLabelMap,
  categoryColors: CategoryColorMap,
  categoryIcons: CategoryIconMap,
): CategoryDefinition {
  if (isBuiltInCategoryId(categoryId)) {
    return categoryDefaults[categoryId];
  }

  return {
    className: 'category-custom',
    color: categoryColors[categoryId] ?? defaultCustomTagColor,
    icon: categoryIcons[categoryId] ?? 'label',
    id: categoryId,
    label: categoryLabels[categoryId] ?? categoryId,
  };
}

function buildTagCategoryDefinition(tag: CustomSkillTag): CategoryDefinition {
  return {
    className: 'category-custom',
    color: tag.color,
    icon: 'label',
    id: `${tagCategoryPrefix}${tag.label}`,
    label: tag.label,
  };
}

function getEffectiveSkillCategories(
  skill: SkillSummary,
  skillCategoryAssignments: SkillCategoryAssignmentMap,
  categoryLabels: CategoryLabelMap,
  categoryColors: CategoryColorMap,
  categoryIcons: CategoryIconMap,
) {
  const assignedCategoryIds = skillCategoryAssignments[skill.path];
  if (assignedCategoryIds && assignedCategoryIds.length > 0) {
    return assignedCategoryIds.map((categoryId) => buildCategoryDefinition(categoryId, categoryLabels, categoryColors, categoryIcons));
  }

  return getInferredSkillCategories(skill);
}

function getCategoryStyle(category: CategoryDefinition, categoryColors: CategoryColorMap): CSSProperties {
  return { '--category-color': categoryColors[category.id] ?? category.color } as CSSProperties;
}

function getSkillCardStyle(path: string, skillCardColors: SkillCardColorMap): CSSProperties {
  const cardColor = skillCardColors[path];
  return cardColor ? ({ '--skill-card-color': cardColor } as CSSProperties) : {};
}

function getCategoryIcon(category: CategoryDefinition, categoryIcons: CategoryIconMap) {
  return categoryIcons[category.id] ?? category.icon ?? (isBuiltInCategoryId(category.id) ? categoryDefaultIcons[category.id] : 'label');
}

function getCategoryLabel(category: CategoryDefinition, categoryLabels: CategoryLabelMap, t?: TranslateFn) {
  const customLabel = categoryLabels[category.id];
  return customLabel && customLabel !== getInitialCategoryLabels()[category.id]
    ? customLabel
    : t
      ? category.labelKey && isBuiltInCategoryId(category.id)
        ? t(category.labelKey ?? categoryLabelKeys[category.id])
        : category.label
      : category.label;
}

function getTagStyle(color: string): CSSProperties {
  return { '--tag-color': color } as CSSProperties;
}

function normalizeSelectableLanguage(languageValue: AppSettings['language']): AppSettings['language'] {
  return languageValue === 'system' ? 'zh-CN' : languageValue;
}

function isProtectedLarkSkill(skill: SkillSummary | SkillDetail) {
  const normalizedPath = skill.path.replaceAll('\\', '/').toLocaleLowerCase();
  return normalizedPath.includes('/.agents/skills/lark-') || skill.name.toLocaleLowerCase().startsWith('lark-');
}

function isWritableSkill(skill: SkillSummary | SkillDetail) {
  return !isProtectedLarkSkill(skill) && (skill.source === 'codex-user' || skill.source === 'agents-user' || skill.source === 'custom');
}

function isReadOnlySkill(skill: SkillSummary | SkillDetail) {
  return !isWritableSkill(skill);
}

function canDeleteSkill(skill: SkillSummary | SkillDetail) {
  return isWritableSkill(skill) || isProtectedLarkSkill(skill);
}

function getRiskLevelKey(skill: SkillSummary | SkillDetail): TranslationKey {
  const text = getSkillSearchText(skill);
  if (text.includes('delete') || text.includes('payment') || text.includes('finance') || text.includes('stock')) {
    return 'risk.high';
  }
  if (text.includes('browser') || text.includes('web') || text.includes('message') || text.includes('mail')) {
    return 'risk.medium';
  }
  return 'risk.low';
}

function getLikelyTrigger(skill: SkillSummary | SkillDetail, t: TranslateFn) {
  const description = skill.description.trim();
  return description
    ? t('insights.useWhen', { description })
    : t('insights.requestMatches', { name: skill.name });
}

function getSkillDependencies(detail: SkillDetail, t: TranslateFn) {
  const markdown = detail.bodyMarkdown.toLowerCase();
  const dependencies = new Set<string>();
  if (markdown.includes('browser') || markdown.includes('playwright') || detail.name.includes('browser')) {
    dependencies.add(t('dependency.browserAutomation'));
  }
  if (markdown.includes('shell') || markdown.includes('powershell') || markdown.includes('command')) {
    dependencies.add(t('dependency.localCommands'));
  }
  if (markdown.includes('api') || markdown.includes('http')) {
    dependencies.add(t('dependency.externalApi'));
  }
  return dependencies.size > 0 ? Array.from(dependencies) : [t('dependency.none')];
}

function getSkillLintItems(detail: SkillDetail, t: TranslateFn) {
  const items = [];
  items.push(detail.description.trim() ? t('lint.descriptionPresent') : t('lint.descriptionMissing'));
  items.push(/^#/m.test(detail.bodyMarkdown) ? t('lint.markdownHeadingPresent') : t('lint.markdownHeadingMissing'));
  items.push(/when to use|use when|trigger/i.test(detail.bodyMarkdown) ? t('lint.triggerFound') : t('lint.triggerMissing'));
  items.push(isWritableSkill(detail) ? t('lint.editableUserSkill') : t('lint.protectedSource'));
  return items;
}

function getMarkdownNodeText(value: ReactNode): string {
  if (typeof value === 'string' || typeof value === 'number') {
    return String(value);
  }
  if (Array.isArray(value)) {
    return value.map(getMarkdownNodeText).join('');
  }
  return '';
}

function getMarkdownHeadingId(value: ReactNode) {
  const text = getMarkdownNodeText(value);
  const slug = text
    .toLowerCase()
    .trim()
    .replace(/[`~!@#$%^&*()+=[\]{}\\|;:'",.<>/?]/g, '')
    .replace(/\s+/g, '-');
  return `markdown-heading-${slug || 'section'}`;
}

function MarkdownPreviewBlock({
  ariaLabel,
  emptyText,
  markdown,
  onScroll,
  previewRef,
}: {
  ariaLabel: string;
  emptyText: string;
  markdown: string;
  onScroll?: (event: UIEvent<HTMLDivElement>) => void;
  previewRef?: RefObject<HTMLDivElement | null>;
}) {
  return (
    <div ref={previewRef} className="markdown-preview markdown-content" role="region" aria-label={ariaLabel} onScroll={onScroll}>
      {markdown.trim() ? (
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ node: _node, ...props }) => <h1 id={getMarkdownHeadingId(props.children)} {...props} />,
            h2: ({ node: _node, ...props }) => <h2 id={getMarkdownHeadingId(props.children)} {...props} />,
            h3: ({ node: _node, ...props }) => <h3 id={getMarkdownHeadingId(props.children)} {...props} />,
            h4: ({ node: _node, ...props }) => <h4 id={getMarkdownHeadingId(props.children)} {...props} />,
            h5: ({ node: _node, ...props }) => <h5 id={getMarkdownHeadingId(props.children)} {...props} />,
            h6: ({ node: _node, ...props }) => <h6 id={getMarkdownHeadingId(props.children)} {...props} />,
          }}
        >
          {markdown}
        </ReactMarkdown>
      ) : (
        <p>{emptyText}</p>
      )}
    </div>
  );
}

function getSimpleDiffLines(previousDetail: SkillDetail | null, nextName: string, nextDescription: string, nextMarkdown: string) {
  if (!previousDetail) {
    return [];
  }

  const previous = [previousDetail.name, previousDetail.description, previousDetail.bodyMarkdown];
  const next = [nextName, nextDescription, nextMarkdown];
  const labels = ['name', 'description', 'markdown'];

  return labels.flatMap((label, index) =>
    previous[index] === next[index] ? [] : [`- ${previous[index]}`, `+ ${next[index]}`],
  );
}

function escapeFrontmatterValue(value: string) {
  return JSON.stringify(value);
}

function buildFullSkillMarkdown(name: string, description: string, bodyMarkdown: string) {
  return `---\nname: ${escapeFrontmatterValue(name)}\ndescription: ${escapeFrontmatterValue(description)}\n---\n\n${bodyMarkdown.replace(/^\n+/, '')}`;
}

function buildFullMarkdownFromDetail(detail: SkillDetail) {
  return buildFullSkillMarkdown(detail.name, detail.description, detail.bodyMarkdown);
}

function parseFrontmatterScalar(value: string) {
  const trimmedValue = value.trim();
  if (
    (trimmedValue.startsWith('"') && trimmedValue.endsWith('"')) ||
    (trimmedValue.startsWith("'") && trimmedValue.endsWith("'"))
  ) {
    try {
      return JSON.parse(trimmedValue);
    } catch {
      return trimmedValue.slice(1, -1);
    }
  }

  return trimmedValue;
}

function parseEditorMarkdown(markdown: string, fallbackName: string, fallbackDescription: string): ParsedEditorMarkdown {
  const normalizedMarkdown = markdown.replace(/^\uFEFF/, '');
  if (!normalizedMarkdown.startsWith('---\n') && !normalizedMarkdown.startsWith('---\r\n')) {
    return {
      bodyMarkdown: normalizedMarkdown,
      description: fallbackDescription,
      name: fallbackName,
    };
  }

  const newline = normalizedMarkdown.startsWith('---\r\n') ? '\r\n' : '\n';
  const startLength = 3 + newline.length;
  const closingMarker = `${newline}---${newline}`;
  const closingIndex = normalizedMarkdown.indexOf(closingMarker, startLength);
  if (closingIndex === -1) {
    return {
      bodyMarkdown: normalizedMarkdown,
      description: fallbackDescription,
      name: fallbackName,
    };
  }

  const frontmatterText = normalizedMarkdown.slice(startLength, closingIndex);
  const frontmatterEntries = new Map<string, string>();
  for (const line of frontmatterText.split(/\r?\n/)) {
    const separatorIndex = line.indexOf(':');
    if (separatorIndex === -1) {
      continue;
    }
    frontmatterEntries.set(line.slice(0, separatorIndex).trim(), parseFrontmatterScalar(line.slice(separatorIndex + 1)));
  }

  return {
    bodyMarkdown: normalizedMarkdown.slice(closingIndex + closingMarker.length).replace(/^\n+/, ''),
    description: frontmatterEntries.get('description') ?? fallbackDescription,
    name: frontmatterEntries.get('name') ?? fallbackName,
  };
}

function replaceEditorFrontmatter(markdown: string, name: string, description: string) {
  const parsed = parseEditorMarkdown(markdown, name, description);
  return buildFullSkillMarkdown(name, description, parsed.bodyMarkdown);
}

function normalizeEditorDraft(value: unknown): SkillEditorDraft | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const draft = value as Partial<SkillEditorDraft>;
  if (typeof draft.name !== 'string' || typeof draft.description !== 'string' || typeof draft.markdown !== 'string') {
    return null;
  }

  return {
    description: draft.description,
    kind: draft.kind === 'existing' || draft.kind === 'copy' ? draft.kind : 'new',
    markdown: draft.markdown,
    name: draft.name,
    path: typeof draft.path === 'string' ? draft.path : null,
    source: draft.source === 'agents-user' || draft.source === 'custom' ? draft.source : 'codex-user',
    sourcePath: typeof draft.sourcePath === 'string' ? draft.sourcePath : null,
    targetDirectory: typeof draft.targetDirectory === 'string' ? draft.targetDirectory : '',
  };
}

function loadStoredEditorDraft(): SkillEditorDraft | null {
  try {
    return normalizeEditorDraft(JSON.parse(window.localStorage.getItem(editorDraftStorageKey) ?? 'null'));
  } catch {
    return null;
  }
}

function loadStoredRecentEditorPaths(): string[] {
  try {
    const storedPaths = JSON.parse(window.localStorage.getItem(recentEditorStorageKey) ?? '[]');
    return Array.isArray(storedPaths) ? storedPaths.filter((path): path is string => typeof path === 'string') : [];
  } catch {
    return [];
  }
}

function getSuggestedTargetDirectory(settings: AppSettings) {
  return settings.customScanDirectories[0] ?? '';
}

function SourceNavIcon({ icon, name }: { icon?: string; name: SourceIconName }) {
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
      {icon ?? iconNames[name] ?? 'label'}
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
  const [detailMode, setDetailMode] = useState<'preview' | 'edit'>('preview');
  const [skillViewMode, setSkillViewMode] = useState<SkillViewMode>(() => normalizeSkillViewMode(settings.skillViewMode));
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
  const settingsRef = useRef(settings);
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
  const [customCategories, setCustomCategories] = useState<CustomCategoryMap>(() => normalizeCustomCategories(settings.customCategories));
  const [categoryColors, setCategoryColors] = useState<CategoryColorMap>(() => normalizeCategoryColors(settings.categoryColors, normalizeCustomCategories(settings.customCategories)));
  const [categoryLabels, setCategoryLabels] = useState<CategoryLabelMap>(() => normalizeCategoryLabels(settings.categoryLabels, normalizeCustomCategories(settings.customCategories)));
  const [categoryIcons, setCategoryIcons] = useState<CategoryIconMap>(() => normalizeCategoryIcons(settings.categoryIcons, normalizeCustomCategories(settings.customCategories)));
  const [categoryContextMenu, setCategoryContextMenu] = useState<CategoryContextMenu | null>(null);
  const [categoryLabelDraft, setCategoryLabelDraft] = useState('');
  const [skillTagContextMenu, setSkillTagContextMenu] = useState<SkillTagContextMenu | null>(null);
  const [skillTags, setSkillTags] = useState<Record<string, CustomSkillTag[]>>(() => normalizeSkillTags(settings.skillTags));
  const [categorySkillOrder, setCategorySkillOrder] = useState<CategorySkillOrderMap>(() => normalizeCategorySkillOrder(settings.categorySkillOrder));
  const [skillCardColors, setSkillCardColors] = useState<SkillCardColorMap>(() => normalizeSkillCardColors(settings.skillCardColors));
  const [skillLocks, setSkillLocks] = useState<SkillLockMap>(() => normalizeSkillLocks(settings.skillLocks));
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedSkillPaths, setSelectedSkillPaths] = useState<Set<string>>(() => new Set());
  const [bulkCategoryId, setBulkCategoryId] = useState('');
  const [bulkTagDraft, setBulkTagDraft] = useState('');
  const [bulkColor, setBulkColor] = useState('');
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [skillCategoryAssignments, setSkillCategoryAssignments] = useState<SkillCategoryAssignmentMap>(() =>
    normalizeSkillCategoryAssignments(settings.skillCategoryAssignments, settings.skillCategoryOverrides),
  );
  const [draggedSkillPath, setDraggedSkillPath] = useState<string | null>(null);
  const [dragOverSkillPath, setDragOverSkillPath] = useState<string | null>(null);
  const pointerCardDragRef = useRef<PointerCardDrag | null>(null);
  const suppressNextCardClickRef = useRef(false);
  const [detailPanelWidth, setDetailPanelWidth] = useState(() => normalizeDetailPanelWidth(settings.detailPanelWidth));
  const [tagDraft, setTagDraft] = useState('');
  const [tagColor, setTagColor] = useState(defaultCustomTagColor);
  const [sortByNameAscending, setSortByNameAscending] = useState(false);
  const [activeGovernanceFilter, setActiveGovernanceFilter] = useState<GovernanceFilter | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>('original');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showWritableOnly, setShowWritableOnly] = useState(false);
  const [showReadOnlyOnly, setShowReadOnlyOnly] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [workspaceMode, setWorkspaceMode] = useState<EditorWorkspaceMode>('library');
  const [editorDraft, setEditorDraft] = useState<SkillEditorDraft>(() => loadStoredEditorDraft() ?? emptyEditorDraft);
  const [editorBaseDraft, setEditorBaseDraft] = useState<SkillEditorDraft>(() => loadStoredEditorDraft() ?? emptyEditorDraft);
  const [recentEditorPaths, setRecentEditorPaths] = useState<string[]>(loadStoredRecentEditorPaths);
  const [editorSaveCompleted, setEditorSaveCompleted] = useState<SaveCompletionState>('idle');
  const [showEditorSaveConfirm, setShowEditorSaveConfirm] = useState(false);
  const [frontmatterConflict, setFrontmatterConflict] = useState<FrontmatterConflict | null>(null);
  const toolbarMenuRef = useRef<HTMLDivElement>(null);
  const categoryContextMenuRef = useRef<HTMLDivElement>(null);
  const skillTagContextMenuRef = useRef<HTMLDivElement>(null);
  const markdownInputRef = useRef<HTMLTextAreaElement>(null);
  const markdownEditPreviewRef = useRef<HTMLDivElement>(null);
  const markdownSyncSourceRef = useRef<'editor' | 'preview' | null>(null);
  const detailResizeRef = useRef<{ startWidth: number; startX: number } | null>(null);
  const detailPanelWidthRef = useRef(detailPanelWidth);
  const editorSaveCompleteTimerRef = useRef<number | null>(null);

  const selectableLanguageOptions = useMemo(() => languageOptions.filter((option) => option.value !== 'system'), [languageOptions]);
  const visibleLanguage = normalizeSelectableLanguage(language);
  const visibleSettingsLanguage = normalizeSelectableLanguage(settingsDraft.language);
  const localizedCategorySidebarLabel = t('category.title');
  const categoryNavItems = useMemo<Array<{ category: CategoryDefinition | null; icon: SourceIconName; labelKey?: TranslationKey }>>(() => {
    const customItems = Object.entries(customCategories)
      .map(([categoryId, category]) => ({
        category: buildCategoryDefinition(categoryId, categoryLabels, categoryColors, categoryIcons),
        icon: category.icon,
      }))
      .sort((leftItem, rightItem) =>
        getCategoryLabel(leftItem.category, categoryLabels, t).localeCompare(getCategoryLabel(rightItem.category, categoryLabels, t), locale),
      );

    return [
      { category: null, icon: 'all', labelKey: 'sources.allSkills' },
      ...builtInCategoryIds.map((categoryId) => ({ category: categoryDefaults[categoryId], icon: categoryId })),
      ...customItems,
    ];
  }, [categoryColors, categoryIcons, categoryLabels, customCategories, locale, t]);

  const filteredSkills = useMemo(() => {
    const searchMatches = filterSkills(skills, searchQuery).filter((skill) => {
      if (showWritableOnly && !isWritableSkill(skill)) {
        return false;
      }
      if (showReadOnlyOnly && !isReadOnlySkill(skill)) {
        return false;
      }
      if (activeGovernanceFilter === 'user-editable' && !isWritableSkill(skill)) {
        return false;
      }
      if (activeGovernanceFilter === 'read-only-plugins' && skill.source !== 'plugin-cache') {
        return false;
      }
      return true;
    });

    if (activeTagLabel) {
      return searchMatches.filter((skill) => skillTags[skill.path]?.some((tag) => tag.label === activeTagLabel));
    }

    if (!activeCategoryId) {
      return searchMatches;
    }

    return searchMatches.filter((skill) =>
      getEffectiveSkillCategories(skill, skillCategoryAssignments, categoryLabels, categoryColors, categoryIcons).some(
        (category) => category.id === activeCategoryId,
      ),
    );
  }, [
    activeCategoryId,
    activeGovernanceFilter,
    activeTagLabel,
    searchQuery,
    showReadOnlyOnly,
    showWritableOnly,
    categoryColors,
    categoryIcons,
    categoryLabels,
    skillCategoryAssignments,
    skillTags,
    skills,
  ]);
  const sortedFilteredSkills = useMemo(() => {
    if (sortMode === 'name' || sortByNameAscending) {
      return [...filteredSkills].sort((leftSkill, rightSkill) => leftSkill.name.localeCompare(rightSkill.name, locale));
    }
    if (sortMode === 'modified') {
      return [...filteredSkills].sort((leftSkill, rightSkill) => {
        const leftTime = leftSkill.modifiedAt ? new Date(leftSkill.modifiedAt).getTime() : 0;
        const rightTime = rightSkill.modifiedAt ? new Date(rightSkill.modifiedAt).getTime() : 0;
        return rightTime - leftTime;
      });
    }

    return filteredSkills;
  }, [filteredSkills, locale, sortByNameAscending, sortMode]);
  const totalPages = Math.max(1, Math.ceil(sortedFilteredSkills.length / skillsPerPage));
  const normalizedCurrentPage = Math.min(currentPage, totalPages);
  const paginatedSkills = useMemo(() => {
    const pageStartIndex = (normalizedCurrentPage - 1) * skillsPerPage;
    return sortedFilteredSkills.slice(pageStartIndex, pageStartIndex + skillsPerPage);
  }, [normalizedCurrentPage, sortedFilteredSkills]);
  const categorySections = useMemo<CategorySection[]>(() => {
    const sectionMap = new Map<CategoryId, { category: CategoryDefinition; skills: SkillSummary[] }>();

    for (const skill of sortedFilteredSkills) {
      const skillCategories = getEffectiveSkillCategories(skill, skillCategoryAssignments, categoryLabels, categoryColors, categoryIcons);
      const tagCategories =
        activeCategoryId || activeTagLabel
          ? []
          : (skillTags[skill.path] ?? []).map((tag) => buildTagCategoryDefinition(tag));

      for (const category of [...skillCategories, ...tagCategories]) {
        if (activeCategoryId && category.id !== activeCategoryId) {
          continue;
        }

        const section = sectionMap.get(category.id) ?? { category, skills: [] };
        section.skills.push(skill);
        sectionMap.set(category.id, section);
      }
    }

    return Array.from(sectionMap.values())
      .map((section) => ({
        ...section,
        label: getCategoryLabel(section.category, categoryLabels, t),
        skills: applyCategorySkillOrder(section.skills, categorySkillOrder[section.category.id]),
      }))
      .sort((leftSection, rightSection) => leftSection.label.localeCompare(rightSection.label, locale));
  }, [
    activeCategoryId,
    activeTagLabel,
    categoryColors,
    categoryIcons,
    categoryLabels,
    categorySkillOrder,
    locale,
    skillCategoryAssignments,
    skillTags,
    sortedFilteredSkills,
    t,
  ]);

  const categoryCounts = useMemo(() => {
    const counts: Record<CategoryId, number> = Object.fromEntries(categoryNavItems.flatMap((item) => (item.category ? [[item.category.id, 0]] : [])));

    for (const skill of skills) {
      for (const category of getEffectiveSkillCategories(skill, skillCategoryAssignments, categoryLabels, categoryColors, categoryIcons)) {
        counts[category.id] = (counts[category.id] ?? 0) + 1;
      }
    }

    return counts;
  }, [categoryColors, categoryIcons, categoryLabels, categoryNavItems, skillCategoryAssignments, skills]);

  const governanceCounts = useMemo(
    () => ({
      readOnlyPlugins: skills.filter((skill) => skill.source === 'plugin-cache').length,
      userEditable: skills.filter(isWritableSkill).length,
    }),
    [skills],
  );

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
  const selectedIsPermanentlyLocked = selectedDetail ? isReadOnlySkill(selectedDetail) : false;
  const selectedIsLocked = selectedDetail ? selectedIsPermanentlyLocked || Boolean(skillLocks[selectedDetail.path]) : false;
  const selectedCanDelete = selectedDetail ? canDeleteSkill(selectedDetail) : false;
  const selectedSkillCount = selectedSkillPaths.size;
  const selectedLintItems = selectedDetail ? getSkillLintItems(selectedDetail, t) : [];
  const detailHasChanges =
    Boolean(selectedDetail) &&
    (selectedDetail?.name !== detailName ||
      selectedDetail?.description !== detailDescription ||
      selectedDetail?.bodyMarkdown !== detailMarkdown);
  const pendingSaveDiffLines = getSimpleDiffLines(selectedDetail, detailName, detailDescription, detailMarkdown);
  const parsedEditorDraft = parseEditorMarkdown(editorDraft.markdown, editorDraft.name, editorDraft.description);
  const editorBodyMarkdown = parsedEditorDraft.bodyMarkdown;
  const editorHasChanges = JSON.stringify(editorDraft) !== JSON.stringify(editorBaseDraft);
  const editorDiffLines = editorHasChanges
    ? [
        ...(editorBaseDraft.name === editorDraft.name ? [] : [`- ${editorBaseDraft.name}`, `+ ${editorDraft.name}`]),
        ...(editorBaseDraft.description === editorDraft.description ? [] : [`- ${editorBaseDraft.description}`, `+ ${editorDraft.description}`]),
        ...(editorBaseDraft.markdown === editorDraft.markdown ? [] : ['- markdown body', '+ markdown body']),
      ]
    : [];
  const editorRecentSkills = recentEditorPaths
    .map((path) => skills.find((skill) => skill.path === path))
    .filter((skill): skill is SkillSummary => Boolean(skill));
  const scanSkills = async () => {
    setIsLoadingSkills(true);
    setScanError(null);

    try {
      const scannedSkills = await invoke<SkillSummary[]>('scan_skills');
      setSkills(scannedSkills);
      setScanOutcome(getScanOutcome(scannedSkills));
    } catch (error) {
      setSkills([]);
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
    settingsRef.current = settings;
    setSettingsDraft({
      ...settings,
      language: normalizeSelectableLanguage(settings.language),
    });
    const nextCustomCategories = normalizeCustomCategories(settings.customCategories);
    setCustomCategories(nextCustomCategories);
    setCategoryColors(normalizeCategoryColors(settings.categoryColors, nextCustomCategories));
    setCategoryLabels(normalizeCategoryLabels(settings.categoryLabels, nextCustomCategories));
    setCategoryIcons(normalizeCategoryIcons(settings.categoryIcons, nextCustomCategories));
    setSkillTags(normalizeSkillTags(settings.skillTags));
    setCategorySkillOrder(normalizeCategorySkillOrder(settings.categorySkillOrder));
    setSkillCardColors(normalizeSkillCardColors(settings.skillCardColors));
    setSkillLocks(normalizeSkillLocks(settings.skillLocks));
    setSkillCategoryAssignments(normalizeSkillCategoryAssignments(settings.skillCategoryAssignments, settings.skillCategoryOverrides));
    setDetailPanelWidth(normalizeDetailPanelWidth(settings.detailPanelWidth));
    setSkillViewMode(normalizeSkillViewMode(settings.skillViewMode));
  }, [settings]);

  useEffect(() => {
    detailPanelWidthRef.current = detailPanelWidth;
  }, [detailPanelWidth]);

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategoryId, activeGovernanceFilter, activeTagLabel, searchQuery, showReadOnlyOnly, showWritableOnly, sortByNameAscending, sortMode]);

  useEffect(() => {
    window.localStorage.setItem(editorDraftStorageKey, JSON.stringify(editorDraft));
  }, [editorDraft]);

  useEffect(() => {
    window.localStorage.setItem(recentEditorStorageKey, JSON.stringify(recentEditorPaths.slice(0, 8)));
  }, [recentEditorPaths]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!editorHasChanges) {
        return;
      }

      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [editorHasChanges]);

  useEffect(
    () => () => {
      if (editorSaveCompleteTimerRef.current) {
        window.clearTimeout(editorSaveCompleteTimerRef.current);
      }
    },
    [],
  );

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

  useEffect(() => {
    const handleOutsideMenuMouseDown = (event: globalThis.MouseEvent) => {
      const target = event.target;

      if (!(target instanceof Node)) {
        return;
      }

      if ((showSortMenu || showFilterMenu) && toolbarMenuRef.current && !toolbarMenuRef.current.contains(target)) {
        setShowSortMenu(false);
        setShowFilterMenu(false);
      }

      if (categoryContextMenu && categoryContextMenuRef.current && !categoryContextMenuRef.current.contains(target)) {
        setCategoryContextMenu(null);
      }

      if (skillTagContextMenu && skillTagContextMenuRef.current && !skillTagContextMenuRef.current.contains(target)) {
        setSkillTagContextMenu(null);
      }
    };

    document.addEventListener('mousedown', handleOutsideMenuMouseDown);

    return () => {
      document.removeEventListener('mousedown', handleOutsideMenuMouseDown);
    };
  }, [categoryContextMenu, showFilterMenu, showSortMenu, skillTagContextMenu]);

  const persistUiPreferences = (
    nextCategoryColors: CategoryColorMap,
    nextCategoryLabels: CategoryLabelMap,
    nextSkillTags: Record<string, CustomSkillTag[]>,
    nextCategorySkillOrder = categorySkillOrder,
    nextDetailPanelWidth = detailPanelWidthRef.current,
    nextCategoryIcons = categoryIcons,
    nextSkillCardColors = skillCardColors,
    nextSkillCategoryAssignments = skillCategoryAssignments,
    nextCustomCategories = customCategories,
    nextSkillViewMode = skillViewMode,
    nextSkillLocks = skillLocks,
  ) => {
    const latestSettings = settingsRef.current;
    const nextSettings = {
      ...latestSettings,
      language: latestSettings.language,
      customCategories: nextCustomCategories,
      categoryColors: nextCategoryColors,
      categoryLabels: getPersistedCategoryLabels(nextCategoryLabels, nextCustomCategories),
      categoryIcons: getPersistedCategoryIcons(nextCategoryIcons, nextCustomCategories),
      categorySkillOrder: getPersistedCategorySkillOrder(nextCategorySkillOrder),
      detailPanelWidth: getPersistedDetailPanelWidth(nextDetailPanelWidth, latestSettings.detailPanelWidth),
      skillCardColors: nextSkillCardColors,
      skillCategoryAssignments: getPersistedSkillCategoryAssignments(nextSkillCategoryAssignments),
      skillCategoryOverrides: {},
      skillTags: nextSkillTags,
      skillViewMode: nextSkillViewMode,
      skillLocks: nextSkillLocks,
    };
    settingsRef.current = nextSettings;
    void saveSettings(nextSettings).catch(() => {
      // Settings save errors are exposed through the shared settings runtime.
    });
  };

  useEffect(() => {
    const handleDetailResizeMove = (event: globalThis.MouseEvent) => {
      if (!detailResizeRef.current) {
        return;
      }

      const nextWidth = clampDetailPanelWidth(
        detailResizeRef.current.startWidth + detailResizeRef.current.startX - event.clientX,
      );
      detailPanelWidthRef.current = nextWidth;
      setDetailPanelWidth(nextWidth);
    };

    const handleDetailResizeEnd = () => {
      if (!detailResizeRef.current) {
        return;
      }

      detailResizeRef.current = null;
      persistUiPreferences(categoryColors, categoryLabels, skillTags, categorySkillOrder, detailPanelWidthRef.current);
    };

    window.addEventListener('mousemove', handleDetailResizeMove);
    window.addEventListener('mouseup', handleDetailResizeEnd);

    return () => {
      window.removeEventListener('mousemove', handleDetailResizeMove);
      window.removeEventListener('mouseup', handleDetailResizeEnd);
    };
  }, [categoryColors, categoryIcons, categoryLabels, categorySkillOrder, customCategories, skillCardColors, skillCategoryAssignments, skillTags]);

  const syncDetailForm = (detail: SkillDetail) => {
    setSelectedDetail(detail);
    setDetailName(detail.name);
    setDetailDescription(detail.description);
    setDetailMarkdown(detail.bodyMarkdown);
    setDetailMode('preview');
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
    if (workspaceMode === 'editor' && editorHasChanges && !window.confirm(t('editor.unsavedConfirm'))) {
      return;
    }

    const nextDraft = {
      ...emptyEditorDraft,
      targetDirectory: getSuggestedTargetDirectory(settingsRef.current),
    };
    setEditorDraft(nextDraft);
    setEditorBaseDraft(nextDraft);
    setEditorSaveCompleted('idle');
    setWorkspaceMode('editor');
  };

  const closeCreateSkillDialog = () => {
    if (isCreatingSkill) {
      return;
    }

    setShowCreateSkill(false);
    setCreateSkillError(null);
    setIsCreatingSkill(false);
  };

  const updateCreateSkillDraft = <Field extends keyof CreateSkillDraft>(field: Field, value: CreateSkillDraft[Field]) => {
    setCreateSkillDraft((currentDraft) => ({
      ...currentDraft,
      [field]: value,
    }));
  };

  const applyCreateTemplate = (template: 'automation' | 'research' | 'writing') => {
    const templates: Record<typeof template, Pick<CreateSkillDraft, 'description' | 'markdown'>> = {
      automation: {
        description: 'Run a repeatable local automation with clear safety checks.',
        markdown:
          '# Automation Skill\n\n## When To Use\nUse when the user asks for this repeatable local workflow.\n\n## Inputs\n- Required files or folders\n\n## Steps\n1. Inspect context.\n2. Run the smallest safe action.\n3. Verify the result.\n\n## Safety\nAsk before deleting, uploading, or transmitting sensitive data.\n',
      },
      research: {
        description: 'Collect, compare, and synthesize source-backed research.',
        markdown:
          '# Research Skill\n\n## When To Use\nUse when the user needs source-backed analysis.\n\n## Source Strategy\n- Prefer primary sources.\n- Record dates and uncertainty.\n\n## Output\nSummarize findings, risks, and next actions.\n',
      },
      writing: {
        description: 'Draft and refine structured writing with a clear voice.',
        markdown:
          '# Writing Skill\n\n## When To Use\nUse when the user asks for drafting, rewriting, or editorial polish.\n\n## Voice\nMatch the user context and audience.\n\n## Output\nReturn concise, ready-to-use text.\n',
      },
    };

    setCreateSkillDraft((currentDraft) => ({
      ...currentDraft,
      description: currentDraft.description || templates[template].description,
      markdown: currentDraft.markdown || templates[template].markdown,
    }));
  };

  const selectSkill = async (skill: SkillSummary) => {
    if (workspaceMode === 'editor' && editorHasChanges && !window.confirm(t('editor.unsavedConfirm'))) {
      return;
    }

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

  const openEditorWorkspace = async (skill: SkillSummary) => {
    if (editorHasChanges && !window.confirm(t('editor.unsavedConfirm'))) {
      return;
    }

    setWorkspaceMode('editor');
    setEditorSaveCompleted('idle');
    setDetailError(null);
    setIsLoadingDetail(true);

    try {
      const detail = await invoke<SkillDetail>('read_skill', { path: skill.path });
      const nextDraft: SkillEditorDraft = {
        description: detail.description,
        kind: 'existing',
        markdown: buildFullMarkdownFromDetail(detail),
        name: detail.name,
        path: detail.path,
        source: isWritableSkill(detail) ? (detail.source as WritableSkillSource) : 'codex-user',
        sourcePath: null,
        targetDirectory: getSuggestedTargetDirectory(settingsRef.current),
      };
      setEditorDraft(nextDraft);
      setEditorBaseDraft(nextDraft);
      setSelectedPath(detail.path);
      selectedPathRef.current = detail.path;
      syncDetailForm(detail);
      setRecentEditorPaths((currentPaths) => [detail.path, ...currentPaths.filter((path) => path !== detail.path)].slice(0, 8));
    } catch (error) {
      setDetailErrorTitleKey('details.errorTitle');
      setDetailError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const copyProtectedSkillToEditor = async (skill: SkillSummary) => {
    if (editorHasChanges && !window.confirm(t('editor.unsavedConfirm'))) {
      return;
    }

    setWorkspaceMode('editor');
    setEditorSaveCompleted('idle');
    setIsLoadingDetail(true);

    try {
      const detail = await invoke<SkillDetail>('read_skill', { path: skill.path });
      const nextDraft: SkillEditorDraft = {
        description: detail.description,
        kind: 'copy',
        markdown: buildFullMarkdownFromDetail(detail),
        name: detail.name,
        path: null,
        source: 'codex-user',
        sourcePath: detail.path,
        targetDirectory: getSuggestedTargetDirectory(settingsRef.current),
      };
      setEditorDraft(nextDraft);
      setEditorBaseDraft({
        ...emptyEditorDraft,
        targetDirectory: nextDraft.targetDirectory,
      });
    } catch (error) {
      setDetailErrorTitleKey('details.errorTitle');
      setDetailError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const updateEditorDraft = (updates: Partial<SkillEditorDraft>) => {
    setEditorSaveCompleted('idle');
    setEditorDraft((currentDraft) => ({
      ...currentDraft,
      ...updates,
    }));
  };

  const updateEditorFrontmatterField = (field: 'description' | 'name', value: string) => {
    setEditorSaveCompleted('idle');
    setEditorDraft((currentDraft) => {
      const nextDraft = { ...currentDraft, [field]: value };
      return {
        ...nextDraft,
        markdown: replaceEditorFrontmatter(nextDraft.markdown, nextDraft.name, nextDraft.description),
      };
    });
  };

  const updateEditorMarkdown = (markdown: string) => {
    setEditorSaveCompleted('idle');
    setEditorDraft((currentDraft) => {
      const parsed = parseEditorMarkdown(markdown, currentDraft.name, currentDraft.description);
      if (parsed.name !== currentDraft.name || parsed.description !== currentDraft.description) {
        setFrontmatterConflict({ markdown, parsed });
        return {
          ...currentDraft,
          markdown,
        };
      }

      return {
        ...currentDraft,
        description: parsed.description,
        markdown,
        name: parsed.name,
      };
    });
  };

  const keepMarkdownFrontmatter = () => {
    if (!frontmatterConflict) {
      return;
    }

    setEditorDraft((currentDraft) => ({
      ...currentDraft,
      description: frontmatterConflict.parsed.description,
      markdown: frontmatterConflict.markdown,
      name: frontmatterConflict.parsed.name,
    }));
    setFrontmatterConflict(null);
  };

  const keepFormFrontmatter = () => {
    if (!frontmatterConflict) {
      return;
    }

    setEditorDraft((currentDraft) => ({
      ...currentDraft,
      markdown: replaceEditorFrontmatter(frontmatterConflict.markdown, currentDraft.name, currentDraft.description),
    }));
    setFrontmatterConflict(null);
  };

  const showEditorSavedState = () => {
    setEditorSaveCompleted('saved');
    if (editorSaveCompleteTimerRef.current) {
      window.clearTimeout(editorSaveCompleteTimerRef.current);
    }
    editorSaveCompleteTimerRef.current = window.setTimeout(() => {
      setEditorSaveCompleted('idle');
      editorSaveCompleteTimerRef.current = null;
    }, 900);
  };

  const performEditorSave = async () => {
    setIsSavingDetail(true);
    setDetailError(null);

    try {
      const parsed = parseEditorMarkdown(editorDraft.markdown, editorDraft.name, editorDraft.description);
      const savedDetail =
        editorDraft.kind === 'existing' && editorDraft.path
          ? await invoke<SkillDetail>('update_skill', {
              input: {
                path: editorDraft.path,
                name: editorDraft.name.trim(),
                description: editorDraft.description.trim(),
                markdown: parsed.bodyMarkdown,
              },
            })
          : await invoke<SkillDetail>('create_skill', {
              input: {
                name: editorDraft.name.trim(),
                description: editorDraft.description.trim(),
                source: editorDraft.source,
                targetDirectory: editorDraft.targetDirectory.trim(),
                markdown: parsed.bodyMarkdown,
              },
            });

      const nextDraft: SkillEditorDraft = {
        description: savedDetail.description,
        kind: 'existing',
        markdown: buildFullMarkdownFromDetail(savedDetail),
        name: savedDetail.name,
        path: savedDetail.path,
        source: isWritableSkill(savedDetail) ? (savedDetail.source as WritableSkillSource) : 'codex-user',
        sourcePath: null,
        targetDirectory: editorDraft.targetDirectory,
      };
      setEditorDraft(nextDraft);
      setEditorBaseDraft(nextDraft);
      setSelectedPath(savedDetail.path);
      selectedPathRef.current = savedDetail.path;
      syncDetailForm(savedDetail);
      upsertDetailIntoSkills(savedDetail);
      setRecentEditorPaths((currentPaths) => [savedDetail.path, ...currentPaths.filter((path) => path !== savedDetail.path)].slice(0, 8));
      showEditorSavedState();
      await scanSkills();
      upsertDetailIntoSkills(savedDetail);
    } catch (error) {
      setDetailErrorTitleKey('details.actionErrorTitle');
      setDetailError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsSavingDetail(false);
      setShowEditorSaveConfirm(false);
    }
  };

  const saveEditorDraft = () => {
    setShowEditorSaveConfirm(true);
  };

  const leaveEditorWorkspace = () => {
    if (editorHasChanges && !window.confirm(t('editor.unsavedConfirm'))) {
      return;
    }

    setWorkspaceMode('library');
  };

  const performSelectedSkillSave = async () => {
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
      setShowSaveConfirm(false);
    }
  };

  const saveSelectedSkill = async () => {
    if (!selectedDetail || selectedIsLocked) {
      return;
    }

    if (detailHasChanges) {
      setShowSaveConfirm(true);
      return;
    }

    await performSelectedSkillSave();
  };

  const createSkill = async () => {
    setIsCreatingSkill(true);
    setCreateSkillError(null);

    try {
      const createdDetail = await invoke<SkillDetail>('create_skill', {
        input: {
          name: createSkillDraft.name.trim(),
          description: createSkillDraft.description.trim(),
          source: createSkillDraft.source,
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
      const nextSkillTags = { ...normalizeSkillTags(settingsRef.current.skillTags), ...skillTags };
      const nextSkillCardColors = { ...skillCardColors };
      const nextSkillCategoryAssignments = { ...skillCategoryAssignments };
      const nextSkillLocks = { ...skillLocks };
      delete nextSkillTags[targetPath];
      delete nextSkillCardColors[targetPath];
      delete nextSkillCategoryAssignments[targetPath];
      delete nextSkillLocks[targetPath];
      setSkillTags(nextSkillTags);
      setSkillCardColors(nextSkillCardColors);
      setSkillCategoryAssignments(nextSkillCategoryAssignments);
      setSkillLocks(nextSkillLocks);
      persistUiPreferences(
        categoryColors,
        categoryLabels,
        nextSkillTags,
        categorySkillOrder,
        detailPanelWidthRef.current,
        categoryIcons,
        nextSkillCardColors,
        nextSkillCategoryAssignments,
        customCategories,
        skillViewMode,
        nextSkillLocks,
      );
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
    setCategoryLabelDraft(categoryLabels[categoryId] ?? (isBuiltInCategoryId(categoryId) ? categoryDefaults[categoryId].label : categoryId));
    setCategoryContextMenu({ categoryId, x: event.clientX, y: event.clientY });
  };

  const updateCategoryColor = (categoryId: CategoryId, color: string) => {
    const nextCategoryColors = {
      ...categoryColors,
      [categoryId]: color,
    };
    setCategoryColors(nextCategoryColors);
    const nextCustomCategories = customCategories[categoryId]
      ? {
          ...customCategories,
          [categoryId]: {
            ...customCategories[categoryId],
            color,
          },
        }
      : customCategories;
    if (nextCustomCategories !== customCategories) {
      setCustomCategories(nextCustomCategories);
    }
    persistUiPreferences(
      nextCategoryColors,
      categoryLabels,
      skillTags,
      categorySkillOrder,
      detailPanelWidthRef.current,
      categoryIcons,
      skillCardColors,
      skillCategoryAssignments,
      nextCustomCategories,
    );
  };

  const updateCategoryIcon = (categoryId: CategoryId, icon: string) => {
    const nextCategoryIcons = {
      ...categoryIcons,
      [categoryId]: icon,
    };
    setCategoryIcons(nextCategoryIcons);
    const nextCustomCategories = customCategories[categoryId]
      ? {
          ...customCategories,
          [categoryId]: {
            ...customCategories[categoryId],
            icon,
          },
        }
      : customCategories;
    if (nextCustomCategories !== customCategories) {
      setCustomCategories(nextCustomCategories);
    }
    persistUiPreferences(
      categoryColors,
      categoryLabels,
      skillTags,
      categorySkillOrder,
      detailPanelWidthRef.current,
      nextCategoryIcons,
      skillCardColors,
      skillCategoryAssignments,
      nextCustomCategories,
    );
  };

  const saveCategoryLabel = () => {
    if (!categoryContextMenu) {
      return;
    }

    const categoryId = categoryContextMenu.categoryId;
    const nextLabel = categoryLabelDraft.trim() || getInitialCategoryLabels(customCategories)[categoryId] || categoryId;
    const nextCategoryLabels = {
      ...categoryLabels,
      [categoryId]: nextLabel,
    };
    const nextCustomCategories = customCategories[categoryId]
      ? {
          ...customCategories,
          [categoryId]: {
            ...customCategories[categoryId],
            label: nextLabel,
          },
        }
      : customCategories;
    setCategoryLabels(nextCategoryLabels);
    if (nextCustomCategories !== customCategories) {
      setCustomCategories(nextCustomCategories);
    }
    persistUiPreferences(
      categoryColors,
      nextCategoryLabels,
      skillTags,
      categorySkillOrder,
      detailPanelWidthRef.current,
      categoryIcons,
      skillCardColors,
      skillCategoryAssignments,
      nextCustomCategories,
    );
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

    const nextSkillTags = {
      ...skillTags,
      [skillTagContextMenu.path]: [...(skillTags[skillTagContextMenu.path] ?? []), { color: tagColor, label }],
    };
    setSkillTags(nextSkillTags);
    persistUiPreferences(categoryColors, categoryLabels, nextSkillTags, categorySkillOrder, detailPanelWidthRef.current, categoryIcons, skillCardColors, skillCategoryAssignments);
    setSkillTagContextMenu(null);
    setTagDraft('');
    setTagColor(defaultCustomTagColor);
  };

  const removeSkillTag = (path: string, index: number) => {
    const remainingTags = (skillTags[path] ?? []).filter((_, tagIndex) => tagIndex !== index);
    const nextSkillTags = { ...skillTags };

    if (remainingTags.length > 0) {
      nextSkillTags[path] = remainingTags;
    } else {
      delete nextSkillTags[path];
    }

    setSkillTags(nextSkillTags);
    persistUiPreferences(categoryColors, categoryLabels, nextSkillTags, categorySkillOrder, detailPanelWidthRef.current, categoryIcons, skillCardColors, skillCategoryAssignments);
  };

  const setSkillCategoryAssignmentsForPath = (path: string, categoryIds: CategoryId[]) => {
    const cleanCategoryIds = Array.from(new Set(categoryIds.filter((categoryId) => categoryId.trim().length > 0)));
    const nextSkillCategoryAssignments = { ...skillCategoryAssignments };

    if (cleanCategoryIds.length > 0) {
      nextSkillCategoryAssignments[path] = cleanCategoryIds;
    } else {
      delete nextSkillCategoryAssignments[path];
    }

    setSkillCategoryAssignments(nextSkillCategoryAssignments);
    persistUiPreferences(categoryColors, categoryLabels, skillTags, categorySkillOrder, detailPanelWidthRef.current, categoryIcons, skillCardColors, nextSkillCategoryAssignments);
  };

  const addSkillCategoryAssignment = (path: string, categoryId: CategoryId) => {
    const currentCategoryIds =
      skillCategoryAssignments[path] ??
      (skills.find((skill) => skill.path === path)
        ? getInferredSkillCategories(skills.find((skill) => skill.path === path) as SkillSummary).map((category) => category.id)
        : []);
    setSkillCategoryAssignmentsForPath(path, [...currentCategoryIds, categoryId]);
  };

  const removeSkillCategoryAssignment = (path: string, categoryId: CategoryId) => {
    const currentCategoryIds =
      skillCategoryAssignments[path] ??
      (skills.find((skill) => skill.path === path)
        ? getInferredSkillCategories(skills.find((skill) => skill.path === path) as SkillSummary).map((category) => category.id)
        : []);
    setSkillCategoryAssignmentsForPath(
      path,
      currentCategoryIds.filter((currentCategoryId) => currentCategoryId !== categoryId),
    );
  };

  const createCustomCategoryForSkill = (path: string, label: string) => {
    const trimmedLabel = label.trim();
    if (!trimmedLabel) {
      return;
    }

    const baseId = `custom-${trimmedLabel
      .toLocaleLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, '-')
      .replace(/^-+|-+$/g, '') || Date.now().toString(36)}`;
    let categoryId = baseId;
    let suffix = 2;
    while (categoryDefaults[categoryId as BuiltInCategoryId] || customCategories[categoryId]) {
      categoryId = `${baseId}-${suffix}`;
      suffix += 1;
    }

    const nextCustomCategories = {
      ...customCategories,
      [categoryId]: {
        color: tagColor,
        icon: 'label',
        label: trimmedLabel,
      },
    };
    const nextCategoryColors = {
      ...categoryColors,
      [categoryId]: tagColor,
    };
    const nextCategoryLabels = {
      ...categoryLabels,
      [categoryId]: trimmedLabel,
    };
    const nextCategoryIcons = {
      ...categoryIcons,
      [categoryId]: 'label',
    };
    const nextSkillCategoryAssignments = {
      ...skillCategoryAssignments,
      [path]: Array.from(new Set([...(skillCategoryAssignments[path] ?? []), categoryId])),
    };

    setCustomCategories(nextCustomCategories);
    setCategoryColors(nextCategoryColors);
    setCategoryLabels(nextCategoryLabels);
    setCategoryIcons(nextCategoryIcons);
    setSkillCategoryAssignments(nextSkillCategoryAssignments);
    persistUiPreferences(
      nextCategoryColors,
      nextCategoryLabels,
      skillTags,
      categorySkillOrder,
      detailPanelWidthRef.current,
      nextCategoryIcons,
      skillCardColors,
      nextSkillCategoryAssignments,
      nextCustomCategories,
    );
    setTagDraft('');
  };

  const updateSkillCardColor = (path: string, color: string) => {
    const nextSkillCardColors = { ...skillCardColors };

    if (color) {
      nextSkillCardColors[path] = color;
    } else {
      delete nextSkillCardColors[path];
    }

    setSkillCardColors(nextSkillCardColors);
    persistUiPreferences(categoryColors, categoryLabels, skillTags, categorySkillOrder, detailPanelWidthRef.current, categoryIcons, nextSkillCardColors, skillCategoryAssignments);
  };

  const updateSkillLock = (path: string, locked: boolean) => {
    const skill = skills.find((candidate) => candidate.path === path);
    if (!skill || !isWritableSkill(skill)) {
      return;
    }

    const nextSkillLocks = { ...skillLocks };
    if (locked) {
      nextSkillLocks[path] = true;
    } else {
      delete nextSkillLocks[path];
    }
    setSkillLocks(nextSkillLocks);
    if (selectedPathRef.current === path && locked) {
      setDetailMode('preview');
    }
    persistUiPreferences(
      categoryColors,
      categoryLabels,
      skillTags,
      categorySkillOrder,
      detailPanelWidthRef.current,
      categoryIcons,
      skillCardColors,
      skillCategoryAssignments,
      customCategories,
      skillViewMode,
      nextSkillLocks,
    );
    setSkillTagContextMenu(null);
  };

  const toggleSkillSelection = (path: string) => {
    setSelectedSkillPaths((currentPaths) => {
      const nextPaths = new Set(currentPaths);
      if (nextPaths.has(path)) {
        nextPaths.delete(path);
      } else {
        nextPaths.add(path);
      }
      return nextPaths;
    });
  };

  const closeSelectionMode = () => {
    setSelectionMode(false);
    setSelectedSkillPaths(new Set());
    setBulkCategoryId('');
    setBulkTagDraft('');
    setBulkColor('');
  };

  const applyBulkCategory = () => {
    if (!bulkCategoryId || selectedSkillCount === 0) {
      return;
    }
    const nextAssignments = { ...skillCategoryAssignments };
    for (const path of selectedSkillPaths) {
      nextAssignments[path] = [bulkCategoryId];
    }
    setSkillCategoryAssignments(nextAssignments);
    persistUiPreferences(
      categoryColors,
      categoryLabels,
      skillTags,
      categorySkillOrder,
      detailPanelWidthRef.current,
      categoryIcons,
      skillCardColors,
      nextAssignments,
      customCategories,
      skillViewMode,
      skillLocks,
    );
  };

  const applyBulkTag = () => {
    const label = bulkTagDraft.trim();
    if (!label || selectedSkillCount === 0) {
      return;
    }
    const nextTags = { ...skillTags };
    for (const path of selectedSkillPaths) {
      const currentTags = nextTags[path] ?? [];
      nextTags[path] = currentTags.some((tag) => tag.label === label)
        ? currentTags
        : [...currentTags, { color: defaultCustomTagColor, label }];
    }
    setSkillTags(nextTags);
    setBulkTagDraft('');
    persistUiPreferences(
      categoryColors,
      categoryLabels,
      nextTags,
      categorySkillOrder,
      detailPanelWidthRef.current,
      categoryIcons,
      skillCardColors,
      skillCategoryAssignments,
      customCategories,
      skillViewMode,
      skillLocks,
    );
  };

  const applyBulkColor = () => {
    if (selectedSkillCount === 0) {
      return;
    }
    const nextColors = { ...skillCardColors };
    for (const path of selectedSkillPaths) {
      if (bulkColor) {
        nextColors[path] = bulkColor;
      } else {
        delete nextColors[path];
      }
    }
    setSkillCardColors(nextColors);
    persistUiPreferences(
      categoryColors,
      categoryLabels,
      skillTags,
      categorySkillOrder,
      detailPanelWidthRef.current,
      categoryIcons,
      nextColors,
      skillCategoryAssignments,
      customCategories,
      skillViewMode,
      skillLocks,
    );
  };

  const applyBulkLock = (locked: boolean) => {
    if (selectedSkillCount === 0) {
      return;
    }
    const nextLocks = { ...skillLocks };
    for (const path of selectedSkillPaths) {
      const skill = skills.find((candidate) => candidate.path === path);
      if (!skill || !isWritableSkill(skill)) {
        continue;
      }
      if (locked) {
        nextLocks[path] = true;
      } else {
        delete nextLocks[path];
      }
    }
    setSkillLocks(nextLocks);
    if (selectedPathRef.current && nextLocks[selectedPathRef.current]) {
      setDetailMode('preview');
    }
    persistUiPreferences(
      categoryColors,
      categoryLabels,
      skillTags,
      categorySkillOrder,
      detailPanelWidthRef.current,
      categoryIcons,
      skillCardColors,
      skillCategoryAssignments,
      customCategories,
      skillViewMode,
      nextLocks,
    );
  };

  const deleteSelectedSkills = async () => {
    if (selectedSkillCount === 0) {
      return;
    }
    setIsBulkDeleting(true);
    setDetailError(null);
    const deletedPaths = new Set<string>();
    const failedPaths: string[] = [];

    for (const path of selectedSkillPaths) {
      const skill = skills.find((candidate) => candidate.path === path);
      if (!skill || !canDeleteSkill(skill)) {
        failedPaths.push(path);
        continue;
      }
      try {
        await invoke('delete_skill', { path });
        deletedPaths.add(path);
      } catch {
        failedPaths.push(path);
      }
    }

    const nextTags = { ...skillTags };
    const nextColors = { ...skillCardColors };
    const nextAssignments = { ...skillCategoryAssignments };
    const nextLocks = { ...skillLocks };
    for (const path of deletedPaths) {
      delete nextTags[path];
      delete nextColors[path];
      delete nextAssignments[path];
      delete nextLocks[path];
    }
    setSkillTags(nextTags);
    setSkillCardColors(nextColors);
    setSkillCategoryAssignments(nextAssignments);
    setSkillLocks(nextLocks);
    persistUiPreferences(
      categoryColors,
      categoryLabels,
      nextTags,
      categorySkillOrder,
      detailPanelWidthRef.current,
      categoryIcons,
      nextColors,
      nextAssignments,
      customCategories,
      skillViewMode,
      nextLocks,
    );
    setSelectedSkillPaths(new Set(failedPaths));
    setShowBulkDeleteConfirm(false);
    if (selectedPathRef.current && deletedPaths.has(selectedPathRef.current)) {
      selectedPathRef.current = null;
      setSelectedPath(null);
      setSelectedDetail(null);
    }
    if (failedPaths.length > 0) {
      setDetailErrorTitleKey('details.actionErrorTitle');
      setDetailError(t('bulk.deleteFailed', { count: String(failedPaths.length) }));
    }
    await scanSkills();
    setIsBulkDeleting(false);
  };

  const startCategorySkillDrag = (event: DragEvent<HTMLElement>, path: string) => {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', path);
    setDraggedSkillPath(path);
    setDragOverSkillPath(null);
  };

  const startPointerCategorySkillDrag = (event: PointerEvent<HTMLElement>, categoryId: CategoryId, path: string) => {
    if (selectionMode || event.button !== 0) {
      return;
    }

    event.preventDefault();
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Pointer capture is best effort across WebViews.
    }
    pointerCardDragRef.current = {
      categoryId,
      hasMoved: false,
      path,
      startX: event.clientX,
      startY: event.clientY,
    };
  };

  const movePointerCategorySkillDrag = (event: PointerEvent<HTMLElement>) => {
    const dragState = pointerCardDragRef.current;
    if (!dragState) {
      return;
    }

    const distanceX = Math.abs(event.clientX - dragState.startX);
    const distanceY = Math.abs(event.clientY - dragState.startY);
    if (distanceX > 6 || distanceY > 6) {
      pointerCardDragRef.current = {
        ...dragState,
        hasMoved: true,
      };
      setDraggedSkillPath(dragState.path);
      const targetElement =
        typeof document.elementFromPoint === 'function'
          ? document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>('[data-skill-card-path]')
          : null;
      const targetPath = targetElement?.dataset.skillCardPath;
      setDragOverSkillPath(targetPath && targetPath !== dragState.path ? targetPath : null);
    }
  };

  const finishPointerCategorySkillDrag = (event: PointerEvent<HTMLElement>, categoryId: CategoryId, fallbackTargetPath: string) => {
    const dragState = pointerCardDragRef.current;
    pointerCardDragRef.current = null;

    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      // Some WebViews release capture automatically.
    }

    if (!dragState || !dragState.hasMoved || dragState.categoryId !== categoryId) {
      setDraggedSkillPath(null);
      setDragOverSkillPath(null);
      return;
    }

    const elementAtPointer =
      typeof document.elementFromPoint === 'function' ? document.elementFromPoint(event.clientX, event.clientY) : event.currentTarget;
    const targetElement = elementAtPointer?.closest<HTMLElement>('[data-skill-card-category][data-skill-card-path]');
    const targetCategoryId = (targetElement?.dataset.skillCardCategory as CategoryId | undefined) ?? categoryId;
    const targetPath = targetElement?.dataset.skillCardPath ?? fallbackTargetPath;

    if (targetCategoryId !== dragState.categoryId || targetPath === dragState.path) {
      setDraggedSkillPath(null);
      setDragOverSkillPath(null);
      return;
    }

    suppressNextCardClickRef.current = true;
    reorderCategorySkill(targetCategoryId, targetPath, dragState.path);
    setDraggedSkillPath(null);
    setDragOverSkillPath(null);
    window.setTimeout(() => {
      suppressNextCardClickRef.current = false;
    }, 0);
  };

  const reorderCategorySkill = (categoryId: CategoryId, targetPath: string, sourcePath = draggedSkillPath) => {
    if (!sourcePath || sourcePath === targetPath) {
      return;
    }

    const section = categorySections.find((currentSection) => currentSection.category.id === categoryId);
    if (!section || !section.skills.some((skill) => skill.path === sourcePath)) {
      return;
    }

    const nextOrder = section.skills.map((skill) => skill.path);
    const sourceIndex = nextOrder.indexOf(sourcePath);
    const targetIndex = nextOrder.indexOf(targetPath);
    if (sourceIndex === -1 || targetIndex === -1) {
      return;
    }
    [nextOrder[sourceIndex], nextOrder[targetIndex]] = [nextOrder[targetIndex], nextOrder[sourceIndex]];
    const nextCategorySkillOrder = {
      ...categorySkillOrder,
      [categoryId]: nextOrder,
    };

    setCategorySkillOrder(nextCategorySkillOrder);
    persistUiPreferences(categoryColors, categoryLabels, skillTags, nextCategorySkillOrder);
  };

  const restoreCategoryDefaultOrder = (categoryId: CategoryId) => {
    const nextCategorySkillOrder = { ...categorySkillOrder };
    delete nextCategorySkillOrder[categoryId];
    setCategorySkillOrder(nextCategorySkillOrder);
    persistUiPreferences(categoryColors, categoryLabels, skillTags, nextCategorySkillOrder);
  };

  const startDetailResize = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    detailResizeRef.current = {
      startWidth: detailPanelWidthRef.current,
      startX: event.clientX,
    };
  };

  const syncMarkdownPreviewScroll = (source: HTMLTextAreaElement | HTMLDivElement, target: HTMLTextAreaElement | HTMLDivElement) => {
    if (markdownSyncSourceRef.current) {
      return;
    }

    const sourceScrollable = source.scrollHeight - source.clientHeight;
    const targetScrollable = target.scrollHeight - target.clientHeight;
    const ratio = sourceScrollable > 0 ? source.scrollTop / sourceScrollable : 0;
    markdownSyncSourceRef.current = source === markdownInputRef.current ? 'editor' : 'preview';
    target.scrollTop = targetScrollable * ratio;
    window.requestAnimationFrame(() => {
      markdownSyncSourceRef.current = null;
    });
  };

  const syncMarkdownPreviewFromEditor = (event?: { currentTarget: HTMLTextAreaElement }) => {
    const editor = event?.currentTarget ?? markdownInputRef.current;
    const preview = markdownEditPreviewRef.current;
    if (editor && preview) {
      syncMarkdownPreviewScroll(editor, preview);
    }
  };

  const syncMarkdownEditorFromPreview = (event: UIEvent<HTMLDivElement>) => {
    const editor = markdownInputRef.current;
    if (editor) {
      syncMarkdownPreviewScroll(event.currentTarget, editor);
    }
  };

  const saveSettingsDraft = async () => {
    try {
      await saveSettings({
        ...settingsDraft,
        language: normalizeSelectableLanguage(settingsDraft.language),
        customCategories,
        categoryColors,
        categoryIcons: getPersistedCategoryIcons(categoryIcons, customCategories),
        categoryLabels: getPersistedCategoryLabels(categoryLabels, customCategories),
        categorySkillOrder: getPersistedCategorySkillOrder(categorySkillOrder),
        detailPanelWidth: getPersistedDetailPanelWidth(detailPanelWidth, settingsRef.current.detailPanelWidth),
        skillCardColors,
        skillCategoryAssignments: getPersistedSkillCategoryAssignments(skillCategoryAssignments),
        skillCategoryOverrides: {},
        skillTags,
        skillViewMode,
        skillLocks,
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

  const detailActions = (
    <div className="detail-actions detail-actions-pinned" style={{ position: 'static' }}>
      <button type="button" className="primary-action" disabled={!selectedDetail || selectedIsLocked || isSavingDetail} onClick={() => void saveSelectedSkill()}>
        <MaterialIcon name="save" />
        {t('actions.save')}
      </button>
      <button
        type="button"
        className="secondary-action"
        disabled={!selectedDetail || !selectedCanDelete}
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
  );
  const contextMenuSkill = skillTagContextMenu ? skills.find((skill) => skill.path === skillTagContextMenu.path) : null;
  const contextMenuPermanentlyLocked = contextMenuSkill ? isReadOnlySkill(contextMenuSkill) : false;
  const contextMenuLocked = contextMenuSkill ? contextMenuPermanentlyLocked || Boolean(skillLocks[contextMenuSkill.path]) : false;
  const contextMenuCategoryIds =
    skillTagContextMenu && contextMenuSkill
      ? skillCategoryAssignments[skillTagContextMenu.path] ?? getInferredSkillCategories(contextMenuSkill).map((category) => category.id)
      : ['default'];
  const contextMenuAvailableCategories = categoryNavItems.flatMap((item) => (item.category ? [item.category] : []));

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
          <button
            type="button"
            className="secondary-action"
            onClick={() => {
              if (workspaceMode === 'editor' && editorHasChanges && !window.confirm(t('editor.unsavedConfirm'))) {
                return;
              }
              void scanSkills();
            }}
          >
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
            onClick={() => {
              if (workspaceMode === 'editor' && editorHasChanges && !window.confirm(t('editor.unsavedConfirm'))) {
                return;
              }
              setShowSettings((current) => !current);
            }}
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
            <section className="settings-card migration-card" aria-label="Migration">
              <h3>Migration</h3>
              <p className="muted">Move settings, category colors, custom tags, and local skills between machines.</p>
              <div className="migration-actions">
                <button type="button">Export migration package</button>
                <button type="button">Import migration package</button>
                <button type="button">Validate migration</button>
              </div>
            </section>
          </div>

          <div className="settings-actions">
            <button type="button" className="primary-action" disabled={settingsSaveStatus === 'saving'} onClick={() => void saveSettingsDraft()}>
              {settingsSaveStatus === 'saving' ? t('settings.saving') : t('settings.save')}
            </button>
          </div>
        </section>
      ) : null}

      {workspaceMode === 'editor' ? (
        <section className="editor-workspace" aria-label={t('editor.workspace')}>
          <aside className="panel editor-rail" aria-label={t('editor.sidebar')}>
            <div className="editor-rail-heading">
              <div>
                <h2>{t('editor.sidebar')}</h2>
                <p>{editorHasChanges ? t('editor.draftAutosaved') : t('editor.draftClean')}</p>
              </div>
              <button type="button" className="icon-button" aria-label={t('editor.backToLibrary')} onClick={leaveEditorWorkspace}>
                <MaterialIcon name="arrow_back" />
              </button>
            </div>
            <section className="editor-rail-section" aria-label={t('editor.drafts')}>
              <h3>{t('editor.drafts')}</h3>
              <button type="button" className="editor-draft-card active">
                <strong>{editorDraft.name || t('editor.untitled')}</strong>
                <span>{editorDraft.path ?? editorDraft.sourcePath ?? t('editor.localDraft')}</span>
              </button>
            </section>
            <section className="editor-rail-section" aria-label={t('editor.recent')}>
              <h3>{t('editor.recent')}</h3>
              {editorRecentSkills.length > 0 ? (
                <div className="editor-recent-list">
                  {editorRecentSkills.map((skill) => (
                    <button key={skill.path} type="button" onClick={() => void openEditorWorkspace(skill)}>
                      <strong>{skill.name}</strong>
                      <span>{formatDateTime(skill.modifiedAt, locale) ?? t('skills.modifiedUnknown')}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="muted">{t('editor.noRecent')}</p>
              )}
            </section>
            <section className="editor-rail-section" aria-label={t('editor.protectedCopy')}>
              <h3>{t('editor.protectedCopy')}</h3>
              <p className="muted">{t('editor.protectedCopyHint')}</p>
            </section>
          </aside>
          <section className="panel editor-main" aria-label={t('editor.main')}>
            <div className="editor-toolbar">
              <div>
                <span className="detail-eyebrow">{t('editor.workspace')}</span>
                <h2>{editorDraft.kind === 'new' ? t('editor.newTitle') : editorDraft.name || t('editor.untitled')}</h2>
              </div>
              <div className="editor-save-state" role="status">
                {editorSaveCompleted === 'saved' ? t('editor.savedComplete') : editorHasChanges ? t('editor.draftAutosaved') : t('editor.draftClean')}
              </div>
              <button type="button" className="secondary-action" onClick={leaveEditorWorkspace}>
                {t('editor.backToLibrary')}
              </button>
              <button type="button" className="primary-action" disabled={isSavingDetail} onClick={saveEditorDraft}>
                <MaterialIcon name={editorSaveCompleted === 'saved' ? 'check' : 'save'} />
                {editorSaveCompleted === 'saved' ? t('editor.savedComplete') : t('actions.save')}
              </button>
            </div>
            {detailError ? (
              <section className="detail-section error-state" aria-label={t(detailErrorTitleKey)}>
                <strong>{t(detailErrorTitleKey)}</strong>
                <p>{detailError}</p>
              </section>
            ) : null}
            {editorDraft.sourcePath ? (
              <section className="detail-section warning-state" aria-label={t('editor.copySource')}>
                <strong>{t('editor.copySource')}</strong>
                <p>{editorDraft.sourcePath}</p>
              </section>
            ) : null}
            <div className="editor-grid">
              <section className="editor-frontmatter" aria-label={t('editor.frontmatter')}>
                <h3>{t('editor.frontmatter')}</h3>
                <label className="field-stack">
                  <span>{t('details.name')}</span>
                  <input aria-label={t('details.name')} value={editorDraft.name} onChange={(event) => updateEditorFrontmatterField('name', event.target.value)} />
                </label>
                <label className="field-stack">
                  <span>{t('details.description')}</span>
                  <textarea
                    aria-label={t('details.description')}
                    value={editorDraft.description}
                    onChange={(event) => updateEditorFrontmatterField('description', event.target.value)}
                  />
                </label>
                <label className="field-stack">
                  <span>{t('create.source')}</span>
                  <select
                    aria-label={t('create.source')}
                    value={editorDraft.source}
                    disabled={editorDraft.kind === 'existing'}
                    onChange={(event) => updateEditorDraft({ source: event.currentTarget.value as WritableSkillSource })}
                  >
                    <option value="codex-user">{t('sources.codexUser')}</option>
                    <option value="agents-user">{t('sources.agentsUser')}</option>
                    <option value="custom">{t('sources.custom')}</option>
                  </select>
                </label>
                {editorDraft.kind !== 'existing' ? (
                  <label className="field-stack">
                    <span>{t('create.targetDirectory')}</span>
                    <input
                      aria-label={t('create.targetDirectory')}
                      list="editor-target-directory-suggestions"
                      value={editorDraft.targetDirectory}
                      onChange={(event) => updateEditorDraft({ targetDirectory: event.currentTarget.value })}
                    />
                  </label>
                ) : null}
                <dl className="editor-meta-list">
                  <div>
                    <dt>{t('details.path')}</dt>
                    <dd>{editorDraft.path ?? t('editor.localDraft')}</dd>
                  </div>
                  <div>
                    <dt>{t('editor.bodyLength')}</dt>
                    <dd>{String(editorBodyMarkdown.length)}</dd>
                  </div>
                </dl>
              </section>
              <section className="editor-markdown-pane" aria-label={t('details.markdownBody')}>
                <label className="field-stack">
                  <span>{t('details.markdownBody')}</span>
                  <textarea
                    className="editor-markdown-input"
                    aria-label={t('details.markdownBody')}
                    value={editorDraft.markdown}
                    onChange={(event) => updateEditorMarkdown(event.currentTarget.value)}
                  />
                </label>
              </section>
              <section className="editor-preview-pane" aria-label={t('details.markdownPreview')}>
                <h3>{t('details.markdownPreview')}</h3>
                <MarkdownPreviewBlock ariaLabel={t('details.markdownPreview')} emptyText={t('details.markdownEmpty')} markdown={editorBodyMarkdown} />
              </section>
            </div>
            <datalist id="editor-target-directory-suggestions">
              {settings.customScanDirectories.map((directory) => (
                <option key={directory} value={directory} />
              ))}
              {defaultScanPathGroups.flatMap((group) =>
                group.paths.map((path) => <option key={`${group.labelKey}-${path}`} value={path} />),
              )}
            </datalist>
          </section>
        </section>
      ) : (
      <section
        className="dashboard-grid fluid-dashboard-grid"
        aria-label={t('layout.dashboard')}
        style={{ '--detail-panel-width': `${detailPanelWidth}px` } as CSSProperties}
      >
        <aside className="panel sidebar fluid-sidebar-panel" aria-label={localizedCategorySidebarLabel}>
          <div className="sidebar-kicker">
            <h2>{localizedCategorySidebarLabel}</h2>
            <p>{t('category.totalSkills', { count: String(skills.length) })}</p>
          </div>
          <section className="sidebar-section governance-section" aria-label={t('governance.title')}>
            <h3>{t('governance.title')}</h3>
            <div className="button-stack">
              <button
                type="button"
                aria-label={`${t('governance.userEditable')} ${governanceCounts.userEditable}`}
                className={activeGovernanceFilter === 'user-editable' ? 'active' : undefined}
                onClick={() => {
                  setActiveGovernanceFilter((current) => (current === 'user-editable' ? null : 'user-editable'));
                  setActiveCategoryId(null);
                  setActiveTagLabel(null);
                }}
              >
                <SourceNavIcon name="default" />
                <span className="source-nav-label">{t('governance.userEditable')}</span>
                <span className="source-nav-count">{governanceCounts.userEditable}</span>
              </button>
              <button
                type="button"
                aria-label={`${t('governance.readOnlyPlugins')} ${governanceCounts.readOnlyPlugins}`}
                className={activeGovernanceFilter === 'read-only-plugins' ? 'active' : undefined}
                onClick={() => {
                  setActiveGovernanceFilter((current) => (current === 'read-only-plugins' ? null : 'read-only-plugins'));
                  setActiveCategoryId(null);
                  setActiveTagLabel(null);
                }}
              >
                <SourceNavIcon name="tag" />
                <span className="source-nav-label">{t('governance.readOnlyPlugins')}</span>
                <span className="source-nav-count">{governanceCounts.readOnlyPlugins}</span>
              </button>
            </div>
          </section>
          <section className="sidebar-section topic-section" aria-label={t('category.topicsAndTags')}>
            <h3>{t('category.topicsAndTags')}</h3>
          </section>
          <nav aria-label={localizedCategorySidebarLabel}>
            {categoryNavItems.map((item) => {
              const label = item.category ? getCategoryLabel(item.category, categoryLabels, t) : t(item.labelKey ?? 'sources.allSkills');
              const count = item.category ? (categoryCounts[item.category.id] ?? 0) : skills.length;
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
                    setActiveGovernanceFilter(null);
                    setCurrentPage(1);
                  }}
                  onContextMenu={(event) => {
                    if (item.category) {
                      openCategoryContextMenu(event, item.category.id);
                    }
                  }}
                >
                  <SourceNavIcon name={item.icon} icon={item.category ? getCategoryIcon(item.category, categoryIcons) : undefined} />
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
                    setActiveGovernanceFilter(null);
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
            <strong>{`${t('sources.scanState')}: ${t(scanOutcomeLabelKey)}`}</strong>
          </div>

        </aside>

        <section className="panel list-panel fluid-list-panel" aria-label={t('skills.title')}>
          <div className="section-heading">
            <div>
              <h2>{t('skills.title')}</h2>
              <p>{t('skills.showingCount', { count: String(sortedFilteredSkills.length), unit: t('skills.countUnit') })}</p>
              <span className="visually-hidden">{`${sortedFilteredSkills.length} ${t('skills.countUnit')}`}</span>
            </div>
            <div className="list-toolbar" ref={toolbarMenuRef}>
              <button
                type="button"
                className={selectionMode ? 'icon-button active' : 'icon-button'}
                aria-label={t('bulk.toggleSelection')}
                aria-pressed={selectionMode}
                onClick={() => {
                  if (selectionMode) {
                    closeSelectionMode();
                  } else {
                    setSelectionMode(true);
                  }
                }}
              >
                <MaterialIcon name="select_check_box" />
              </button>
              <div className="view-switcher" role="tablist" aria-label={t('view.skillView')}>
                <button
                  type="button"
                  role="tab"
                  aria-selected={skillViewMode === 'list'}
                  className={skillViewMode === 'list' ? 'active' : undefined}
                  title={t('view.list')}
                  onClick={() => {
                    setSkillViewMode('list');
                    persistUiPreferences(categoryColors, categoryLabels, skillTags, categorySkillOrder, detailPanelWidthRef.current, categoryIcons, skillCardColors, skillCategoryAssignments, customCategories, 'list');
                  }}
                >
                  <MaterialIcon name="format_list_bulleted" />
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={skillViewMode === 'cards'}
                  className={skillViewMode === 'cards' ? 'active' : undefined}
                  title={t('view.cards')}
                  onClick={() => {
                    setSkillViewMode('cards');
                    persistUiPreferences(categoryColors, categoryLabels, skillTags, categorySkillOrder, detailPanelWidthRef.current, categoryIcons, skillCardColors, skillCategoryAssignments, customCategories, 'cards');
                  }}
                >
                  <MaterialIcon name="grid_view" />
                </button>
              </div>
              <button
                type="button"
                className={sortByNameAscending ? 'icon-button active' : 'icon-button'}
                aria-label={t('toolbar.sortSkills')}
                aria-pressed={sortByNameAscending}
                onClick={() => {
                  setSortByNameAscending((isActive) => !isActive);
                  setSortMode('name');
                  setShowSortMenu((isOpen) => !isOpen);
                }}
              >
                <MaterialIcon name="sort" />
              </button>
              {showSortMenu ? (
                <div className="toolbar-menu" role="menu" aria-label={t('toolbar.sortSkills')}>
                  <button type="button" role="menuitemradio" aria-checked={sortMode === 'name'} onClick={() => setSortMode('name')}>
                    {t('toolbar.nameAz')}
                  </button>
                  <button type="button" role="menuitemradio" aria-checked={sortMode === 'modified'} onClick={() => setSortMode('modified')}>
                    {t('toolbar.modifiedTime')}
                  </button>
                </div>
              ) : null}
              <button
                type="button"
                className={showWritableOnly || showReadOnlyOnly ? 'icon-button active' : 'icon-button'}
                aria-label={t('toolbar.filterSkills')}
                aria-pressed={showWritableOnly || showReadOnlyOnly}
                onClick={() => {
                  setShowFilterMenu((isOpen) => !isOpen);
                }}
              >
                <MaterialIcon name="filter_list" />
              </button>
              {showFilterMenu ? (
                <div className="toolbar-menu" role="menu" aria-label={t('toolbar.filterSkills')}>
                  <button type="button" role="menuitemcheckbox" aria-checked={showWritableOnly} onClick={() => setShowWritableOnly((isActive) => !isActive)}>
                    {t('toolbar.writableOnly')}
                  </button>
                  <button type="button" role="menuitemcheckbox" aria-checked={showReadOnlyOnly} onClick={() => setShowReadOnlyOnly((isActive) => !isActive)}>
                    {t('governance.readOnlyPlugins')}
                  </button>
                </div>
              ) : null}
            </div>
          </div>
          {selectionMode ? (
            <div className="bulk-action-bar" role="toolbar" aria-label={t('bulk.actions')}>
              <strong>{t('bulk.selectedCount', { count: String(selectedSkillCount) })}</strong>
              <button type="button" onClick={() => setSelectedSkillPaths(new Set(sortedFilteredSkills.map((skill) => skill.path)))}>
                {t('bulk.selectAll')}
              </button>
              <button type="button" onClick={() => setSelectedSkillPaths(new Set())}>
                {t('bulk.clearSelection')}
              </button>
              <select aria-label={t('bulk.category')} value={bulkCategoryId} onChange={(event) => setBulkCategoryId(event.target.value)}>
                <option value="">{t('customize.chooseCategory')}</option>
                {contextMenuAvailableCategories.map((category) => (
                  <option key={`bulk-${category.id}`} value={category.id}>
                    {getCategoryLabel(category, categoryLabels, t)}
                  </option>
                ))}
              </select>
              <button type="button" disabled={!bulkCategoryId || selectedSkillCount === 0} onClick={applyBulkCategory}>
                {t('bulk.changeCategory')}
              </button>
              <input
                aria-label={t('bulk.tag')}
                value={bulkTagDraft}
                placeholder={t('bulk.tag')}
                onChange={(event) => setBulkTagDraft(event.target.value)}
              />
              <button type="button" disabled={!bulkTagDraft.trim() || selectedSkillCount === 0} onClick={applyBulkTag}>
                {t('bulk.addTag')}
              </button>
              <select aria-label={t('bulk.color')} value={bulkColor} onChange={(event) => setBulkColor(event.target.value)}>
                {skillCardColorChoices.map((choice) => (
                  <option key={`bulk-color-${choice.labelKey ?? choice.label}`} value={choice.color}>
                    {choice.labelKey ? t(choice.labelKey) : choice.label}
                  </option>
                ))}
              </select>
              <button type="button" disabled={selectedSkillCount === 0} onClick={applyBulkColor}>
                {t('bulk.applyColor')}
              </button>
              <button type="button" disabled={selectedSkillCount === 0} onClick={() => applyBulkLock(true)}>
                <MaterialIcon name="lock" size={17} />
                {t('bulk.lock')}
              </button>
              <button type="button" disabled={selectedSkillCount === 0} onClick={() => applyBulkLock(false)}>
                <MaterialIcon name="lock_open" size={17} />
                {t('bulk.unlock')}
              </button>
              <button type="button" className="danger-action" disabled={selectedSkillCount === 0} onClick={() => setShowBulkDeleteConfirm(true)}>
                <MaterialIcon name="delete" size={17} />
                {t('bulk.delete')}
              </button>
            </div>
          ) : null}
          {listState === 'ready' ? (
            <div className="skill-list-scroll fluid-table-region">
              <div className={skillViewMode === 'cards' ? 'skill-card-grid active' : 'skill-card-grid'}>
                {categorySections.map((section) => (
                  <section
                    key={section.category.id}
                    className="category-card-section"
                    aria-label={`Skill category: ${section.label}`}
                    style={getCategoryStyle(section.category, categoryColors)}
                  >
                    <div className="category-card-heading">
                      <div>
                        <h3>{section.label}</h3>
                        <span>{`${section.skills.length} ${t('skills.countUnit')}`}</span>
                      </div>
                      <div className="category-heading-actions">
                        {selectionMode ? (
                          <button
                            type="button"
                            className="select-category-button"
                            aria-label={t('bulk.selectCategory', { category: section.label })}
                            onClick={() => setSelectedSkillPaths(new Set(section.skills.map((skill) => skill.path)))}
                          >
                            <MaterialIcon name="select_all" size={17} />
                          </button>
                        ) : null}
                        <button type="button" className="restore-order-button" onClick={() => restoreCategoryDefaultOrder(section.category.id)}>
                          {t('actions.restoreDefault')}
                        </button>
                      </div>
                    </div>
                    <div
                      className="category-card-scroll two-row-card-scroll"
                      style={{ overflowY: 'auto' }}
                      onDragOver={(event) => {
                        event.preventDefault();
                        event.dataTransfer.dropEffect = 'move';
                      }}
                    >
                      {section.skills.map((skill) => {
                        const selected = selectionMode ? selectedSkillPaths.has(skill.path) : selectedPath === skill.path;
                        const customTags = skillTags[skill.path] ?? [];
                        const locked = isReadOnlySkill(skill) || Boolean(skillLocks[skill.path]);
                        return (
                          <div
                            key={`${section.category.id}-${skill.path}`}
                            role="button"
                            tabIndex={0}
                            className={`skill-card ${selected ? 'selected-card' : ''} ${draggedSkillPath === skill.path ? 'dragging-card' : ''} ${dragOverSkillPath === skill.path ? 'drag-over-card' : ''}`}
                            aria-pressed={selected}
                            draggable={!selectionMode}
                            data-skill-card-category={section.category.id}
                            data-skill-card-path={skill.path}
                            style={getSkillCardStyle(skill.path, skillCardColors)}
                            onDragStart={(event) => startCategorySkillDrag(event, skill.path)}
                            onDragEnd={() => {
                              setDraggedSkillPath(null);
                              setDragOverSkillPath(null);
                            }}
                            onPointerDown={(event) => startPointerCategorySkillDrag(event, section.category.id, skill.path)}
                            onPointerMove={movePointerCategorySkillDrag}
                            onPointerCancel={() => {
                              pointerCardDragRef.current = null;
                              setDraggedSkillPath(null);
                              setDragOverSkillPath(null);
                            }}
                            onPointerUp={(event) => finishPointerCategorySkillDrag(event, section.category.id, skill.path)}
                            onDragEnter={(event) => {
                              event.preventDefault();
                              event.dataTransfer.dropEffect = 'move';
                              if (draggedSkillPath && draggedSkillPath !== skill.path) {
                                setDragOverSkillPath(skill.path);
                              }
                            }}
                            onDragOver={(event) => {
                              event.preventDefault();
                              event.dataTransfer.dropEffect = 'move';
                            }}
                            onDrop={(event) => {
                              event.preventDefault();
                              reorderCategorySkill(section.category.id, skill.path, event.dataTransfer.getData('text/plain') || draggedSkillPath);
                              setDraggedSkillPath(null);
                              setDragOverSkillPath(null);
                            }}
                            onClick={() => {
                              if (suppressNextCardClickRef.current) {
                                return;
                              }
                              if (selectionMode) {
                                toggleSkillSelection(skill.path);
                              } else {
                                void selectSkill(skill);
                              }
                            }}
                            onContextMenu={(event) => openSkillTagContextMenu(event, skill.path)}
                            onKeyDown={(event) => {
                              if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault();
                                if (selectionMode) {
                                  toggleSkillSelection(skill.path);
                                } else {
                                  void selectSkill(skill);
                                }
                              }
                            }}
                          >
                            <span className="skill-card-topline">
                              <span className="skill-card-leading">
                                {selectionMode ? (
                                  <input
                                    type="checkbox"
                                    aria-label={t('bulk.selectSkill', { name: skill.name })}
                                    checked={selectedSkillPaths.has(skill.path)}
                                    onClick={(event) => event.stopPropagation()}
                                    onChange={() => toggleSkillSelection(skill.path)}
                                  />
                                ) : null}
                                <span className="skill-card-icon">
                                  <MaterialIcon name={getSkillIcon(skill)} size={24} />
                                </span>
                              </span>
                              <span
                                className={`skill-card-lock-state ${locked ? 'locked' : 'unlocked'}`}
                                aria-label={locked ? t('skills.lockedSkill') : t('skills.editableSkill')}
                                title={locked ? t('skills.lockedSkill') : t('skills.editableSkill')}
                              >
                                <MaterialIcon name={locked ? 'lock' : 'lock_open'} size={18} />
                              </span>
                            </span>
                            <span className="skill-card-body">
                              <strong>{skill.name}</strong>
                              <span className="skill-description">{skill.description}</span>
                            </span>
                            <span className="skill-card-actions">
                              <button
                                type="button"
                                className="secondary-action"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  void openEditorWorkspace(skill);
                                }}
                              >
                                <MaterialIcon name="edit" size={16} />
                                {t('editor.open')}
                              </button>
                              {isReadOnlySkill(skill) ? (
                                <button
                                  type="button"
                                  className="secondary-action"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    void copyProtectedSkillToEditor(skill);
                                  }}
                                >
                                  <MaterialIcon name="content_copy" size={16} />
                                  {t('editor.copyToUserSkill')}
                                </button>
                              ) : null}
                            </span>
                            <span className="skill-card-tags">
                              {getEffectiveSkillCategories(skill, skillCategoryAssignments, categoryLabels, categoryColors, categoryIcons).map((category) => (
                                <span
                                  key={`${skill.path}-${category.id}`}
                                  className={`category-chip ${category.className}`}
                                  data-testid={`skill-category-${skill.path}-${category.id}`}
                                  style={getCategoryStyle(category, categoryColors)}
                                  aria-hidden="true"
                                >
                                  {getCategoryLabel(category, categoryLabels, t)}
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
                          </div>
                        );
                      })}
                    </div>
                  </section>
                ))}
              </div>

              <div className={skillViewMode === 'list' ? 'skill-table-wrap fluid-table-region active' : 'skill-table-wrap fluid-table-region semantic-table'}>
                <table aria-label={t('skills.tableLabel')} className="skill-table">
                  <thead>
                    <tr>
                      <th scope="col">{t('skills.columnName')}</th>
                      <th scope="col">{t('skills.columnDescription')}</th>
                      <th scope="col">{t('skills.columnModified')}</th>
                      <th scope="col">{t('skills.columnPath')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedSkills.map((skill) => (
                      <tr
                        key={skill.path}
                        className={(selectionMode ? selectedSkillPaths.has(skill.path) : selectedPath === skill.path) ? 'selected-row' : undefined}
                        aria-selected={selectionMode ? selectedSkillPaths.has(skill.path) : selectedPath === skill.path}
                        tabIndex={0}
                        onClick={() => {
                          if (selectionMode) {
                            toggleSkillSelection(skill.path);
                          } else {
                            void selectSkill(skill);
                          }
                        }}
                        onContextMenu={(event) => openSkillTagContextMenu(event, skill.path)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            if (selectionMode) {
                              toggleSkillSelection(skill.path);
                            } else {
                              void selectSkill(skill);
                            }
                          }
                        }}
                      >
                        <td>
                          <span className="table-skill-name">
                            {selectionMode ? (
                              <input
                                type="checkbox"
                                aria-label={t('bulk.selectSkill', { name: skill.name })}
                                checked={selectedSkillPaths.has(skill.path)}
                                onClick={(event) => event.stopPropagation()}
                                onChange={() => toggleSkillSelection(skill.path)}
                              />
                            ) : null}
                            <span className="table-skill-icon">
                              <MaterialIcon name={getSkillIcon(skill)} />
                            </span>
                            <strong>{skill.name}</strong>
                          </span>
                          <span className="table-skill-tags">
                            {getEffectiveSkillCategories(skill, skillCategoryAssignments, categoryLabels, categoryColors, categoryIcons).map((category) => (
                              <span
                                key={`${skill.path}-table-${category.id}`}
                                className={`category-chip ${category.className}`}
                                style={getCategoryStyle(category, categoryColors)}
                              >
                                {getCategoryLabel(category, categoryLabels, t)}
                              </span>
                            ))}
                            {(skillTags[skill.path] ?? []).map((tag, index) => (
                              <span
                                key={`${skill.path}-table-${tag.label}-${index}`}
                                className="category-chip custom-skill-tag"
                                style={getTagStyle(tag.color)}
                              >
                                {tag.label}
                              </span>
                            ))}
                          </span>
                        </td>
                        <td>
                          {skillViewMode === 'list' ? <span className="skill-description">{skill.description}</span> : null}
                        </td>
                        <td>{formatDateTime(skill.modifiedAt, locale) ?? t('skills.modifiedUnknown')}</td>
                        <td>
                          <PathButton path={skill.path} onOpen={openSkillFolder} />
                          <span className="table-row-actions">
                            <button
                              type="button"
                              className="secondary-action"
                              onClick={(event) => {
                                event.stopPropagation();
                                void openEditorWorkspace(skill);
                              }}
                            >
                              <MaterialIcon name="edit" size={16} />
                              {t('editor.open')}
                            </button>
                            {isReadOnlySkill(skill) ? (
                              <button
                                type="button"
                                className="secondary-action"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  void copyProtectedSkillToEditor(skill);
                                }}
                              >
                                <MaterialIcon name="content_copy" size={16} />
                                {t('editor.copyToUserSkill')}
                              </button>
                            ) : null}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {skillViewMode === 'list' ? (
                <div className="pagination-controls" aria-label={t('pagination.label')}>
                  <span>
                    {t('pagination.range', {
                      end: String(Math.min(normalizedCurrentPage * skillsPerPage, sortedFilteredSkills.length)),
                      start: String(paginatedSkills.length === 0 ? 0 : (normalizedCurrentPage - 1) * skillsPerPage + 1),
                      total: String(sortedFilteredSkills.length),
                      unit: t('skills.countUnit'),
                    })}
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
              ) : null}
            </div>
          ) : (
            <div className={`empty-state ${listState === 'error' ? 'error-state' : ''}`}>
              {listState === 'error' ? (
                <section className="scan-diagnostics" aria-label={t('diagnostics.scanDiagnostics')}>
                  <strong>{t('skills.errorTitle')}</strong>
                  {isTauriUnavailable(scanError ?? '') ? <h3>{t('diagnostics.desktopBridgeUnavailable')}</h3> : null}
                  <p>
                    {isTauriUnavailable(scanError ?? '')
                      ? t('diagnostics.desktopBridgeUnavailableDescription')
                      : scanError}
                  </p>
                  {scanError && isTauriUnavailable(scanError) ? <code>{scanError}</code> : null}
                  <div className="diagnostic-paths">
                    {[...sidebarStoragePaths, ...settings.customScanDirectories].map((path) => (
                      <span key={path}>{t('diagnostics.scanPath', { path })}</span>
                    ))}
                  </div>
                  <div className="diagnostic-actions">
                    <button type="button" onClick={() => void scanSkills()}>
                      {t('actions.rescan')}
                    </button>
                    <button type="button" onClick={() => setShowSettings(true)}>
                      {t('diagnostics.reviewScanSettings')}
                    </button>
                  </div>
                </section>
              ) : (
                <>
                  <strong>
                    {listState === 'loading'
                      ? t('skills.loadingTitle')
                      : listState === 'filtered-empty'
                        ? t('skills.noMatchesTitle')
                        : t('skills.emptyTitle')}
                  </strong>
                  <p>
                    {listState === 'loading'
                      ? t('skills.loadingDescription')
                      : listState === 'filtered-empty'
                        ? t('skills.noMatchesDescription')
                        : t('skills.emptyDescription')}
                  </p>
                </>
              )}
            </div>
          )}
        </section>

        <button
          type="button"
          className="detail-resize-handle"
          role="separator"
          aria-label={t('details.resizePanel')}
          aria-orientation="vertical"
          onMouseDown={startDetailResize}
        >
          <span />
        </button>

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
                  disabled={selectedIsLocked}
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
                  <input disabled={selectedIsLocked} value={detailName} onChange={(event) => setDetailName(event.target.value)} />
                </label>
                <div className="detail-tag-row">
                  {getEffectiveSkillCategories(selectedDetail, skillCategoryAssignments, categoryLabels, categoryColors, categoryIcons).map((category) => (
                    <span
                      key={`${selectedDetail.path}-${category.id}`}
                      className={`category-chip ${category.className}`}
                      style={getCategoryStyle(category, categoryColors)}
                    >
                      {getCategoryLabel(category, categoryLabels, t)}
                    </span>
                  ))}
                  <button type="button" className="tag-edit-button" aria-label={t('details.tags')}>
                    <MaterialIcon name="edit" size={14} />
                  </button>
                </div>
                <dl className="detail-meta-strip">
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

              {selectedIsLocked ? (
                <section className="detail-section warning-state" aria-label={t('details.readOnlySource')}>
                  <strong>{t(selectedIsPermanentlyLocked ? 'details.readOnlySource' : 'details.userLocked')}</strong>
                  <p>{t(selectedIsPermanentlyLocked ? 'details.readOnlySourceDescription' : 'details.userLockedDescription')}</p>
                </section>
              ) : null}

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
                      disabled={selectedIsLocked}
                      value={detailDescription}
                      onChange={(event) => setDetailDescription(event.target.value)}
                    />
                  </label>
                )}
              </section>
              <section className="detail-markdown-section detail-body-section fluid-markdown-region">
                {detailMode === 'preview' ? (
                  <div className="markdown-preview-shell">
                    <MarkdownPreviewBlock ariaLabel={t('details.markdownPreview')} emptyText={t('details.markdownEmpty')} markdown={detailMarkdown} />
                  </div>
                ) : (
                  <div className="markdown-edit-layout">
                    <label className="field-stack detail-markdown-field">
                      <span>{t('details.markdownBody')}</span>
                      <textarea
                        ref={markdownInputRef}
                        className="detail-markdown-input fluid-markdown-input"
                        disabled={selectedIsLocked}
                        value={detailMarkdown}
                        onChange={(event) => {
                          setDetailMarkdown(event.target.value);
                          syncMarkdownPreviewFromEditor(event);
                        }}
                        onClick={() => syncMarkdownPreviewFromEditor()}
                        onKeyUp={() => syncMarkdownPreviewFromEditor()}
                        onScroll={syncMarkdownPreviewFromEditor}
                      />
                    </label>
                    <MarkdownPreviewBlock
                      ariaLabel={t('details.markdownEditPreview')}
                      emptyText={t('details.markdownEmpty')}
                      markdown={detailMarkdown}
                      onScroll={syncMarkdownEditorFromPreview}
                      previewRef={markdownEditPreviewRef}
                    />
                  </div>
                )}
              </section>

              <section className="detail-section lint-section" aria-label={t('lint.title')}>
                <h3>{t('lint.title')}</h3>
                <ul>
                  {selectedLintItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
              {detailActions}
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
              {detailActions}
            </div>
          )}
        </aside>
      </section>
      )}
      {categoryContextMenu ? (
        (() => {
          const activeCategory = buildCategoryDefinition(categoryContextMenu.categoryId, categoryLabels, categoryColors, categoryIcons);
          return (
        <div
          ref={categoryContextMenuRef}
          className="context-menu color-context-menu"
          role="menu"
          style={{ left: categoryContextMenu.x, top: categoryContextMenu.y }}
        >
          <strong>{getCategoryLabel(activeCategory, categoryLabels, t)}</strong>
          <label className="field-stack">
            <span>{t('customize.categoryName')}</span>
            <input aria-label={t('customize.categoryName')} value={categoryLabelDraft} onChange={(event) => setCategoryLabelDraft(event.target.value)} />
          </label>
          <div className="context-menu-actions">
            <button type="button" onClick={() => setCategoryContextMenu(null)}>
              {t('actions.cancel')}
            </button>
            <button type="button" className="primary-action" onClick={saveCategoryLabel}>
              {t('customize.saveCategory')}
            </button>
          </div>
          <div className="context-menu-group" role="group" aria-label={t('customize.categoryColor')}>
            {colorChoices.map((choice) => (
              <button
                key={choice.color}
                type="button"
                aria-label={t('customize.categoryColorChoice', {
                  category: getCategoryLabel(activeCategory, categoryLabels, t),
                  color: choice.labelKey ? t(choice.labelKey) : choice.label,
                })}
                onClick={() => updateCategoryColor(categoryContextMenu.categoryId, choice.color)}
              >
                <span className="color-swatch" style={{ background: choice.color }} />
                {choice.labelKey ? t(choice.labelKey) : choice.label}
              </button>
            ))}
          </div>
          <div className="context-menu-group" role="group" aria-label={t('customize.categoryIcon')}>
            {categoryIconChoices.map((choice) => (
              <button
                key={choice.icon}
                type="button"
                className={getCategoryIcon(activeCategory, categoryIcons) === choice.icon ? 'active-choice' : undefined}
                aria-label={t('customize.categoryIconChoice', { icon: t(choice.labelKey) })}
                onClick={() => updateCategoryIcon(categoryContextMenu.categoryId, choice.icon)}
              >
                <MaterialIcon name={choice.icon} />
                {t(choice.labelKey)}
              </button>
            ))}
          </div>
        </div>
          );
        })()
      ) : null}
      {skillTagContextMenu ? (
        <div
          ref={skillTagContextMenuRef}
          className="context-menu tag-context-menu"
          role="dialog"
          aria-label={t('customize.skillMenu')}
          style={{ left: skillTagContextMenu.x, top: skillTagContextMenu.y }}
        >
          <strong>{contextMenuSkill?.name ?? t('customize.skillMenu')}</strong>
          <button
            type="button"
            className="context-lock-action"
            disabled={contextMenuPermanentlyLocked}
            onClick={() => {
              if (contextMenuSkill && !contextMenuPermanentlyLocked) {
                updateSkillLock(contextMenuSkill.path, !contextMenuLocked);
              }
            }}
          >
            <MaterialIcon name={contextMenuLocked ? 'lock' : 'lock_open'} size={18} />
            {t(
              contextMenuPermanentlyLocked
                ? 'customize.permanentlyLocked'
                : contextMenuLocked
                  ? 'customize.unlockSkill'
                  : 'customize.lockSkill',
            )}
          </button>
          <div className="context-menu-group existing-tag-list" role="group" aria-label={t('customize.defaultCategory')}>
            <span className="context-menu-caption">{t('customize.currentCategories')}</span>
            {contextMenuCategoryIds.map((categoryId) => {
              const category = buildCategoryDefinition(categoryId, categoryLabels, categoryColors, categoryIcons);
              return (
                <div key={`${skillTagContextMenu.path}-${categoryId}`} className="existing-tag-item">
                  <span className={`category-chip ${category.className}`} style={getCategoryStyle(category, categoryColors)}>
                    {getCategoryLabel(category, categoryLabels, t)}
                  </span>
                  <button
                    type="button"
                    aria-label={t('customize.removeCategory', { label: getCategoryLabel(category, categoryLabels, t) })}
                    onClick={() => removeSkillCategoryAssignment(skillTagContextMenu.path, categoryId)}
                  >
                    {t('customize.delete')}
                  </button>
                </div>
              );
            })}
          </div>
          <label className="field-stack">
            <span>{t('customize.addDefaultCategory')}</span>
            <select
              aria-label={t('customize.addDefaultCategory')}
              defaultValue=""
              onChange={(event) => {
                const categoryId = event.currentTarget.value;
                if (categoryId) {
                  addSkillCategoryAssignment(skillTagContextMenu.path, categoryId);
                  event.currentTarget.value = '';
                }
              }}
            >
              <option value="">{t('customize.chooseCategory')}</option>
              {contextMenuAvailableCategories.map((category) => (
                <option key={category.id} value={category.id} disabled={contextMenuCategoryIds.includes(category.id)}>
                  {getCategoryLabel(category, categoryLabels, t)}
                </option>
              ))}
            </select>
          </label>
          <div className="context-menu-group color-choice-grid" role="group" aria-label={t('customize.cardColor')}>
            {skillCardColorChoices.map((choice) => (
              <button
                key={choice.labelKey ?? choice.label}
                type="button"
                className={(skillCardColors[skillTagContextMenu.path] ?? '') === choice.color ? 'active-choice' : undefined}
                aria-label={t('customize.cardColorChoice', { color: choice.labelKey ? t(choice.labelKey) : choice.label })}
                onClick={() => updateSkillCardColor(skillTagContextMenu.path, choice.color)}
              >
                <span className="color-swatch" style={{ background: choice.color || '#ffffff' }} />
                {choice.labelKey ? t(choice.labelKey) : choice.label}
              </button>
            ))}
          </div>
          {(skillTags[skillTagContextMenu.path] ?? []).length > 0 ? (
            <div className="existing-tag-list">
              {(skillTags[skillTagContextMenu.path] ?? []).map((tag, index) => (
                <div key={`${tag.label}-${index}`} className="existing-tag-item">
                  <span className="category-chip custom-skill-tag" style={getTagStyle(tag.color)}>
                    {tag.label}
                  </span>
                  <button type="button" aria-label={t('customize.removeTag', { label: tag.label })} onClick={() => removeSkillTag(skillTagContextMenu.path, index)}>
                    {t('customize.delete')}
                  </button>
                </div>
              ))}
            </div>
          ) : null}
          <label className="field-stack">
            <span>{t('customize.tagName')}</span>
            <input aria-label={t('customize.tagName')} value={tagDraft} onChange={(event) => setTagDraft(event.target.value)} />
          </label>
          <div className="tag-color-picker" aria-label={t('customize.tagColor')}>
            {colorChoices.map((choice) => (
              <button
                key={choice.color}
                type="button"
                className={tagColor === choice.color ? 'active-color' : undefined}
                aria-label={t('customize.tagColorChoice', { color: choice.labelKey ? t(choice.labelKey) : choice.label })}
                onClick={() => setTagColor(choice.color)}
              >
                <span className="color-swatch" style={{ background: choice.color }} />
              </button>
            ))}
          </div>
          <div className="context-menu-actions">
            <button type="button" onClick={() => setSkillTagContextMenu(null)}>
              {t('actions.cancel')}
            </button>
            <button type="button" onClick={() => createCustomCategoryForSkill(skillTagContextMenu.path, tagDraft)}>
              {t('customize.addCategory')}
            </button>
            <button type="button" className="primary-action" onClick={addSkillTag}>
              {t('customize.addTag')}
            </button>
          </div>
        </div>
      ) : null}
      {showBulkDeleteConfirm ? (
        <div className="dialog-backdrop">
          <div role="dialog" aria-modal="true" aria-labelledby="bulk-delete-title" className="confirm-dialog">
            <h2 id="bulk-delete-title">{t('bulk.deleteTitle')}</h2>
            <p>{t('bulk.deleteConfirm', { count: String(selectedSkillCount) })}</p>
            <p className="muted">{t('details.deleteBackupNotice')}</p>
            <div className="dialog-actions">
              <button type="button" disabled={isBulkDeleting} onClick={() => setShowBulkDeleteConfirm(false)}>
                {t('actions.cancel')}
              </button>
              <button type="button" className="danger-action" disabled={isBulkDeleting} onClick={() => void deleteSelectedSkills()}>
                {t('actions.confirmDelete')}
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {showDeleteConfirm && deleteConfirmPath ? (
        <div className="dialog-backdrop">
          <div role="dialog" aria-modal="true" aria-labelledby="delete-skill-title" className="confirm-dialog">
            <h2 id="delete-skill-title">{t('actions.delete')}</h2>
            <p>{t('details.deleteConfirm')}</p>
            <p className="muted">{t('details.deleteBackupNotice')}</p>
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
      {showSaveConfirm && selectedDetail ? (
        <div className="dialog-backdrop">
          <div role="dialog" aria-modal="true" aria-labelledby="save-skill-title" className="confirm-dialog diff-dialog">
            <h2 id="save-skill-title">{t('saveReview.title')}</h2>
            <p>{t('saveReview.backupNotice')}</p>
            <div className="diff-preview">
              {pendingSaveDiffLines.length > 0 ? (
                pendingSaveDiffLines.map((line, index) => <code key={`${line}-${index}`}>{line}</code>)
              ) : (
                <code>{t('saveReview.noChanges')}</code>
              )}
            </div>
            <div className="dialog-actions">
              <button type="button" onClick={() => setShowSaveConfirm(false)}>
                {t('actions.cancel')}
              </button>
              <button type="button" className="primary-action" disabled={isSavingDetail} onClick={() => void performSelectedSkillSave()}>
                {t('saveReview.saveWithBackup')}
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {showEditorSaveConfirm ? (
        <div className="dialog-backdrop">
          <div role="dialog" aria-modal="true" aria-labelledby="editor-save-skill-title" className="confirm-dialog diff-dialog">
            <h2 id="editor-save-skill-title">{t('saveReview.title')}</h2>
            <p>{t('saveReview.backupNotice')}</p>
            <div className="diff-preview">
              {editorDiffLines.length > 0 ? (
                editorDiffLines.map((line, index) => <code key={`${line}-${index}`}>{line}</code>)
              ) : (
                <code>{t('saveReview.noChanges')}</code>
              )}
            </div>
            <div className="dialog-actions">
              <button type="button" onClick={() => setShowEditorSaveConfirm(false)}>
                {t('actions.cancel')}
              </button>
              <button type="button" className="primary-action" disabled={isSavingDetail} onClick={() => void performEditorSave()}>
                {t('saveReview.saveWithBackup')}
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {frontmatterConflict ? (
        <div className="dialog-backdrop">
          <div role="dialog" aria-modal="true" aria-labelledby="frontmatter-conflict-title" className="confirm-dialog diff-dialog">
            <h2 id="frontmatter-conflict-title">{t('editor.frontmatterConflictTitle')}</h2>
            <p>{t('editor.frontmatterConflictDescription')}</p>
            <div className="diff-preview">
              <code>{`Form: ${editorDraft.name} / ${editorDraft.description}`}</code>
              <code>{`Markdown: ${frontmatterConflict.parsed.name} / ${frontmatterConflict.parsed.description}`}</code>
            </div>
            <div className="dialog-actions">
              <button type="button" onClick={keepFormFrontmatter}>
                {t('editor.keepForm')}
              </button>
              <button type="button" className="primary-action" onClick={keepMarkdownFrontmatter}>
                {t('editor.keepMarkdown')}
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
            <section className="create-template-panel" aria-label={t('create.intentTemplates')}>
              <h3>{t('create.intentStep')}</h3>
              <div className="template-actions">
                <button type="button" onClick={() => applyCreateTemplate('automation')}>
                  {t('create.automationTemplate')}
                </button>
                <button type="button" onClick={() => applyCreateTemplate('research')}>
                  {t('create.researchTemplate')}
                </button>
                <button type="button" onClick={() => applyCreateTemplate('writing')}>
                  {t('create.writingTemplate')}
                </button>
              </div>
            </section>
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
              <label className="field-stack">
                <span>{t('create.source')}</span>
                <select
                  aria-label={t('create.source')}
                  value={createSkillDraft.source}
                  onChange={(event) => updateCreateSkillDraft('source', event.target.value as WritableSkillSource)}
                >
                  <option value="codex-user">{t('sources.codexUser')}</option>
                  <option value="agents-user">{t('sources.agentsUser')}</option>
                  <option value="custom">{t('sources.custom')}</option>
                </select>
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
