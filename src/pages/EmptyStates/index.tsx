import { ActionButton } from '../../components/ActionButton';
import { ErrorState } from '../../components/ErrorState';
import { PageHeader } from '../../components/PageHeader';
import { EmptyState } from '../../common/EmptyState';
import { useUIStore } from '../../store/uiStore';
import './EmptyStates.css';

export default function EmptyStatesPage() {
  const ui = useUIStore();

  return (
    <div className="empty-states-page">
      <PageHeader title="空状态 / 异常状态" subtitle="统一 empty、loading、error、权限状态的设计语言" />

      <div className="states-grid">
        <section className="card state-card">
          <EmptyState
            state="empty"
            title="还没有发现 Skill"
            description="请先扫描 Skill 根目录，或检查设置中的目录配置是否正确。"
            action={(
              <div className="empty-actions">
                <ActionButton variant="primary">立即扫描</ActionButton>
                <ActionButton variant="text" onClick={() => ui.enterSub('settings')}>打开设置</ActionButton>
              </div>
            )}
          />
        </section>

        <section className="card state-card">
          <EmptyState
            state="filtered-empty"
            title="无搜索结果"
            description="没有找到匹配的 Skill，请尝试其他关键词或清除筛选条件。"
            action={(
              <div className="empty-actions">
                <ActionButton variant="primary">清除筛选</ActionButton>
                <ActionButton variant="text">返回全部</ActionButton>
              </div>
            )}
          />
        </section>

        <section className="card state-card">
          <EmptyState
            state="loading"
            title="正在扫描"
            description="正在读取 Skill 目录，请稍候。已处理 12 / 42 个文件。"
            progress={28}
          />
        </section>

        <section className="card state-card state-card-error">
          <ErrorState
            title="目录无法访问"
            description="当前没有权限读取 ~/.../skills，请检查目录权限或更换根目录。"
            primaryAction={<ActionButton variant="danger">重试</ActionButton>}
            secondaryAction={<ActionButton variant="text" onClick={() => ui.enterSub('settings')}>更改目录</ActionButton>}
          />
        </section>
      </div>
    </div>
  );
}
