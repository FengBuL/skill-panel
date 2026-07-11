import type { ReactNode } from 'react';
import { useUIStore } from '../store/uiStore';
import './TopBar.css';

export function TopBar({ context }: { context?: ReactNode }) {
  const { mainView, subView, setMainView, enterSub } = useUIStore();
  const librarySubViews = ['detail', 'editor', 'preview', 'create', 'ai'];
  const libraryActive = mainView === 'library' && (!subView || librarySubViews.includes(subView));

  return (
    <header className="top-nav">
      <div className="nav-left">
        <button className="brand" type="button" onClick={() => setMainView('library')}>
          <span className="brand-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2 2 7l10 5 10-5-10-5Z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </span>
          <span>Skill Panel</span>
        </button>
        <nav className="nav-links" aria-label="主导航">
          <button
            type="button"
            className={`nav-link ${mainView === 'dashboard' && !subView ? 'active' : ''}`}
            onClick={() => setMainView('dashboard')}
          >
            Dashboard
          </button>
          <button
            type="button"
            className={`nav-link ${libraryActive ? 'active' : ''}`}
            onClick={() => setMainView('library')}
          >
            Library
          </button>
          <button
            type="button"
            className={`nav-link ${subView === 'logs' ? 'active' : ''}`}
            onClick={() => enterSub('logs')}
          >
            Logs
          </button>
          <button
            type="button"
            className={`nav-link ${subView === 'dependencies' ? 'active' : ''}`}
            onClick={() => enterSub('dependencies')}
          >
            Dependencies
          </button>
          <button
            type="button"
            className={`nav-link ${subView === 'settings' ? 'active' : ''}`}
            onClick={() => enterSub('settings')}
          >
            Settings
          </button>
        </nav>
      </div>
      <div className="nav-right">
        {context ?? (
          <button className="btn btn-ghost" type="button" onClick={() => enterSub('create')}>
            New Skill
          </button>
        )}
      </div>
    </header>
  );
}
