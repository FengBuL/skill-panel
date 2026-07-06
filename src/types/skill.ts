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
  category?: string | null;
  categories?: string[] | null;
  tags?: string[] | null;
  frontmatter?: Record<string, unknown> | null;
}

export interface SkillPathGroup {
  labelKey: string;
  paths: string[];
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

export interface SkillUsageSetting {
  callCount: number;
  lastCalledAt?: string | null;
}

export interface SkillOrganizationSuggestionSetting {
  dismissed?: boolean;
  kind: 'category' | 'tag' | 'health' | 'draft';
  label: string;
  message: string;
}

export interface SkillHealthSetting {
  issues: string[];
  score: number;
  status: 'healthy' | 'warning' | 'critical';
}

export interface SkillDraftSetting {
  description: string;
  markdown: string;
  name: string;
  updatedAt: string;
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
  skillUsage?: Record<string, SkillUsageSetting>;
  skillOrganizationSuggestions?: Record<string, SkillOrganizationSuggestionSetting[]>;
  skillHealth?: Record<string, SkillHealthSetting>;
  skillDrafts?: Record<string, SkillDraftSetting>;
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
  'default_scan_path_groups',
  'read_skill',
  'create_skill',
  'update_skill',
  'delete_skill',
  'open_skill_folder',
  'append_audit_log',
  'load_app_settings',
  'save_app_settings',
  'clone_skill',
  'toggle_skill_enabled',
  'validate_skill',
  'read_skill_files',
  'write_skill_file',
  'get_version_history',
  'restore_version',
  'get_call_logs',
  'analyze_deps',
  'ai_optimize',
  'watch_scan_dirs',
  'set_ai_key',
] as const;

export type SkillCommandName = (typeof skillCommandNames)[number];

export interface SkillCommandMap {
  app_version: () => Promise<string>;
  scan_skills: () => Promise<SkillSummary[]>;
  default_scan_path_groups: () => Promise<SkillPathGroup[]>;
  read_skill: (input: { path: string }) => Promise<SkillDetail>;
  create_skill: (input: { input: CreateSkillInput }) => Promise<SkillDetail>;
  update_skill: (input: { input: UpdateSkillInput }) => Promise<SkillDetail>;
  delete_skill: (input: { path: string }) => Promise<void>;
  open_skill_folder: (input: { path: string }) => Promise<void>;
  append_audit_log: (input: { entry: { action: string; detail: Record<string, unknown>; timestamp: string } }) => Promise<void>;
  load_app_settings: () => Promise<AppSettings>;
  save_app_settings: (input: { settings: AppSettings }) => Promise<AppSettings>;
  clone_skill: (input: { srcPath: string; destName: string }) => Promise<{ newPath: string }>;
  toggle_skill_enabled: (input: { path: string; enabled: boolean }) => Promise<void>;
  validate_skill: (input: { path: string }) => Promise<{
    score: number;
    checks: { id: string; label: string; status: string; detail?: string }[];
  }>;
  read_skill_files: (input: { dir: string }) => Promise<
    { name: string; content: string; size: number; isMain: boolean }[]
  >;
  write_skill_file: (input: { dir: string; fileName: string; content: string }) => Promise<void>;
  get_version_history: (input: { path: string }) => Promise<
    { id: string; time: string; note: string; diffLines: number; source: string }[]
  >;
  restore_version: (input: { path: string; versionId: string }) => Promise<void>;
  get_call_logs: (input: { range: string }) => Promise<
    { time: string; skillName: string; prompt: string; status: string; durationMs: number; tokens: number }[]
  >;
  analyze_deps: (input: { path: string }) => Promise<Record<string, unknown>>;
  ai_optimize: (input: { content: string; action: string; vendor: string }) => Promise<void>;
  watch_scan_dirs: (input: { dirs: string[] }) => Promise<void>;
  set_ai_key: (input: { vendor: string; key: string }) => Promise<void>;
}
