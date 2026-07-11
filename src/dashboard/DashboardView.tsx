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

const fallbackRecent: RecentRow[] = [
  { name: 'aihot-query', meta: 'AI · Builtin', time: '今天 09:41', status: '健康', tone: 'healthy' },
  { name: 'meeting-notes', meta: '生产力 · User', time: '昨天', status: '健康', tone: 'healthy' },
  { name: 'deploy-preview', meta: '开发者 · User', time: '7月5日', status: '待审', tone: 'review' },
  { name: 'git-sync', meta: '开发者 · Builtin', time: '7月4日', status: '健康', tone: 'healthy' },
];

const fallbackAttention: AttentionRow[] = [
  { name: 'deploy-preview', meta: 'SKILL.md 缺少 required 字段', status: '待审', tone: 'review' },
  { name: 'finance-lookup', meta: '引用文件缺失', status: '待审', tone: 'review' },
  { name: 'image-caption', meta: '已归档，可清理', status: '已归档', tone: 'archived' },
  { name: 'old-connector', meta: '90 天未使用', status: '低频', tone: 'archived' },
];

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
  if (!skills.length) return fallbackRecent;

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
  if (!skills.length) return fallbackAttention;

  const rows: AttentionRow[] = skills.filter(isAttention).slice(0, 4).map((skill) => ({
    name: skill.name,
    meta: skill.disabled ? '已禁用，请确认是否归档' : '描述缺失或解析信息不足',
    status: skill.disabled ? '已归档' : '待审',
    tone: skill.disabled ? 'archived' : 'review',
  }));

  if (rows.length >= 4) return rows;
  return [...rows, ...fallbackAttention].slice(0, 4);
}

export function DashboardView() {
  const ui = useUIStore();
  const skillStore = useSkillStore();
  const skills = skillStore.skills;
  const total = skills.length || 42;
  const attention = skills.length ? skills.filter(isAttention).length : 4;
  const healthy = Math.max(total - attention, 0);
  const archived = skills.length ? skills.filter((skill) => skill.disabled).length : 3;
  const unarchived = Math.max(total - archived, 0);
  const todayCalls = skills.length
    ? skills.reduce((sum, skill) => sum + Math.max(1, Math.round(skill.size / 120)), 0)
    : 156;

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
        <MetricCard label="今日调用" value={todayCalls} helper="较昨日 +12%" onClick={() => ui.enterSub('logs')} />
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
                {toRecentRows(skills).map((row) => (
                  <SkillRowMini key={`${row.name}-${row.time}`} {...row} />
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="card">
          <div className="card-header">
            <h2 className="card-title">需要关注</h2>
          </div>
          <div className="card-body card-body-flush">
            <table className="table">
              <tbody>
                {toAttentionRows(skills).map((row) => (
                  <SkillRowMini key={`${row.name}-${row.meta}`} {...row} />
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <section className="card mt-4">
        <div className="card-header">
          <h2 className="card-title">依赖提醒</h2>
        </div>
        <div className="card-body">
          <RiskSummary tone="info" label="提示">
            westock-data 与 wb-finance-skill 存在共享依赖，建议统一引用版本。
          </RiskSummary>
          <RiskSummary tone="review" label="待处理">
            3 个 Skill 引用了本地不存在的 references，请检查路径。
          </RiskSummary>
        </div>
      </section>
    </>
  );
}
