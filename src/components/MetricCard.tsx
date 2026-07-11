type MetricCardProps = {
  label: string;
  value: string | number;
  helper: string;
  tone?: 'default' | 'healthy' | 'review' | 'danger';
  onClick?: () => void;
};

export function MetricCard({ label, value, helper, tone = 'default', onClick }: MetricCardProps) {
  const classes = ['card', 'card-body', 'metric-card', `metric-card-${tone}`];

  return (
    <button type="button" className={classes.join(' ')} onClick={onClick}>
      <span className="section-title">{label}</span>
      <span className="metric-value">{value}</span>
      <span className="text-sm text-secondary mt-2">{helper}</span>
    </button>
  );
}
