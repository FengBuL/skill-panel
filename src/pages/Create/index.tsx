import { useState } from 'react';
import { ActionButton } from '../../components/ActionButton';
import { Modal } from '../../components/Modal';
import { SkillForm, type SkillFormValue } from '../../components/SkillForm';
import { TemplateSelector, type SkillTemplate } from '../../components/TemplateSelector';
import { showToast } from '../../components/Toast';
import { createSkill } from '../../lib/skills';
import { mapSummary } from '../../lib/invoke';
import { useSkillStore } from '../../store/skillStore';
import { useUIStore } from '../../store/uiStore';
import './Create.css';

const defaultMarkdown = '# My Awesome Skill\n\nDescribe what this skill does.\n\n## When To Use\n\nDescribe scenarios.\n\n## Steps\n\n1. First step\n\n## Safety\n\nDescribe safety.';

export default function CreatePage() {
  const ui = useUIStore();
  const skillStore = useSkillStore();
  const [form, setForm] = useState<SkillFormValue>({
    name: 'my-awesome-skill',
    displayName: '',
    category: '',
    description: '',
    targetDir: '~/.codex/skills',
  });
  const [template, setTemplate] = useState<SkillTemplate>('blank');
  const [aiPrompt, setAiPrompt] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const canCreate = form.name.trim().length > 0 && form.targetDir.trim().length > 0;

  const submit = async () => {
    if (!canCreate || saving) {
      setError('名称和目标目录不能为空');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const created = await createSkill({
        name: form.name.trim(),
        description: form.description.trim(),
        source: 'codex-user',
        targetDirectory: form.targetDir.trim(),
        markdown: defaultMarkdown,
      });
      skillStore.setSkills([...skillStore.skills, mapSummary(created)]);
      showToast('Skill 已创建', '');
      ui.exitSub();
    } catch (err) {
      setError(String(err));
      showToast('创建失败', '');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="create-page">
      <div className="page-header">
        <h1 className="page-title">Library</h1>
        <p className="page-subtitle">创建新 Skill 的弹窗流程示意</p>
      </div>

      <Modal
        title="新建 Skill"
        onClose={ui.exitSub}
        footer={(
          <>
            <ActionButton variant="text" onClick={ui.exitSub}>取消</ActionButton>
            <ActionButton variant="primary" disabled={!canCreate || saving} onClick={submit}>
              {saving ? '创建中...' : '创建并编辑'}
            </ActionButton>
          </>
        )}
      >
        <SkillForm value={form} onChange={setForm} />

        <div className="section-title create-section-title">选择模板</div>
        <TemplateSelector value={template} onChange={setTemplate} />

        <div className="section-title create-section-title">AI 辅助创建</div>
        <p className="text-sm text-secondary create-ai-note">输入一句话描述，AI 可生成初稿，但仍需你审阅和确认。</p>
        <textarea
          className="textarea"
          value={aiPrompt}
          onChange={event => setAiPrompt(event.target.value)}
          placeholder="例如：帮我创建一个能查询本地天气的 Skill"
        />
        <ActionButton variant="text" className="create-ai-button" onClick={() => showToast('AI 初稿入口已准备', '')}>
          用 AI 生成初稿
        </ActionButton>
        {error ? <div className="create-error">{error}</div> : null}
      </Modal>
    </div>
  );
}
