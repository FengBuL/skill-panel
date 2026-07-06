// TopBar 双层 — wt-0-foundation 产出
// 全局层（恒定）：Brand + 主导航Segment(仅dashboard|library) + 设置/主题图标
// 上下文层（随页面变）：由各页面通过 children 传入
import type { ReactNode } from 'react';
import { useUIStore } from '../store/uiStore';
import { useSkillStore } from '../store/skillStore';
import { Segment, IconButton, SearchBox, Button } from './ui';
import './TopBar.css';

export function TopBar({ context }: { context?: ReactNode }) {
  const { mainView, setMainView, enterSub, undo, redo, undoStack, redoStack } = useUIStore();
  const skillStore = useSkillStore();
  const skills = skillStore.skills;
  const attentionCount = skills.filter(skill => skill.disabled || !skill.description || skill.description === '(无描述)').length;
  const defaultContext = (
    <>
      <SearchBox value={skillStore.search} onChange={skillStore.setSearch} placeholder="搜索名称/描述..." />
      <div className="sp-toolbar-group" aria-label="撤销重做">
        <IconButton title="撤销" label="撤销" onClick={undo}>
          <span className="material-symbols-outlined" aria-hidden="true">undo</span>
        </IconButton>
        <IconButton title="重做" label="重做" onClick={redo}>
          <span className="material-symbols-outlined" aria-hidden="true">redo</span>
        </IconButton>
      </div>
      <Button variant={skillStore.bulkMode ? 'primary' : 'secondary'} size="sm" onClick={skillStore.toggleBulk}>
        <span className="material-symbols-outlined sp-btn-icon" aria-hidden="true">select_check_box</span>
        批量
      </Button>
      <div className="sp-toolbar-group" aria-label="视图切换">
        <IconButton title="网格视图" label="网格视图">
          <span className="material-symbols-outlined" aria-hidden="true">grid_view</span>
        </IconButton>
        <IconButton title="列表视图" label="列表视图">
          <span className="material-symbols-outlined" aria-hidden="true">view_list</span>
        </IconButton>
      </div>
      <Button variant="secondary" size="sm">
        <span className="material-symbols-outlined sp-btn-icon" aria-hidden="true">sort</span>
        最近修改
      </Button>
      <button
        className="sp-pill sp-pill-muted"
        onClick={() => skillStore.toggleFilter('status', 'attention')}
        aria-pressed={skillStore.filters.status.includes('attention')}
      >
        待关注 {attentionCount}
      </button>
      <div className="sp-toolbar-spacer" />
      <span className="sp-pill sp-pill-quiet">Undo {undoStack.length} · Redo {redoStack.length}</span>
      <Button variant="primary" size="sm" onClick={() => enterSub('create')}>
        <span className="material-symbols-outlined sp-btn-icon" aria-hidden="true">add</span>
        + 新建
      </Button>
    </>
  );
  return (
    <div className="sp-topbar-wrap">
      <div className="sp-topbar-global">
        <div className="sp-topbar-brand">Skill Panel</div>
        <Segment
          items={[{ value: 'dashboard', label: '仪表板' }, { value: 'library', label: 'Library' }]}
          value={mainView}
          onChange={v => setMainView(v)}
        />
        <div className="sp-toolbar-spacer" />
        <span className="sp-pill sp-pill-blue">扫描完成 · {skills.length} 个 Skill</span>
        <span className="sp-pill sp-pill-green">自动修复可用</span>
        <IconButton title="命令面板" label="命令面板">
          <span className="material-symbols-outlined" aria-hidden="true">terminal</span>
        </IconButton>
        <IconButton title="主题" label="切换主题">
          <span className="material-symbols-outlined" aria-hidden="true">dark_mode</span>
        </IconButton>
        <IconButton title="设置" label="设置" onClick={() => enterSub('settings')}>
          <span className="material-symbols-outlined" aria-hidden="true">settings</span>
        </IconButton>
      </div>
      <div className="sp-topbar-context">{context || defaultContext}</div>
    </div>
  );
}
