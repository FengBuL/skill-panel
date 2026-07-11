type ValidationCheck = {
  id: string;
  label: string;
  status: string;
  detail?: string;
};

type ValidationResultProps = {
  checks?: ValidationCheck[];
};

const fallbackChecks: ValidationCheck[] = [
  { id: 'frontmatter', label: 'Frontmatter 字段完整', status: 'ok' },
  { id: 'markdown', label: 'Markdown 结构正常', status: 'ok' },
  { id: 'trigger', label: '触发条件可增加英文关键词', status: 'warn' },
];

function toneForStatus(status: string) {
  if (status === 'ok') return 'healthy';
  if (status === 'warn') return 'review';
  return 'archived';
}

function labelForStatus(status: string) {
  if (status === 'ok') return '通过';
  if (status === 'warn') return '建议';
  return '待审';
}

export function ValidationResult({ checks = fallbackChecks }: ValidationResultProps) {
  return (
    <div className="validation-result-list">
      {checks.map((check) => (
        <div className={`validation-result-row validation-result-${check.status}`} key={check.id}>
          <span className={`status-pill status-${toneForStatus(check.status)}`}>{labelForStatus(check.status)}</span>
          <span className="text-sm">{check.detail ? `${check.label}：${check.detail}` : check.label}</span>
        </div>
      ))}
    </div>
  );
}
