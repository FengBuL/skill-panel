type FileTreeItem = {
  name: string;
  meta: string;
  depth?: number;
};

type FileTreeProps = {
  items?: FileTreeItem[];
};

export function FileTree({ items = [] }: FileTreeProps) {
  if (!items.length) {
    return <div className="aux-state">暂无文件数据</div>;
  }

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
