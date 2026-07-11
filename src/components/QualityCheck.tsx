type QualityCheckItem = {
  label: string;
  status: '通过' | '待审';
  tone?: 'healthy' | 'review';
};

type QualityCheckProps = {
  items?: QualityCheckItem[];
};

const defaultItems: QualityCheckItem[] = [
  { status: '通过', tone: 'healthy', label: 'SKILL.md 结构完整' },
  { status: '通过', tone: 'healthy', label: 'references/ 目录文件齐全' },
  { status: '通过', tone: 'healthy', label: 'Tauri 命令契约无变更' },
];

export function QualityCheck({ items = defaultItems }: QualityCheckProps) {
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
