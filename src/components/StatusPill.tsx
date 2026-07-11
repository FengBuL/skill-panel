import type { ReactNode } from 'react';
import './ui.css';

type StatusPillTone = 'healthy' | 'invalid' | 'warning' | 'info' | 'archived' | 'readonly' | 'favorite' | 'neutral';

type StatusPillProps = {
  tone?: StatusPillTone;
  children: ReactNode;
  icon?: ReactNode;
  active?: boolean;
  className?: string;
};

export function StatusPill({ tone = 'neutral', children, icon, active = false, className }: StatusPillProps) {
  const classes = ['sp-status-pill', `sp-status-pill-${tone}`];
  if (active) classes.push('is-active');
  if (className) classes.push(className);

  return (
    <span className={classes.join(' ')}>
      {icon ? <span className="sp-status-pill-icon">{icon}</span> : null}
      {children}
    </span>
  );
}
