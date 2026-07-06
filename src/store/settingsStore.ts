// Settings Store — 设置/主题/AI配置/待关注规则
// wt-0-foundation 产出
import { create } from 'zustand';

export type Theme = 'light' | 'dark' | 'auto';
export type AIVendor = 'glm' | 'openai' | 'claude' | 'ollama';

export interface AttentionRule {
  id: string;
  enabled: boolean;
  type: 'daysUnused' | 'missingDesc' | 'missingWhen' | 'shortContent';
  threshold?: number;
}

interface SettingsState {
  locale: 'zh-CN' | 'en-US' | 'auto';
  theme: Theme;
  autoScan: boolean;
  watchFiles: boolean;
  customScanDirs: string[];
  attentionRules: AttentionRule[];

  // AI
  aiVendor: AIVendor;
  aiKeyStored: boolean;
  aiDesensitize: boolean;
  aiDiffConfirm: boolean;
  aiMonthlyBudget: number;
  aiMonthlyUsed: number;

  setLocale: (l: SettingsState['locale']) => void;
  setTheme: (t: Theme) => void;
  setAutoScan: (b: boolean) => void;
  setWatchFiles: (b: boolean) => void;
  addScanDir: (d: string) => void;
  removeScanDir: (d: string) => void;
  toggleRule: (id: string) => void;
  setRuleThreshold: (id: string, v: number) => void;
  setAIVendor: (v: AIVendor) => void;
  setAIDesensitize: (b: boolean) => void;
  setAIDiffConfirm: (b: boolean) => void;
  setAIBudget: (v: number) => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  locale: 'auto',
  theme: 'light',
  autoScan: true,
  watchFiles: true,
  customScanDirs: [],
  attentionRules: [
    { id: 'daysUnused', enabled: true, type: 'daysUnused', threshold: 60 },
    { id: 'missingDesc', enabled: true, type: 'missingDesc' },
    { id: 'missingWhen', enabled: false, type: 'missingWhen' },
    { id: 'shortContent', enabled: false, type: 'shortContent', threshold: 100 },
  ],

  aiVendor: 'glm',
  aiKeyStored: false,
  aiDesensitize: true,
  aiDiffConfirm: true,
  aiMonthlyBudget: 50,
  aiMonthlyUsed: 2.4,

  setLocale: (l) => set({ locale: l }),
  setTheme: (t) => set({ theme: t }),
  setAutoScan: (b) => set({ autoScan: b }),
  setWatchFiles: (b) => set({ watchFiles: b }),
  addScanDir: (d) => set({ customScanDirs: [...get().customScanDirs, d] }),
  removeScanDir: (d) => set({ customScanDirs: get().customScanDirs.filter(x => x !== d) }),
  toggleRule: (id) => set({ attentionRules: get().attentionRules.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r) }),
  setRuleThreshold: (id, v) => set({ attentionRules: get().attentionRules.map(r => r.id === id ? { ...r, threshold: v } : r) }),
  setAIVendor: (v) => set({ aiVendor: v }),
  setAIDesensitize: (b) => set({ aiDesensitize: b }),
  setAIDiffConfirm: (b) => set({ aiDiffConfirm: b }),
  setAIBudget: (v) => set({ aiMonthlyBudget: v }),
}));
