import { MetricCard } from '../components/MetricCard';
import { PageHeader } from '../components/PageHeader';
import { RiskSummary } from '../components/RiskSummary';
import { SkillRowMini } from '../components/SkillRowMini';
import { useSkillStore, type Skill } from '../store/skillStore';
import { useUIStore } from '../store/uiStore';
import '../pages/Dashboard/Dashboard.css';

type RecentRow = {
  name: string;
  meta: string;
  time: string;
  status: string;
  tone: 'healthy' | 'review' | 'archived';
};

type AttentionRow = {
  name: string;
  meta: string;
  status: string;
  tone: 'healthy' | 'review' | 'archived';
};

function formatSource(source: Skill['source']) {
  return source === 'plugin' ? 'Builtin' : 'User';
}

function formatDate(value: string) {
  if (!value) return '未知';
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
    const [, month, day] = value.slice(0, 10).split('-');
    return `${Number(month)}月${Number(day)}日`;
  }
  return value;
}

function isAttention(skill: Skill) {
  return skill.disabled || !skill.description || skill.description === '(无描述)';
}

function toRecentRows(skills: Skill[]): RecentRow[] {
  if (!skills.length) return [];

  return [...skills]
    .sort((a, b) => String(b.modifiedAt).localeCompare(String(a.modifiedAt)))
    .slice(0, 4)
    .map((skill) => ({
      name: skill.name,
      meta: `${skill.category || '未分类'} · ${formatSource(skill.source)}`,
      time: formatDate(skill.modifiedAt),
      status: isAttention(skill) ? '待审' : '健康',
      tone: isAttention(skill) ? 'review' : 'healthy',
    }));
}

function toAttentionRows(skills: Skill[]): AttentionRow[] {
  if (!skills.length) return [];

  const rows: AttentionRow[] = skills.filter(isAttention).slice(0, 4).map((skill) => ({
    name: skill.name,
    meta: skill.disabled ? '已禁用，请确认是否归档' : '描述缺失或解析信息不足',
    status: skill.disabled ? '已归档' : '待审',
    tone: skill.disabled ? 'archived' : 'review',
  }));

  return rows;
}

export function DashboardView() {
  const ui = useUIStore();
  const skillStore = useSkillStore();
  const skills = skillStore.skills;
  const total = skills.length;
  const attention = skills.filter(isAttention).length;
  const healthy = Math.max(total - attention, 0);
  const archived = skills.filter((skill) => skill.disabled).length;
  const unarchived = Math.max(total - archived, 0);
  const todayCalls = '暂无数据';
  const recentRows = toRecentRows(skills);
  const attentionRows = toAttentionRows(skills);

  const openLibrary = () => {
    skillStore.clearFilters('source');
    skillStore.clearFilters('status');
    skillStore.clearFilters('category');
    ui.setMainView('library');
  };

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Skill 仓库概览与待处理事项"
        actions={<button className="btn btn-ghost" type="button" onClick={() => ui.enterSub('create')}>New Skill</button>}
      />

      <div className="grid-4 mb-4">
        <MetricCard label="Skill 总数" value={total} helper="上次扫描：2 分钟前" onClick={openLibrary} />
        <MetricCard label="健康状态" value={healthy} helper={`${attention} 个需要关注`} tone="healthy" onClick={openLibrary} />
        <MetricCard label="今日调用" value={todayCalls} helper="尚未接入真实调用统计" onClick={() => ui.enterSub('logs')} />
        <MetricCard label="未归档" value={unarchived} helper={`${archived} 个已归档`} onClick={openLibrary} />
      </div>

      <div className="grid-2">
        <section className="card">
          <div className="card-header">
            <h2 className="card-title">最近修改</h2>
            <button className="btn btn-text btn-sm" type="button" onClick={openLibrary}>查看全部</button>
          </div>
          <div className="card-body card-body-flush">
            <table className="table">
              <tbody>
                {recentRows.map((row) => (
                  <SkillRowMini key={`${row.name}-${row.time}`} {...row} />
                ))}
              </tbody>
            </table>
            {recentRows.length ? null : <div className="aux-state">暂无最近修改记录</div>}
          </div>
        </section>

        <section className="card">
          <div className="card-header">
            <h2 className="card-title">需要关注</h2>
          </div>
          <div className="card-body card-body-flush">
            <table className="table">
              <tbody>
                {attentionRows.map((row) => (
                  <SkillRowMini key={`${row.name}-${row.meta}`} {...row} />
                ))}
              </tbody>
            </table>
            {attentionRows.length ? null : <div className="aux-state">暂无需要关注的 Skill</div>}
          </div>
        </section>
      </div>

      <section className="card mt-4">
        <div className="card-header">
          <h2 className="card-title">依赖提醒</h2>
        </div>
        <div className="card-body">
          <RiskSummary tone="info" label="尚未接入">
            依赖分析结果需要进入依赖页面后基于真实 Skill 文件生成。
          </RiskSummary>
        </div>
      </section>
    </>
  );
}
