import { type ReactNode } from 'react';

type ListState = 'loading' | 'error' | 'empty' | 'filtered-empty' | 'ready';

type EmptyStateProps = {
  children?: ReactNode;
  description?: string;
  state: ListState;
  title?: string;
};

export function EmptyState({ children, description, state, title }: EmptyStateProps) {
  return (
    <div className={`empty-state ${state === 'error' ? 'error-state' : ''}`}>
      {children ?? (
        <>
          {state === 'loading' ? (
            <div className="skeleton-stack" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
          ) : null}
          <strong>{title}</strong>
          <p>{description}</p>
        </>
      )}
    </div>
  );
}
