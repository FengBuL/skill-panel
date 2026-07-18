import { useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import '../styles/tokens.css';
import { useUIStore } from '../store/uiStore';
import { useSkillStore } from '../store/skillStore';
import { TopBar } from '../components/TopBar';
import { ToastHost, showToast } from '../components/Toast';
import { scanSkills } from '../lib/invoke';
import { safeListen } from '../lib/tauriEvents';

import LibraryPage from '../pages/Library';
import DashboardPage from '../pages/Dashboard';
import EditorPage from '../pages/Editor';
import CreatePage from '../pages/Create';
import PreviewPage from '../pages/Preview';
import LogsPage from '../pages/Logs';
import DependenciesPage from '../pages/Dependencies';
import SettingsPage from '../pages/Settings';
import EmptyStatesPage from '../pages/EmptyStates';
import { DetailView } from '../detail/DetailView';
import { AIAssistantView } from '../components/ai/AIAssistantView';

export function AppShell() {
  const { mainView, subView, enterSub, undo, redo } = useUIStore();
  const skillStore = useSkillStore();
  const setScanStatus = skillStore.setScanStatus;
  const setSkills = skillStore.setSkills;

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

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
      if ((e.metaKey || e.ctrlKey) && (e.key === 'Z' || (e.shiftKey && e.key === 'z'))) { e.preventDefault(); redo(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo]);

  useEffect(() => {
    let unlisten: (() => void) | undefined;
    const dirs = ['~/.codex/skills', '~/.agents/skills', '~/.codex/plugins/cache'];
    invoke('watch_scan_dirs', { dirs }).catch(() => {});
    safeListen('scan-changed', () => {
      scanSkills().then(r => {
        setScanStatus(r.status, r.error);
        if (r.status === 'error') {
          showToast(`重新扫描失败：${r.error}`, '打开设置', () => enterSub('settings'));
          return;
        }
        setSkills(r.skills);
        showToast('检测到文件变化，已重新扫描', '');
      });
    }).then(fn => { unlisten = fn; });
    return () => { unlisten?.(); };
  }, [enterSub, setScanStatus, setSkills]);

  let page;
  if (subView === 'editor') {
    page = <EditorPage />;
  } else if (subView === 'create') {
    page = <CreatePage />;
  } else if (subView === 'preview') {
    page = <PreviewPage />;
  } else if (subView === 'detail') {
    page = <DetailView />;
  } else if (subView === 'ai') {
    page = <AIAssistantView />;
  } else if (subView === 'logs') {
    page = <LogsPage />;
  } else if (subView === 'dependencies') {
    page = <DependenciesPage />;
  } else if (subView === 'settings') {
    page = <SettingsPage />;
  } else if (subView === 'empty-states') {
    page = <EmptyStatesPage />;
  } else if (mainView === 'dashboard') {
    page = <DashboardPage />;
  } else {
    page = <LibraryPage />;
  }

  return (
    <div className="app">
      <TopBar />
      <main className="main">{page}</main>
      <ToastHost />
    </div>
  );
}
