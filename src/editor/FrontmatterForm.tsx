export type FrontmatterDraft = {
  name: string;
  display: string;
  version: string;
  category: string;
  tags: string;
  author: string;
};

type FrontmatterFormProps = {
  value: FrontmatterDraft;
  onChange: (next: FrontmatterDraft) => void;
};

const fields: { key: keyof FrontmatterDraft; label: string }[] = [
  { key: 'name', label: 'name' },
  { key: 'display', label: 'display' },
  { key: 'version', label: 'version' },
  { key: 'category', label: 'category' },
  { key: 'tags', label: 'tags' },
  { key: 'author', label: 'author' },
];

export function FrontmatterForm({ value, onChange }: FrontmatterFormProps) {
  return (
    <div className="card-body editor-frontmatter-body">
      {fields.map((field) => (
        <div className="frontmatter-row" key={field.key}>
          <label htmlFor={`frontmatter-${field.key}`}>{field.label}</label>
          <input
            id={`frontmatter-${field.key}`}
            className="input"
            value={value[field.key]}
            onChange={(event) => onChange({ ...value, [field.key]: event.target.value })}
          />
        </div>
      ))}
    </div>
  );
}
