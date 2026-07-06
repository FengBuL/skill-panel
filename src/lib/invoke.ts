// Tauri 命令调用封装 — 真实 invoke + mock fallback
// wt-0-foundation 产出，前端各页面用此封装调用后端
import { invoke } from '@tauri-apps/api/core';
import type { SkillSummary } from '../types/skill';
import type { Skill } from '../store/skillStore';

// mock 数据（Tauri 不可用时 fallback，如纯浏览器开发）
const MOCK_SKILLS: Skill[] = [
  { name: 'Browser Control', description: 'Open, navigate, inspect, test web targets.', source: 'plugin', category: '浏览器', path: '', modifiedAt: '5天前', size: 12400, starred: true, disabled: false, protected: true },
  { name: 'A-Share Daily Update', description: 'Standardizes daily stock updates for MarketData.', source: 'mine', category: '金融', path: '', modifiedAt: '3天前', size: 8900, starred: false, disabled: false, protected: false },
  { name: 'Claude-to-IM Bridge', description: 'Bridge Claude responses to IM platforms.', source: 'mine', category: '常用', path: '', modifiedAt: '昨天', size: 5600, starred: false, disabled: false, protected: false },
  { name: 'PDF Analysis Core', description: 'Financial PDF processing pipeline.', source: 'mine', category: '数据', path: '', modifiedAt: '1周前', size: 15200, starred: false, disabled: false, protected: false },
  { name: 'Document Illustrator', description: 'Auto-generate illustrations for documents.', source: 'mine', category: '文案', path: '', modifiedAt: '2天前', size: 7800, starred: true, disabled: false, protected: false },
  { name: 'Youtube Clipper', description: 'Download and clip YouTube videos for research.', source: 'mine', category: '常用', path: '', modifiedAt: '3天前', size: 6700, starred: false, disabled: false, protected: false },
  { name: 'Email Composer', description: 'Compose professional emails with templates.', source: 'mine', category: '文案', path: '', modifiedAt: '4天前', size: 4500, starred: false, disabled: false, protected: false },
  { name: 'Serenity Stock', description: 'Stock screening engine with technical filters.', source: 'mine', category: '金融', path: '', modifiedAt: '2个月前', size: 21000, starred: false, disabled: false, protected: false },
  { name: 'Data Validator', description: 'Validate and clean datasets before processing.', source: 'mine', category: '数据', path: '', modifiedAt: '6天前', size: 9100, starred: false, disabled: false, protected: false },
  { name: 'Lark Bot Bridge', description: 'Integrate Lark messaging with skill execution.', source: 'plugin', category: '常用', path: '', modifiedAt: '1个月前', size: 11200, starred: false, disabled: false, protected: true },
];

// SkillSummary → store Skill 映射
function mapSummary(s: SkillSummary): Skill {
  const isPlugin = s.source === 'plugin-cache' || s.source === 'system' || s.source === 'unknown';
  return {
    name: s.name,
    description: s.description || '(无描述)',
    source: isPlugin ? 'plugin' : 'mine',
    category: '未分类', // 待 frontmatter 解析或用户分类
    path: s.path,
    modifiedAt: s.modifiedAt || '未知',
    size: 0,
    starred: false,
    disabled: false,
    protected: isPlugin,
  };
}

// 扫描 Skill（真实 invoke，失败 fallback mock）
export async function scanSkills(): Promise<{ skills: Skill[]; isMock: boolean }> {
  try {
    const summaries = await invoke<SkillSummary[]>('scan_skills');
    if (summaries && summaries.length) {
      return { skills: summaries.map(mapSummary), isMock: false };
    }
    return { skills: MOCK_SKILLS, isMock: true };
  } catch {
    // Tauri 不可用（纯浏览器开发环境）
    return { skills: MOCK_SKILLS, isMock: true };
  }
}

// 读取 Skill 详情
export async function readSkill(path: string): Promise<{ markdown: string; frontmatter: Record<string, unknown> } | null> {
  try {
    const detail = await invoke<{ markdown: string; frontmatter: Record<string, unknown>; rawContent: string }>('read_skill', { path });
    return { markdown: detail.markdown || detail.rawContent || '', frontmatter: detail.frontmatter || {} };
  } catch {
    return null;
  }
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
