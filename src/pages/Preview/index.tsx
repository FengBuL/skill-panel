// 预览页 — 只读三栏：大纲 + 渲染内容
import { useUIStore } from '../../store/uiStore';
import { Button } from '../../components/ui';
import { showToast } from '../../components/Toast';
import '../Editor/Editor.css';

export default function PreviewPage() {
  const ui = useUIStore();
  return (
    <div className="ed-main">
      <aside className="ed-rail">
        <div className="ed-rail-section"><div className="ed-rail-label">大纲</div>
          <div className="ed-file active">A-Share Update</div>
          <div className="ed-file" style={{paddingLeft:20,fontSize:10}}>When To Use</div>
          <div className="ed-file" style={{paddingLeft:20,fontSize:10}}>Required Inputs</div>
          <div className="ed-file" style={{paddingLeft:20,fontSize:10}}>Source Strategy</div>
          <div className="ed-file" style={{paddingLeft:20,fontSize:10}}>Safety</div>
        </div>
        <div className="ed-rail-section"><div className="ed-rail-label">文件信息</div>
          <div style={{padding:'0 8px',fontSize:10,color:'var(--text-muted)',lineHeight:1.9}}>
            <div>📐 12.4 KB</div><div>📝 186 行</div><div>📄 Markdown</div><div>📅 3 天前</div>
          </div>
        </div>
      </aside>
      <div className="ed-center" style={{background:'#fff'}}>
        <div style={{padding:'8px 16px',display:'flex',alignItems:'center',borderBottom:'1px solid var(--border-2)'}}>
          <span style={{fontSize:10,color:'var(--text-faint)',fontWeight:600}}>预览模式</span>
          <div style={{flex:1}} />
          <Button variant="secondary" size="sm" onClick={()=>showToast('已复制路径','')}>📋 复制路径</Button>
        </div>
        <div style={{flex:1,overflow:'auto',padding:'24px 32px',maxWidth:720,margin:'0 auto',width:'100%'}}>
          <div style={{display:'flex',gap:8,fontSize:11,color:'var(--text-muted)',padding:'8px 12px',background:'var(--surface-2)',borderRadius:'var(--radius-md)',marginBottom:16}}>
            <span>我的</span><span style={{color:'var(--border)'}}>·</span><span>3天前</span><span style={{color:'var(--border)'}}>·</span><span style={{color:'var(--success)',fontWeight:500}}>● 已解析</span>
          </div>
          <div className="ed-preview-title" style={{fontSize:22}}>A-Share Daily Update</div>
          <div className="ed-preview-desc" style={{fontSize:13,marginBottom:20}}>Standardizes daily updates for the local stock dataset.</div>
          <div className="ed-preview-h2" style={{fontSize:15}}>When To Use</div>
          <div className="ed-preview-p" style={{fontSize:12}}>Update all A-share CSV files to a target trading date.</div>
          <div className="ed-preview-h2" style={{fontSize:15}}>Required Inputs</div>
          <div className="ed-preview-p" style={{fontSize:12}}>• Dataset dir: <code className="ed-code">D:\Quant\MarketData</code></div>
          <div className="ed-preview-h2" style={{fontSize:15}}>Safety</div>
          <div className="ed-preview-p" style={{fontSize:12}}>Always backup before overwriting.</div>
        </div>
        <div style={{padding:'10px 16px',borderTop:'1px solid var(--border-2)',display:'flex',gap:8}}>
          <Button variant="primary" size="sm" onClick={()=>ui.enterSub('editor','A-Share Daily Update')}>✏️ 编辑</Button>
          <Button variant="secondary" size="sm">📂 目录</Button>
        </div>
      </div>
    </div>
  );
}
