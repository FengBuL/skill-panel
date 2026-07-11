import { useEffect, useState } from 'react';
import { CategoryPill } from '../../components/CategoryPill';
import { FilterBar } from '../../components/FilterBar';
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
  const [selectedCategory, setSelectedCategory] = useState('全部');

  useEffect(() => {
    scanSkills().then((result) => {
      store.setSkills(result.skills);
    });
  }, []);

  const baseSkills = store.filtered.length || store.search || store.filters.source.length || store.filters.status.length
    ? store.filtered
    : store.skills;
  const visibleSkills = baseSkills
    .filter((skill) => categoryMatches(skill.category, selectedCategory))
    .slice(0, 6);
  const detailSkill = store.drawerIdx >= 0 ? store.skills[store.drawerIdx] : visibleSkills[0] || store.skills[0] || null;
  const openDetail = (idx: number, name: string) => {
    store.openDrawer(idx >= 0 ? idx : 0);
    ui.enterSub('detail', name);
  };

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Manage your Skills</h1>
        <p className="page-subtitle">整理、查看、维护本地 Skill，让常用工具触手可及</p>
      </div>

      <div className="flex justify-between items-center mb-4 gap-4 library-toolbar">
        <SearchBar value={store.search} onChange={store.setSearch} />
        <FilterBar />
      </div>

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

      <div className="content-grid">
        <div className="skill-grid">
          {visibleSkills.map((skill) => {
            const idx = store.skills.indexOf(skill);
            const active = detailSkill?.name === skill.name;
            return (
              <SkillCard
                key={skill.path || skill.name}
                skill={skill}
                active={active}
                onClick={() => openDetail(idx, skill.path || skill.name)}
              />
            );
          })}
        </div>
        <DetailPanel skill={detailSkill} />
      </div>
    </>
  );
}
