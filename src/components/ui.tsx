// UI 基础组件 — wt-0-foundation 产出，各 wt 消费
import type { ReactNode, CSSProperties } from 'react';
import './ui.css';

// Button
type BtnVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type BtnSize = 'sm' | 'md';
export function Button({
  variant = 'secondary', size = 'md', children, onClick, title, disabled, style,
}: {
  variant?: BtnVariant; size?: BtnSize; children: ReactNode;
  onClick?: () => void; title?: string; disabled?: boolean; style?: CSSProperties;
}) {
  return (
    <button
      className={`sp-btn sp-btn-${variant} ${size === 'sm' ? 'sp-btn-sm' : ''}`}
      onClick={onClick} title={title} disabled={disabled} style={style}
    >{children}</button>
  );
}

// Icon button
export function IconButton({ children, onClick, title, label }: { children: ReactNode; onClick?: () => void; title?: string; label?: string }) {
  return <button className="sp-icon-btn" onClick={onClick} title={title} aria-label={label || title}>{children}</button>;
}

// Kbd
export function Kbd({ children }: { children: ReactNode }) {
  return <span className="sp-kbd">{children}</span>;
}

// Segment (分段控件)
export function Segment<T extends string>({
  items, value, onChange,
}: { items: { value: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="sp-segment">
      {items.map(it => (
        <button
          key={it.value}
          className={`sp-segment-item ${it.value === value ? 'active' : ''}`}
          onClick={() => onChange(it.value)}
        >{it.label}</button>
      ))}
    </div>
  );
}

// Toggle
export function Toggle({ on, onClick }: { on: boolean; onClick?: () => void }) {
  return <div className={`sp-toggle ${on ? 'on' : ''}`} onClick={onClick} role="switch" aria-checked={on} />;
}

// Breadcrumb
export function Breadcrumb({ items }: { items: { label: string; badge?: 'edit' | 'preview' | 'create' }[] }) {
  return (
    <div className="sp-breadcrumb">
      {items.map((it, i) => (
        <span key={i} className="sp-bc-item">
          {i > 0 && <span className="sp-bc-sep">/</span>}
          <span className={i === items.length - 1 ? 'sp-bc-current' : 'sp-bc-prev'}>{it.label}</span>
          {it.badge && <span className={`sp-bc-badge ${it.badge}`}>{it.badge === 'edit' ? '编辑' : it.badge === 'preview' ? '预览' : '新建'}</span>}
        </span>
      ))}
    </div>
  );
}

// SearchBox
export function SearchBox({ value, onChange, placeholder = '搜索...' }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="sp-search-box">
      <span aria-hidden="true">🔍</span>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} aria-label="搜索" />
      <Kbd>⌘K</Kbd>
    </div>
  );
}
