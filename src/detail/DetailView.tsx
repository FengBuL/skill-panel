import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { DangerZone } from '../components/DangerZone';
import { DependencyList } from '../components/DependencyList';
import { QualityCheck } from '../components/QualityCheck';
import { getSkillPermission } from '../lib/skillPermissions';
import { useSkillStore, type Skill } from '../store/skillStore';
import { useUIStore } from '../store/uiStore';
import type { AppSettings, DeleteSkillResult } from '../types/skill';
import './detail.css';

type DetailModal = 'archive' | 'copy' | 'delete' | null;

interface OperationMessage {
  detail: string;
  tone: 'success' | 'error' | 'info';
  title: string;
}

function sourceLabel(source?: Skill['source']) {
  return source === 'plugin' ? 'Builtin' : 'User';
}

function shortPath(path: string) {
  if (!path) return '~/.workbuddy/skills/aihot/SKILL.md';
  return path.replace(/^\/Users\/[^/]+/, '~');
}

function directoryPath(path: string) {
  return path.replace(/\/SKILL\.md$/, '');
}

function formatDate(value: string) {
  if (!value) return '2026年7月7日';
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
    const [year, month, day] = value.slice(0, 10).split('-');
    return `${year}年${Number(month)}月${Number(day)}日`;
  }
  return value;
}

function safeErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return message
    .replace(/\/Users\/[^/\s]+/g, '~')
    .replace(/[A-Z]:\\Users\\[^\\\s]+/g, '~');
}

function normalizeSettings(settings: AppSettings | null): AppSettings {
  return {
    language: settings?.language || 'system',
    customScanDirectories: settings?.customScanDirectories || [],
    showDefaultScanDirectories: settings?.showDefaultScanDirectories ?? true,
    ...settings,
    skillArchives: settings?.skillArchives || {},
  };
}

const fallbackSkill: Skill = {
  name: 'aihot-query',
  description: '从 aihot.virxact.com 获取每日 AI 热点资讯和动态。',
  source: 'plugin',
  category: 'AI',
  path: '~/.workbuddy/skills/aihot/SKILL.md',
  modifiedAt: '2026-07-07',
  size: 12400,
  starred: false,
  disabled: false,
  protected: true,
};

