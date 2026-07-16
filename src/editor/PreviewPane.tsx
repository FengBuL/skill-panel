type PreviewPaneProps = {
  markdown: string;
};

function parseSections(markdown: string) {
  const lines = markdown.split('\n');
  const title = lines.find((line) => line.startsWith('# '))?.replace(/^#\s+/, '') || '暂无数据';
  const sections: { heading: string; items: string[]; paragraphs: string[] }[] = [];
  let current: { heading: string; items: string[]; paragraphs: string[] } | null = null;

  for (const line of lines) {
    if (line.startsWith('## ')) {
      current = { heading: line.replace(/^##\s+/, ''), items: [], paragraphs: [] };
      sections.push(current);
    } else if (current && line.startsWith('- ')) {
      current.items.push(line.replace(/^-\s+/, ''));
    } else if (current && line.trim() && !line.startsWith('#')) {
      current.paragraphs.push(line.trim());
    }
  }

  return { title, sections };
}

export function PreviewPane({ markdown }: PreviewPaneProps) {
  const { title, sections } = parseSections(markdown);

  return (
    <div className="card editor-pane">
      <div className="card-header"><h2 className="card-title">Preview</h2></div>
      <div className="card-body markdown-preview">
        <h1>{title}</h1>
        {sections.map((section, sectionIndex) => (
          <section key={`${section.heading}-${sectionIndex}`}>
            <h2>{section.heading}</h2>
            {section.paragraphs.map((paragraph, paragraphIndex) => <p key={`${sectionIndex}-${paragraphIndex}`}>{paragraph}</p>)}
            {section.items.length ? (
              <ul>
                {section.items.map((item, itemIndex) => <li key={`${sectionIndex}-${itemIndex}`}>{item}</li>)}
              </ul>
            ) : null}
          </section>
        ))}
      </div>
    </div>
  );
}
