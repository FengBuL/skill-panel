// 调用日志页 — wt-4-dashboard 职责
import { useEffect, useState } from 'react';
import { getCallLogs, type CallLogRow } from '../../lib/logs';
import './Logs.css';

export default function LogsPage() {
  const [logs, setLogs] = useState<CallLogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMock, setIsMock] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    getCallLogs('7d')
      .then(result => {
        if (!alive) return;
        setLogs(result.logs);
        setIsMock(result.isMock);
        setError('');
      })
      .catch(err => {
        if (!alive) return;
        setError(String(err));
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => { alive = false; };
  }, []);

  const successCount = logs.filter(log => log.status === 'ok').length;
  const totalTokens = logs.reduce((sum, log) => sum + log.tokens, 0);
  const topSkill = logs[0]?.skillName || '暂无';

  return (
    <div className="log-main">
      <div className="log-metrics">
        {[['总调用', String(logs.length), isMock ? '浏览器预览' : '真实日志'], ['成功率', logs.length ? `${Math.round((successCount / logs.length) * 100)}%` : '0%', `${successCount} 成功`], ['最常用', topSkill, '最近记录'], ['Token', String(totalTokens), '本周']].map(([l,v,t])=>(
          <div key={l} className="log-metric">
            <div className="log-metric-label">{l}</div><div className="log-metric-value">{v}</div><div className="log-metric-note">{t}</div>
          </div>
        ))}
      </div>
      {loading && <div className="log-state">加载调用日志...</div>}
      {error && <div className="log-state error">日志加载失败：{error}</div>}
      {!loading && !error && logs.length === 0 && <div className="log-state">暂无调用日志</div>}
      <div className="log-table-wrap">
        <table className="log-table">
          <thead><tr><th>时间</th><th>Skill</th><th>触发 Prompt</th><th>状态</th><th>耗时</th><th>Token</th></tr></thead>
          <tbody>
            {logs.map((log, i)=>(
              <tr key={`${log.time}-${i}`}><td>{log.time}</td><td>{log.skillName}</td><td>{log.prompt}</td><td><span className={`log-status ${log.status}`}>{log.status==='ok'?'成功':'失败'}</span></td><td>{(log.durationMs / 1000).toFixed(1)}s</td><td>{log.tokens}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
