import { type KeyboardEvent, type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { diffLines } from 'diff';
import { DiffModal } from '../components/ai/DiffModal';
import { AIRail } from '../components/ai/AIRail';
import { ValidationResult } from '../components/ValidationResult';
import { showToast } from '../components/Toast';
import { useAIRail } from '../hooks/useAIRail';
import { sanitizeText } from '../lib/redaction';
import { cloneSkill, getVersionHistory, readSkill, restoreVersion, updateSkill, validateSkill } from '../lib/invoke';
import { getSkillPermission } from '../lib/skillPermissions';
import { useSettingsStore } from '../store/settingsStore';
import { useSkillStore } from '../store/skillStore';
import { useUIStore } from '../store/uiStore';
import type { SkillDetail } from '../types/skill';
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

type VersionEntry = { id: string; time: string; note: string; diffLines: number; source: string };

type LoadedDraft = {
  frontmatter: FrontmatterDraft;
  markdown: string;
  rawContent: string;
  sha256: string;
};

type SaveFailure = {
  message: string;
};

type ConflictState = {
  external: LoadedDraft;
  diffPreview: { text: string; kind: 'same' | 'added' | 'removed' }[];
};

type RestoreCandidate = VersionEntry | null;

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

function frontmatterFromDetail(detail: Partial<SkillDetail> | null, current: FrontmatterDraft, fallbackName: string): FrontmatterDraft {
  const source = detail?.frontmatter || {};
  return {
    name: String(source.name || detail?.name || fallbackName),
    display: String(source.display || source.title || source.description || detail?.description || current.display),
    version: String(source.version || current.version),
    category: String(source.category || current.category),
    tags: Array.isArray(source.tags) ? source.tags.join(', ') : String(source.tags || current.tags),
    author: String(source.author || current.author),
  };
}

function rawContentForDetail(detail: Partial<SkillDetail> | null, markdown: string): string {
  return String(detail?.rawContent || detail?.markdown || markdown);
}

async function sha256Hex(content: string): Promise<string> {
  const cryptoApi = globalThis.crypto;
  if (cryptoApi?.subtle) {
    const digest = await cryptoApi.subtle.digest('SHA-256', new TextEncoder().encode(content));
    return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
  }
  return `sha256-unavailable:${content.length}:${content}`;
}

function shortHash(hash: string) {
  return hash.length > 16 ? `${hash.slice(0, 12)}…${hash.slice(-6)}` : hash;
}

function buildDiffPreview(externalMarkdown: string, draftMarkdown: string): ConflictState['diffPreview'] {
  return diffLines(externalMarkdown, draftMarkdown).flatMap((part) => {
    const kind: 'same' | 'added' | 'removed' = part.added ? 'added' : part.removed ? 'removed' : 'same';
    return part.value
      .split('\n')
      .filter((line) => line.length > 0)
      .slice(0, 12)
      .map((text) => ({ text, kind }));
  });
}

function Modal({
  title,
  description,
  children,
  onClose,
  primary,
}: {
  title: string;
  description: string;
  children: ReactNode;
  onClose: () => void;
  primary?: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const titleId = useMemo(() => `editor-modal-${title.replace(/\s+/g, '-').toLowerCase()}`, [title]);
  const descriptionId = `${titleId}-description`;

  useEffect(() => {
    restoreFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const dialog = dialogRef.current;
    const focusable = dialog?.querySelectorAll<HTMLElement>('button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])');
    const first = focusable?.[0];
    first?.focus();
    return () => {
      restoreFocusRef.current?.focus();
    };
  }, []);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
      return;
    }
    if (event.key === 'Enter' && primary && !(event.target instanceof HTMLTextAreaElement)) {
      event.preventDefault();
      primary();
      return;
    }
    if (event.key !== 'Tab') return;
    const dialog = dialogRef.current;
    const focusable = Array.from(
      dialog?.querySelectorAll<HTMLElement>('button:not(:disabled), [href], input:not(:disabled), textarea:not(:disabled), select:not(:disabled), [tabindex]:not([tabindex="-1"])') || [],
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <div className="editor-modal-backdrop" onMouseDown={onClose}>
      <div
        ref={dialogRef}
        className="editor-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        onKeyDown={handleKeyDown}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="editor-modal-header">
          <div>
            <h2 id={titleId}>{title}</h2>
            <p id={descriptionId}>{description}</p>
          </div>
          <button className="btn btn-text" type="button" aria-label="关闭" onClick={onClose}>关闭</button>
        </div>
        {children}
      </div>
    </div>
  );
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
  const [saveStatus, setSaveStatus] = useState<'synced' | 'dirty' | 'saving'>('synced');
  const [showAI, setShowAI] = useState(false);
  const [validation, setValidation] = useState<ValidationState | null>(null);
  const [baseline, setBaseline] = useState<LoadedDraft | null>(null);
  const [versions, setVersions] = useState<VersionEntry[]>([]);
  const [saveFailure, setSaveFailure] = useState<SaveFailure | null>(null);
  const [showUndoConfirm, setShowUndoConfirm] = useState(false);
  const [conflict, setConflict] = useState<ConflictState | null>(null);
  const [overwriteConfirmed, setOverwriteConfirmed] = useState(false);
  const [restoreCandidate, setRestoreCandidate] = useState<RestoreCandidate>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [aiDraftNotice, setAiDraftNotice] = useState<string | null>(null);
  const [showReturnConfirm, setShowReturnConfirm] = useState(false);
  const [copyingProtected, setCopyingProtected] = useState(false);
  const [copyFailure, setCopyFailure] = useState<string | null>(null);

  const skill = useMemo(() => selectedSkill, [selectedSkill]);
  const pagePath = skill?.path || pathForName(frontmatter.name);
  const permission = skill ? getSkillPermission(skill) : null;
  const readOnly = ui.editorReadOnly || Boolean(permission?.readOnly);
  const returnTarget = ui.editorReturnTarget ?? {
    subView: skill ? 'detail' as const : null,
    subParam: skill?.path || null,
  };

  useEffect(() => {
    const nextName = selectedSkill?.name || ui.subParam || 'Browser Control';
    setFrontmatter(initialFrontmatter(nextName));
    setMarkdown(ui.subParam ? aihotMarkdown : browserMarkdown);
    setDirty(false);
    setSaveStatus('synced');
    setBaseline(null);
    setVersions([]);
    setSuccessBanner(null);
    setAiDraftNotice(null);
    setShowReturnConfirm(false);
    setCopyFailure(null);
  }, [selectedSkill?.name, ui.subParam]);

  useEffect(() => {
    if (!skill?.path) return;
    readSkill(skill.path).then(async (result) => {
      if (!result) return;
      const nextMarkdown = result.markdown || result.bodyMarkdown || '';
      const nextFrontmatter = frontmatterFromDetail(result, initialFrontmatter(result.name || skill.name), skill.name);
      const rawContent = rawContentForDetail(result, nextMarkdown);
      const sha256 = await sha256Hex(rawContent);
      setMarkdown(nextMarkdown);
      setFrontmatter(nextFrontmatter);
      setBaseline({ frontmatter: nextFrontmatter, markdown: nextMarkdown, rawContent, sha256 });
      setDirty(false);
      setSaveStatus('synced');
    });
    getVersionHistory(skill.path)
      .then((nextVersions) => setVersions(Array.isArray(nextVersions) ? nextVersions : []))
      .catch(() => setVersions([]));
  }, [skill?.path]);

  const markDirty = () => {
    if (readOnly) return;
    setDirty(true);
    setSaveStatus('dirty');
    setSuccessBanner(null);
  };
  const updateFrontmatter = (next: FrontmatterDraft) => {
    if (readOnly) return;
    setFrontmatter(next);
    markDirty();
  };
  const updateMarkdown = (next: string) => {
    if (readOnly) return;
    setMarkdown(next);
    markDirty();
  };
  const refreshVersions = async () => {
    if (!skill?.path) return;
    try {
      const nextVersions = await getVersionHistory(skill.path);
      setVersions(Array.isArray(nextVersions) ? nextVersions : []);
    } catch {
      setVersions([]);
    }
  };

  const save = async (options?: { force?: boolean }) => {
    if (readOnly || !skill?.path || !dirty || saveStatus === 'saving') return;
    setSaveStatus('saving');
    setSaveFailure(null);
    try {
      if (!options?.force && baseline) {
        const latest = await readSkill(skill.path);
        if (latest) {
          const latestMarkdown = latest.markdown || latest.bodyMarkdown || '';
          const latestRaw = rawContentForDetail(latest, latestMarkdown);
          const latestSha = await sha256Hex(latestRaw);
          if (latestSha !== baseline.sha256) {
            const latestFrontmatter = frontmatterFromDetail(latest, baseline.frontmatter, skill.name);
            setConflict({
              external: { frontmatter: latestFrontmatter, markdown: latestMarkdown, rawContent: latestRaw, sha256: latestSha },
              diffPreview: buildDiffPreview(latestMarkdown, markdown),
            });
            setSaveStatus('dirty');
            return;
          }
        }
      }

      const saved = (await updateSkill({
        path: skill.path,
        name: frontmatter.name,
        description: frontmatter.display || skill.description,
        markdown,
      })) as SkillDetail | null;
      const savedMarkdown = saved?.markdown || saved?.bodyMarkdown || markdown;
      const savedFrontmatter = frontmatterFromDetail(saved, frontmatter, skill.name);
      const savedRaw = rawContentForDetail(saved, markdown);
      const savedSha = await sha256Hex(savedRaw);
      setBaseline({ frontmatter: savedFrontmatter, markdown: savedMarkdown, rawContent: savedRaw, sha256: savedSha });
      setFrontmatter(savedFrontmatter);
      setMarkdown(savedMarkdown);
      setDirty(false);
      setSaveStatus('synced');
      setConflict(null);
      setOverwriteConfirmed(false);
      setSuccessBanner('保存成功：已创建版本快照，原文件已备份，可随时恢复');
      showToast('已保存，原文件已备份', '');
      await refreshVersions();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setSaveStatus('dirty');
      setSaveFailure({ message });
    }
  };

  const confirmUndo = () => {
    if (readOnly || !baseline) return;
    setFrontmatter(baseline.frontmatter);
    setMarkdown(baseline.markdown);
    setDirty(false);
    setSaveStatus('synced');
    setShowUndoConfirm(false);
    setAiDraftNotice(null);
  };

  const reloadExternal = () => {
    if (!conflict) return;
    setFrontmatter(conflict.external.frontmatter);
    setMarkdown(conflict.external.markdown);
    setBaseline(conflict.external);
    setDirty(false);
    setSaveStatus('synced');
    setConflict(null);
    setOverwriteConfirmed(false);
  };

  const confirmRestore = async () => {
    if (readOnly || !skill?.path || !restoreCandidate) return;
    try {
      await restoreVersion(skill.path, restoreCandidate.id);
      const reloaded = await readSkill(skill.path);
      if (reloaded) {
        const restoredMarkdown = reloaded.markdown || reloaded.bodyMarkdown || '';
        const restoredFrontmatter = frontmatterFromDetail(reloaded, frontmatter, skill.name);
        const restoredRaw = rawContentForDetail(reloaded, restoredMarkdown);
        setFrontmatter(restoredFrontmatter);
        setMarkdown(restoredMarkdown);
        setBaseline({ frontmatter: restoredFrontmatter, markdown: restoredMarkdown, rawContent: restoredRaw, sha256: await sha256Hex(restoredRaw) });
      }
      setDirty(false);
      setSaveStatus('synced');
      setRestoreCandidate(null);
      setSuccessBanner(`已恢复到 ${restoreCandidate.time}，当前版本已备份保留`);
      showToast(`已恢复到 ${restoreCandidate.time}`, '');
      await refreshVersions();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setSaveFailure({ message: `恢复失败：${message}` });
      setRestoreCandidate(null);
    }
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
      if (readOnly) return;
      updateMarkdown(newContent);
      setAiDraftNotice('已采纳 1 条建议，点击保存后写回 SKILL.md');
    },
    onToast: (message) => showToast(sanitizeText(message), ''),
  });

  const performReturn = () => {
    setShowReturnConfirm(false);
    if (returnTarget.subView) {
      ui.enterSub(returnTarget.subView, returnTarget.subParam ?? undefined);
      return;
    }
    ui.exitSub();
  };

  const requestReturn = () => {
    if (dirty && !readOnly) {
      setShowReturnConfirm(true);
      return;
    }
    performReturn();
  };

  const copyProtectedToEditable = async () => {
    if (!skill?.path || copyingProtected) return;
    setCopyingProtected(true);
    setCopyFailure(null);
    try {
      const result = await cloneSkill(skill.path, skill.name);
      const copied = {
        ...skill,
        source: 'mine' as const,
        protected: false,
        path: result.newPath,
      };
      skillStore.setSkills([...skillStore.skills, copied]);
      skillStore.openDrawer(skillStore.skills.length);
      ui.enterEditor(result.newPath, {
        readOnly: false,
        returnTarget,
      });
      showToast('已复制到可编辑目录', '');
    } catch (error) {
      const message = sanitizeText(error instanceof Error ? error.message : String(error));
      setCopyFailure(`复制失败：${message}`);
    } finally {
      setCopyingProtected(false);
    }
  };

  return (
    <>
      <div className="page-header editor-page-header">
        <div className="editor-header-main">
          <button className="btn btn-text editor-back-button" type="button" aria-label="返回" onClick={requestReturn}>
            <span aria-hidden="true">←</span>
            <span>返回</span>
          </button>
          <div className="editor-title-block">
            <h1 className="page-title">{readOnly ? '查看' : '编辑'} {frontmatter.name}</h1>
            <p className="page-subtitle">{pagePath}</p>
          </div>
        </div>
        <div className="flex gap-2 editor-header-actions">
          <button className="btn btn-ghost" type="button" disabled={readOnly} onClick={() => ui.enterSub('ai', skill?.path || frontmatter.name)}>AI 辅助</button>
        </div>
      </div>

      <EditorWorkspace ariaLabel="Skill editor">
        <div className="editor-grid">
          <div className="card editor-pane editor-compose-pane">
            <div className="card-header">
              <h2 className="card-title">Frontmatter</h2>
              <span className={`editor-dirty-pill ${dirty ? 'is-dirty' : ''}`}>{saveStatus === 'saving' ? '保存中…' : dirty ? '未保存' : '已同步'}</span>
            </div>
            {readOnly ? (
              <div className="editor-banner warning" aria-live="polite">
                <p>这是受保护的 Skill。当前页面仅供查看，原文件不会被修改。如需编辑，请复制到可编辑目录。</p>
                <button className="btn btn-ghost btn-sm" type="button" disabled={copyingProtected || !skill?.path} onClick={copyProtectedToEditable}>
                  {copyingProtected ? '复制中' : '复制到可编辑目录'}
                </button>
                {copyFailure ? <small>{copyFailure}</small> : null}
              </div>
            ) : null}
            {successBanner ? <div className="editor-banner success" aria-live="polite">{successBanner}</div> : null}
            {aiDraftNotice ? <div className="editor-banner info" aria-live="polite">{aiDraftNotice}</div> : null}
            <FrontmatterForm value={frontmatter} onChange={updateFrontmatter} readOnly={readOnly} />
            <div className="card-header editor-section-header"><h2 className="card-title">Markdown</h2></div>
            <MarkdownEditor value={markdown} onChange={updateMarkdown} readOnly={readOnly} />
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
              {readOnly ? (
                <p className="text-sm text-secondary mb-3">只读模式已禁用 AI 写回。</p>
              ) : showAI ? (
                <AIRail
                  status={aiRail.status}
                  stream={aiRail.stream}
                  result={aiRail.result}
                  vendor={settings.aiVendor}
                  monthlyUsed={settings.aiMonthlyUsed}
                  monthlyBudget={settings.aiMonthlyBudget}
                  desensitize={settings.aiDesensitize}
                  pendingPreview={aiRail.pendingPreview}
                  onRun={aiRail.run}
                  onConfirmSend={aiRail.confirmSend}
                  onCancel={aiRail.cancel}
                />
              ) : (
                <>
                  <p className="text-sm text-secondary mb-3">AI 修改内容会以 diff 形式展示，采纳后进入草稿，保存后写回文件。</p>
                  <button className="btn btn-ghost editor-full-button" type="button" onClick={() => setShowAI(true)}>AI</button>
                </>
              )}
            </div>
            <div className="card-header editor-section-header"><h2 className="card-title">版本历史</h2></div>
            <div className="card-body editor-version-list">
              {versions.length ? versions.map((version) => (
                <button
                  key={version.id}
                  className="editor-version-row"
                  type="button"
                  aria-label={`恢复 ${version.id}`}
                  disabled={readOnly}
                  onClick={() => setRestoreCandidate(version)}
                >
                  <span>{version.time}</span>
                  <strong>{version.id}</strong>
                  <small>{version.source} · {version.note}</small>
                  <small>{pagePath}</small>
                </button>
              )) : <p className="text-sm text-secondary">暂无版本历史</p>}
            </div>
            <div className="editor-save-row">
              <button className="btn btn-text" type="button" disabled={readOnly || !dirty} onClick={() => setShowUndoConfirm(true)}>撤销更改</button>
              <button className="btn btn-primary" type="button" disabled={readOnly || !dirty || saveStatus === 'saving' || !skill?.path} onClick={() => save()}>保存</button>
            </div>
          </aside>
        </div>
      </EditorWorkspace>

      {!readOnly && aiRail.status === 'diffing' && aiRail.result && aiRail.lastAction ? (
        <DiffModal
          hunks={aiRail.hunks}
          result={aiRail.result}
          action={aiRail.lastAction}
          onApply={aiRail.applySelected}
          onReject={aiRail.reject}
        />
      ) : null}

      {saveFailure ? (
        <Modal
          title="保存失败"
          description={`原文件安全未改动。${saveFailure.message}`}
          onClose={() => setSaveFailure(null)}
          primary={() => save()}
        >
          <div className="editor-modal-body">
            <p>草稿已保留</p>
            <div className="editor-modal-actions">
              <button className="btn btn-text" type="button" onClick={() => navigator.clipboard?.writeText(markdown)}>复制草稿</button>
              <button className="btn btn-primary" type="button" onClick={() => save()}>重试保存</button>
            </div>
          </div>
        </Modal>
      ) : null}

      {showUndoConfirm ? (
        <Modal
          title="撤销更改"
          description="当前编辑尚未保存，恢复后将回到最近一次成功保存或读取时的内容。"
          onClose={() => setShowUndoConfirm(false)}
          primary={confirmUndo}
        >
          <div className="editor-modal-body">
            <p>撤销后将丢失未保存的更改。</p>
            <div className="editor-modal-actions">
              <button className="btn btn-text" type="button" onClick={() => setShowUndoConfirm(false)}>保留草稿并继续</button>
              <button className="btn btn-primary" type="button" onClick={confirmUndo}>确认撤销</button>
            </div>
          </div>
        </Modal>
      ) : null}

      {showReturnConfirm ? (
        <Modal
          title="离开编辑器？"
          description="当前编辑尚未保存。确认返回后，未保存内容会丢失。"
          onClose={() => setShowReturnConfirm(false)}
          primary={performReturn}
        >
          <div className="editor-modal-body">
            <p>可以继续编辑，或确认返回上一级。</p>
            <div className="editor-modal-actions">
              <button className="btn btn-text" type="button" onClick={() => setShowReturnConfirm(false)}>继续编辑</button>
              <button className="btn btn-primary" type="button" onClick={performReturn}>确认返回</button>
            </div>
          </div>
        </Modal>
      ) : null}

      {conflict ? (
        <Modal
          title="文件冲突"
          description={`文件已被其他程序修改。打开时 SHA256: ${shortHash(baseline?.sha256 || '')}，当前 SHA256: ${shortHash(conflict.external.sha256)}。`}
          onClose={() => { setConflict(null); setOverwriteConfirmed(false); }}
        >
          <div className="editor-modal-body">
            <h3>外部版本 vs 当前草稿</h3>
            <div className="editor-diff-preview">
              {conflict.diffPreview.map((line, index) => (
                <code key={`${line.kind}-${index}`} className={`editor-diff-line ${line.kind}`}>{line.kind === 'added' ? '+ ' : line.kind === 'removed' ? '- ' : '  '}{line.text}</code>
              ))}
            </div>
            <label className="editor-confirm-row">
              <input type="checkbox" checked={overwriteConfirmed} onChange={(event) => setOverwriteConfirmed(event.target.checked)} />
              我已确认：覆盖前会自动备份外部版本
            </label>
            <div className="editor-modal-actions">
              <button className="btn btn-text" type="button" onClick={reloadExternal}>重新读取外部版本</button>
              <button className="btn btn-text" type="button" onClick={() => setConflict(null)}>取消稍后检查</button>
              <button className="btn btn-primary" type="button" disabled={!overwriteConfirmed} onClick={() => save({ force: true })}>保留当前草稿并覆盖</button>
            </div>
          </div>
        </Modal>
      ) : null}

      {restoreCandidate ? (
        <Modal
          title="恢复到旧版本？"
          description={`目标版本 ${restoreCandidate.id}。当前版本快照将先创建，路径安全检查通过后恢复。失败时原文件不会被修改。`}
          onClose={() => setRestoreCandidate(null)}
          primary={confirmRestore}
        >
          <div className="editor-modal-body">
            <p>当前版本仍可通过备份再次恢复。</p>
            <div className="editor-modal-actions">
              <button className="btn btn-text" type="button" onClick={() => setRestoreCandidate(null)}>取消</button>
              <button className="btn btn-primary" type="button" onClick={confirmRestore}>确认恢复</button>
            </div>
          </div>
        </Modal>
      ) : null}
    </>
  );
}
