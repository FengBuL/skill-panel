// Skill Store — 技能列表/筛选/分页/选中/禁用
// wt-0-foundation 产出
import { create } from 'zustand';

export type SkillSource = 'mine' | 'plugin';
export type SkillCategory = '金融' | '数据' | '文案' | '自动化' | '浏览器' | '常用';

export interface Skill {
  name: string;
  description: string;
  source: SkillSource;
  category: string;
  path: string;
  modifiedAt: string;
  size: number;
  starred: boolean;
  disabled: boolean;
  protected: boolean;
}

export interface SkillFilters {
  source: string[]; // ['mine','plugin'] 空=全部
  category: string[];
  status: string[]; // 'starred','disabled','attention','archived'
}

export type SkillScanStatus = 'idle' | 'success' | 'empty' | 'error' | 'demo';

interface SkillState {
  skills: Skill[];
  filtered: Skill[];
  search: string;
  filters: SkillFilters;
  page: number;
  pageSize: number;
  libraryCategory: string;
  scanStatus: SkillScanStatus;
  scanError: string;
  scanIsDemo: boolean;
  bulkMode: boolean;
  bulkSelected: Set<number>;
  drawerIdx: number; // -1=关闭
  drawerOpen: boolean;
  disabledSet: Set<number>;

  // actions
  setSkills: (s: Skill[]) => void;
  setSearch: (q: string) => void;
  toggleFilter: (type: keyof SkillFilters, val: string) => void;
  clearFilters: (type: keyof SkillFilters) => void;
  setPage: (p: number) => void;
  setLibraryCategory: (category: string) => void;
  setScanStatus: (status: SkillScanStatus, error?: string) => void;
  applyFilters: () => void;
  toggleBulk: () => void;
  toggleSelect: (idx: number) => void;
  selectAll: () => void;
  clearSelection: () => void;
  toggleDisable: (idx: number) => void;
  toggleStar: (idx: number) => void;
  openDrawer: (idx: number) => void;
  closeDrawer: () => void;
}

export const useSkillStore = create<SkillState>((set, get) => ({
  skills: [],
  filtered: [],
  search: '',
  filters: { source: [], category: [], status: [] },
  page: 1,
  pageSize: 6,
  libraryCategory: '全部',
  scanStatus: 'idle',
  scanError: '',
  scanIsDemo: false,
  bulkMode: false,
  bulkSelected: new Set(),
  drawerIdx: -1,
  drawerOpen: false,
  disabledSet: new Set(),

  setSkills: (s) => { set({ skills: s }); get().applyFilters(); },

  setSearch: (q) => { set({ search: q, page: 1 }); get().applyFilters(); },

  toggleFilter: (type, val) => {
    const f = { ...get().filters };
    const arr = [...f[type]];
    const i = arr.indexOf(val);
    if (i >= 0) arr.splice(i, 1); else arr.push(val);
    f[type] = arr;
    set({ filters: f, page: 1 });
    get().applyFilters();
  },

  clearFilters: (type) => {
    const f = { ...get().filters };
    f[type] = [];
    set({ filters: f, page: 1 });
    get().applyFilters();
  },

  setPage: (p) => {
    const { filtered, skills, pageSize } = get();
    const total = (filtered.length || get().search || get().filters.source.length || get().filters.category.length || get().filters.status.length)
      ? filtered.length
      : skills.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    set({ page: Math.min(Math.max(1, p), totalPages) });
  },

  setLibraryCategory: (category) => {
    set({ libraryCategory: category, page: 1 });
  },

  setScanStatus: (status, error = '') => set({
    scanStatus: status,
    scanError: error,
    scanIsDemo: status === 'demo',
  }),

  applyFilters: () => {
    const { skills, search, filters } = get();
    let r = skills;
    if (search) {
      const q = search.toLowerCase();
      r = r.filter(s => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q));
    }
    if (filters.source.length) r = r.filter(s => filters.source.includes(s.source));
    if (filters.category.length) r = r.filter(s => filters.category.includes(s.category));
    if (filters.status.includes('starred')) r = r.filter(s => s.starred);
    if (filters.status.includes('disabled')) r = r.filter(s => s.disabled);
    if (filters.status.includes('attention')) r = r.filter(s => s.disabled || !s.description || s.description === '(无描述)');
    const totalPages = Math.max(1, Math.ceil(r.length / get().pageSize));
    set({ filtered: r, page: Math.min(get().page, totalPages) });
  },

  toggleBulk: () => {
    const bm = !get().bulkMode;
    set({ bulkMode: bm, bulkSelected: bm ? get().bulkSelected : new Set() });
  },

  toggleSelect: (idx) => {
    const s = new Set(get().bulkSelected);
    if (s.has(idx)) s.delete(idx); else s.add(idx);
    set({ bulkSelected: s });
  },

  selectAll: () => {
    const { skills, filtered } = get();
    set({ bulkSelected: new Set(filtered.map((skill) => skills.indexOf(skill)).filter((idx) => idx >= 0)) });
  },

  clearSelection: () => set({ bulkSelected: new Set() }),

  toggleDisable: (idx) => {
    const skills = [...get().skills];
    skills[idx] = { ...skills[idx], disabled: !skills[idx].disabled };
    set({ skills });
    get().applyFilters();
  },

  toggleStar: (idx) => {
    const skills = [...get().skills];
    skills[idx] = { ...skills[idx], starred: !skills[idx].starred };
    set({ skills });
    get().applyFilters();
  },

  openDrawer: (idx) => set({ drawerIdx: idx, drawerOpen: true }),
  closeDrawer: () => set({ drawerOpen: false, drawerIdx: -1 }),
}));
