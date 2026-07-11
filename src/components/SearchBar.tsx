type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export function SearchBar({ value, onChange, placeholder = '搜索 Skill 名称、标签或描述...' }: SearchBarProps) {
  return (
    <div className="search-box">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      <input type="text" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} aria-label="搜索 Skill" />
    </div>
  );
}
