// Library 页面 — wt-1-library 职责
// 卡片网格 + 分页 + 侧栏多选AND筛选 + 批量overlay + Drawer只读 + 卡片操作菜单 + 键盘导航
// 数据：真实 invoke('scan_skills') + mock fallback
import { useState, useEffect } from 'react';
import { useSkillStore, type Skill } from '../../store/skillStore';
import { useUIStore } from '../../store/uiStore';
import { Button, SearchBox } from '../../components/ui';
import { showToast } from '../../components/Toast';
import { scanSkills } from '../../lib/invoke';
import './Library.css';

// 初始空，useEffect 内调用 scanSkills() 加载（真实扫描，失败 fallback mock）
let MOCK_SKILLS: Skill[] = [];

const AV_COLORS: Record<string, string> = { '浏览器': '#E8F0FF/#0A84FF', '金融': '#FFF7ED/#B54708', '常用': '#FBEAF0/#D4537E', '数据': '#EAFBEF/#2FB344', '文案': '#F0EDFF/#6B5DD3' };

export default function LibraryPage() {
  const store = useSkillStore();
  const ui = useUIStore();
  const [search, setSearch] = useState('');
  const [filterSrc, setFilterSrc] = useState<string[]>([]);
  const [filterCat, setFilterCat] = useState<string[]>([]);
  const [bulkMode, setBulkMode] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [drawerIdx, setDrawerIdx] = useState(-1);
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const [, forceRender] = useState(0);

  useEffect(() => {
    scanSkills().then(r => {
      MOCK_SKILLS = r.skills;
      store.setSkills(r.skills);
      forceRender(n => n + 1);
      if (r.isMock) showToast('Tauri 不可用，使用示例数据', '');
    });
  }, []);

  // 筛选
  const filtered = MOCK_SKILLS.filter(s => {
    if (search) { const q = search.toLowerCase(); if (!s.name.toLowerCase().includes(q) && !s.description.toLowerCase().includes(q)) return false; }
    if (filterSrc.length && !filterSrc.includes(s.source)) return false;
    if (filterCat.length && !filterCat.includes(s.category)) return false;
    return true;
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const curPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((curPage - 1) * pageSize, curPage * pageSize);

  const toggleFilter = (type: 'src' | 'cat', val: string) => {
    const setter = type === 'src' ? setFilterSrc : setFilterCat;
    const arr = type === 'src' ? filterSrc : filterCat;
    setter(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]);
    setPage(1);
  };

  const toggleSelect = (idx: number) => {
    const ns = new Set(selected);
    if (ns.has(idx)) ns.delete(idx); else ns.add(idx);
    setSelected(ns);
  };

  const drawerSkill = drawerIdx >= 0 ? MOCK_SKILLS[drawerIdx] : null;
  const av = (cat: string) => AV_COLORS[cat] || '#F1F4F9/#5A6270';
  const colorsOf = (cat: string): [string, string] => {
    const v = av(cat).split('/');
    return [v[0] || '#F1F4F9', v[1] || '#5A6270'];
  };

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* 侧栏：多选AND筛选 */}
      <aside className="lib-sidebar">
        <div className="lib-side-section">
          <div className="lib-side-label">来源</div>
          {['mine', 'plugin'].map(s => (
            <div key={s} className={`lib-side-item ${filterSrc.includes(s) ? 'active' : ''}`} onClick={() => toggleFilter('src', s)}>
              <span className="lib-dot" style={{ background: s === 'mine' ? 'var(--accent)' : 'var(--warning)' }} />
              {s === 'mine' ? '我的' : '插件'}
              <span className="lib-count">{MOCK_SKILLS.filter(x => x.source === s).length}</span>
            </div>
          ))}
        </div>
        <div className="lib-side-section">
          <div className="lib-side-label">分类</div>
          {['金融', '数据', '文案', '自动化', '浏览器', '常用'].map(c => (
            <div key={c} className={`lib-side-item ${filterCat.includes(c) ? 'active' : ''}`} onClick={() => toggleFilter('cat', c)}>
              <span className="lib-dot" style={{ background: colorsOf(c)[0] }} />
              {c}
              <span className="lib-count">{MOCK_SKILLS.filter(x => x.category === c).length}</span>
            </div>
          ))}
        </div>
        <div className="lib-side-section">
          <div className="lib-side-label">状态</div>
          <div className="lib-side-item"><span>★</span>已收藏<span className="lib-count">{MOCK_SKILLS.filter(x => x.starred).length}</span></div>
          <div className="lib-side-item"><span>⊘</span>已禁用<span className="lib-count">{MOCK_SKILLS.filter(x => x.disabled).length}</span></div>
        </div>
      </aside>

      {/* 主区 */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* 批量操作栏 */}
        {bulkMode && (
          <div className="lib-bulk-bar">
            <span className="lib-bulk-count">已选 {selected.size} 个</span>
            <button className="lib-bulk-action" onClick={() => setSelected(new Set(filtered.map((_, i) => i)))}>全选</button>
            <button className="lib-bulk-action" onClick={() => setSelected(new Set())}>清空</button>
            <span style={{ width: 1, height: 20, background: 'var(--border)' }} />
            <button className="lib-bulk-action">📁 移动分类</button>
            <button className="lib-bulk-action">🏷 加标签</button>
            <button className="lib-bulk-action" onClick={() => { showToast(`已归档 ${selected.size} 个 Skill`, '撤销'); setBulkMode(false); setSelected(new Set()); }}>📦 归档</button>
            <div style={{ flex: 1 }} />
            <Button variant="ghost" size="sm" onClick={() => { setBulkMode(false); setSelected(new Set()); }}>退出批量</Button>
          </div>
        )}
        <div style={{ padding: '12px 20px 8px' }}>
          <div style={{ fontSize: 16, fontWeight: 600 }}>全部 Skill</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{filtered.length} 个 · {MOCK_SKILLS.filter(x => x.source === 'mine').length} 可编辑 · {MOCK_SKILLS.filter(x => x.starred).length} 已收藏</div>
        </div>
        <div style={{ padding: '8px 20px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid var(--border-2)' }}>
          <SearchBox value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="搜索名称/描述..." />
          <Button variant="secondary" size="sm" onClick={() => setBulkMode(!bulkMode)}>{bulkMode ? '退出' : '批量'}</Button>
          <div style={{ flex: 1 }} />
          <Button variant="primary" size="sm" onClick={() => ui.enterSub('create')}>+ 新建</Button>
        </div>

        {/* 卡片网格 */}
        <div className="lib-grid" tabIndex={0}>
          {pageItems.map(s => {
            const idx = MOCK_SKILLS.indexOf(s);
            return (
              <div
                key={s.name}
                className={`lib-card ${bulkMode && selected.has(idx) ? 'selected' : ''} ${s.disabled ? 'disabled' : ''}`}
                onClick={() => bulkMode ? toggleSelect(idx) : setDrawerIdx(idx)}
              >
                {bulkMode && <div className={`lib-ck ${selected.has(idx) ? 'on' : ''}`} onClick={e => { e.stopPropagation(); toggleSelect(idx); }} />}
                <div className="lib-card-top">
                  <div className="lib-avatar" style={{ background: colorsOf(s.category)[0], color: colorsOf(s.category)[1] }}>{s.name.slice(0, 2).toUpperCase()}</div>
                  <span className={`lib-badge ${s.source}`}>{s.source === 'plugin' ? '插件' : '我的'}</span>
                </div>
                <div className="lib-name">{s.name}</div>
                <div className="lib-desc">{s.description}</div>
                <div className="lib-tags"><span className="lib-tag">{s.category}</span></div>
                <div className="lib-footer"><span>{s.modifiedAt}</span>{s.starred && <span className="lib-star">★</span>}</div>
              </div>
            );
          })}
        </div>

        {/* 分页器 */}
        <div className="lib-pagination">
          <button className="lib-page-btn" disabled={curPage <= 1} onClick={() => setPage(curPage - 1)}>‹</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button key={p} className={`lib-page-btn ${p === curPage ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
          ))}
          <button className="lib-page-btn" disabled={curPage >= totalPages} onClick={() => setPage(curPage + 1)}>›</button>
          <span className="lib-page-info">第 {(curPage - 1) * pageSize + 1}-{Math.min(curPage * pageSize, filtered.length)} / {filtered.length}</span>
        </div>
      </div>

      {/* Drawer 只读 */}
      {drawerSkill && (
        <>
          <div className="lib-drawer-overlay" onClick={() => setDrawerIdx(-1)} />
          <div className="lib-drawer open">
            <div className="lib-drawer-header">
              <span className="lib-drawer-eyebrow">详情 · 只读预览</span>
              <button className="lib-drawer-nav" disabled={drawerIdx <= 0} onClick={() => setDrawerIdx(drawerIdx - 1)}>‹</button>
              <button className="lib-drawer-nav" disabled={drawerIdx >= MOCK_SKILLS.length - 1} onClick={() => setDrawerIdx(drawerIdx + 1)}>›</button>
              <button className="lib-drawer-nav" style={{ marginLeft: 'auto' }} onClick={() => setDrawerIdx(-1)}>✕</button>
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
              {drawerSkill.protected && <div className="lib-protected">⚠ 插件 Skill 受保护 · 复制为用户 Skill 后可编辑</div>}
            </div>
            <div className="lib-drawer-footer">
              <Button variant="secondary" size="sm">📂 打开目录</Button>
              <Button variant="primary" size="sm" onClick={() => ui.enterSub('editor', drawerSkill.name)}>✏️ 在编辑器打开</Button>
              <Button variant="danger" size="sm" onClick={() => { showToast(`已归档 ${drawerSkill.name}`, '撤销'); setDrawerIdx(-1); }}>📦 归档</Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
