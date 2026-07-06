// AIRail — 编辑器右栏 AI 面板（动作列表 + 流式区 + CostBadge）
import type { AiStatus, AiVendor, AiResult, AiAction } from '../../lib/ai';
import { AI_ACTIONS } from '../../lib/ai';
import { CostBadge } from './CostBadge';

export function AIRail({
  status,
  stream,
  result,
  vendor,
  monthlyUsed,
  monthlyBudget,
  desensitize,
  onRun,
  onCancel,
}: {
  status: AiStatus;
  stream: string;
  result: AiResult | null;
  vendor: AiVendor;
  monthlyUsed: number;
  monthlyBudget: number;
  desensitize: boolean;
  onRun: (action: AiAction) => void;
  onCancel: () => void;
}) {
  const isGenerating = status === 'generating';

  return (
    <div className="ai-rail">
      <div className="ai-rail-header">
        <span className="material-symbols-outlined" aria-hidden="true">auto_awesome</span>
        <span className="ai-rail-title">AI 助手</span>
        <span className="ai-rail-vendor">{vendor.toUpperCase()}</span>
      </div>

      {desensitize && (
        <div className="ai-rail-warn">
          <span className="material-symbols-outlined" aria-hidden="true">shield</span>
          内容将发送至厂商 API（已脱敏）
        </div>
      )}

      <div className="ai-rail-actions">
        {AI_ACTIONS.map((action) => (
          <button
            key={action.id}
            className="ai-action-btn"
            disabled={isGenerating}
            onClick={() => onRun(action.id)}
          >
            <span className="material-symbols-outlined ai-action-icon" aria-hidden="true">
              {action.icon}
            </span>
            <span className="ai-action-label">
              {action.id === 'struct' && '完善结构'}
              {action.id === 'desc' && '优化描述'}
              {action.id === 'polish' && '润色正文'}
              {action.id === 'fm' && '生成 frontmatter'}
              {action.id === 'safe' && '安全审查'}
            </span>
          </button>
        ))}
      </div>

      {(stream || isGenerating) && (
        <div className="ai-stream-area">
          <div className="ai-stream-header">
            <span>生成中</span>
            {isGenerating && (
              <button className="ai-cancel-btn" onClick={onCancel}>
                <span className="material-symbols-outlined" aria-hidden="true">stop_circle</span>
                取消
              </button>
            )}
          </div>
          <div className="ai-stream-text">
            {stream}
            {isGenerating && <span className="ai-cursor" />}
          </div>
        </div>
      )}

      {result && status === 'idle' && (
        <div className="ai-result-area">
          <div className="ai-result-header">生成结果</div>
          <div className="ai-result-text">{result.content}</div>
        </div>
      )}

      <div className="ai-rail-footer">
        <CostBadge
          usage={result?.usage ?? null}
          costCny={result?.costCny ?? 0}
          monthlyUsed={monthlyUsed}
          monthlyBudget={monthlyBudget}
        />
      </div>
    </div>
  );
}
