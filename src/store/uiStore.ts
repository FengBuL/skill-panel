// UI Store — 视图/Drawer/批量/undo栈/命令面板
// wt-0-foundation 产出
import { create } from 'zustand';

export type MainView = 'dashboard' | 'library';
export type SubView = 'editor' | 'create' | 'preview' | 'detail' | 'ai' | 'logs' | 'dependencies' | 'settings' | 'empty-states' | null;

interface UndoEntry { label: string; undo?: () => void; redo?: () => void; ts: number }
export interface EditorReturnTarget {
  subView: SubView;
  subParam: string | null;
}

export interface EditorOptions {
  readOnly?: boolean;
  returnTarget?: EditorReturnTarget;
}

interface UIState {
  mainView: MainView;
  subView: SubView;
  subParam: string | null; // editor/preview 传 skill name
  editorReadOnly: boolean;
  editorReturnTarget: EditorReturnTarget | null;
  cmdOpen: boolean;
  historyOpen: boolean;
  aiRailOpen: boolean;
  validateOpen: boolean;
  undoStack: UndoEntry[];
  redoStack: UndoEntry[];

  setMainView: (v: MainView) => void;
  enterSub: (v: SubView, param?: string) => void;
  enterEditor: (param?: string, options?: EditorOptions) => void;
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
  editorReadOnly: false,
  editorReturnTarget: null,
  cmdOpen: false,
  historyOpen: false,
  aiRailOpen: false,
  validateOpen: false,
  undoStack: [],
  redoStack: [],

  setMainView: (v) => set({ mainView: v, subView: null, subParam: null, editorReadOnly: false, editorReturnTarget: null }),

  enterSub: (v, param) => set({
    subView: v,
    subParam: param ?? null,
    ...(v === 'editor' ? {} : { editorReadOnly: false, editorReturnTarget: null }),
  }),

  enterEditor: (param, options) => set({
    subView: 'editor',
    subParam: param ?? null,
    editorReadOnly: options?.readOnly ?? false,
    editorReturnTarget: options?.returnTarget ?? { subView: null, subParam: null },
  }),

  exitSub: () => set({ subView: null, subParam: null, editorReadOnly: false, editorReturnTarget: null }),

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
