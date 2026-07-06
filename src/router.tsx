// Router — 状态机式视图路由（不用 react-router）
// wt-0-foundation 产出
// 主视图：dashboard | library（Segment 切换）
// 次级视图（面包屑进入）：editor | create | preview | logs | settings
import { useUIStore } from './store/uiStore';

export function AppRouter() {
  const { subView, mainView } = useUIStore();

  // 次级视图优先（面包屑进入的编辑/预览/新建等）
  switch (subView) {
    case 'editor': return { view: 'editor', lazy: () => import('./pages/Editor') };
    case 'create': return { view: 'create', lazy: () => import('./pages/Create') };
    case 'preview': return { view: 'preview', lazy: () => import('./pages/Preview') };
    case 'logs': return { view: 'logs', lazy: () => import('./pages/Logs') };
    case 'settings': return { view: 'settings', lazy: () => import('./pages/Settings') };
    default: break;
  }

  // 主视图
  switch (mainView) {
    case 'dashboard': return { view: 'dashboard', lazy: () => import('./pages/Dashboard') };
    case 'library':
    default: return { view: 'library', lazy: () => import('./pages/Library') };
  }
}

// 供 App.tsx 使用：根据当前视图渲染对应页面占位
// 各 worktree 实现具体页面后替换占位
export const VIEW_TITLES: Record<string, string> = {
  dashboard: '仪表板',
  library: 'Library',
  editor: '编辑器',
  create: '新建 Skill',
  preview: '预览',
  logs: '调用日志',
  settings: '设置',
};
