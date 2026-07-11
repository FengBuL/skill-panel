import type { ReactNode } from 'react';

type RiskSummaryProps = {
  tone: 'info' | 'review';
  label: string;
  children: ReactNode;
};

export function RiskSummary({ tone, label, children }: RiskSummaryProps) {
  return (
    <div className="risk-summary flex items-center gap-3">
      <span className={`status-pill status-${tone}`}>{label}</span>
      <span className="text-sm">{children}</span>
    </div>
  );
}
