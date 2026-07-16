type QualityCheckItem = {
  label: string;
  status: '通过' | '待审';
  tone?: 'healthy' | 'review';
};

type QualityCheckProps = {
  items?: QualityCheckItem[];
};

export function QualityCheck({ items = [] }: QualityCheckProps) {
  if (!items.length) {
    return <div className="aux-state">暂无校验结果</div>;
  }

  return (
    <div className="quality-list">
      {items.map((item) => (
        <div className="quality-row" key={item.label}>
          <span className={`status-pill status-${item.tone || 'healthy'}`}>{item.status}</span>
          <span className="text-sm">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
