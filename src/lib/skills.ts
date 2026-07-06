import { invoke } from '@tauri-apps/api/core';
import type { CreateSkillInput, SkillDetail } from '../types/skill';

export async function createSkill(input: CreateSkillInput): Promise<SkillDetail> {
  return invoke<SkillDetail>('create_skill', { input });
}
