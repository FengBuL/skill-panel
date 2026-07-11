type MarkdownEditorProps = {
  value: string;
  onChange: (next: string) => void;
};

export function MarkdownEditor({ value, onChange }: MarkdownEditorProps) {
  return (
    <div className="card-body editor-markdown-body">
      <textarea
        className="textarea editor-markdown-textarea"
        aria-label="Markdown body"
        spellCheck={false}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
