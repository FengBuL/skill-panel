import type { ParsedHunk } from '../../lib/ai';
import { DiffHunk } from './DiffHunk';

type DiffPreviewProps = {
  hunks: ParsedHunk[];
  onAcceptAll: () => void;
  onRejectAll: () => void;
};

export function DiffPreview({ hunks, onAcceptAll, onRejectAll }: DiffPreviewProps) {
  const totalAdded = hunks.reduce((sum, hunk) => sum + hunk.addedCount, 0);
  const totalRemoved = hunks.reduce((sum, hunk) => sum + hunk.removedCount, 0);

  return (
    <div className="ai-page-diff">
      <div className="ai-page-diff-summary">
        <span>共 {hunks.length} 处修改</span>
        <span className="added">+{totalAdded} 行</span>
        <span className="removed">-{totalRemoved} 行</span>
      </div>
      <div className="ai-page-hunks">
        {hunks.map((hunk) => (
          <DiffHunk key={hunk.id} hunk={hunk} />
        ))}
      </div>
      <div className="ai-page-diff-footer">
        <button className="btn btn-primary" type="button" onClick={onAcceptAll}>采纳并写回</button>
        <button className="btn btn-text" type="button" onClick={onRejectAll}>拒绝</button>
      </div>
    </div>
  );
}
