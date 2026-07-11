import { useState } from 'react';
import type { AiAction, ParsedHunk } from '../../lib/ai';
import { useSettingsStore } from '../../store/settingsStore';
import { useUIStore } from '../../store/uiStore';
import { PageHeader } from '../PageHeader';
import { showToast } from '../Toast';
import { KeyStatusBadge } from '../KeyStatusBadge';
import { AIModeSelector } from './AIModeSelector';
import { DiffPreview } from './DiffPreview';
import './ai.css';

const sampleHunks: ParsedHunk[] = [
  {
    id: 1,
    oldStart: 3,
    oldLines: 2,
    newStart: 3,
    newLines: 2,
    addedCount: 1,
    removedCount: 1,
    lines: [
      '-从 aihot.virxact.com 获取每日 AI 热点资讯和动态。',
      '+从 aihot.virxact.com 获取每日 AI 热点资讯、行业动态与关键产品发布。',
      ' ',
      '## 触发条件',
      '+- 用户询问“今天 AI 有什么新闻”',
    ],
  },
  {
    id: 2,
    oldStart: 14,
    oldLines: 1,
    newStart: 15,
    newLines: 1,
    addedCount: 1,
    removedCount: 1,
    lines: [
      '## 工作流',
      '-4. 生成中文摘要并返回',
      '+4. 生成中文摘要，标注信息来源后返回',
    ],
  },
];

export function AIAssistantView() {
  const settings = useSettingsStore();
  const ui = useUIStore();
  const [mode, setMode] = useState<AiAction>('polish');
  const [note, setNote] = useState('');

  const acceptAll = () => {
    showToast('已进入写回确认，本批次保留人工确认流程', '');
  };

  const rejectAll = () => {
    showToast('已拒绝 AI 建议', '');
  };

  return (
    <>
      <PageHeader
        title="AI 助手"
        subtitle="为 aihot-query 提供润色、结构优化与安全审查，所有写回需经 diff 确认"
        actions={<button className="btn btn-text" type="button" onClick={() => ui.enterSub('editor', ui.subParam ?? undefined)}>返回编辑器</button>}
      />

      <div className="grid-2 ai-page-grid">
        <section className="card">
          <div className="card-header"><h2 className="card-title">选择优化方向</h2></div>
          <div className="card-body">
            <AIModeSelector selected={mode} onSelect={setMode} />
            <div className="mt-4">
              <label className="section-title" htmlFor="ai-extra-note">补充说明（可选）</label>
              <textarea
                id="ai-extra-note"
                className="textarea ai-note-input mt-2"
                placeholder="例如：增加对中文口语化查询的支持"
                value={note}
                onChange={(event) => setNote(event.target.value)}
              />
            </div>
            <button className="btn btn-primary ai-page-full-button mt-3" type="button">生成优化建议</button>
          </div>
        </section>

        <section className="card">
          <div className="card-header ai-diff-card-header">
            <h2 className="card-title">Diff 对比</h2>
            <span className="status-pill status-review">待确认</span>
          </div>
          <div className="card-body">
            <p className="text-sm text-secondary mb-3">请检查 AI 建议的每一处改动，确认后才可写回 SKILL.md。</p>
            <DiffPreview hunks={sampleHunks} onAcceptAll={acceptAll} onRejectAll={rejectAll} />
          </div>
        </section>
      </div>

      <section className="card mt-4">
        <div className="card-header"><h2 className="card-title">API Key 状态</h2></div>
        <div className="card-body">
          <KeyStatusBadge stored={settings.aiKeyStored} />
        </div>
      </section>
    </>
  );
}
