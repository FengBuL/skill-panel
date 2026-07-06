// Library 页面 — wt-1-library 职责
// 卡片网格 + 分页 + 侧栏多选AND筛选 + 批量overlay + Drawer只读 + 卡片操作菜单 + 键盘导航
// 数据：真实 invoke('scan_skills') + mock fallback
import { useEffect } from 'react';
import { useSkillStore } from '../../store/skillStore';
import { useUIStore } from '../../store/uiStore';
import { Button } from '../../components/ui';
import { showToast } from '../../components/Toast';
import { scanSkills } from '../../lib/invoke';
import './Library.css';

const AV_COLORS: Record<string, string> = { '浏览器': '#E8F0FF/#0A84FF', '金融': '#FFF7ED/#B54708', '常用': '#FBEAF0/#D4537E', '数据': '#EAFBEF/#2FB344', '文案': '#F0EDFF/#6B5DD3' };

export default function LibraryPage() {
  const store = useSkillStore();
  const ui = useUIStore();

  useEffect(() => {
    scanSkills().then(r => {
      store.setSkills(r.skills);
      if (r.isMock) showToast('Tauri 不可用，使用示例数据', '');
    });
  }, []);

  const skills = store.skills;
  const filtered = store.filtered;
  const totalPages = Math.max(1, Math.ceil(filtered.length / store.pageSize));
  const curPage = Math.min(store.page, totalPages);
  const pageItems = filtered.slice((curPage - 1) * store.pageSize, curPage * store.pageSize);

  const toggleFilter = (type: 'src' | 'cat', val: string) => {
    store.toggleFilter(type === 'src' ? 'source' : 'category', val);
  };

  const drawerSkill = store.drawerIdx >= 0 ? skills[store.drawerIdx] : null;
  const av = (cat: string) => AV_COLORS[cat] || '#F1F4F9/#5A6270';
  const colorsOf = (cat: string): [string, string] => {
    const v = av(cat).split('/');
    return [v[0] || '#F1F4F9', v[1] || '#5A6270'];
  };

  return (
    <div className="lib-shell">
      {/* 侧栏：多选AND筛选 */}
      <aside className="lib-sidebar">
        <div className="lib-side-section">
          <div className="lib-side-label">来源</div>
          {['mine', 'plugin'].map(s => (
            <div key={s} className={`lib-side-item ${store.filters.source.includes(s) ? 'active' : ''}`} onClick={() => toggleFilter('src', s)}>
              <span className="lib-dot" style={{ background: s === 'mine' ? 'var(--accent)' : 'var(--warning)' }} />
              {s === 'mine' ? '我的' : '插件'}
              <span className="lib-count">{skills.filter(x => x.source === s).length}</span>
            </div>
          ))}
        </div>
        <div className="lib-side-section">
          <div className="lib-side-label">分类</div>
          {['金融', '数据', '文案', '自动化', '浏览器', '常用'].map(c => (
            <div key={c} className={`lib-side-item ${store.filters.category.includes(c) ? 'active' : ''}`} onClick={() => toggleFilter('cat', c)}>
              <span className="lib-dot" style={{ background: colorsOf(c)[0] }} />
              {c}
              <span className="lib-count">{skills.filter(x => x.category === c).length}</span>
            </div>
          ))}
        </div>
        <div className="lib-side-section">
          <div className="lib-side-label">状态</div>
          <div className={`lib-side-item ${store.filters.status.includes('starred') ? 'active' : ''}`} onClick={() => store.toggleFilter('status', 'starred')}>
            <span className="material-symbols-outlined lib-side-icon" aria-hidden="true">star</span>已收藏<span className="lib-count">{skills.filter(x => x.starred).length}</span>
          </div>
          <div className={`lib-side-item ${store.filters.status.includes('disabled') ? 'active' : ''}`} onClick={() => store.toggleFilter('status', 'disabled')}>
            <span className="material-symbols-outlined lib-side-icon" aria-hidden="true">block</span>已禁用<span className="lib-count">{skills.filter(x => x.disabled).length}</span>
          </div>
          <div className={`lib-side-item ${store.filters.status.includes('attention') ? 'active' : ''}`} onClick={() => store.toggleFilter('status', 'attention')}>
            <span className="material-symbols-outlined lib-side-icon" aria-hidden="true">priority_high</span>待关注<span className="lib-count">{skills.filter(x => x.disabled || !x.description || x.description === '(无描述)').length}</span>
          </div>
        </div>
      </aside>

      {/* 主区 */}
      <div className="lib-main">
        {/* 批量操作栏 */}
        {store.bulkMode && (
          <div className="lib-bulk-bar">
            <span className="lib-bulk-count">已选 {store.bulkSelected.size} 个</span>
            <button className="lib-bulk-action" onClick={store.selectAll}>全选</button>
            <button className="lib-bulk-action" onClick={store.clearSelection}>清空</button>
            <span className="lib-bulk-sep" />
            <button className="lib-bulk-action"><span className="material-symbols-outlined" aria-hidden="true">drive_file_move</span>移动分类</button>
            <button className="lib-bulk-action"><span className="material-symbols-outlined" aria-hidden="true">sell</span>加标签</button>
            <button className="lib-bulk-action" onClick={() => { showToast(`已归档 ${store.bulkSelected.size} 个 Skill`, '撤销'); store.toggleBulk(); store.clearSelection(); }}><span className="material-symbols-outlined" aria-hidden="true">archive</span>归档</button>
            <div className="lib-flex" />
            <Button variant="ghost" size="sm" onClick={() => { store.toggleBulk(); store.clearSelection(); }}>退出批量</Button>
          </div>
        )}
        <div className="lib-titlebar">
          <div className="lib-title">全部 Skill</div>
          <div className="lib-subtitle">{filtered.length} 个 · {skills.filter(x => x.source === 'mine').length} 可编辑 · {skills.filter(x => x.starred).length} 已收藏</div>
        </div>

        {/* 卡片网格 */}
        <div className="lib-grid" tabIndex={0}>
          {pageItems.map(s => {
            const idx = skills.indexOf(s);
            return (
              <div
                key={s.name}
                className={`lib-card ${store.bulkMode && store.bulkSelected.has(idx) ? 'selected' : ''} ${s.disabled ? 'disabled' : ''}`}
                onClick={() => store.bulkMode ? store.toggleSelect(idx) : store.openDrawer(idx)}
              >
                {store.bulkMode && <div className={`lib-ck ${store.bulkSelected.has(idx) ? 'on' : ''}`} onClick={e => { e.stopPropagation(); store.toggleSelect(idx); }} />}
                <div className="lib-card-top">
                  <div className="lib-avatar" style={{ background: colorsOf(s.category)[0], color: colorsOf(s.category)[1] }}>{s.name.slice(0, 2).toUpperCase()}</div>
                  <span className={`lib-badge ${s.source}`}>{s.source === 'plugin' ? '插件' : '我的'}</span>
                </div>
                <div className="lib-name">{s.name}</div>
                <div className="lib-desc">{s.description}</div>
                <div className="lib-tags"><span className="lib-tag">{s.category}</span></div>
                <div className="lib-footer"><span>{s.modifiedAt}</span><span className={`lib-star ${s.starred ? 'on' : ''}`} onClick={e => { e.stopPropagation(); store.toggleStar(idx); }}>★</span></div>
              </div>
            );
          })}
        </div>

        {/* 分页器 */}
        <div className="lib-pagination">
          <button className="lib-page-btn" disabled={curPage <= 1} onClick={() => store.setPage(curPage - 1)}>‹</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button key={p} className={`lib-page-btn ${p === curPage ? 'active' : ''}`} onClick={() => store.setPage(p)}>{p}</button>
          ))}
          <button className="lib-page-btn" disabled={curPage >= totalPages} onClick={() => store.setPage(curPage + 1)}>›</button>
          <span className="lib-page-info">第 {filtered.length ? (curPage - 1) * store.pageSize + 1 : 0}-{Math.min(curPage * store.pageSize, filtered.length)} / {filtered.length}</span>
        </div>
      </div>

      {/* Drawer 只读 */}
      {drawerSkill && (
        <>
          <div className="lib-drawer-overlay" onClick={store.closeDrawer} />
          <div className="lib-drawer open">
            <div className="lib-drawer-header">
              <span className="lib-drawer-eyebrow">详情 · 只读预览</span>
              <button className="lib-drawer-nav" disabled={store.drawerIdx <= 0} onClick={() => store.openDrawer(store.drawerIdx - 1)}>‹</button>
              <button className="lib-drawer-nav" disabled={store.drawerIdx >= skills.length - 1} onClick={() => store.openDrawer(store.drawerIdx + 1)}>›</button>
              <button className="lib-drawer-nav lib-drawer-close" onClick={store.closeDrawer}>✕</button>
            </div>
            <div className="lib-drawer-body">
              <div className="lib-drawer-title">{drawerSkill.name}</div>
              <div className="lib-drawer-tags">
                <span className={`lib-badge ${drawerSkill.source}`}>{drawerSkill.source === 'plugin' ? '插件' : '我的'}</span>
                <span className="lib-tag">{drawerSkill.category}</span>
              </div>
              <div className="lib-drawer-desc">{drawerSkill.description}</div>
              <div className="lib-drawer-meta">
                <div><div className="lib-meta-label">修改时间</div><div className="lib-meta-val">{drawerSkill.modifiedAt}</div></div>
                <div><div className="lib-meta-label">来源</div><div className="lib-meta-val">{drawerSkill.source === 'plugin' ? '插件缓存' : '我的'}</div></div>
                <div><div className="lib-meta-label">状态</div><div className="lib-meta-val" style={{ color: 'var(--success)' }}>已解析</div></div>
                <div><div className="lib-meta-label">大小</div><div className="lib-meta-val">{(drawerSkill.size / 1024).toFixed(1)} KB</div></div>
              </div>
              {drawerSkill.protected && <div className="lib-protected">插件 Skill 受保护 · 复制为用户 Skill 后可编辑</div>}
            </div>
            <div className="lib-drawer-footer">
              <Button variant="secondary" size="sm"><span className="material-symbols-outlined sp-btn-icon" aria-hidden="true">folder_open</span>打开目录</Button>
              <Button variant="primary" size="sm" onClick={() => ui.enterSub('editor', drawerSkill.name)}><span className="material-symbols-outlined sp-btn-icon" aria-hidden="true">edit</span>在编辑器打开</Button>
              <Button variant="danger" size="sm" onClick={() => { showToast(`已归档 ${drawerSkill.name}`, '撤销'); store.closeDrawer(); }}><span className="material-symbols-outlined sp-btn-icon" aria-hidden="true">archive</span>归档</Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
