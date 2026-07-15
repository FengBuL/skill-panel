import type { Skill } from '../store/skillStore';
import type { SkillSummary } from '../types/skill';

type SkillLike = Skill | SkillSummary;

function sourceOf(skill: SkillLike) {
  return 'protected' in skill
    ? skill.source
    : skill.source === 'codex-user' || skill.source === 'agents-user' || skill.source === 'custom'
      ? 'mine'
      : 'plugin';
}

export function isEditableSkill(skill: SkillLike) {
  if ('protected' in skill && skill.protected) {
    return false;
  }
  return sourceOf(skill) === 'mine';
}

export function isReadOnlySkill(skill: SkillLike) {
  return !isEditableSkill(skill);
}

export function canDeleteLocalSkill(skill: SkillLike) {
  return isEditableSkill(skill);
}

export function getSkillPermission(skill: SkillLike) {
  const canEdit = isEditableSkill(skill);
  return {
    canArchive: true,
    canCopyToEditable: !canEdit,
    canDelete: canDeleteLocalSkill(skill),
    canEdit,
    readOnly: !canEdit,
  };
}
