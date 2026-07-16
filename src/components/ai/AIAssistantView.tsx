import { useEffect, useState } from 'react';
import type { AiAction } from '../../lib/ai';
import { hasApiKey } from '../../lib/ai';
import { useSettingsStore } from '../../store/settingsStore';
import { useUIStore } from '../../store/uiStore';
import { PageHeader } from '../PageHeader';
import { showToast } from '../Toast';
import { KeyStatusBadge } from '../KeyStatusBadge';
import { AIModeSelector } from './AIModeSelector';
import './ai.css';

export function AIAssistantView() {
  const settings = useSettingsStore();
  const ui = useUIStore();
  const [mode, setMode] = useState<AiAction>('polish');
  const [note, setNote] = useState('');
  const [keyStored, setKeyStored] = useState(settings.aiKeyStored);

  useEffect(() => {
    let active = true;
    hasApiKey(settings.aiVendor).then((stored) => {
      if (active) {
        setKeyStored(stored);
        settings.setAIKeyStored(stored);
      }
    });
    return () => {
      active = false;
    };
  }, [settings.aiVendor, settings.setAIKeyStored]);

  return (
    <>
      <PageHeader
        title="AI 助手"
        subtitle="提供润色、结构优化与安全审查，所有写回需经 diff 确认"
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
            <button
              className="btn btn-primary ai-page-full-button mt-3"
              type="button"
              disabled={!keyStored}
              onClick={() => showToast('请从 Editor 右侧 AI 面板确认脱敏预览后发送', '')}
            >
              生成优化建议
            </button>
          </div>
        </section>

        <section className="card">
          <div className="card-header ai-diff-card-header">
            <h2 className="card-title">Diff 对比</h2>
            <span className="status-pill status-review">暂无数据</span>
          </div>
          <div className="card-body">
            <p className="text-sm text-secondary mb-3">暂无 AI 建议。请从 Editor 右侧 AI 面板确认脱敏预览后发送。</p>
            <div className="aux-state">暂无 Diff 数据</div>
          </div>
        </section>
      </div>

      <section className="card mt-4">
        <div className="card-header"><h2 className="card-title">API Key 状态</h2></div>
        <div className="card-body">
          <KeyStatusBadge stored={keyStored} />
        </div>
      </section>
    </>
  );
}
