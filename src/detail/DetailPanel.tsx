import type { Skill } from '../store/skillStore';

type DetailPanelProps = {
  skill: Skill | null;
  onOpenDetail?: (skill: Skill) => void;
};

function sourceLabel(source?: Skill['source']) {
  return source === 'plugin' ? 'Builtin' : 'User';
}

function shortPath(path: string) {
  if (!path) return '';
  return path.replace(/^\/Users\/[^/]+/, '~');
}

export function DetailPanel({ skill, onOpenDetail }: DetailPanelProps) {
  if (!skill) {
    return (
      <aside className="card detail-panel">
        <div className="detail-body">
          <div className="detail-section">
            <div className="section-title">详情</div>
            <p className="text-sm text-secondary">暂无数据</p>
          </div>
        </div>
      </aside>
    );
  }

  const current = skill;

  return (
    <aside className="card detail-panel">
      <div className="detail-header">
        <div className="detail-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 2a10 10 0 1 0 10 10H12V2z" />
            <path d="M12 2a10 10 0 0 1 10 10" />
          </svg>
        </div>
        <div className="detail-title-block">
          <h2>{current.name}</h2>
          <p>{shortPath(current.path)}</p>
        </div>
      </div>
      <div className="detail-panel-actions">
        <button
          className="btn btn-primary detail-panel-open-button"
          type="button"
          onClick={() => onOpenDetail?.(skill)}
        >
          查看完整详情
        </button>
      </div>
      <div className="detail-body">
        <div className="detail-section">
          <div className="section-title">概览</div>
          <div className="detail-row"><span className="detail-label">状态</span><span className="detail-value detail-value-healthy">健康</span></div>
          <div className="detail-row"><span className="detail-label">分类</span><span className="detail-value">{current.category || '未分类'}</span></div>
          <div className="detail-row"><span className="detail-label">来源</span><span className="detail-value">{sourceLabel(current.source)}</span></div>
          <div className="detail-row"><span className="detail-label">版本</span><span className="detail-value">暂无数据</span></div>
        </div>
        <div className="detail-section">
          <div className="section-title">使用</div>
          <div className="detail-row"><span className="detail-label">调用次数</span><span className="detail-value">暂无数据</span></div>
          <div className="detail-row"><span className="detail-label">最近使用</span><span className="detail-value">暂无数据</span></div>
          <div className="detail-row"><span className="detail-label">首次发现</span><span className="detail-value">暂无数据</span></div>
        </div>
        <div className="detail-section">
          <div className="section-title">文件</div>
          <div className="detail-row"><span className="detail-label">SKILL.md</span><span className="detail-value">{current.size ? `${(current.size / 1000).toFixed(1)} KB` : '暂无数据'}</span></div>
          <div className="detail-row"><span className="detail-label">references/</span><span className="detail-value">尚未接入</span></div>
        </div>
        <div className="detail-section">
          <div className="section-title">标签</div>
          <div className="flex gap-2 detail-tags">
            <span className="tag tag-category">{current.category || '未分类'}</span>
            <span className="tag">news</span>
            <span className="tag">{current.source === 'plugin' ? 'builtin' : 'user'}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
