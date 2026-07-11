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

const defaultItems: DependencyItem[] = [
  { name: 'humanizer', description: '文本润色', relation: '被调用', status: '正常', tone: 'healthy' },
  { name: 'web-search', description: '网络搜索', relation: '可选依赖', status: '正常', tone: 'healthy' },
  { name: 'old-feed-parser', description: '旧版订阅解析', relation: '历史依赖', status: '未找到', tone: 'archived' },
];

export function DependencyList({ items = defaultItems }: DependencyListProps) {
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
