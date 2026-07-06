// DiffHunk — 单个 diff hunk，支持勾选采纳
import { useState } from 'react';
import type { ParsedHunk } from '../../lib/ai';

export function DiffHunk({
  hunk,
  selected,
  onToggle,
}: {
  hunk: ParsedHunk;
  selected: boolean;
  onToggle: () => void;
}) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className={`ai-hunk ${selected ? 'selected' : ''}`}>
      <div className="ai-hunk-header" onClick={() => onToggle()}>
        <label className="ai-hunk-check" onClick={(e) => e.stopPropagation()}>
          <input type="checkbox" checked={selected} onChange={onToggle} />
        </label>
        <span className="ai-hunk-meta">
          行 {hunk.oldStart}–{hunk.oldStart + hunk.oldLines - 1}
        </span>
        <span className="ai-hunk-stats">
          <span className="added">+{hunk.addedCount}</span>
          <span className="removed">-{hunk.removedCount}</span>
        </span>
        <button
          className="ai-hunk-expand"
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}
        >
          <span className="material-symbols-outlined" aria-hidden="true">
            {expanded ? 'expand_less' : 'expand_more'}
          </span>
        </button>
      </div>
      {expanded && (
        <div className="ai-hunk-body">
          {hunk.lines.map((line, i) => (
            <div
              key={i}
              className={`ai-diff-line ${
                line.startsWith('+') ? 'add' : line.startsWith('-') ? 'del' : 'ctx'
              }`}
            >
              <span className="ai-diff-prefix">{line[0]}</span>
              <span className="ai-diff-text">{line.slice(1)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
