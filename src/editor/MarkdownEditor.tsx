type MarkdownEditorProps = {
  value: string;
  onChange: (next: string) => void;
  readOnly?: boolean;
};

export function MarkdownEditor({ value, onChange, readOnly = false }: MarkdownEditorProps) {
  return (
    <div className="card-body editor-markdown-body">
      <textarea
        className="textarea editor-markdown-textarea"
        aria-label="Markdown body"
        spellCheck={false}
        value={value}
        readOnly={readOnly}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
