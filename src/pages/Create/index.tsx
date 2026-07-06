// 新建页 — 复用编辑器三栏，空内容 + 校验 + 创建按钮
import { useState } from 'react';
import { useUIStore } from '../../store/uiStore';
import { Button } from '../../components/ui';
import { showToast } from '../../components/Toast';
import '../Editor/Editor.css';

export default function CreatePage() {
  const ui = useUIStore();
  const [name, setName] = useState('my-awesome-skill');
  const [desc, setDesc] = useState('');
  const [md, setMd] = useState('# My Awesome Skill\n\nDescribe what this skill does.\n\n## When To Use\n\nDescribe scenarios.\n\n## Steps\n\n1. First step\n\n## Safety\n\nDescribe safety.');
  return (
    <div className="ed-main">
      <aside className="ed-rail">
        <div className="ed-rail-section"><div className="ed-rail-label">校验</div>
          <div className="ed-val-item ok" style={{padding:'4px 8px'}}>✓ 名称可用</div>
          <div className="ed-val-item ok" style={{padding:'4px 8px'}}>✓ 目录可创建</div>
          <div className="ed-val-item warn" style={{padding:'4px 8px'}}>⚠ 描述为空</div>
        </div>
      </aside>
      <div className="ed-center">
        <div className="ed-fm"><div className="ed-fm-header">▾ Frontmatter</div>
          <div className="ed-fm-body">
            <div className="ed-fm-field"><div className="ed-fm-label">名称 <span style={{color:'var(--success)'}}>✓ 可用</span></div><input className="ed-input" value={name} onChange={e=>setName(e.target.value)} /></div>
            <div className="ed-fm-field"><div className="ed-fm-label">分类</div><select className="ed-input"><option>未分类</option><option>金融</option></select></div>
            <div className="ed-fm-field full"><div className="ed-fm-label">描述</div><input className="ed-input" value={desc} onChange={e=>setDesc(e.target.value)} placeholder="简要描述功能" /></div>
            <div className="ed-fm-field full"><div className="ed-fm-label">目标目录</div><input className="ed-input" style={{fontFamily:'ui-monospace,monospace',fontSize:10}} value={`~/.codex/skills/${name}/`} readOnly /></div>
          </div>
        </div>
        <textarea className="ed-textarea" value={md} onChange={e=>setMd(e.target.value)} spellCheck={false} />
        <div className="ed-statusbar"><span>⌘+Enter 创建</span><span style={{marginLeft:'auto'}}>{new Blob([md]).size} B</span></div>
      </div>
      <div className="ed-preview">
        <div className="ed-preview-title">{name}</div>
        <div className="ed-preview-desc">{desc || '暂无描述'}</div>
        <div className="ed-preview-h2">When To Use</div><div className="ed-preview-p">Describe scenarios.</div>
        <div className="ed-preview-h2">Steps</div><div className="ed-preview-p">1. First step</div>
        <div style={{marginTop:20}}><Button variant="primary" onClick={()=>{showToast('Skill 已创建','');ui.exitSub();}}>创建 Skill</Button></div>
      </div>
    </div>
  );
}
