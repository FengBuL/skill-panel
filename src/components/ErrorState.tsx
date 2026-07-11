import type { ReactNode } from 'react';
import { ActionButton } from './ActionButton';
import './ui.css';

export function ErrorState({
  title,
  description,
  primaryAction,
  secondaryAction,
}: {
  title: string;
  description: string;
  primaryAction?: ReactNode;
  secondaryAction?: ReactNode;
}) {
  return (
    <div className="empty-state error-state" role="alert">
      <div className="empty-icon error-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4" />
          <path d="M12 16h.01" />
        </svg>
      </div>
      <h2 className="empty-title">{title}</h2>
      <p className="empty-desc">{description}</p>
      <div className="empty-actions">
        {primaryAction ?? <ActionButton variant="danger">重试</ActionButton>}
        {secondaryAction}
      </div>
    </div>
  );
}
