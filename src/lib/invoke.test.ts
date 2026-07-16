import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mapSummary, scanSkills } from './invoke';
import type { SkillSummary } from '../types/skill';

const { invokeMock } = vi.hoisted(() => ({
  invokeMock: vi.fn(),
}));

vi.mock('@tauri-apps/api/core', () => ({
  invoke: invokeMock,
}));

function summary(overrides: Partial<SkillSummary>): SkillSummary {
  return {
    path: '/Users/demo/.codex/skills/demo/SKILL.md',
    name: 'demo',
    description: 'Demo skill',
    source: 'codex-user',
    parseStatus: 'parsed',
    modifiedAt: null,
    ...overrides,
  };
}

describe('mapSummary', () => {
  beforeEach(() => {
    invokeMock.mockReset();
    localStorage.removeItem('skill-panel-demo-mode');
  });

  it('uses category signals from summary and frontmatter before falling back to uncategorized', () => {
    expect(mapSummary(summary({ category: 'finance' })).category).toBe('金融');
    expect(mapSummary(summary({ frontmatter: { category: 'writing' } })).category).toBe('文案');
    expect(mapSummary(summary({ tags: ['data'] })).category).toBe('数据');
    expect(mapSummary(summary({})).category).toBe('未分类');
  });

  it('keeps plugin and system skills protected', () => {
    expect(mapSummary(summary({ source: 'plugin-cache' })).protected).toBe(true);
    expect(mapSummary(summary({ source: 'system' })).protected).toBe(true);
    expect(mapSummary(summary({ source: 'codex-user' })).protected).toBe(false);
  });

  it('does not return built-in demo skills when installed scanning fails', async () => {
    invokeMock.mockRejectedValue(new Error('Unable to parse settings at /Users/demo/.codex/skill-panel/settings.json'));

    const result = await scanSkills();

    expect(invokeMock).toHaveBeenCalledWith('scan_skills');
    expect(result.skills).toEqual([]);
    expect(result.isMock).toBe(false);
    expect(result.status).toBe('error');
    expect(result.error).toContain('<PATH>');
    expect(result.error).not.toContain('/Users/demo');
  });

  it('returns demo skills only when explicit demo mode is enabled', async () => {
    localStorage.setItem('skill-panel-demo-mode', 'true');
    invokeMock.mockRejectedValue(new Error('browser preview'));

    const result = await scanSkills();

    expect(result.skills.length).toBeGreaterThan(0);
    expect(result.isMock).toBe(true);
    expect(result.status).toBe('demo');
  });
});
