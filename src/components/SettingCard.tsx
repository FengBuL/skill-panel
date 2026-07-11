import type { ReactNode } from 'react';

export function SettingCard({ title, children, danger = false }: { title: string; children: ReactNode; danger?: boolean }) {
  return (
    <section className={`card setting-card ${danger ? 'setting-card-danger' : ''}`}>
      <div className="card-header">
        <h2 className="card-title">{title}</h2>
      </div>
      <div className="card-body">
        {children}
      </div>
    </section>
  );
}
