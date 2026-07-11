type FileTreeItem = {
  name: string;
  meta: string;
  depth?: number;
};

type FileTreeProps = {
  items?: FileTreeItem[];
};

const defaultItems: FileTreeItem[] = [
  { name: 'SKILL.md', meta: '2.4 KB' },
  { name: 'references/', meta: '3 个文件' },
  { name: 'api-notes.md', meta: '1.1 KB', depth: 1 },
  { name: 'examples.md', meta: '860 B', depth: 1 },
  { name: 'assets/', meta: '1 个文件' },
];

export function FileTree({ items = defaultItems }: FileTreeProps) {
  return (
    <div className="file-tree">
      {items.map((item) => (
        <div className="file-tree-row" style={{ paddingLeft: 12 + (item.depth || 0) * 22 }} key={`${item.name}-${item.meta}`}>
          <span className="file-tree-icon" aria-hidden="true">{item.name.endsWith('/') ? '▸' : '•'}</span>
          <span className="file-tree-name">{item.name}</span>
          <span className="file-tree-meta">{item.meta}</span>
        </div>
      ))}
    </div>
  );
}
