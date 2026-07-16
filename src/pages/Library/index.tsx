import { useCallback, useEffect, useMemo } from 'react';
import { CategoryPill } from '../../components/CategoryPill';
import { FilterBar } from '../../components/FilterBar';
import { PageHeader } from '../../components/PageHeader';
import { SearchBar } from '../../components/SearchBar';
import { SkillCard } from '../../components/SkillCard';
import { DetailPanel } from '../../detail/DetailPanel';
import { scanSkills } from '../../lib/invoke';
import { useSkillStore } from '../../store/skillStore';
import { useUIStore } from '../../store/uiStore';
import './Library.css';

const categoryPills = ['全部', 'AI', '生产力', '开发者', '设计', '金融', '已归档'];

function categoryMatches(skillCategory: string, selected: string) {
  if (selected === '全部') return true;
  if (selected === 'AI') return /AI|智能|浏览器/.test(skillCategory);
  if (selected === '生产力') return /生产力|常用|文案|自动化/.test(skillCategory);
  if (selected === '开发者') return /开发者|浏览器|自动化/.test(skillCategory);
  if (selected === '设计') return /设计|文案/.test(skillCategory);
  if (selected === '金融') return /金融/.test(skillCategory);
  if (selected === '已归档') return false;
  return true;
}

export default function LibraryPage() {
  const store = useSkillStore();
  const ui = useUIStore();
  const selectedCategory = store.libraryCategory;
  const setScanStatus = store.setScanStatus;
  const setSkills = store.setSkills;
  const setPage = store.setPage;
  const openDrawer = store.openDrawer;
  const closeDrawer = store.closeDrawer;
  const setLibraryCategory = store.setLibraryCategory;
  const toggleFilter = store.toggleFilter;

  const loadSkills = useCallback(() => {
    scanSkills().then((result) => {
      setScanStatus(result.status, result.error);
      if (result.status === 'error') return;
      setSkills(result.skills);
    });
  }, [setScanStatus, setSkills]);

  useEffect(() => {
    loadSkills();
  }, [loadSkills]);

  const baseSkills = store.filtered.length || store.search || store.filters.source.length || store.filters.status.length || store.filters.category.length
    ? store.filtered
    : store.skills;
  const filteredSkills = useMemo(
    () => baseSkills.filter((skill) => categoryMatches(skill.category, selectedCategory)),
    [baseSkills, selectedCategory],
  );
  const totalItems = filteredSkills.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / store.pageSize));
  const currentPage = Math.min(Math.max(1, store.page), totalPages);
  const startIndex = totalItems ? (currentPage - 1) * store.pageSize : 0;
  const visibleSkills = filteredSkills.slice(startIndex, startIndex + store.pageSize);
  const rangeStart = totalItems ? startIndex + 1 : 0;
  const rangeEnd = totalItems ? startIndex + visibleSkills.length : 0;
  const detailSkill = store.drawerIdx >= 0 ? store.skills[store.drawerIdx] : visibleSkills[0] || null;
  const pageNumbers = useMemo(() => {
    const pages = new Set<number>([1, totalPages, currentPage - 1, currentPage, currentPage + 1]);
    return Array.from(pages)
      .filter((page) => page >= 1 && page <= totalPages)
      .sort((a, b) => a - b);
  }, [currentPage, totalPages]);

  useEffect(() => {
    if (store.page !== currentPage) {
      setPage(currentPage);
    }
  }, [currentPage, setPage, store.page]);

  useEffect(() => {
    if (!visibleSkills.length) {
      if (store.drawerIdx >= 0) closeDrawer();
      return;
    }
    const current = store.drawerIdx >= 0 ? store.skills[store.drawerIdx] : null;
    if (!current || !visibleSkills.some((skill) => skill.path === current.path)) {
      const nextIdx = store.skills.indexOf(visibleSkills[0]);
      if (nextIdx >= 0) openDrawer(nextIdx);
    }
  }, [closeDrawer, currentPage, openDrawer, selectedCategory, store.drawerIdx, store.filters, store.search, store.skills, visibleSkills]);

  const selectSkill = (idx: number) => {
    store.openDrawer(idx >= 0 ? idx : 0);
  };
  const openSkillDetail = (idx: number, skill: typeof visibleSkills[number]) => {
    selectSkill(idx);
    ui.enterSub('detail', skill.path || skill.name);
  };
  const changePage = (page: number) => {
    setPage(page);
  };
  const setSelectedCategory = (category: string) => {
    setLibraryCategory(category);
  };
  const toggleSource = (source: string) => toggleFilter('source', source);
  const toggleStatus = (status: string) => toggleFilter('status', status);

  const sourceActive = (source: string) => store.filters.source.includes(source);
  const statusActive = (status: string) => store.filters.status.includes(status);

  const stateBanner = store.scanStatus === 'error' ? (
    <section className="library-state library-state-error" role="alert">
      <h2>Skill 扫描失败</h2>
      <p>{store.scanError || '扫描失败，未加载真实 Skill。'}</p>
      <div className="library-state-actions">
        <button className="btn btn-primary" type="button" onClick={loadSkills}>重新扫描</button>
        <button className="btn btn-ghost" type="button" onClick={() => ui.enterSub('settings')}>打开设置</button>
      </div>
    </section>
  ) : null;

  return (
    <>
      <PageHeader
        title="Manage your Skills"
        subtitle="整理、查看、维护本地 Skill，让常用工具触手可及"
        actions={<button className="btn btn-ghost" type="button" onClick={() => ui.enterSub('create')}>New Skill</button>}
      />

      <div className="flex justify-between items-center mb-4 gap-4 library-toolbar">
        <SearchBar value={store.search} onChange={store.setSearch} />
        <div className="library-filter-actions" aria-label="Library filters">
          <button className={`pill ${sourceActive('mine') ? 'pill-active' : 'pill-default'}`} type="button" onClick={() => toggleSource('mine')} aria-pressed={sourceActive('mine')}>User</button>
          <button className={`pill ${sourceActive('plugin') ? 'pill-active' : 'pill-default'}`} type="button" onClick={() => toggleSource('plugin')} aria-pressed={sourceActive('plugin')}>Builtin</button>
          <button className={`pill ${statusActive('starred') ? 'pill-active' : 'pill-default'}`} type="button" onClick={() => toggleStatus('starred')} aria-pressed={statusActive('starred')}>已收藏</button>
          <button className={`pill ${statusActive('disabled') ? 'pill-active' : 'pill-default'}`} type="button" onClick={() => toggleStatus('disabled')} aria-pressed={statusActive('disabled')}>已禁用</button>
          <FilterBar />
        </div>
      </div>

      {store.scanIsDemo ? (
        <div className="library-demo-banner" role="status">
          <strong>演示数据</strong>
          <span>当前为显式 demo 模式，列表未代表本机真实 Skill。</span>
        </div>
      ) : null}

      <div className="flex gap-2 mb-4 category-row">
        {categoryPills.map((category) => (
          <CategoryPill
            key={category}
            label={category}
            active={selectedCategory === category || (selectedCategory === '全部' && category === '全部')}
            onClick={() => setSelectedCategory(category)}
          />
        ))}
      </div>

      {stateBanner}

      {store.scanStatus !== 'error' && !totalItems ? (
        <section className="library-state" role="status">
          <h2>未发现 Skill</h2>
          <p>当前扫描范围没有返回可显示的 Skill。</p>
          <div className="library-state-actions">
            <button className="btn btn-primary" type="button" onClick={loadSkills}>重新扫描</button>
            <button className="btn btn-ghost" type="button" onClick={() => ui.enterSub('settings')}>打开设置</button>
          </div>
        </section>
      ) : null}

      <div className="content-grid">
        <div className="skill-grid">
          {visibleSkills.map((skill) => {
            const idx = store.skills.indexOf(skill);
            const active = detailSkill?.path === skill.path;
            return (
              <SkillCard
                key={skill.path || skill.name}
                skill={skill}
                active={active}
                onClick={() => selectSkill(idx)}
                onOpen={() => openSkillDetail(idx, skill)}
              />
            );
          })}
        </div>
        {detailSkill ? (
          <DetailPanel
            skill={detailSkill}
            onOpenDetail={(skill) => {
              const idx = store.skills.indexOf(skill);
              openSkillDetail(idx, skill);
            }}
          />
        ) : null}
      </div>

      {totalItems ? (
        <nav className="library-pagination" aria-label="Library pagination">
          <span className="library-page-range">{rangeStart}–{rangeEnd} / {totalItems}</span>
          <span className="library-page-total">第 {currentPage} / {totalPages} 页</span>
          <div className="library-page-buttons">
            <button type="button" className="btn btn-text btn-sm" aria-label="首页" disabled={currentPage === 1} onClick={() => changePage(1)}>首页</button>
            <button type="button" className="btn btn-text btn-sm" aria-label="上一页" disabled={currentPage === 1} onClick={() => changePage(currentPage - 1)}>上一页</button>
            {pageNumbers.map((page) => (
              <button
                key={page}
                type="button"
                className={`btn btn-text btn-sm ${page === currentPage ? 'library-page-active' : ''}`}
                aria-label={`第 ${page} 页`}
                aria-current={page === currentPage ? 'page' : undefined}
                onClick={() => changePage(page)}
              >
                {page}
              </button>
            ))}
            <button type="button" className="btn btn-text btn-sm" aria-label="下一页" disabled={currentPage === totalPages} onClick={() => changePage(currentPage + 1)}>下一页</button>
            <button type="button" className="btn btn-text btn-sm" aria-label="末页" disabled={currentPage === totalPages} onClick={() => changePage(totalPages)}>末页</button>
          </div>
        </nav>
      ) : null}
    </>
  );
}
