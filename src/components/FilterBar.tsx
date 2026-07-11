type FilterBarProps = {
  onFilter?: () => void;
  onSort?: () => void;
};

export function FilterBar({ onFilter, onSort }: FilterBarProps) {
  return (
    <div className="flex gap-2">
      <button className="btn btn-text btn-sm" type="button" onClick={onFilter}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
        </svg>
        筛选
      </button>
      <button className="btn btn-text btn-sm" type="button" onClick={onSort}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m3 16 4 4 4-4" />
          <path d="M7 20V4" />
          <path d="m21 8-4-4-4 4" />
          <path d="M17 4v16" />
        </svg>
        排序
      </button>
    </div>
  );
}
