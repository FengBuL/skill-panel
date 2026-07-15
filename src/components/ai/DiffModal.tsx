// DiffModal — 全屏 diff 对比，支持全部接受/采纳所选/拒绝
import { type KeyboardEvent, useState, useEffect, useRef } from 'react';
import type { ParsedHunk, AiResult, AiAction } from '../../lib/ai';
import { DiffHunk } from './DiffHunk';

export function DiffModal({
  hunks,
  result,
  action,
  onApply,
  onReject,
}: {
  hunks: ParsedHunk[];
  result: AiResult;
  action: AiAction;
  onApply: (selectedIds: Set<number>) => void;
  onReject: () => void;
}) {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(
    new Set(hunks.map((h) => h.id)),
  );
  const modalRef = useRef<HTMLDivElement | null>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setSelectedIds(new Set(hunks.map((h) => h.id)));
  }, [hunks]);

  useEffect(() => {
    restoreFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    modalRef.current?.querySelector<HTMLElement>('button')?.focus();
    return () => {
      restoreFocusRef.current?.focus();
    };
  }, []);

  const toggleHunk = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => setSelectedIds(new Set(hunks.map((h) => h.id)));
  const selectNone = () => setSelectedIds(new Set());

  const totalAdded = hunks.reduce((s, h) => s + h.addedCount, 0);
  const totalRemoved = hunks.reduce((s, h) => s + h.removedCount, 0);
  const selectedCount = selectedIds.size;

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      onReject();
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = Array.from(
      modalRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled), [href], input:not(:disabled), textarea:not(:disabled), select:not(:disabled), [tabindex]:not([tabindex="-1"])') || [],
    );
    if (!focusable.length) return;
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
    <div className="ai-diff-overlay" onClick={onReject}>
      <div
        ref={modalRef}
        className="ai-diff-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-diff-title"
        aria-describedby="ai-diff-description"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <div className="ai-diff-header">
          <div id="ai-diff-title" className="ai-diff-title">
            <span className="material-symbols-outlined" aria-hidden="true">auto_awesome</span>
            AI 修改对比 · {action}
          </div>
          <div className="ai-diff-actions">
            <button className="ai-diff-btn select-all" onClick={selectAll}>全选</button>
            <button className="ai-diff-btn select-none" onClick={selectNone}>取消全选</button>
            <button className="ai-diff-btn close" aria-label="关闭" onClick={onReject}>
              <span className="material-symbols-outlined" aria-hidden="true">close</span>
            </button>
          </div>
        </div>

        <div id="ai-diff-description" className="ai-diff-stats">
          <span>共 {hunks.length} 处修改</span>
          <span className="added">+{totalAdded} 行</span>
          <span className="removed">-{totalRemoved} 行</span>
          <span>已选 {selectedCount}/{hunks.length}</span>
          <span className="separator">·</span>
          <span>{result.usage.promptTokens + result.usage.completionTokens} tokens</span>
          <span>¥{result.costCny.toFixed(4)}</span>
        </div>

        <div className="ai-diff-body">
          {hunks.map((hunk) => (
            <DiffHunk
              key={hunk.id}
              hunk={hunk}
              selected={selectedIds.has(hunk.id)}
              onToggle={() => toggleHunk(hunk.id)}
            />
          ))}
        </div>

        <div className="ai-diff-footer">
          <button className="ai-diff-btn reject" onClick={onReject}>拒绝</button>
          <div style={{ flex: 1 }} />
          <button
            className="ai-diff-btn apply-selected"
            disabled={selectedCount === 0}
            onClick={() => onApply(selectedIds)}
          >
            采纳所选 ({selectedCount})
          </button>
          <button
            className="ai-diff-btn apply-all"
            onClick={() => onApply(new Set(hunks.map((h) => h.id)))}
          >
            全部接受
          </button>
        </div>
      </div>
    </div>
  );
}
