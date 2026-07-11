import type { AiAction } from '../../lib/ai';

type AIMode = {
  id: AiAction;
  title: string;
  description: string;
};

type AIModeSelectorProps = {
  selected: AiAction;
  onSelect: (mode: AiAction) => void;
};

const modes: AIMode[] = [
  { id: 'polish', title: '润色表达', description: '让描述更简洁自然' },
  { id: 'struct', title: '结构优化', description: '重组章节与触发条件' },
  { id: 'safe', title: '安全审查', description: '检查敏感路径与权限描述' },
];

export function AIModeSelector({ selected, onSelect }: AIModeSelectorProps) {
  return (
    <div className="ai-mode-list">
      {modes.map((mode) => (
        <button
          key={mode.id}
          className={`ai-mode-option ${selected === mode.id ? 'active' : ''}`}
          type="button"
          onClick={() => onSelect(mode.id)}
        >
          <span className="ai-mode-title">{mode.title}</span>
          <span className="ai-mode-desc">{mode.description}</span>
        </button>
      ))}
    </div>
  );
}
