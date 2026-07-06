// Tauri 命令类型契约 — wt-6-backend 据此实现，前端各 wt 据此调用
// wt-0-foundation 产出，只 wt-6 可修改
// 红线：任何 wt 不得修改此文件

// ============ 已有命令（v3.6 保留） ============
export interface AppVersionCmd { name: 'app_version'; args: {}; returns: string }
export interface ScanSkillsCmd { name: 'scan_skills'; args: {}; returns: SkillScanResult[] }
export interface ReadSkillCmd { name: 'read_skill'; args: { path: string }; returns: SkillContent }
export interface CreateSkillCmd { name: 'create_skill'; args: { path: string; content: string }; returns: void }
export interface UpdateSkillCmd { name: 'update_skill'; args: { path: string; content: string }; returns: void }
export interface DeleteSkillCmd { name: 'delete_skill'; args: { path: string }; returns: void }
export interface OpenSkillFolderCmd { name: 'open_skill_folder'; args: { path: string }; returns: void }
export interface LoadSettingsCmd { name: 'load_app_settings'; args: {}; returns: Record<string, unknown> }
export interface SaveSettingsCmd { name: 'save_app_settings'; args: { settings: Record<string, unknown> }; returns: void }

// ============ v3.8 命令（wt-6 实现） ============

// P0 复制/克隆
export interface CloneSkillCmd {
  name: 'clone_skill';
  args: { srcPath: string; destName: string };
  returns: { newPath: string };
}

// P0 启用/禁用
export interface ToggleSkillEnabledCmd {
  name: 'toggle_skill_enabled';
  args: { path: string; enabled: boolean };
  returns: void;
}

// P0 结构化校验
export interface ValidateSkillCmd {
  name: 'validate_skill';
  args: { path: string };
  returns: ValidationResult;
}

// P0 多文件 Skill
export interface ReadSkillFilesCmd {
  name: 'read_skill_files';
  args: { dir: string };
  returns: SkillFile[];
}
export interface WriteSkillFileCmd {
  name: 'write_skill_file';
  args: { dir: string; fileName: string; content: string };
  returns: void;
}

// P1 文件监听
export interface WatchScanDirsCmd {
  name: 'watch_scan_dirs';
  args: { dirs: string[] };
  returns: void; // 通过 Tauri event 'scan-changed' 通知前端
}

// P1 版本历史
export interface GetVersionHistoryCmd {
  name: 'get_version_history';
  args: { path: string };
  returns: VersionEntry[];
}
export interface RestoreVersionCmd {
  name: 'restore_version';
  args: { path: string; versionId: string };
  returns: void;
}

// P1 调用日志
export interface GetCallLogsCmd {
  name: 'get_call_logs';
  args: { range: '7d' | '30d' | 'all' };
  returns: CallLog[];
}

// P2 依赖解析
export interface AnalyzeDepsCmd {
  name: 'analyze_deps';
  args: { path: string };
  returns: { dependsOn: string[]; dependedBy: string[] };
}

// ============ AI 命令（wt-3-ai 依赖） ============
export interface AIOptimizeCmd {
  name: 'ai_optimize';
  args: { content: string; action: AIAction; vendor: AIVendor };
  returns: void; // 通过 Tauri event 'ai-chunk' 流式推送，'ai-done' 结束
}

// ============ 类型定义 ============
export interface SkillScanResult {
  name: string;
  description: string;
  source: 'mine' | 'plugin';
  category: string;
  path: string;
  modifiedAt: string;
  size: number;
  protected: boolean;
}

export interface SkillContent {
  frontmatter: Record<string, unknown>;
  markdown: string;
  raw: string;
}

export interface SkillFile {
  name: string;
  content: string;
  size: number;
  isMain: boolean;
}

export interface ValidationResult {
  score: number; // 0-100
  checks: ValidationCheck[];
}

export interface ValidationCheck {
  id: string;
  label: string;
  status: 'ok' | 'warn' | 'fail';
  detail?: string;
}

export interface VersionEntry {
  id: string;
  time: string;
  note: string;
  diffLines: number;
  source: 'manual' | 'ai';
}

export interface CallLog {
  time: string;
  skillName: string;
  prompt: string;
  status: 'ok' | 'fail';
  durationMs: number;
  tokens: number;
}

export type AIAction = 'struct' | 'desc' | 'polish' | 'fm' | 'safe';
export type AIVendor = 'glm' | 'openai' | 'claude' | 'ollama';

// ============ 命令名联合（供 invoke 类型检查） ============
export type CommandName =
  | AppVersionCmd['name'] | ScanSkillsCmd['name'] | ReadSkillCmd['name']
  | CreateSkillCmd['name'] | UpdateSkillCmd['name'] | DeleteSkillCmd['name']
  | OpenSkillFolderCmd['name'] | LoadSettingsCmd['name'] | SaveSettingsCmd['name']
  | CloneSkillCmd['name'] | ToggleSkillEnabledCmd['name'] | ValidateSkillCmd['name']
  | ReadSkillFilesCmd['name'] | WriteSkillFileCmd['name'] | WatchScanDirsCmd['name']
  | GetVersionHistoryCmd['name'] | RestoreVersionCmd['name'] | GetCallLogsCmd['name']
  | AnalyzeDepsCmd['name'] | AIOptimizeCmd['name'];

// mock invoke（前端开发用，wt-6 实现后切真实）
export const mockInvoke = async <T>(cmd: string, _args?: unknown): Promise<T> => {
  console.warn(`[mockInvoke] ${cmd} — 等待 wt-6-backend 实现`);
  return [] as unknown as T;
};
