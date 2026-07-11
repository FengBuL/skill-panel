import { StatusPill } from './StatusPill';

export type LogTableRow = {
  time: string;
  skillName: string;
  prompt: string;
  tokens: string;
  duration: string;
  status: 'ok' | 'warning' | 'fail' | 'archived';
};

const statusMeta = {
  ok: { label: '成功', tone: 'healthy' as const },
  warning: { label: '警告', tone: 'warning' as const },
  fail: { label: '失败', tone: 'invalid' as const },
  archived: { label: '已归档', tone: 'archived' as const },
};

export function LogTable({ rows }: { rows: LogTableRow[] }) {
  return (
    <table className="table aux-table">
      <thead>
        <tr>
          <th>时间</th>
          <th>Skill</th>
          <th>输入摘要</th>
          <th>Token</th>
          <th>耗时</th>
          <th>状态</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(row => {
          const status = statusMeta[row.status];
          return (
            <tr key={`${row.time}-${row.skillName}`}>
              <td className="text-sm">{row.time}</td>
              <td><strong>{row.skillName}</strong></td>
              <td className="text-sm">{row.prompt}</td>
              <td className="text-sm">{row.tokens}</td>
              <td className="text-sm">{row.duration}</td>
              <td><StatusPill tone={status.tone}>{status.label}</StatusPill></td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
