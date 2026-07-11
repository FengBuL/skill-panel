import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActionButton } from '../../components/ActionButton';
import { LogTable, type LogTableRow } from '../../components/LogTable';
import { PageHeader } from '../../components/PageHeader';
import { StatusPill } from '../../components/StatusPill';
import { getCallLogs, type CallLogRow } from '../../lib/logs';
import './Logs.css';

const fallbackRows: LogTableRow[] = [
  { time: '今天 09:41:12', skillName: 'aihot-query', prompt: '“今天 AI 圈有什么”', tokens: '1,240', duration: '1.2s', status: 'ok' },
  { time: '今天 09:38:55', skillName: 'meeting-notes', prompt: '“总结刚刚的会议”', tokens: '2,860', duration: '3.4s', status: 'ok' },
  { time: '今天 09:15:02', skillName: 'deploy-preview', prompt: '“部署当前目录”', tokens: '—', duration: '8.1s', status: 'warning' },
  { time: '昨天 18:22:41', skillName: 'git-sync', prompt: '“查看仓库状态”', tokens: '—', duration: '0.4s', status: 'ok' },
  { time: '昨天 16:05:33', skillName: 'finance-lookup', prompt: '“查一下 NVDA”', tokens: '420', duration: '0.9s', status: 'fail' },
  { time: '7月5日 11:30:18', skillName: 'image-caption', prompt: '“给这张图写说明”', tokens: '3,120', duration: '4.7s', status: 'archived' },
];

function toLogTableRow(log: CallLogRow): LogTableRow {
  return {
    time: log.time,
    skillName: log.skillName,
    prompt: `“${log.prompt}”`,
    tokens: log.tokens ? log.tokens.toLocaleString('en-US') : '—',
    duration: `${(log.durationMs / 1000).toFixed(1)}s`,
    status: log.status === 'ok' ? 'ok' : 'fail',
  };
}

export default function LogsPage() {
  const [logs, setLogs] = useState<CallLogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadLogs = useCallback(() => {
    setLoading(true);
    getCallLogs('7d')
      .then(result => {
        setLogs(result.logs);
        setError('');
      })
      .catch(err => {
        setError(String(err));
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const rows = useMemo(() => (logs.length ? logs.map(toLogTableRow) : fallbackRows), [logs]);
  const selected = rows[0];

  return (
    <div className="logs-page">
      <PageHeader
        title="调用日志"
        subtitle="查看 Skill 调用记录、token 消耗与执行状态"
        actions={(
          <ActionButton
            variant="ghost"
            size="small"
            className="logs-refresh-action"
            disabled={loading}
            onClick={loadLogs}
            icon={(
              <>
                <span className="material-symbols-outlined logs-refresh-symbol" aria-hidden="true">refresh</span>
                <svg className="logs-refresh-fallback" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                  <path d="M3 21v-5h5" />
                  <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                  <path d="M21 3v5h-5" />
                </svg>
              </>
            )}
          >
            刷新
          </ActionButton>
        )}
      />

      <div className="logs-toolbar">
        <div className="search-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input type="text" placeholder="搜索 Skill 名称或调用关键词..." aria-label="搜索日志" />
        </div>
        <div className="logs-filter-group">
          <button className="pill pill-active" type="button">全部</button>
          <button className="pill pill-default" type="button">成功</button>
          <button className="pill pill-default" type="button">失败</button>
          <ActionButton
            variant="text"
            size="small"
            icon={(
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
              </svg>
            )}
          >
            筛选
          </ActionButton>
        </div>
      </div>

      {loading ? <div className="aux-state">加载调用日志...</div> : null}
      {error ? <div className="aux-state aux-state-error">日志加载失败：{error}</div> : null}

      <section className="card">
        <div className="card-body aux-card-body-flush">
          <LogTable rows={rows} />
        </div>
      </section>

      <section className="card logs-detail-card">
        <div className="card-header">
          <h2 className="card-title">日志详情</h2>
        </div>
        <div className="card-body">
          <div className="grid-2">
            <div>
              <div className="detail-row"><span className="detail-label">调用 ID</span><span className="detail-value">log_20260707_094112</span></div>
              <div className="detail-row"><span className="detail-label">Skill</span><span className="detail-value">{selected.skillName}</span></div>
              <div className="detail-row"><span className="detail-label">用户输入</span><span className="detail-value">{selected.prompt.replace(/[“”]/g, '')}</span></div>
            </div>
            <div>
              <div className="detail-row"><span className="detail-label">输出 token</span><span className="detail-value">{selected.tokens}</span></div>
              <div className="detail-row"><span className="detail-label">执行耗时</span><span className="detail-value">{selected.duration}</span></div>
              <div className="detail-row"><span className="detail-label">状态</span><span className="detail-value"><StatusPill tone="healthy">成功</StatusPill></span></div>
            </div>
          </div>
          <p className="text-sm text-secondary logs-safe-note">完整请求与响应内容仅保存在本地日志文件，已脱敏处理。</p>
        </div>
      </section>
    </div>
  );
}
