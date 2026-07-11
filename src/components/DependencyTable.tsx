import { StatusPill } from './StatusPill';

export type DependencyTableRow = {
  skill: string;
  dependency: string;
  relation: string;
  status: 'missing' | 'healthy' | 'review';
  advice: string;
};

const statusMeta = {
  missing: { label: '缺失', tone: 'invalid' as const },
  healthy: { label: '正常', tone: 'healthy' as const },
  review: { label: '版本不一致', tone: 'warning' as const },
};

export function DependencyTable({ rows }: { rows: DependencyTableRow[] }) {
  return (
    <table className="table aux-table">
      <thead>
        <tr>
          <th>Skill</th>
          <th>依赖项</th>
          <th>关系类型</th>
          <th>状态</th>
          <th>建议</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(row => {
          const status = statusMeta[row.status];
          return (
            <tr key={`${row.skill}-${row.dependency}`}>
              <td><strong>{row.skill}</strong></td>
              <td>{row.dependency}</td>
              <td>{row.relation}</td>
              <td><StatusPill tone={status.tone}>{status.label}</StatusPill></td>
              <td className="text-sm">{row.advice}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
