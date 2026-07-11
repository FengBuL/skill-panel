// AppShell — v3.8 应用壳
// wt-0-foundation 产出：Provider + TopBar + 路由分发 + Toast
// 各 worktree 填充 pages/ 后，此处自动渲染对应页面
import { useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import './styles/tokens.css';
import { useUIStore } from './store/uiStore';
import { useSkillStore } from './store/skillStore';
import { TopBar } from './components/TopBar';
import { ToastHost, showToast } from './components/Toast';
import { Button } from './components/ui';
import { scanSkills } from './lib/invoke';
import { safeListen } from './lib/tauriEvents';

// 页面（各 worktree 实现，当前为占位）
import LibraryPage from './pages/Library';
import DashboardPage from './pages/Dashboard';
import EditorPage from './pages/Editor';
import CreatePage from './pages/Create';
import PreviewPage from './pages/Preview';
import LogsPage from './pages/Logs';
import DependenciesPage from './pages/Dependencies';
import SettingsPage from './pages/Settings';
import EmptyStatesPage from './pages/EmptyStates';
import { DetailView } from './detail/DetailView';
import { AIAssistantView } from './components/ai/AIAssistantView';

export function AppShell() {
  const { mainView, subView, subParam, enterSub, exitSub, undo, redo } = useUIStore();
  const skillStore = useSkillStore();

  useEffect(() => {
    const openHashView = () => {
      if (window.location.hash === '#empty-states') {
        enterSub('empty-states');
      }
    };
    openHashView();
    window.addEventListener('hashchange', openHashView);
    return () => window.removeEventListener('hashchange', openHashView);
  }, [enterSub]);

  // 全局快捷键
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
      if ((e.metaKey || e.ctrlKey) && (e.key === 'Z' || (e.shiftKey && e.key === 'z'))) { e.preventDefault(); redo(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo]);

  // 文件监听：启动时 watch 扫描目录 + 监听 scan-changed 事件自动重扫
  useEffect(() => {
    let unlisten: (() => void) | undefined;
    const dirs = ['~/.codex/skills', '~/.agents/skills', '~/.codex/plugins/cache'];
    // 启动文件监听（Tauri 可用时）
    invoke('watch_scan_dirs', { dirs }).catch(() => {});
    // 监听变化事件 → 重新扫描
    safeListen('scan-changed', () => {
      scanSkills().then(r => { skillStore.setSkills(r.skills); showToast('检测到文件变化，已重新扫描', ''); });
    }).then(fn => { unlisten = fn; });
    return () => { unlisten?.(); };
  }, []);

  // 次级视图优先
  let page;
  let topbarContext;
  if (subView === 'editor') {
    page = <EditorPage />;
    topbarContext = <></>;
  } else if (subView === 'create') {
    page = <CreatePage />;
    topbarContext = <Button variant="ghost" size="sm" onClick={exitSub}>← 返回 Library</Button>;
  } else if (subView === 'preview') {
    page = <PreviewPage />;
    topbarContext = <Button variant="ghost" size="sm" onClick={exitSub}>← 返回 Library</Button>;
  } else if (subView === 'detail') {
    page = <DetailView />;
  } else if (subView === 'ai') {
    page = <AIAssistantView />;
    topbarContext = <Button variant="secondary" onClick={() => enterSub('editor', subParam ?? undefined)}>返回编辑器</Button>;
  } else if (subView === 'logs') {
    page = <LogsPage />;
    topbarContext = <Button variant="ghost" size="sm" onClick={exitSub}>← 返回</Button>;
  } else if (subView === 'dependencies') {
    page = <DependenciesPage />;
    topbarContext = <Button variant="ghost" size="sm" onClick={exitSub}>← 返回</Button>;
  } else if (subView === 'settings') {
    page = <SettingsPage />;
    topbarContext = <Button variant="ghost" size="sm" onClick={exitSub}>← 返回</Button>;
  } else if (subView === 'empty-states') {
    page = <EmptyStatesPage />;
    topbarContext = <Button variant="ghost" size="sm" onClick={exitSub}>← 返回</Button>;
  } else if (mainView === 'dashboard') {
    page = <DashboardPage />;
  } else {
    page = <LibraryPage />;
  }

  return (
    <div className="app">
      <TopBar context={topbarContext} />
      <main className="main">{page}</main>
      <ToastHost />
    </div>
  );
}
