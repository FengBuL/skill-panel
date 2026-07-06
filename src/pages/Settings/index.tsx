// 设置页 — wt-5-infra 职责：主题/扫描/待关注规则/AI配置/更多功能
import { useState } from 'react';
import { Button, Toggle, Segment } from '../../components/ui';
import { useSettingsStore, type Theme, type AIVendor } from '../../store/settingsStore';
import './Settings.css';

export default function SettingsPage() {
  const s = useSettingsStore();
  const [showAI, setShowAI] = useState(false);
  return (
    <div className="set-drawer">
      <div className="set-header"><span style={{fontSize:16,fontWeight:600}}>设置</span></div>
      <div className="set-body">
        <div className="set-section">
          <div className="set-section-label">通用</div>
          <div className="set-row"><span className="set-label">主题</span>
            <Segment<Theme> items={[{value:'light',label:'亮'},{value:'dark',label:'暗'},{value:'auto',label:'自动'}]} value={s.theme} onChange={v=>s.setTheme(v)} />
          </div>
          <div className="set-row"><span className="set-label">启动时自动扫描</span><Toggle on={s.autoScan} onClick={()=>s.setAutoScan(!s.autoScan)} /></div>
          <div className="set-row"><div><div className="set-label">文件监听自动重扫</div><div className="set-desc">文件变化时自动重新扫描</div></div><Toggle on={s.watchFiles} onClick={()=>s.setWatchFiles(!s.watchFiles)} /></div>
        </div>
        <div className="set-section">
          <div className="set-section-label">待关注规则 <span style={{fontWeight:400,textTransform:'none'}}>可自定义</span></div>
          {s.attentionRules.map(r => (
            <div key={r.id} className="set-row">
              <Toggle on={r.enabled} onClick={()=>s.toggleRule(r.id)} />
              <span style={{flex:1,fontSize:11}}>{r.id==='daysUnused'?`超过 ${r.threshold} 天未修改`:r.id==='missingDesc'?'缺少描述':r.id==='missingWhen'?'没有 When To Use':`Markdown 少于 ${r.threshold} 行`}</span>
            </div>
          ))}
        </div>
        <div className="set-section">
          <div className="set-section-label">数据</div>
          <div className="set-row"><span className="set-label">导入 Skill</span><Button variant="secondary" size="sm">📥 从文件导入</Button></div>
          <div className="set-row"><span className="set-label">导出全部</span><Button variant="secondary" size="sm">📤 导出</Button></div>
        </div>
        <div className="set-section" style={{background:'linear-gradient(180deg,var(--ai-soft) 0%,transparent 100%)'}}>
          <div className="set-section-label" style={{color:'var(--ai-text)'}}>✨ AI 助手配置</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:6,marginBottom:10}}>
            {([['glm','智谱 GLM'],['openai','OpenAI'],['claude','Claude'],['ollama','Ollama 本地']] as [AIVendor,string][]).map(([v,n])=>(
              <div key={v} className={`set-vendor ${s.aiVendor===v?'active':''}`} onClick={()=>s.setAIVendor(v)}><div className="sv-name">{n}</div></div>
            ))}
          </div>
          <div className="set-row"><div><div className="set-label">API Key</div><div className="set-desc">存储于系统 Keychain</div></div><Button variant="secondary" size="sm">🔑 已存储·更换</Button></div>
          <div className="set-row"><span className="set-label">脱敏发送</span><Toggle on={s.aiDesensitize} onClick={()=>s.setAIDesensitize(!s.aiDesensitize)} /></div>
          <div className="set-row"><span className="set-label">diff 确认后写入</span><Toggle on={s.aiDiffConfirm} onClick={()=>s.setAIDiffConfirm(!s.aiDiffConfirm)} /></div>
          <div className="set-row"><span className="set-label">月预算</span><span style={{fontSize:11}}>¥<input className="set-budget" value={s.aiMonthlyBudget} onChange={e=>s.setAIBudget(+e.target.value)} /></span></div>
          <div className="set-row"><span className="set-label">本月已用</span><span style={{fontSize:11,color:'var(--warning)'}}>¥{s.aiMonthlyUsed} / ¥{s.aiMonthlyBudget}</span></div>
        </div>
      </div>
    </div>
  );
}
