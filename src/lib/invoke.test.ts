import { describe, expect, it } from 'vitest';
import { mapSummary } from './invoke';
import type { SkillSummary } from '../types/skill';

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
});
