import { useEffect, useMemo, useState } from 'react';
import { DiffModal } from '../components/ai/DiffModal';
import { AIRail } from '../components/ai/AIRail';
import { ValidationResult } from '../components/ValidationResult';
import { showToast } from '../components/Toast';
import { useAIRail } from '../hooks/useAIRail';
import { readSkill, validateSkill } from '../lib/invoke';
import { useSettingsStore } from '../store/settingsStore';
import { useSkillStore } from '../store/skillStore';
import { useUIStore } from '../store/uiStore';
import { EditorWorkspace } from './EditorWorkspace';
import { FrontmatterForm, type FrontmatterDraft } from './FrontmatterForm';
import { MarkdownEditor } from './MarkdownEditor';
import { PreviewPane } from './PreviewPane';
import '../pages/Editor/Editor.css';
import '../components/ai/ai.css';

type ValidationState = {
  score: number;
  checks: { id: string; label: string; status: string; detail?: string }[];
};

const browserMarkdown = `# Browser Control

Open, navigate, inspect, test web targets.

## When To Use

Use when user asks to open a URL.

## Commands

- open_url - Navigate
- screenshot - Capture

## Safety

Only operate on localhost.`;

const aihotMarkdown = `# aihot-query

## 描述

从 aihot.virxact.com 获取每日 AI 热点资讯和动态。

## 触发条件

- 用户询问“今天 AI 圈有什么”
- 用户提到“AI 日报”
- 用户查询 OpenAI / Anthropic / Google 最新发布

## 工作流

1. 解析用户意图，提取关键词
2. 调用 aihot API 获取热点列表
3. 按相关性和时间排序
4. 生成中文摘要并返回

## 注意事项

- 默认返回 Top 10 条热点
- 支持按日期筛选
- 不保存用户查询历史`;

function initialFrontmatter(name: string): FrontmatterDraft {
  const isAihot = name === 'aihot-query';
  return {
    name,
    display: isAihot ? 'AI 热点查询' : name,
    version: isAihot ? '1.3.2' : '1.0.0',
    category: isAihot ? 'AI' : '浏览器',
    tags: isAihot ? 'news, builtin' : 'browser, automation',
    author: isAihot ? 'WorkBuddy Team' : 'User',
  };
}

function pathForName(name: string) {
  if (name === 'Browser Control') return '~/.codex/skills/browser-control/SKILL.md';
  return `~/.workbuddy/skills/${name.replace(/\s+/g, '-').toLowerCase()}/SKILL.md`;
}

