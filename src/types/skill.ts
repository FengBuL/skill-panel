export const skillSources = [
  'codex-user',
  'agents-user',
  'system',
  'plugin-cache',
  'custom',
  'unknown',
] as const;

export type SkillSource = (typeof skillSources)[number];

export const writableSkillSources = ['codex-user', 'agents-user', 'custom'] as const;

export type WritableSkillSource = (typeof writableSkillSources)[number];

export const parseStatuses = ['parsed', 'missing-skill-file', 'invalid-frontmatter', 'read-error'] as const;

export type ParseStatus = (typeof parseStatuses)[number];

export interface SkillSummary {
  path: string;
  name: string;
  description: string;
  source: SkillSource;
  parseStatus: ParseStatus;
  modifiedAt: string | null;
}

export interface SkillDetail extends SkillSummary {
  markdown: string;
  bodyMarkdown: string;
  rawContent: string;
  frontmatter: Record<string, unknown>;
}

export interface CustomSkillTagSetting {
  color: string;
  label: string;
}

export interface CustomCategorySetting {
  color: string;
  icon: string;
  label: string;
}

export interface AppSettings {
  language: 'system' | 'zh-CN' | 'en-US';
  customScanDirectories: string[];
  showDefaultScanDirectories: boolean;
  customCategories?: Record<string, CustomCategorySetting>;
  categoryColors?: Record<string, string>;
  categoryLabels?: Record<string, string>;
  categoryIcons?: Record<string, string>;
  categorySkillOrder?: Record<string, string[]>;
  detailPanelWidth?: number;
  skillViewMode?: 'cards' | 'list';
  skillCardColors?: Record<string, string>;
  skillCategoryOverrides?: Record<string, 'data' | 'default' | 'finance' | 'writing'>;
  skillCategoryAssignments?: Record<string, string[]>;
  skillArchives?: Record<string, boolean>;
  skillFavorites?: Record<string, boolean>;
  skillLocks?: Record<string, boolean>;
  skillTags?: Record<string, CustomSkillTagSetting[]>;
}

export interface CreateSkillInput {
  name: string;
  description: string;
  source: WritableSkillSource;
  targetDirectory: string;
  markdown: string;
}

export interface UpdateSkillInput {
  path: string;
  name?: string;
  description?: string;
  markdown?: string;
}

export const skillCommandNames = [
  'app_version',
  'scan_skills',
  'read_skill',
  'create_skill',
  'update_skill',
  'delete_skill',
  'open_skill_folder',
  'load_app_settings',
  'save_app_settings',
] as const;

export type SkillCommandName = (typeof skillCommandNames)[number];

export interface SkillCommandMap {
  app_version: () => Promise<string>;
  scan_skills: () => Promise<SkillSummary[]>;
  read_skill: (input: { path: string }) => Promise<SkillDetail>;
  create_skill: (input: { input: CreateSkillInput }) => Promise<SkillDetail>;
  update_skill: (input: { input: UpdateSkillInput }) => Promise<SkillDetail>;
  delete_skill: (input: { path: string }) => Promise<void>;
  open_skill_folder: (input: { path: string }) => Promise<void>;
  load_app_settings: () => Promise<AppSettings>;
  save_app_settings: (input: { settings: AppSettings }) => Promise<AppSettings>;
}
