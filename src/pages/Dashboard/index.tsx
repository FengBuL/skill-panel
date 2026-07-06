import { useUIStore } from '../../store/uiStore';
import { Button } from '../../components/ui';
import './Dashboard.css';

export default function DashboardPage() {
  const ui = useUIStore();
  return (
    <div className="dash-main">
      <div className="dash-header">
        <div><div className="dash-title">仪表板</div><div className="dash-sub">10 个 Skill · 上次扫描 2 分钟前</div></div>
        <Button variant="secondary" size="sm">🔄 重新扫描</Button>
      </div>
      <div className="dash-metrics">
        <div className="dash-metric" onClick={() => ui.setMainView('library')}><div className="dm-label">全部 Skill</div><div className="dm-val">10</div><div className="dm-trend">↑ +2 较上周</div></div>
        <div className="dash-metric" onClick={() => ui.setMainView('library')}><div className="dm-label">可编辑</div><div className="dm-val">8</div><div className="dm-trend" style={{color:'var(--accent)'}}>80%</div></div>
        <div className="dash-metric" onClick={() => ui.setMainView('library')}><div className="dm-label">已收藏</div><div className="dm-val">2</div><div className="dm-trend" style={{color:'var(--text-muted)'}}>Browser Control 等</div></div>
        <div className="dash-metric warn" onClick={() => ui.setMainView('library')}><div className="dm-label">⚠ 需关注</div><div className="dm-val">3</div><div className="dm-trend">2 低频 · 1 缺描述 →</div></div>
      </div>
      <div className="dash-grid">
        <div className="dash-panel">
          <div className="dp-title">最近修改 <span className="dp-note">按修改时间·非使用记录</span></div>
          {[['BC','Browser Control','2小时前'],['CI','Claude-to-IM Bridge','1天前'],['AD','A-Share Daily Update','2天前'],['YC','Youtube Clipper','3天前']].map(([av,n,t])=>(
            <div key={n} className="dash-recent"><div className="dr-av">{av}</div><div className="dr-name">{n}</div><div className="dr-time">{t}</div></div>
          ))}
        </div>
        <div className="dash-panel">
          <div className="dp-title">待处理 <span className="dp-note">规则可在设置调整</span></div>
          <div className="dash-suggest warn"><div className="ds-text"><div className="ds-title">2 个 Skill 超过 60 天未修改</div><div className="ds-detail">Serenity Stock · Lark Bot</div></div><button className="ds-btn">查看</button></div>
          <div className="dash-suggest warn"><div className="ds-text"><div className="ds-title">1 个 Skill 缺少描述</div><div className="ds-detail">Serenity Stock Analysis</div></div><button className="ds-btn">补充</button></div>
          <div className="dash-suggest ok"><div className="ds-text"><div className="ds-title">最近新增 2 个 Skill</div><div className="ds-detail">Doc Illustrator · Youtube Clipper</div></div><button className="ds-btn">查看</button></div>
          <div style={{marginTop:12}}><Button variant="secondary" size="sm" onClick={()=>ui.enterSub('logs')}>📋 调用日志</Button></div>
        </div>
      </div>
    </div>
  );
}
