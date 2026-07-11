import type { ReactNode } from 'react';
import './ui.css';

type PageHeaderProps = {
  title: ReactNode;
  subtitle?: ReactNode;
  eyebrow?: ReactNode;
  actions?: ReactNode;
};

export function PageHeader({ title, subtitle, eyebrow, actions }: PageHeaderProps) {
  return (
    <header className="sp-page-header">
      <div className="sp-page-header-copy">
        {eyebrow ? <div className="sp-page-header-eyebrow">{eyebrow}</div> : null}
        <h1>{title}</h1>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      {actions ? <div className="sp-page-header-actions">{actions}</div> : null}
    </header>
  );
}
