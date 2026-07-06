// 编辑器/新建/预览 共用三栏布局 — wt-2-editor 职责
import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useUIStore } from '../../store/uiStore';
import { useSkillStore } from '../../store/skillStore';
import { Button } from '../../components/ui';
import { showToast } from '../../components/Toast';
import { readSkill, validateSkill } from '../../lib/invoke';
import { safeListen } from '../../lib/tauriEvents';
import './Editor.css';

export default function EditorPage() {
  const ui = useUIStore();
  const skillStore = useSkillStore();
  const [title, setTitle] = useState(ui.subParam || 'Browser Control');
  const [desc, setDesc] = useState('Open, navigate, inspect, test web targets.');
  const [md, setMd] = useState('# Browser Control\n\nOpen, navigate, inspect, test web targets.\n\n## When To Use\n\nUse when user asks to open a URL.\n\n## Commands\n\n- `open_url` — Navigate\n- `screenshot` — Capture\n\n## Safety\n\nOnly operate on localhost.');
  const [dirty, setDirty] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [showValidate, setShowValidate] = useState(false);
  const [validateResult, setValidateResult] = useState<{ score: number; checks: { id: string; label: string; status: string; detail?: string }[] } | null>(null);
  const [aiStream, setAiStream] = useState('');

  // AI 调用：invoke('ai_optimize') + 监听 ai-chunk 事件流式显示
  const callAI = async (action: string) => {
    setAiStream('');
    const unlisten = await safeListen<{ chunk: string; done: boolean }>('ai-chunk', (e) => {
      if (e.payload.done) {
        setTimeout(() => { showToast('AI 生成完成，请确认 diff', '查看'); }, 200);
        unlisten();
      } else {
        setAiStream(prev => prev + e.payload.chunk);
      }
    });
    try {
      await invoke('ai_optimize', { content: md, action, vendor: 'glm' });
    } catch (err) {
      setAiStream('调用失败: ' + String(err) + '（需先在设置配置 API Key）');
      unlisten();
    }
  };

  // 真实加载 Skill 内容
  useEffect(() => {
    if (!ui.subParam) return;
    const skill = skillStore.skills.find(s => s.name === ui.subParam);
    if (skill && skill.path) {
      readSkill(skill.path).then(r => {
        if (r) {
          if (r.markdown) setMd(r.markdown);
          if (r.frontmatter.description) setDesc(String(r.frontmatter.description));
          setTitle(ui.subParam || title);
        }
      });
    }
  }, [ui.subParam]);

  const markDirty = () => setDirty(true);
  const save = () => { setDirty(false); showToast('已保存', ''); };

  return (
    <div className="ed-main">
      {/* 左栏：文件 + 草稿 */}
      <aside className="ed-rail">
        <div className="ed-rail-section"><div className="ed-rail-label">文件</div>
          <div className="ed-file active"><span className="material-symbols-outlined ed-file-icon" aria-hidden="true">description</span>SKILL.md</div>
          <div className="ed-file"><span className="material-symbols-outlined ed-file-icon" aria-hidden="true">code</span>helper.py</div>
          <div className="ed-file"><span className="material-symbols-outlined ed-file-icon" aria-hidden="true">settings</span>config.json</div>
          <div className="ed-file add"><span className="material-symbols-outlined ed-file-icon" aria-hidden="true">add</span>添加文件</div>
        </div>
        <div className="ed-rail-section"><div className="ed-rail-label">最近编辑</div>
          <div className="ed-draft">A-Share Update<div className="ed-draft-meta">3天前</div></div>
          <div className="ed-draft">Claude-to-IM<div className="ed-draft-meta">昨天</div></div>
        </div>
      </aside>

      {/* 中栏：Frontmatter + 编辑 */}
      <div className="ed-center">
        {showValidate && (
          <div className="ed-validate">
            {validateResult ? (
              <>
                <div className="ed-val-score"><div className={`ed-score-ring ${validateResult.score >= 80 ? 'good' : 'warn'}`} style={validateResult.score >= 80 ? { background: 'var(--success-soft)', color: 'var(--success)' } : {}}>{validateResult.score}</div><div><div style={{fontSize:12,fontWeight:600}}>质量评分 {validateResult.score}/100</div><div style={{fontSize:10,color:'var(--text-faint)'}}>{validateResult.checks.filter(c=>c.status==='ok').length} 通过 · {validateResult.checks.filter(c=>c.status==='warn').length} 警告 · {validateResult.checks.filter(c=>c.status==='fail').length} 缺失</div></div></div>
                {validateResult.checks.map(c => (
                  <div key={c.id} className={`ed-val-item ${c.status}`}>
                    <span className="material-symbols-outlined ed-val-icon" aria-hidden="true">{c.status === 'ok' ? 'check_circle' : c.status === 'warn' ? 'warning' : 'cancel'}</span>
                    {c.label}{c.detail ? `（${c.detail}）` : ''}
                  </div>
                ))}
              </>
            ) : <div style={{fontSize:11,color:'var(--text-muted)'}}>校验中...</div>}
          </div>
        )}
        <div className="ed-fm">
          <div className="ed-fm-header"><span className="material-symbols-outlined ed-inline-icon" aria-hidden="true">expand_more</span>Frontmatter</div>
          <div className="ed-fm-body">
            <div className="ed-fm-field"><div className="ed-fm-label">名称</div><input className="ed-input" value={title} onChange={e=>{setTitle(e.target.value);markDirty();}} /></div>
            <div className="ed-fm-field"><div className="ed-fm-label">分类</div><select className="ed-input"><option>浏览器</option><option>金融</option></select></div>
            <div className="ed-fm-field full"><div className="ed-fm-label">描述</div><input className="ed-input" value={desc} onChange={e=>{setDesc(e.target.value);markDirty();}} /></div>
          </div>
        </div>
        <div className="ed-md-toolbar">
          <button className="ed-md-tool" title="加粗">B</button><button className="ed-md-tool" title="斜体">I</button><button className="ed-md-tool" title="代码">&lt;/&gt;</button>
          <button className="ed-md-tool" title="链接"><span className="material-symbols-outlined" aria-hidden="true">link</span></button>
          <button className="ed-md-tool" title="图片"><span className="material-symbols-outlined" aria-hidden="true">image</span></button>
          <div style={{flex:1}} />
          <button className="ed-md-tool" title="校验" onClick={async () => { setShowValidate(true); const skill = skillStore.skills.find(s => s.name === ui.subParam); if (skill?.path) { const r = await validateSkill(skill.path); if (r) setValidateResult(r); } }}>✓ 校验</button>
          <button className="ed-md-tool ed-md-tool-text" onClick={()=>setShowAI(!showAI)} style={{color:'var(--ai-text)'}}><span className="material-symbols-outlined" aria-hidden="true">auto_awesome</span>AI</button>
        </div>
        <textarea className="ed-textarea" value={md} onChange={e=>{setMd(e.target.value);markDirty();}} spellCheck={false} />
        <div className="ed-statusbar"><span>行 {md.split('\n').length} · 列 1</span><span>Markdown</span><span style={{marginLeft:'auto'}}>{new Blob([md]).size} B</span></div>
      </div>

      {/* 右栏：预览 / AI */}
      <div className="ed-preview">
        {showAI ? (
          <div className="ed-ai-rail">
            <div className="ed-ai-title"><span className="material-symbols-outlined ed-inline-icon" aria-hidden="true">auto_awesome</span>AI 助手 <span style={{fontSize:9,color:'var(--text-faint)'}}>GLM-4</span></div>
            <div className="ed-ai-warn"><span className="material-symbols-outlined ed-inline-icon" aria-hidden="true">shield</span>内容将发送至厂商 API（已脱敏）</div>
            <div className="ed-ai-action" onClick={()=>callAI('struct')}><span className="ed-ai-icon material-symbols-outlined" aria-hidden="true">account_tree</span>完善结构</div>
            <div className="ed-ai-action" onClick={()=>callAI('desc')}><span className="ed-ai-icon material-symbols-outlined" aria-hidden="true">notes</span>优化描述</div>
            <div className="ed-ai-action" onClick={()=>callAI('polish')}><span className="ed-ai-icon material-symbols-outlined" aria-hidden="true">auto_fix_high</span>润色正文</div>
            <div className="ed-ai-action" onClick={()=>callAI('fm')}><span className="ed-ai-icon material-symbols-outlined" aria-hidden="true">sell</span>生成 frontmatter</div>
            <div className="ed-ai-action" onClick={()=>callAI('safe')}><span className="ed-ai-icon material-symbols-outlined" aria-hidden="true">policy</span>安全审查</div>
            {aiStream && <div className="ed-ai-stream">{aiStream}<span className="ed-ai-typing" /></div>}
            <div className="ed-ai-cost">本次约 1.2k token · ¥0.003 · 本月 ¥2.4/¥50</div>
          </div>
        ) : (
          <>
            <div className="ed-preview-title">{title}</div>
            <div className="ed-preview-desc">{desc}</div>
            <div className="ed-preview-h2">When To Use</div>
            <div className="ed-preview-p">Use when user asks to open a URL.</div>
            <div className="ed-preview-h2">Commands</div>
            <div className="ed-preview-p">• <code className="ed-code">open_url</code> — Navigate</div>
            <div className="ed-preview-p">• <code className="ed-code">screenshot</code> — Capture</div>
            <div className="ed-preview-h2">Safety</div>
            <div className="ed-preview-p">Only operate on localhost.</div>
          </>
        )}
      </div>
    </div>
  );
}
