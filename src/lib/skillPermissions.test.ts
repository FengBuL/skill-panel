import { describe, expect, it } from 'vitest';
import { getSkillPermission, isEditableSkill, isReadOnlySkill } from './skillPermissions';

describe('skill permission matrix', () => {
  it('allows user and custom sources to edit local files', () => {
    expect(isEditableSkill({ source: 'codex-user' } as never)).toBe(true);
    expect(isEditableSkill({ source: 'agents-user' } as never)).toBe(true);
    expect(isEditableSkill({ source: 'custom' } as never)).toBe(true);
    expect(isEditableSkill({ source: 'mine', protected: false } as never)).toBe(true);
  });

  it('keeps protected and built-in sources read only while allowing archive and copy', () => {
    const permission = getSkillPermission({ source: 'plugin', protected: true } as never);

    expect(isReadOnlySkill({ source: 'plugin-cache' } as never)).toBe(true);
    expect(permission).toEqual({
      canArchive: true,
      canCopyToEditable: true,
      canDelete: false,
      canEdit: false,
      readOnly: true,
    });
  });
});