export function DetailView() {
  const ui = useUIStore();
  const store = useSkillStore();
  const [modal, setModal] = useState<DetailModal>(null);
  const [settings, setSettings] = useState<AppSettings>(() => normalizeSettings(null));
  const [copyName, setCopyName] = useState('');
  const [deleteConfirmed, setDeleteConfirmed] = useState(false);
  const [message, setMessage] = useState<OperationMessage | null>(null);
  const [busy, setBusy] = useState(false);
  const lastFocused = useRef<HTMLElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const cancelButtonRef = useRef<HTMLButtonElement | null>(null);

  const current = useMemo(() => {
    const param = ui.subParam;
    return store.skills.find((skill) => skill.path === param || skill.name === param) ||
      (store.drawerIdx >= 0 ? store.skills[store.drawerIdx] : null) ||
      store.skills[0] ||
      fallbackSkill;
  }, [store.drawerIdx, store.skills, ui.subParam]);

  const archived = Boolean(settings.skillArchives?.[current.path]);
  const statusTone = archived ? 'archived' : current.disabled ? 'archived' : 'healthy';
  const statusText = archived ? '已归档' : current.disabled ? '已禁用' : '健康';
  const usageCount = Math.max(12, Math.round((current.size || 12400) / 100));
  const displayPath = shortPath(current.path);
  const fullDirectoryPath = directoryPath(current.path);
  const permission = getSkillPermission(current);

  useEffect(() => {
    let cancelled = false;
    invoke<AppSettings>('load_app_settings')
      .then((loaded) => {
        if (!cancelled) setSettings(normalizeSettings(loaded));
      })
      .catch(() => {
        if (!cancelled) setSettings(normalizeSettings(null));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const closeModal = (detail = '操作已取消，页面和文件保持原状态。') => {
    setModal(null);
    setDeleteConfirmed(false);
    setBusy(false);
    setMessage({ title: '已取消操作', detail, tone: 'info' });
    queueMicrotask(() => lastFocused.current?.focus());
  };

  const openModal = (nextModal: Exclude<DetailModal, null>) => {
    lastFocused.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setMessage(null);
    setDeleteConfirmed(false);
    setCopyName(current.name);
    setModal(nextModal);
  };

  useEffect(() => {
    if (!modal) return;
    const id = window.setTimeout(() => cancelButtonRef.current?.focus(), 0);
    return () => window.clearTimeout(id);
  }, [modal]);

  const trapDialogFocus = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeModal();
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    if (!focusable || focusable.length === 0) return;
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

  const openCurrentFolder = async () => {
    setMessage(null);
    try {
      await invoke('open_skill_folder', { path: current.path });
      setMessage({ title: '已打开目录', detail: `路径：${displayPath.replace(/\/SKILL\.md$/, '')}`, tone: 'success' });
    } catch (error) {
      setMessage({ title: '打开目录失败', detail: safeErrorMessage(error), tone: 'error' });
    }
  };

  const persistArchive = async (nextArchived: boolean) => {
    setBusy(true);
    try {
      const nextArchives = { ...(settings.skillArchives || {}) };
      if (nextArchived) {
        nextArchives[current.path] = true;
      } else {
        delete nextArchives[current.path];
      }
      const nextSettings = { ...settings, skillArchives: nextArchives };
      const saved = await invoke<AppSettings>('save_app_settings', { settings: nextSettings });
      setSettings(normalizeSettings(saved));
      setModal(null);
      setMessage({
        title: nextArchived ? '归档成功' : '已取消归档',
        detail: nextArchived ? '应用内状态已归档，本地文件保留。' : 'Skill 已恢复到未归档显示状态。',
        tone: 'success',
      });
    } catch (error) {
      setMessage({ title: nextArchived ? '归档失败' : '取消归档失败', detail: safeErrorMessage(error), tone: 'error' });
    } finally {
      setBusy(false);
      queueMicrotask(() => lastFocused.current?.focus());
    }
  };

  const copyCurrentToEditable = async () => {
    const trimmedName = copyName.trim();
    if (!trimmedName) return;
    setBusy(true);
    try {
      const result = await invoke<{ newPath: string }>('clone_skill', {
        destName: trimmedName,
        srcPath: current.path,
      });
      const copiedSkill: Skill = {
        ...current,
        name: trimmedName,
        path: result.newPath,
        source: 'mine',
        protected: false,
        disabled: false,
      };
      store.setSkills([copiedSkill, ...store.skills.filter((skill) => skill.path !== result.newPath)]);
      ui.enterSub('detail', result.newPath);
      setModal(null);
      setMessage({
        title: '复制成功',
        detail: `新路径：${result.newPath}；来源：User`,
        tone: 'success',
      });
    } catch (error) {
      setMessage({ title: '复制失败', detail: safeErrorMessage(error), tone: 'error' });
    } finally {
      setBusy(false);
      queueMicrotask(() => lastFocused.current?.focus());
    }
  };

  const deleteCurrentSkill = async () => {
    if (!permission.canDelete || !deleteConfirmed) return;
    setBusy(true);
    try {
      const result = await invoke<DeleteSkillResult>('delete_skill', { path: current.path });
      store.setSkills(store.skills.filter((skill) => skill.path !== current.path));
      setModal(null);
      setMessage({
        title: '删除成功',
        detail: `${result.skillName} 已进入系统废纸篓。备份：${result.backupPath}。${result.restoreInstructions}`,
        tone: 'success',
      });
    } catch (error) {
      setMessage({ title: '删除失败', detail: `${safeErrorMessage(error)} 原文件保持存在。`, tone: 'error' });
    } finally {
      setBusy(false);
      queueMicrotask(() => lastFocused.current?.focus());
    }
  };

  return (
    <>
      <div className="page-header detail-page-header">
        <div>
          <h1 className="page-title">{current.name}</h1>
          <p className="page-subtitle">{displayPath}</p>
        </div>
        <div className="flex gap-2 detail-actions-row">
          {permission.canEdit ? (
            <button className="btn btn-primary" type="button" onClick={() => ui.enterSub('editor', current.path)}>编辑</button>
          ) : (
            <button className="btn btn-primary" type="button" onClick={() => openModal('copy')}>复制到可编辑目录</button>
          )}
          <button className="btn btn-text" type="button" onClick={() => void openCurrentFolder()}>打开目录</button>
          <button className="btn btn-text" type="button">备份</button>
          <button className="btn btn-danger-text" type="button" onClick={() => openModal('archive')}>
            {archived ? '取消归档' : '归档'}
          </button>
        </div>
      </div>

      {message ? (
        <div className={`detail-confirm-banner detail-${message.tone}-banner`} role="status">
          <div>
            <strong>{message.title}</strong>
            <span className="text-sm">{message.detail}</span>
          </div>
          <button className="btn btn-text btn-sm" type="button" onClick={() => setMessage(null)}>关闭</button>
        </div>
      ) : null}

      <div className="grid-3 mb-4">
        <div className="card card-body">
          <div className="section-title">状态</div>
          <div className="flex items-center gap-2 mt-2">
            <span className={`status-pill status-${statusTone}`}>{statusText}</span>
            <span className="text-sm text-secondary">上次校验通过</span>
          </div>
        </div>
        <div className="card card-body">
          <div className="section-title">分类 / 来源</div>
          <div className="flex items-center gap-2 mt-2">
            <span className="tag tag-category">{current.category || '未分类'}</span>
            <span className="tag">{sourceLabel(current.source)}</span>
          </div>
        </div>
        <div className="card card-body">
          <div className="section-title">使用统计</div>
          <div className="detail-stat-number">{usageCount}</div>
          <div className="text-sm text-secondary">最近使用：今天 09:41</div>
        </div>
      </div>

      {permission.readOnly ? (
        <section className="detail-protected-banner" aria-label="受保护来源">
          <strong>受保护来源</strong>
          <span>直接编辑和删除本地文件已禁用，可应用内归档或复制到可编辑目录。</span>
        </section>
      ) : null}

      <div className="grid-2">
        <section className="card">
          <div className="card-header"><h2 className="card-title">基础信息</h2></div>
          <div className="card-body detail-info-list">
            <div className="detail-row"><span className="detail-label">名称</span><span className="detail-value">{current.name}</span></div>
            <div className="detail-row"><span className="detail-label">显示名</span><span className="detail-value">{current.description || 'AI 热点查询'}</span></div>
            <div className="detail-row"><span className="detail-label">版本</span><span className="detail-value">1.3.2</span></div>
            <div className="detail-row"><span className="detail-label">作者</span><span className="detail-value">{current.source === 'plugin' ? 'WorkBuddy Team' : 'User'}</span></div>
            <div className="detail-row"><span className="detail-label">路径</span><span className="detail-value detail-path">{displayPath.replace(/\/SKILL\.md$/, '')}</span></div>
            <div className="detail-row"><span className="detail-label">更新时间</span><span className="detail-value">{formatDate(current.modifiedAt)}</span></div>
            <div className="detail-row"><span className="detail-label">文件结构</span><span className="detail-value detail-path">SKILL.md · references/ · assets/</span></div>
            <div className="detail-row">
              <span className="detail-label">标签</span>
              <span className="detail-value detail-tags">
                <span className="tag tag-category">{current.category || '未分类'}</span>
                <span className="tag">news</span>
                <span className="tag">{current.source === 'plugin' ? 'builtin' : 'user'}</span>
              </span>
            </div>
          </div>
        </section>

        <section className="card">
          <div className="card-header"><h2 className="card-title">质量检查</h2></div>
          <div className="card-body">
            <QualityCheck />
          </div>
        </section>
      </div>

      <section className="card mt-4">
        <div className="card-header"><h2 className="card-title">依赖关系</h2></div>
        <div className="card-body card-body-flush">
          <DependencyList />
        </div>
      </section>

      <DangerZone
        archived={archived}
        canDelete={permission.canDelete}
        onArchive={() => openModal('archive')}
        onDelete={() => openModal('delete')}
      />

      {modal ? (
        <div className="detail-modal-overlay" onKeyDown={trapDialogFocus}>
          <div
            aria-labelledby={`detail-${modal}-title`}
            aria-modal="true"
            className="detail-modal"
            ref={dialogRef}
            role="dialog"
          >
            {modal === 'archive' ? (
              <>
                <div className="detail-modal-header">
                  <h2 id="detail-archive-title">应用内归档</h2>
                </div>
                <div className="detail-modal-body">
                  <p>仅修改应用内状态，使用 AppSettings.skillArchives 并通过 save_app_settings 持久化。本地文件保留。</p>
                  <div className="detail-modal-row"><span>Skill 名称</span><strong>{current.name}</strong></div>
                  <div className="detail-modal-row"><span>来源</span><strong>{sourceLabel(current.source)}</strong></div>
                  <div className="detail-modal-row"><span>完整路径</span><strong>{current.path}</strong></div>
                  <div className="detail-modal-note">可再次取消归档。取消后页面和文件保持原状态。</div>
                </div>
                <div className="detail-modal-footer">
                  <button ref={cancelButtonRef} className="btn btn-text" type="button" onClick={() => closeModal()}>取消</button>
                  <button className="btn btn-primary" type="button" onClick={() => void persistArchive(!archived)} disabled={busy}>
                    {archived ? '确认取消归档' : '确认归档'}
                  </button>
                </div>
              </>
            ) : null}

            {modal === 'copy' ? (
              <>
                <div className="detail-modal-header">
                  <h2 id="detail-copy-title">复制到可编辑目录</h2>
                </div>
                <div className="detail-modal-body">
                  <p>原文件保留只读，新文件复制到允许写入的用户 Skill 根目录，来源变为 User。</p>
                  <label className="detail-field">
                    <span>新 Skill 名称</span>
                    <input value={copyName} onChange={(event) => setCopyName(event.target.value)} />
                  </label>
                  <div className="detail-modal-row"><span>原文件</span><strong>{current.path}</strong></div>
                  <div className="detail-modal-row"><span>目标</span><strong>默认可编辑 Skill 根目录</strong></div>
                </div>
                <div className="detail-modal-footer">
                  <button ref={cancelButtonRef} className="btn btn-text" type="button" onClick={() => closeModal()}>取消</button>
                  <button className="btn btn-primary" type="button" onClick={() => void copyCurrentToEditable()} disabled={busy || !copyName.trim()}>
                    复制并编辑
                  </button>
                </div>
              </>
            ) : null}

            {modal === 'delete' ? (
              <>
                <div className="detail-modal-header detail-modal-danger">
                  <h2 id="detail-delete-title">删除本地文件</h2>
                </div>
                <div className="detail-modal-body">
                  <p className="detail-danger-copy">文件将进入系统废纸篓，同时创建应用内备份</p>
                  <div className="detail-modal-row"><span>Skill 名称</span><strong>{current.name}</strong></div>
                  <div className="detail-modal-row"><span>来源</span><strong>{sourceLabel(current.source)}</strong></div>
                  <div className="detail-modal-row"><span>完整路径</span><strong>{current.path}</strong></div>
                  <div className="detail-modal-row"><span>将受影响的文件或目录</span><strong>{fullDirectoryPath}</strong></div>
                  <div className="detail-modal-note">恢复方式：从系统废纸篓恢复原目录，或按删除结果返回的应用内备份路径手动恢复。</div>
                  <label className="detail-confirm-checkbox">
                    <input
                      checked={deleteConfirmed}
                      onChange={(event) => setDeleteConfirmed(event.target.checked)}
                      type="checkbox"
                    />
                    <span>我已了解删除影响，并确认要删除本地文件</span>
                  </label>
                </div>
                <div className="detail-modal-footer">
                  <button ref={cancelButtonRef} className="btn btn-text" type="button" onClick={() => closeModal()}>取消</button>
                  <button className="btn btn-danger" type="button" onClick={() => void deleteCurrentSkill()} disabled={busy || !deleteConfirmed || !permission.canDelete}>
                    删除本地文件
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
