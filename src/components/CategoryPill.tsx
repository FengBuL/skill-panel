type CategoryPillProps = {
  label: string;
  active?: boolean;
  onClick?: () => void;
};

function categoryTone(label: string) {
  const tones: Record<string, string> = {
    全部: 'all',
    AI: 'ai',
    生产力: 'productivity',
    开发者: 'developer',
    设计: 'design',
    金融: 'finance',
    已归档: 'archived',
  };
  return tones[label] ?? 'neutral';
}

export function CategoryPill({ label, active = false, onClick }: CategoryPillProps) {
  return (
    <button
      className={`pill category-pill category-pill-${categoryTone(label)} ${active ? 'pill-active' : 'pill-default'}`}
      type="button"
      onClick={onClick}
      aria-pressed={active}
    >
      {label}
    </button>
  );
}
