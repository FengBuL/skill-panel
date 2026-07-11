export type SkillTemplate = 'blank' | 'api' | 'ai';

const templates: { id: SkillTemplate; name: string; desc: string; icon: 'file' | 'layout' | 'pie' }[] = [
  { id: 'blank', name: '空白模板', desc: '从空 SKILL.md 开始', icon: 'file' },
  { id: 'api', name: 'API 调用', desc: '封装一个外部 API', icon: 'layout' },
  { id: 'ai', name: 'AI 助手', desc: '基于 LLM 的辅助能力', icon: 'pie' },
];

function TemplateIcon({ icon }: { icon: 'file' | 'layout' | 'pie' }) {
  if (icon === 'layout') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18" />
        <path d="M9 21V9" />
      </svg>
    );
  }
  if (icon === 'pie') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 2a10 10 0 1 0 10 10H12V2z" />
        <path d="M12 2a10 10 0 0 1 10 10" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
    </svg>
  );
}

export function TemplateSelector({ value, onChange }: { value: SkillTemplate; onChange: (value: SkillTemplate) => void }) {
  return (
    <div className="template-grid" role="list" aria-label="选择模板">
      {templates.map(template => (
        <button
          className={`template-card ${value === template.id ? 'selected' : ''}`}
          type="button"
          key={template.id}
          onClick={() => onChange(template.id)}
        >
          <span className="template-icon"><TemplateIcon icon={template.icon} /></span>
          <span className="template-name">{template.name}</span>
          <span className="template-desc">{template.desc}</span>
        </button>
      ))}
    </div>
  );
}
