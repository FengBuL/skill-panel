import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { type SkillDetail, type SkillSummary } from '../types/skill';

type Skill = SkillSummary | SkillDetail;

type SkillPermission = {
  canDelete: boolean;
  canEdit: boolean;
  locked: boolean;
  readonly: boolean;
};

type SkillContextValue = {
  canDeleteSkill: (skill: Skill) => boolean;
  getSkillPermission: (skill: Skill, userLocked?: boolean) => SkillPermission;
  isReadOnlySkill: (skill: Skill) => boolean;
  isSkillLocked: (skill: Skill, userLocked?: boolean) => boolean;
  isWritableSkill: (skill: Skill) => boolean;
};

type UIContextValue = {
  density: 'compact' | 'comfortable';
};

type SettingsContextValue = {
  hasHydratedSettings: boolean;
};

type SkillPanelContextValue = SkillContextValue & {
  settings: SettingsContextValue;
  ui: UIContextValue;
};

const SkillContext = createContext<SkillContextValue | null>(null);
const UIContext = createContext<UIContextValue | null>(null);
const SettingsContext = createContext<SettingsContextValue | null>(null);
const SkillPanelContext = createContext<SkillPanelContextValue | null>(null);

export function isWritableSkillSource(skill: Skill) {
  return skill.source === 'codex-user' || skill.source === 'agents-user' || skill.source === 'custom';
}

export function isReadOnlySkillSource(skill: Skill) {
  return !isWritableSkillSource(skill);
}

export function canDeleteSkillSource(skill: Skill) {
  return isWritableSkillSource(skill);
}

function getSkillPermissionSource(skill: Skill, userLocked = false): SkillPermission {
  const canEdit = isWritableSkillSource(skill);
  const readonly = !canEdit;
  const locked = readonly || userLocked;

  return {
    canDelete: canEdit,
    canEdit,
    locked,
    readonly,
  };
}

const defaultSkillContext: SkillContextValue = {
  canDeleteSkill: canDeleteSkillSource,
  getSkillPermission: getSkillPermissionSource,
  isReadOnlySkill: isReadOnlySkillSource,
  isSkillLocked: (skill, userLocked) => getSkillPermissionSource(skill, userLocked).locked,
  isWritableSkill: isWritableSkillSource,
};

const defaultUIContext: UIContextValue = {
  density: 'compact',
};

const defaultSettingsContext: SettingsContextValue = {
  hasHydratedSettings: true,
};

const defaultSkillPanelContext: SkillPanelContextValue = {
  ...defaultSkillContext,
  settings: defaultSettingsContext,
  ui: defaultUIContext,
};

export function SkillPanelProvider({ children }: { children: ReactNode }) {
  const skillContext = useMemo<SkillContextValue>(() => defaultSkillContext, []);
  const uiContext = useMemo<UIContextValue>(() => defaultUIContext, []);
  const settingsContext = useMemo<SettingsContextValue>(() => defaultSettingsContext, []);
  const skillPanelContext = useMemo<SkillPanelContextValue>(
    () => ({
      ...skillContext,
      settings: settingsContext,
      ui: uiContext,
    }),
    [settingsContext, skillContext, uiContext],
  );

  return (
    <SkillPanelContext.Provider value={skillPanelContext}>
      <SkillContext.Provider value={skillContext}>
        <UIContext.Provider value={uiContext}>
          <SettingsContext.Provider value={settingsContext}>{children}</SettingsContext.Provider>
        </UIContext.Provider>
      </SkillContext.Provider>
    </SkillPanelContext.Provider>
  );
}

export function useSkillPanelStore() {
  const context = useContext(SkillPanelContext);
  if (!context) {
    return defaultSkillPanelContext;
  }

  return context;
}

export function useSkillContext() {
  return useContext(SkillContext) ?? defaultSkillContext;
}

export function useUIContext() {
  return useContext(UIContext) ?? defaultUIContext;
}

export function useSettingsContext() {
  return useContext(SettingsContext) ?? defaultSettingsContext;
}
