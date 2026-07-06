// TopBar 双层 — wt-0-foundation 产出
// 全局层（恒定）：Brand + 主导航Segment(仅dashboard|library) + 设置/主题图标
// 上下文层（随页面变）：由各页面通过 children 传入
import type { ReactNode } from 'react';
import { useUIStore } from '../store/uiStore';
import { Segment, IconButton } from './ui';
import './TopBar.css';

export function TopBar({ context }: { context?: ReactNode }) {
  const { mainView, setMainView, enterSub } = useUIStore();
  return (
    <div className="sp-topbar-wrap">
      <div className="sp-topbar-global">
        <div className="sp-topbar-brand">Skill Panel</div>
        <Segment
          items={[{ value: 'dashboard', label: '仪表板' }, { value: 'library', label: 'Library' }]}
          value={mainView}
          onChange={v => setMainView(v)}
        />
        <div style={{ flex: 1 }} />
        <IconButton title="命令面板" label="命令面板">⌘</IconButton>
        <IconButton title="主题" label="切换主题">🌙</IconButton>
        <IconButton title="设置" label="设置" onClick={() => enterSub('settings')}>⚙</IconButton>
      </div>
      {context && <div className="sp-topbar-context">{context}</div>}
    </div>
  );
}
