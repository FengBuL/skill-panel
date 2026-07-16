import { DependencyGraph } from '../../components/DependencyGraph';
import { DependencyTable, type DependencyTableRow } from '../../components/DependencyTable';
import { PageHeader } from '../../components/PageHeader';
import { StatusPill } from '../../components/StatusPill';
import { useUIStore } from '../../store/uiStore';
import './Dependencies.css';

const dependencyRows: DependencyTableRow[] = [];

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
            <DependencyGraph nodes={[]} />
            <p className="text-sm text-secondary dep-note">尚未接入真实依赖拓扑。</p>
          </div>
        </section>

        <section className="card">
          <div className="card-header">
            <h2 className="card-title">风险摘要</h2>
          </div>
          <div className="card-body">
            <div className="dep-risk-row dep-risk-high">
              <StatusPill tone="warning">尚未接入</StatusPill>
              <span className="text-sm">暂无真实依赖分析结果</span>
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
          {dependencyRows.length ? null : <div className="aux-state">暂无依赖数据</div>}
        </div>
      </section>
    </div>
  );
}
