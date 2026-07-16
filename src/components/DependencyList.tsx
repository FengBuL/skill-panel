type DependencyItem = {
  name: string;
  description: string;
  relation: string;
  status: string;
  tone: 'healthy' | 'archived' | 'review';
};

type DependencyListProps = {
  items?: DependencyItem[];
};

export function DependencyList({ items = [] }: DependencyListProps) {
  if (!items.length) {
    return <div className="aux-state">暂无依赖数据</div>;
  }

  return (
    <table className="table detail-dependency-table">
      <thead>
        <tr>
          <th>Skill</th>
          <th>关系</th>
          <th>状态</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={`${item.name}-${item.relation}`}>
            <td>
              <strong>{item.name}</strong>
              <div className="text-xs text-muted">{item.description}</div>
            </td>
            <td>{item.relation}</td>
            <td><span className={`status-pill status-${item.tone}`}>{item.status}</span></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
