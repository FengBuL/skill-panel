import { useMemo, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { DangerZone } from '../components/DangerZone';
import { DependencyList } from '../components/DependencyList';
import { QualityCheck } from '../components/QualityCheck';
import { getSkillPermission } from '../lib/skillPermissions';
import { useSkillStore, type Skill } from '../store/skillStore';
import { useUIStore } from '../store/uiStore';
import './detail.css';

function sourceLabel(source?: Skill['source']) {
  return source === 'plugin' ? 'Builtin' : 'User';
}

function shortPath(path: string) {
  if (!path) return '~/.workbuddy/skills/aihot/SKILL.md';
  return path.replace(/^\/Users\/[^/]+/, '~');
}

function formatDate(value: string) {
  if (!value) return '2026年7月7日';
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
    const [year, month, day] = value.slice(0, 10).split('-');
    return `${year}年${Number(month)}月${Number(day)}日`;
  }
  return value;
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
  const [archiveConfirm, setArchiveConfirm] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const current = useMemo(() => {
    const param = ui.subParam;
    return store.skills.find((skill) => skill.path === param || skill.name === param) ||
      (store.drawerIdx >= 0 ? store.skills[store.drawerIdx] : null) ||
      store.skills[0] ||
      fallbackSkill;
  }, [store.drawerIdx, store.skills, ui.subParam]);

  const statusTone = current.disabled ? 'archived' : 'healthy';
  const statusText = current.disabled ? '已归档' : '健康';
  const usageCount = Math.max(12, Math.round((current.size || 12400) / 100));
  const displayPath = shortPath(current.path);
  const permission = getSkillPermission(current);

  const openCurrentFolder = async () => {
    setActionError(null);
    try {
      await invoke('open_skill_folder', { path: current.path });
    } catch (error) {
      setActionError(error instanceof Error ? error.message : String(error));
    }
  };

  const copyCurrentToEditable = async () => {
    setActionError(null);
    try {
      const result = await invoke<{ newPath: string }>('clone_skill', {
        destName: current.name,
        srcPath: current.path,
      });
      ui.enterSub('editor', result.newPath);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : String(error));
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
            <button className="btn btn-primary" type="button" onClick={() => void copyCurrentToEditable()}>复制到可编辑目录</button>
          )}
          <button className="btn btn-text" type="button" onClick={() => void openCurrentFolder()}>打开目录</button>
          <button className="btn btn-text" type="button">备份</button>
          <button className="btn btn-danger-text" type="button" onClick={() => setArchiveConfirm(true)}>归档</button>
        </div>
      </div>

      {actionError ? (
        <div className="detail-confirm-banner detail-error-banner">
          <span className="text-sm">{actionError}</span>
          <button className="btn btn-text btn-sm" type="button" onClick={() => setActionError(null)}>关闭</button>
        </div>
      ) : null}

      {archiveConfirm ? (
        <div className="detail-confirm-banner">
          <span className="text-sm">归档需要确认。本批次只展示确认提示，不写入本地数据。</span>
          <button className="btn btn-text btn-sm" type="button" onClick={() => setArchiveConfirm(false)}>取消</button>
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

      <DangerZone />
    </>
  );
}
