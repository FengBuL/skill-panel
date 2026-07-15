import { describe, expect, expectTypeOf, it } from 'vitest';
import {
  parseStatuses,
  skillCommandNames,
  skillSources,
  writableSkillSources,
  type AppSettings,
  type CreateSkillInput,
  type DeleteSkillResult,
  type SkillCommandMap,
  type SkillDetail,
  type SkillPathGroup,
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
      'ai_cancel',
      'get_ai_key',
    ]);

    expectTypeOf<SkillCommandMap['scan_skills']>().returns.resolves.toEqualTypeOf<SkillSummary[]>();
    expectTypeOf<SkillCommandMap['default_scan_path_groups']>().returns.resolves.toEqualTypeOf<SkillPathGroup[]>();
    expectTypeOf<SkillCommandMap['read_skill']>().parameter(0).toEqualTypeOf<{ path: string }>();
    expectTypeOf<SkillCommandMap['read_skill']>().returns.resolves.toEqualTypeOf<SkillDetail>();
    expectTypeOf<SkillCommandMap['create_skill']>().parameter(0).toEqualTypeOf<{ input: CreateSkillInput }>();
    expectTypeOf<SkillCommandMap['update_skill']>().parameter(0).toEqualTypeOf<{ input: UpdateSkillInput }>();
    expectTypeOf<SkillCommandMap['delete_skill']>().returns.resolves.toEqualTypeOf<DeleteSkillResult>();
    expectTypeOf<SkillCommandMap['append_audit_log']>().parameter(0).toEqualTypeOf<{
      entry: { action: string; detail: Record<string, unknown>; timestamp: string };
    }>();
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
      category?: string | null;
      categories?: string[] | null;
      tags?: string[] | null;
      frontmatter?: Record<string, unknown> | null;
    }>();
    expectTypeOf<SkillPathGroup>().toEqualTypeOf<{ labelKey: string; paths: string[] }>();
    expectTypeOf<SkillDetail>().toMatchTypeOf<SkillSummary>();
    expectTypeOf<SkillDetail>().toMatchTypeOf<
      SkillSummary & {
        markdown: string;
        bodyMarkdown: string;
        rawContent: string;
        frontmatter: Record<string, unknown>;
      }
    >();
    expectTypeOf<DeleteSkillResult>().toEqualTypeOf<{
      skillName: string;
      originalPath: string;
      backupPath: string;
      trashResult: string;
      restoreInstructions: string;
    }>();
    expectTypeOf<AppSettings>().toEqualTypeOf<{
      language: 'system' | 'zh-CN' | 'en-US';
      customScanDirectories: string[];
      showDefaultScanDirectories: boolean;
      customCategories?: Record<string, { color: string; icon: string; label: string }>;
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
      skillTags?: Record<string, { color: string; label: string }[]>;
      skillUsage?: Record<string, { callCount: number; lastCalledAt?: string | null }>;
      skillOrganizationSuggestions?: Record<
        string,
        { dismissed?: boolean; kind: 'category' | 'tag' | 'health' | 'draft'; label: string; message: string }[]
      >;
      skillHealth?: Record<string, { issues: string[]; score: number; status: 'healthy' | 'warning' | 'critical' }>;
      skillDrafts?: Record<string, { description: string; markdown: string; name: string; updatedAt: string }>;
      aiVendor?: string;
      aiDesensitize?: boolean;
      aiDiffConfirm?: boolean;
      aiMonthlyBudget?: number;
      aiMonthlyUsed?: number;
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
