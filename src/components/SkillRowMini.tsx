type SkillRowMiniProps = {
  name: string;
  meta: string;
  time?: string;
  status: string;
  tone: 'healthy' | 'review' | 'archived';
};

export function SkillRowMini({ name, meta, time, status, tone }: SkillRowMiniProps) {
  return (
    <tr>
      <td>
        <strong>{name}</strong>
        <div className="text-xs text-muted">{meta}</div>
      </td>
      {time ? <td className="text-sm">{time}</td> : null}
      <td>
        <span className={`status-pill status-${tone}`}>{status}</span>
      </td>
    </tr>
  );
}
