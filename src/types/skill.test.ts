import { describe, expect, expectTypeOf, it } from 'vitest';
import {
  parseStatuses,
  skillCommandNames,
  skillSources,
  writableSkillSources,
  type AppSettings,
  type CreateSkillInput,
  type SkillCommandMap,
  type SkillDetail,
  type SkillSummary,
  type UpdateSkillInput,
} from './skill';

describe('skill type contracts', () => {
  it('keeps source and parse status literals stable for filters and backend payloads', () => {
    expect(skillSources).toEqual([
      'codex-user',
      'agents-user',
      'system',
      'plugin-cache',
      'custom',
      'unknown',
    ]);
    expect(parseStatuses).toEqual(['parsed', 'missing-skill-file', 'invalid-frontmatter', 'read-error']);
    expect(writableSkillSources).toEqual(['codex-user', 'agents-user', 'custom']);
  });

  it('declares the command boundary used by future Tauri integrations', () => {
    expect(skillCommandNames).toEqual([
      'app_version',
      'scan_skills',
      'read_skill',
      'create_skill',
      'update_skill',
      'delete_skill',
      'open_skill_folder',
      'load_app_settings',
      'save_app_settings',
    ]);

    expectTypeOf<SkillCommandMap['scan_skills']>().returns.resolves.toEqualTypeOf<SkillSummary[]>();
    expectTypeOf<SkillCommandMap['read_skill']>().parameter(0).toEqualTypeOf<{ path: string }>();
    expectTypeOf<SkillCommandMap['read_skill']>().returns.resolves.toEqualTypeOf<SkillDetail>();
    expectTypeOf<SkillCommandMap['create_skill']>().parameter(0).toEqualTypeOf<{ input: CreateSkillInput }>();
    expectTypeOf<SkillCommandMap['update_skill']>().parameter(0).toEqualTypeOf<{ input: UpdateSkillInput }>();
    expectTypeOf<SkillCommandMap['save_app_settings']>().parameter(0).toEqualTypeOf<{ settings: AppSettings }>();
  });

  it('models the summary, detail, settings, and mutation payload shapes', () => {
    expectTypeOf<SkillSummary>().toEqualTypeOf<{
      path: string;
      name: string;
      description: string;
      source: 'codex-user' | 'agents-user' | 'system' | 'plugin-cache' | 'custom' | 'unknown';
      parseStatus: 'parsed' | 'missing-skill-file' | 'invalid-frontmatter' | 'read-error';
      modifiedAt: string | null;
    }>();
    expectTypeOf<SkillDetail>().toMatchTypeOf<SkillSummary>();
    expectTypeOf<SkillDetail>().toMatchTypeOf<
      SkillSummary & {
        markdown: string;
        bodyMarkdown: string;
        rawContent: string;
        frontmatter: Record<string, unknown>;
      }
    >();
    expectTypeOf<AppSettings>().toEqualTypeOf<{
      language: 'system' | 'zh-CN' | 'en-US';
      customScanDirectories: string[];
      showDefaultScanDirectories: boolean;
      categoryColors?: Record<string, string>;
      categoryLabels?: Record<string, string>;
      skillTags?: Record<string, { color: string; label: string }[]>;
    }>();
    expectTypeOf<CreateSkillInput>().toEqualTypeOf<{
      name: string;
      description: string;
      source: 'codex-user' | 'agents-user' | 'custom';
      targetDirectory: string;
      markdown: string;
    }>();
    expectTypeOf<UpdateSkillInput>().toEqualTypeOf<{
      path: string;
      name?: string;
      description?: string;
      markdown?: string;
    }>();
  });
});
