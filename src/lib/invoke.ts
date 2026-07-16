// Tauri 命令调用封装 — 真实 invoke + mock fallback
// wt-0-foundation 产出，前端各页面用此封装调用后端
import { invoke } from '@tauri-apps/api/core';
import type { SkillDetail, SkillSummary, UpdateSkillInput } from '../types/skill';
import type { Skill } from '../store/skillStore';

// mock 数据（Tauri 不可用时 fallback，如纯浏览器开发）
const MOCK_SKILLS: Skill[] = [
  { name: 'aihot-query', description: '从 aihot.virxact.com 获取每日 AI 热点资讯和动态。', source: 'plugin', category: 'AI', path: '~/.workbuddy/skills/aihot/SKILL.md', modifiedAt: '今天', size: 12400, starred: false, disabled: false, protected: true },
  { name: 'meeting-notes', description: '总结会议纪要并提取待办事项。', source: 'mine', category: '生产力', path: '~/.workbuddy/skills/meeting-notes/SKILL.md', modifiedAt: '昨天', size: 8900, starred: false, disabled: false, protected: false },
  { name: 'deploy-preview', description: '将静态构建产物部署到 CloudStudio 沙箱工作区。', source: 'mine', category: '开发者', path: '~/.workbuddy/skills/deploy-preview/SKILL.md', modifiedAt: '7月5日', size: 5600, starred: false, disabled: true, protected: false },
  { name: 'git-sync', description: '同步本地仓库状态与最近提交记录。', source: 'plugin', category: '开发者', path: '~/.workbuddy/skills/git-sync/SKILL.md', modifiedAt: '7月4日', size: 20300, starred: false, disabled: false, protected: true },
  { name: 'finance-lookup', description: '通过 NeoData 查询股票、基金与市场数据。', source: 'plugin', category: '金融', path: '~/.workbuddy/skills/finance-lookup/SKILL.md', modifiedAt: '7月2日', size: 3100, starred: false, disabled: false, protected: true },
  { name: 'image-caption', description: '为上传的图片生成替代文本与说明。', source: 'mine', category: 'AI', path: '~/.workbuddy/skills/image-caption/SKILL.md', modifiedAt: '6月28日', size: 1200, starred: false, disabled: false, protected: false },
  { name: 'design-review', description: '检查界面布局、颜色和信息层级。', source: 'mine', category: '设计', path: '~/.workbuddy/skills/design-review/SKILL.md', modifiedAt: '6月25日', size: 5100, starred: false, disabled: false, protected: false },
  { name: 'daily-brief', description: '整理每日工作简报和待处理事项。', source: 'mine', category: '生产力', path: '~/.workbuddy/skills/daily-brief/SKILL.md', modifiedAt: '6月21日', size: 4300, starred: false, disabled: false, protected: false },
];

const CATEGORY_ALIASES: Record<string, string> = {
  browser: '浏览器',
  web: '浏览器',
  finance: '金融',
  stock: '金融',
  market: '金融',
  data: '数据',
  csv: '数据',
  sheet: '数据',
  document: '文案',
  docs: '文案',
  writing: '文案',
  mail: '文案',
  automation: '自动化',
  workflow: '自动化',
  common: '常用',
};

function normalizeCategory(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return CATEGORY_ALIASES[trimmed.toLowerCase()] || trimmed;
}

function firstCategorySignal(s: SkillSummary): string | null {
  const frontmatter = s.frontmatter || {};
  const candidates: unknown[] = [
    s.category,
    ...(s.categories || []),
    frontmatter.category,
    ...((Array.isArray(frontmatter.categories) ? frontmatter.categories : []) as unknown[]),
    ...((Array.isArray(s.tags) ? s.tags : []) as unknown[]),
    ...((Array.isArray(frontmatter.tags) ? frontmatter.tags : []) as unknown[]),
  ];

  for (const candidate of candidates) {
    const normalized = normalizeCategory(candidate);
    if (normalized) return normalized;
  }

  const haystack = `${s.path} ${s.name} ${s.description}`.toLowerCase();
  for (const [needle, category] of Object.entries(CATEGORY_ALIASES)) {
    if (haystack.includes(needle)) return category;
  }

  return null;
}

// SkillSummary → store Skill 映射
export function mapSummary(s: SkillSummary): Skill {
  const source = String(s.source);
  const isPlugin = source === 'plugin-cache' || source === 'plugin' || source === 'system' || source === 'unknown';
  const frontmatter = s.frontmatter || {};
  return {
    name: s.name,
    description: s.description || '(无描述)',
    source: isPlugin ? 'plugin' : 'mine',
    category: firstCategorySignal(s) || '未分类',
    path: s.path,
    modifiedAt: s.modifiedAt || '未知',
    size: 0,
    starred: Boolean(frontmatter.starred || frontmatter.favorite),
    disabled: Boolean(frontmatter.disabled),
    protected: isPlugin,
  };
}

// 扫描 Skill（真实 invoke，失败 fallback mock）
export async function scanSkills(): Promise<{ skills: Skill[]; isMock: boolean }> {
  try {
    const summaries = await invoke<SkillSummary[]>('scan_skills');
    if (Array.isArray(summaries)) {
      return { skills: summaries.map(mapSummary), isMock: false };
    }
    return { skills: MOCK_SKILLS, isMock: true };
  } catch {
    // Tauri 不可用（纯浏览器开发环境）
    return { skills: MOCK_SKILLS, isMock: true };
  }
}

// 读取 Skill 详情
export async function readSkill(path: string): Promise<SkillDetail | null> {
  try {
    return await invoke<SkillDetail>('read_skill', { path });
  } catch {
    return null;
  }
}

export async function updateSkill(input: UpdateSkillInput): Promise<SkillDetail> {
  return await invoke<SkillDetail>('update_skill', { input });
}

export async function getVersionHistory(path: string): Promise<{ id: string; time: string; note: string; diffLines: number; source: string }[]> {
  return await invoke('get_version_history', { path });
}

export async function restoreVersion(path: string, versionId: string): Promise<void> {
  await invoke('restore_version', { path, versionId });
}

export async function cloneSkill(srcPath: string, destName: string): Promise<{ newPath: string }> {
  return await invoke('clone_skill', { srcPath, destName });
}

// 校验 Skill
export async function validateSkill(path: string): Promise<{ score: number; checks: { id: string; label: string; status: string; detail?: string }[] } | null> {
  try {
    return await invoke('validate_skill', { path });
  } catch {
    return null;
  }
}

// 加载/保存设置
export async function loadSettings(): Promise<Record<string, unknown> | null> {
  try { return await invoke('load_app_settings'); } catch { return null; }
}
export async function saveSettings(settings: Record<string, unknown>): Promise<boolean> {
  try { await invoke('save_app_settings', { settings }); return true; } catch { return false; }
}
