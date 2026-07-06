// 新建页 — 复用编辑器三栏，空内容 + 校验 + 创建按钮
import { useState } from 'react';
import { useUIStore } from '../../store/uiStore';
import { useSkillStore } from '../../store/skillStore';
import { Button } from '../../components/ui';
import { showToast } from '../../components/Toast';
import { createSkill } from '../../lib/skills';
import { mapSummary } from '../../lib/invoke';
import '../Editor/Editor.css';

export default function CreatePage() {
  const ui = useUIStore();
  const skillStore = useSkillStore();
  const [name, setName] = useState('my-awesome-skill');
  const [desc, setDesc] = useState('');
  const [targetDir, setTargetDir] = useState('~/.codex/skills');
  const [md, setMd] = useState('# My Awesome Skill\n\nDescribe what this skill does.\n\n## When To Use\n\nDescribe scenarios.\n\n## Steps\n\n1. First step\n\n## Safety\n\nDescribe safety.');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const canCreate = name.trim().length > 0 && targetDir.trim().length > 0;

  const submit = async () => {
    if (!canCreate || saving) {
      setError('名称和目标目录不能为空');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const created = await createSkill({
        name: name.trim(),
        description: desc.trim(),
        source: 'codex-user',
        targetDirectory: targetDir.trim(),
        markdown: md,
      });
      skillStore.setSkills([...skillStore.skills, mapSummary(created)]);
      showToast('Skill 已创建', '');
      ui.exitSub();
    } catch (err) {
      setError(String(err));
      showToast('创建失败', '');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="ed-main">
      <aside className="ed-rail">
        <div className="ed-rail-section"><div className="ed-rail-label">校验</div>
          <div className={`ed-val-item ${name.trim() ? 'ok' : 'fail'}`} style={{padding:'4px 8px'}}>{name.trim() ? '✓' : '✗'} 名称可用</div>
          <div className={`ed-val-item ${targetDir.trim() ? 'ok' : 'fail'}`} style={{padding:'4px 8px'}}>{targetDir.trim() ? '✓' : '✗'} 目录可创建</div>
          <div className={`ed-val-item ${desc.trim() ? 'ok' : 'warn'}`} style={{padding:'4px 8px'}}>{desc.trim() ? '✓' : '⚠'} 描述{desc.trim() ? '已填写' : '为空'}</div>
          {error && <div className="ed-val-item fail" style={{padding:'4px 8px'}}>{error}</div>}
        </div>
      </aside>
      <div className="ed-center">
        <div className="ed-fm"><div className="ed-fm-header">▾ Frontmatter</div>
          <div className="ed-fm-body">
            <div className="ed-fm-field"><div className="ed-fm-label">名称 <span style={{color:'var(--success)'}}>✓ 可用</span></div><input className="ed-input" value={name} onChange={e=>setName(e.target.value)} /></div>
            <div className="ed-fm-field"><div className="ed-fm-label">分类</div><select className="ed-input"><option>未分类</option><option>金融</option></select></div>
            <div className="ed-fm-field full"><div className="ed-fm-label">描述</div><input className="ed-input" value={desc} onChange={e=>setDesc(e.target.value)} placeholder="简要描述功能" /></div>
            <div className="ed-fm-field full"><div className="ed-fm-label">目标目录</div><input className="ed-input" style={{fontFamily:'ui-monospace,monospace',fontSize:10}} value={targetDir} onChange={e=>setTargetDir(e.target.value)} /></div>
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
        <div style={{marginTop:20}}><Button variant="primary" disabled={!canCreate || saving} onClick={submit}>{saving ? '创建中...' : '创建 Skill'}</Button></div>
      </div>
    </div>
  );
}
