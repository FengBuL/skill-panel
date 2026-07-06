// UI Store — 视图/Drawer/批量/undo栈/命令面板
// wt-0-foundation 产出
import { create } from 'zustand';

export type MainView = 'dashboard' | 'library';
export type SubView = 'editor' | 'create' | 'preview' | 'logs' | 'settings' | null;

interface UndoEntry { label: string; undo?: () => void; redo?: () => void; ts: number }

interface UIState {
  mainView: MainView;
  subView: SubView;
  subParam: string | null; // editor/preview 传 skill name
  cmdOpen: boolean;
  historyOpen: boolean;
  aiRailOpen: boolean;
  validateOpen: boolean;
  undoStack: UndoEntry[];
  redoStack: UndoEntry[];

  setMainView: (v: MainView) => void;
  enterSub: (v: SubView, param?: string) => void;
  exitSub: () => void;
  setCmdOpen: (b: boolean) => void;
  setHistoryOpen: (b: boolean) => void;
  setAiRailOpen: (b: boolean) => void;
  setValidateOpen: (b: boolean) => void;
  pushUndo: (label: string, undo?: () => void, redo?: () => void) => void;
  undo: () => void;
  redo: () => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  mainView: 'library',
  subView: null,
  subParam: null,
  cmdOpen: false,
  historyOpen: false,
  aiRailOpen: false,
  validateOpen: false,
  undoStack: [],
  redoStack: [],

  setMainView: (v) => set({ mainView: v, subView: null, subParam: null }),

  enterSub: (v, param) => set({ subView: v, subParam: param ?? null }),

  exitSub: () => set({ subView: null, subParam: null }),

  setCmdOpen: (b) => set({ cmdOpen: b }),
  setHistoryOpen: (b) => set({ historyOpen: b }),
  setAiRailOpen: (b) => set({ aiRailOpen: b }),
  setValidateOpen: (b) => set({ validateOpen: b }),

  pushUndo: (label, undo, redo) => {
    const s = get().undoStack;
    const next = [...s, { label, undo, redo, ts: Date.now() }];
    if (next.length > 20) next.shift();
    set({ undoStack: next, redoStack: [] });
  },

  undo: () => {
    const s = get().undoStack;
    if (!s.length) return;
    const last = s[s.length - 1];
    last.undo?.();
    set({ undoStack: s.slice(0, -1), redoStack: [...get().redoStack, last] });
  },

  redo: () => {
    const s = get().redoStack;
    if (!s.length) return;
    const last = s[s.length - 1];
    last.redo?.();
    set({ redoStack: s.slice(0, -1), undoStack: [...get().undoStack, last] });
  },
}));
