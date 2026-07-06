// CostBadge — 显示 AI 调用的 token 消耗和费用
import type { AiUsage } from '../../lib/ai';

export function CostBadge({
  usage,
  costCny,
  monthlyUsed,
  monthlyBudget,
}: {
  usage: AiUsage | null;
  costCny: number;
  monthlyUsed: number;
  monthlyBudget: number;
}) {
  const total = usage ? usage.promptTokens + usage.completionTokens : 0;
  const budgetPct = monthlyBudget > 0 ? Math.min(100, (monthlyUsed / monthlyBudget) * 100) : 0;
  const overBudget = monthlyUsed > monthlyBudget;

  return (
    <div className="ai-cost-badge">
      {usage && (
        <div className="ai-cost-row">
          <span className="ai-cost-label">本次</span>
          <span className="ai-cost-value">
            {total.toLocaleString()} tokens · ¥{costCny.toFixed(4)}
          </span>
        </div>
      )}
      <div className="ai-cost-row">
        <span className="ai-cost-label">本月</span>
        <span className={`ai-cost-value ${overBudget ? 'over' : ''}`}>
          ¥{monthlyUsed.toFixed(2)} / ¥{monthlyBudget.toFixed(0)}
        </span>
      </div>
      <div className="ai-cost-bar">
        <div
          className={`ai-cost-bar-fill ${overBudget ? 'over' : ''}`}
          style={{ width: `${budgetPct}%` }}
        />
      </div>
    </div>
  );
}
