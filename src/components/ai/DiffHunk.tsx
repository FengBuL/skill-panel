import { useState } from 'react';
import type { ParsedHunk } from '../../lib/ai';

export function DiffHunk({
  hunk,
  selected = false,
  onToggle,
}: {
  hunk: ParsedHunk;
  selected?: boolean;
  onToggle?: () => void;
  onAccept?: () => void;
  onReject?: () => void;
}) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className={`ai-hunk ${selected ? 'selected' : ''}`}>
      <div className="ai-hunk-header" onClick={() => onToggle?.()}>
        <span className="ai-hunk-meta">
          行 {hunk.oldStart}–{hunk.oldStart + hunk.oldLines - 1}
        </span>
        <span className="ai-hunk-stats">
          <span className="added">+{hunk.addedCount}</span>
          <span className="removed">-{hunk.removedCount}</span>
        </span>
        <button
          className="ai-hunk-expand"
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}
        >
          <span aria-hidden="true">{expanded ? '⌃' : '⌄'}</span>
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
              <span className="ai-diff-line-number">{line.startsWith('+') ? hunk.newStart + i : hunk.oldStart + i}</span>
              <span className="ai-diff-prefix">{line[0]}</span>
              <span className="ai-diff-text">{line.slice(1)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