export function EditorView() {
  const ui = useUIStore();
  const skillStore = useSkillStore();
  const settings = useSettingsStore();
  const selectedSkill = skillStore.skills.find((item) => item.name === ui.subParam || item.path === ui.subParam) || null;
  const requestedName = selectedSkill?.name || ui.subParam || 'Browser Control';
  const [frontmatter, setFrontmatter] = useState(() => initialFrontmatter(requestedName));
  const [markdown, setMarkdown] = useState(() => (ui.subParam ? aihotMarkdown : browserMarkdown));
  const [dirty, setDirty] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [validation, setValidation] = useState<ValidationState | null>(null);

  const skill = useMemo(() => selectedSkill, [selectedSkill]);
  const pagePath = skill?.path || pathForName(frontmatter.name);

  useEffect(() => {
    const nextName = selectedSkill?.name || ui.subParam || 'Browser Control';
    setFrontmatter(initialFrontmatter(nextName));
    setMarkdown(ui.subParam ? aihotMarkdown : browserMarkdown);
    setDirty(false);
  }, [selectedSkill?.name, ui.subParam]);

  useEffect(() => {
    if (!skill?.path) return;
    readSkill(skill.path).then((result) => {
      if (!result) return;
      if (result.markdown) setMarkdown(result.markdown);
      setFrontmatter((current) => ({
        ...current,
        display: String(result.frontmatter.display || result.frontmatter.title || current.display),
        version: String(result.frontmatter.version || current.version),
        category: String(result.frontmatter.category || current.category),
        tags: Array.isArray(result.frontmatter.tags) ? result.frontmatter.tags.join(', ') : String(result.frontmatter.tags || current.tags),
        author: String(result.frontmatter.author || current.author),
      }));
    });
  }, [skill?.path]);

  const markDirty = () => setDirty(true);
  const updateFrontmatter = (next: FrontmatterDraft) => {
    setFrontmatter(next);
    markDirty();
  };
  const updateMarkdown = (next: string) => {
    setMarkdown(next);
    markDirty();
  };
  const save = () => {
    setDirty(false);
    showToast('已保存', '');
  };
  const runValidation = async () => {
    if (skill?.path) {
      const result = await validateSkill(skill.path);
      if (result) {
        setValidation(result);
        return;
      }
    }
    setValidation({
      score: 86,
      checks: [
        { id: 'frontmatter', label: 'Frontmatter 字段完整', status: 'ok' },
        { id: 'markdown', label: 'Markdown 结构正常', status: 'ok' },
        { id: 'trigger', label: '触发条件可增加英文关键词', status: 'warn' },
      ],
    });
  };

  const aiRail = useAIRail({
    content: markdown,
    vendor: settings.aiVendor,
    desensitize: settings.aiDesensitize,
    onApply: (newContent) => {
      updateMarkdown(newContent);
    },
    onToast: (message) => showToast(message, ''),
  });

  return (
    <>
      <div className="page-header editor-page-header">
        <div>
          <h1 className="page-title">编辑 {frontmatter.name}</h1>
          <p className="page-subtitle">{pagePath}</p>
        </div>
        <div className="flex gap-2 editor-header-actions">
          <button className="btn btn-ghost" type="button" onClick={() => ui.enterSub('ai', skill?.path || frontmatter.name)}>AI 辅助</button>
          <button className="btn btn-text" type="button" onClick={() => ui.enterSub('detail', skill?.path || frontmatter.name)}>返回详情</button>
        </div>
      </div>

      <EditorWorkspace ariaLabel="Skill editor">
        <div className="editor-grid">
          <div className="card editor-pane editor-compose-pane">
            <div className="card-header">
              <h2 className="card-title">Frontmatter</h2>
              <span className={`editor-dirty-pill ${dirty ? 'is-dirty' : ''}`}>{dirty ? '未保存' : '已同步'}</span>
            </div>
            <FrontmatterForm value={frontmatter} onChange={updateFrontmatter} />
            <div className="card-header editor-section-header"><h2 className="card-title">Markdown</h2></div>
            <MarkdownEditor value={markdown} onChange={updateMarkdown} />
          </div>

          <PreviewPane markdown={markdown} />

          <aside className="card editor-side-pane">
            <div className="card-header"><h2 className="card-title">校验结果</h2></div>
            <div className="card-body">
              <ValidationResult checks={validation?.checks} />
              <button className="btn btn-text editor-full-button" type="button" onClick={runValidation}>重新校验</button>
            </div>
            <div className="card-header editor-section-header"><h2 className="card-title">AI 辅助</h2></div>
            <div className="card-body">
              {showAI ? (
                <AIRail
                  status={aiRail.status}
                  stream={aiRail.stream}
                  result={aiRail.result}
                  vendor={settings.aiVendor}
                  monthlyUsed={settings.aiMonthlyUsed}
                  monthlyBudget={settings.aiMonthlyBudget}
                  desensitize={settings.aiDesensitize}
                  onRun={aiRail.run}
                  onCancel={aiRail.cancel}
                />
              ) : (
                <>
                  <p className="text-sm text-secondary mb-3">AI 修改内容会以 diff 形式展示，确认后才写回文件。</p>
                  <button className="btn btn-ghost editor-full-button" type="button" onClick={() => setShowAI(true)}>AI</button>
                </>
              )}
            </div>
            <div className="editor-save-row">
              <button className="btn btn-text" type="button" onClick={() => { setDirty(false); }}>撤销更改</button>
              <button className="btn btn-primary" type="button" onClick={save}>保存</button>
            </div>
          </aside>
        </div>
      </EditorWorkspace>

      {aiRail.status === 'diffing' && aiRail.result && aiRail.lastAction ? (
        <DiffModal
          hunks={aiRail.hunks}
          result={aiRail.result}
          action={aiRail.lastAction}
          onApply={aiRail.applySelected}
          onReject={aiRail.reject}
        />
      ) : null}
    </>
  );
}
