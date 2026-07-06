import { useUIStore } from '../../store/uiStore';
import { useSkillStore } from '../../store/skillStore';
import { Button } from '../../components/ui';
import './Dashboard.css';

export default function DashboardPage() {
  const ui = useUIStore();
  const skillStore = useSkillStore();
  const skills = skillStore.skills;
  const editable = skills.filter(skill => !skill.protected && skill.source === 'mine').length;
  const favorites = skills.filter(skill => skill.starred).length;
  const attention = skills.filter(skill => skill.disabled || !skill.description || skill.description === '(无描述)').length;
  const recent = [...skills].sort((a, b) => String(b.modifiedAt).localeCompare(String(a.modifiedAt))).slice(0, 4);
  const openLibrary = (filter?: () => void) => {
    skillStore.clearFilters('status');
    skillStore.clearFilters('source');
    filter?.();
    ui.setMainView('library');
  };

  return (
    <div className="dash-main">
      <div className="dash-header">
        <div><div className="dash-title">仪表板</div><div className="dash-sub">{skills.length} 个 Skill · 来自当前扫描结果</div></div>
        <Button variant="secondary" size="sm"><span className="material-symbols-outlined sp-btn-icon" aria-hidden="true">refresh</span>重新扫描</Button>
      </div>
      <div className="dash-metrics">
        <div className="dash-metric" onClick={() => openLibrary()}><div className="dm-label">全部 Skill</div><div className="dm-val">{skills.length}</div><div className="dm-trend">当前库总量</div></div>
        <div className="dash-metric" onClick={() => openLibrary(() => skillStore.toggleFilter('source', 'mine'))}><div className="dm-label">可编辑</div><div className="dm-val">{editable}</div><div className="dm-trend" style={{color:'var(--accent)'}}>{skills.length ? Math.round((editable / skills.length) * 100) : 0}%</div></div>
        <div className="dash-metric" onClick={() => openLibrary(() => skillStore.toggleFilter('status', 'starred'))}><div className="dm-label">已收藏</div><div className="dm-val">{favorites}</div><div className="dm-trend" style={{color:'var(--text-muted)'}}>{skills.find(skill => skill.starred)?.name || '暂无收藏'}</div></div>
        <div className="dash-metric warn" onClick={() => openLibrary(() => skillStore.toggleFilter('status', 'attention'))}><div className="dm-label">需关注</div><div className="dm-val">{attention}</div><div className="dm-trend">禁用或缺描述</div></div>
      </div>
      <div className="dash-grid">
        <div className="dash-panel">
          <div className="dp-title">最近修改 <span className="dp-note">按修改时间·非使用记录</span></div>
          {recent.length ? recent.map(skill => (
            <div key={skill.path || skill.name} className="dash-recent"><div className="dr-av">{skill.name.slice(0, 2).toUpperCase()}</div><div className="dr-name">{skill.name}</div><div className="dr-time">{skill.modifiedAt}</div></div>
          )) : <div className="ds-detail">暂无扫描结果</div>}
        </div>
        <div className="dash-panel">
          <div className="dp-title">待处理 <span className="dp-note">规则可在设置调整</span></div>
          <div className="dash-suggest warn"><div className="ds-text"><div className="ds-title">{attention} 个 Skill 需关注</div><div className="ds-detail">禁用、缺描述或解析异常</div></div><button className="ds-btn" onClick={() => openLibrary()}>查看</button></div>
          <div className="dash-suggest ok"><div className="ds-text"><div className="ds-title">当前可编辑 {editable} 个 Skill</div><div className="ds-detail">插件和系统来源已保护</div></div><button className="ds-btn" onClick={() => openLibrary(() => skillStore.toggleFilter('source', 'mine'))}>查看</button></div>
          <div style={{marginTop:12}}><Button variant="secondary" size="sm" onClick={()=>ui.enterSub('logs')}><span className="material-symbols-outlined sp-btn-icon" aria-hidden="true">receipt_long</span>调用日志</Button></div>
        </div>
      </div>
    </div>
  );
}
