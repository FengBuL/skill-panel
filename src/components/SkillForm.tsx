import type { ChangeEvent } from 'react';

export type SkillFormValue = {
  name: string;
  displayName: string;
  category: string;
  description: string;
  targetDir: string;
};

type SkillFormProps = {
  value: SkillFormValue;
  onChange: (value: SkillFormValue) => void;
};

export function SkillForm({ value, onChange }: SkillFormProps) {
  const update = (key: keyof SkillFormValue) => (event: ChangeEvent<HTMLInputElement>) => {
    onChange({ ...value, [key]: event.target.value });
  };

  return (
    <>
      <div className="form-group">
        <label htmlFor="new-skill-name">Skill 名称</label>
        <input id="new-skill-name" className="input" value={value.name} onChange={update('name')} placeholder="例如：my-custom-skill" />
      </div>
      <div className="form-group">
        <label htmlFor="new-skill-display">显示名称</label>
        <input id="new-skill-display" className="input" value={value.displayName} onChange={update('displayName')} placeholder="例如：我的自定义 Skill" />
      </div>
      <div className="form-group">
        <label htmlFor="new-skill-category">分类</label>
        <input id="new-skill-category" className="input" value={value.category} onChange={update('category')} placeholder="例如：Productivity" />
      </div>
      <div className="form-group">
        <label htmlFor="new-skill-desc">描述</label>
        <input id="new-skill-desc" className="input" value={value.description} onChange={update('description')} placeholder="简要描述功能" />
      </div>
    </>
  );
}
