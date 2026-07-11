import { type ReactNode } from 'react';
import { ActionButton } from '../components/ActionButton';
import '../components/ui.css';

type ListState = 'loading' | 'error' | 'empty' | 'filtered-empty' | 'ready';

type EmptyStateProps = {
  action?: ReactNode;
  children?: ReactNode;
  description?: string;
  progress?: number;
  state: ListState;
  title?: string;
};

function EmptyIcon({ state }: { state: ListState }) {
  if (state === 'loading') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
        <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
      </svg>
    );
  }
  if (state === 'filtered-empty') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    </svg>
  );
}

export function EmptyState({ action, children, description, progress, state, title }: EmptyStateProps) {
  if (state === 'ready') return <>{children}</>;

  const fallbackTitle = state === 'loading' ? '正在扫描' : state === 'filtered-empty' ? '无搜索结果' : '还没有发现 Skill';
  const fallbackDescription = state === 'loading'
    ? '正在读取 Skill 目录，请稍候。'
    : state === 'filtered-empty'
      ? '没有找到匹配的 Skill，请尝试其他关键词或清除筛选条件。'
      : '请先扫描 Skill 根目录，或检查设置中的目录配置是否正确。';

  return (
    <div className={`empty-state ${state === 'error' ? 'error-state' : ''}`}>
      <div className="empty-icon" aria-hidden="true"><EmptyIcon state={state} /></div>
      <h2 className="empty-title">{title ?? fallbackTitle}</h2>
      <p className="empty-desc">{description ?? fallbackDescription}</p>
      {typeof progress === 'number' ? (
        <div className="empty-progress" aria-label="扫描进度">
          <span style={{ width: `${Math.max(0, Math.min(100, progress))}%` }} />
        </div>
      ) : null}
      {children}
      {action ?? (state === 'empty' ? <ActionButton variant="primary">立即扫描</ActionButton> : null)}
    </div>
  );
}
