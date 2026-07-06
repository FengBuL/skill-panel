// 调用日志页 — wt-4-dashboard 职责
import { Button } from '../../components/ui';
import './Logs.css';

const LOGS = [
  { time: '2分钟前', skill: 'Browser Control', prompt: '打开 localhost:3000 截图', status: 'ok', dur: '1.2s', tokens: 340 },
  { time: '1小时前', skill: 'A-Share Daily Update', prompt: '更新今天的A股数据', status: 'ok', dur: '3.4s', tokens: 890 },
  { time: '3小时前', skill: 'PDF Analysis Core', prompt: '解析这份财报PDF', status: 'fail', dur: '0.8s', tokens: 120 },
  { time: '昨天', skill: 'Claude-to-IM Bridge', prompt: '把回复转发到飞书', status: 'ok', dur: '0.9s', tokens: 210 },
];

export default function LogsPage() {
  return (
    <div style={{ flex: 1, overflow: 'auto', padding: '16px 20px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 16 }}>
        {[['总调用', '128', '本周'], ['成功率', '94%', '120 成功'], ['最常用', 'Browser Control', '42 次'], ['Token', '18.4k', '本周']].map(([l,v,t])=>(
          <div key={l} style={{background:'#fff',border:'1px solid var(--border)',borderRadius:'var(--radius-lg)',padding:14}}>
            <div style={{fontSize:11,color:'var(--text-muted)'}}>{l}</div><div style={{fontSize:20,fontWeight:600}}>{v}</div><div style={{fontSize:10,color:'var(--success)'}}>{t}</div>
          </div>
        ))}
      </div>
      <table className="log-table">
        <tr><th>时间</th><th>Skill</th><th>触发 Prompt</th><th>状态</th><th>耗时</th><th>Token</th></tr>
        {LOGS.map((l,i)=>(
          <tr key={i}><td>{l.time}</td><td>{l.skill}</td><td>{l.prompt}</td><td><span className={`log-status ${l.status}`}>{l.status==='ok'?'成功':'失败'}</span></td><td>{l.dur}</td><td>{l.tokens}</td></tr>
        ))}
      </table>
    </div>
  );
}
