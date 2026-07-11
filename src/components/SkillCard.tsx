import type { Skill } from '../store/skillStore';

type SkillCardProps = {
  skill: Skill;
  active?: boolean;
  onClick?: () => void;
};

function sourceLabel(source: Skill['source']) {
  return source === 'plugin' ? 'Builtin' : 'User';
}

function statusLabel(skill: Skill) {
  if (skill.disabled) return '待审';
  if (skill.protected) return '健康';
  return '健康';
}

function statusClass(skill: Skill) {
  if (skill.disabled) return 'status-review';
  return 'status-healthy';
}

function iconToneClass(skill: Skill) {
  const text = `${skill.name} ${skill.category} ${skill.description}`.toLowerCase();
  if (/meeting|notes|image|caption|生产力/.test(text)) return 'skill-icon-warning';
  if (/deploy|preview/.test(text)) return 'skill-icon-danger';
  if (/git|sync|开发者/.test(text)) return 'skill-icon-success';
  if (/finance|lookup|金融/.test(text)) return 'skill-icon-midnight';
  if (/design|设计/.test(text)) return 'skill-icon-ai';
  return 'skill-icon-blue';
}

export function SkillCard({ skill, active = false, onClick }: SkillCardProps) {
  return (
    <button className={`card skill-card ${active ? 'active' : ''}`} type="button" onClick={onClick}>
      <div className="skill-card-header">
        <div className={`skill-icon ${iconToneClass(skill)}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 2a10 10 0 1 0 10 10H12V2z" />
            <path d="M12 2a10 10 0 0 1 10 10" />
          </svg>
        </div>
        <div>
          <div className="skill-name">{skill.name}</div>
          <div className="skill-source">{sourceLabel(skill.source)} · {skill.category || '未分类'}</div>
        </div>
      </div>
      <p className="skill-desc">{skill.description}</p>
      <div className="skill-meta">
        <div className="skill-stats">
          <span className="stat">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 2v20" />
              <path d="M2 12h20" />
            </svg>
            {Math.max(12, Math.round((skill.size || skill.name.length * 1000) / 100))}
          </span>
          <span className="stat">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            {skill.modifiedAt || '未知'}
          </span>
        </div>
        <span className={`status-pill ${statusClass(skill)}`}>{statusLabel(skill)}</span>
      </div>
    </button>
  );
}
