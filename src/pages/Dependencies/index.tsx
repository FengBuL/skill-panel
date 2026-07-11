import { DependencyGraph } from '../../components/DependencyGraph';
import { DependencyTable, type DependencyTableRow } from '../../components/DependencyTable';
import { PageHeader } from '../../components/PageHeader';
import { StatusPill } from '../../components/StatusPill';
import { useUIStore } from '../../store/uiStore';
import './Dependencies.css';

const dependencyRows: DependencyTableRow[] = [
  { skill: 'aihot-query', dependency: 'old-feed-parser', relation: '历史依赖', status: 'missing', advice: '移除引用或迁移到 web-search' },
  { skill: 'deploy-preview', dependency: 'cloudstudio-deploy', relation: '直接调用', status: 'healthy', advice: '—' },
  { skill: 'finance-lookup', dependency: 'westock-data', relation: '共享依赖', status: 'review', advice: '统一引用版本' },
  { skill: 'meeting-notes', dependency: 'humanizer', relation: '可选调用', status: 'healthy', advice: '—' },
];

export default function DependenciesPage() {
  const ui = useUIStore();

  return (
    <div className="dependencies-page">
      <PageHeader
        title="依赖分析"
        subtitle="梳理 Skill 之间的调用关系，发现缺失依赖与潜在风险"
        actions={<button className="btn btn-text" type="button" onClick={ui.exitSub}>返回</button>}
      />

      <div className="grid-2 dependencies-top-grid">
        <section className="card">
          <div className="card-header">
            <h2 className="card-title">依赖拓扑</h2>
          </div>
          <div className="card-body">
            <DependencyGraph nodes={[
              { label: 'aihot-query' },
              { label: 'humanizer' },
              { label: 'old-feed-parser', missing: true },
            ]} />
            <p className="text-sm text-secondary dep-note">红色边框表示缺失或未找到的依赖 Skill。</p>
          </div>
        </section>

        <section className="card">
          <div className="card-header">
            <h2 className="card-title">风险摘要</h2>
          </div>
          <div className="card-body">
            <div className="dep-risk-row dep-risk-high">
              <StatusPill tone="invalid">高风险</StatusPill>
              <span className="text-sm">1 个 Skill 缺少关键依赖</span>
            </div>
            <div className="dep-risk-row dep-risk-medium">
              <StatusPill tone="warning">中风险</StatusPill>
              <span className="text-sm">2 个 Skill 引用了已归档依赖</span>
            </div>
            <div className="dep-risk-row dep-risk-low">
              <StatusPill tone="healthy">正常</StatusPill>
              <span className="text-sm">39 个 Skill 依赖关系完整</span>
            </div>
          </div>
        </section>
      </div>

      <section className="card">
        <div className="card-header">
          <h2 className="card-title">依赖详情</h2>
        </div>
        <div className="card-body aux-card-body-flush">
          <DependencyTable rows={dependencyRows} />
        </div>
      </section>
    </div>
  );
}
