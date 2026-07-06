// 设置页 — wt-5-infra 职责：主题/扫描/待关注规则/AI配置/更多功能
import { useState } from 'react';
import { Button, Toggle, Segment } from '../../components/ui';
import { useSettingsStore, type Theme, type AIVendor } from '../../store/settingsStore';
import { setAIKey } from '../../lib/ai';
import './Settings.css';

export default function SettingsPage() {
  const s = useSettingsStore();
  const [apiKey, setApiKey] = useState('');
  const [savingKey, setSavingKey] = useState(false);
  const [keyError, setKeyError] = useState('');
  const [keyStatus, setKeyStatus] = useState(s.aiKeyStored ? '已存储' : '未配置');
  const saveKey = async () => {
    if (!apiKey.trim() || savingKey) return;
    setSavingKey(true);
    setKeyError('');
    try {
      await setAIKey(s.aiVendor, apiKey.trim());
      s.setAIKeyStored(true);
      setApiKey('');
      setKeyStatus('已存储');
    } catch (err) {
      setKeyError(String(err));
      setKeyStatus('保存失败');
    } finally {
      setSavingKey(false);
    }
  };

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
          <div className="set-row"><span className="set-label">导入 Skill</span><Button variant="secondary" size="sm"><span className="material-symbols-outlined sp-btn-icon" aria-hidden="true">upload_file</span>从文件导入</Button></div>
          <div className="set-row"><span className="set-label">导出全部</span><Button variant="secondary" size="sm"><span className="material-symbols-outlined sp-btn-icon" aria-hidden="true">download</span>导出</Button></div>
        </div>
        <div className="set-section set-section-ai">
          <div className="set-section-label">AI 助手配置</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:6,marginBottom:10}}>
            {([['glm','智谱 GLM'],['openai','OpenAI'],['claude','Claude'],['ollama','Ollama 本地']] as [AIVendor,string][]).map(([v,n])=>(
              <div key={v} className={`set-vendor ${s.aiVendor===v?'active':''}`} onClick={()=>s.setAIVendor(v)}><div className="sv-name">{n}</div></div>
            ))}
          </div>
          <div className="set-row ai-key-row">
            <div><div className="set-label">API Key</div><div className="set-desc">存储于系统 Keychain · {keyStatus}</div></div>
            <div className="set-key-controls">
              <input className="set-key-input" type="password" value={apiKey} onChange={e=>setApiKey(e.target.value)} placeholder={s.aiKeyStored ? '输入新 Key 替换' : '输入 API Key'} />
              <Button variant="secondary" size="sm" disabled={!apiKey.trim() || savingKey} onClick={saveKey}>{savingKey ? '保存中' : '保存'}</Button>
            </div>
          </div>
          {keyError && <div className="set-error">Key 保存失败：{keyError}</div>}
          <div className="set-row"><span className="set-label">脱敏发送</span><Toggle on={s.aiDesensitize} onClick={()=>s.setAIDesensitize(!s.aiDesensitize)} /></div>
          <div className="set-row"><span className="set-label">diff 确认后写入</span><Toggle on={s.aiDiffConfirm} onClick={()=>s.setAIDiffConfirm(!s.aiDiffConfirm)} /></div>
          <div className="set-row"><span className="set-label">月预算</span><span style={{fontSize:11}}>¥<input className="set-budget" value={s.aiMonthlyBudget} onChange={e=>s.setAIBudget(+e.target.value)} /></span></div>
          <div className="set-row"><span className="set-label">本月已用</span><span style={{fontSize:11,color:'var(--warning)'}}>¥{s.aiMonthlyUsed} / ¥{s.aiMonthlyBudget}</span></div>
        </div>
      </div>
    </div>
  );
}
