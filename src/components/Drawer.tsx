import type { ReactNode } from 'react';
import './ui.css';

export function Drawer({ title, children, footer }: { title: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <aside className="drawer" aria-label={title}>
      <div className="drawer-header">
        <h2 className="drawer-title">{title}</h2>
      </div>
      <div className="drawer-body">{children}</div>
      {footer ? <div className="drawer-footer">{footer}</div> : null}
    </aside>
  );
}
