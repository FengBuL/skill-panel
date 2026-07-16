type ValidationCheck = {
  id: string;
  label: string;
  status: string;
  detail?: string;
};

type ValidationResultProps = {
  checks?: ValidationCheck[];
};

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

export function ValidationResult({ checks = [] }: ValidationResultProps) {
  if (!checks.length) {
    return <div className="aux-state">暂无校验结果</div>;
  }

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
