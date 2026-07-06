import { ErrorBoundary } from './common/ErrorBoundary';
import { SkillPanelWorkspace } from './SkillPanelWorkspace';

export function App() {
  return (
    <ErrorBoundary title="Skill Panel" description="应用遇到异常，请刷新或重启后继续。">
      <SkillPanelWorkspace />
    </ErrorBoundary>
  );
}
