type DependencyGraphNode = {
  label: string;
  missing?: boolean;
};

export function DependencyGraph({ nodes }: { nodes: DependencyGraphNode[] }) {
  return (
    <div className="dep-graph" aria-label="依赖拓扑">
      {nodes.map((node, index) => (
        <span className="dep-graph-step" key={node.label}>
          <span className={`dep-node ${node.missing ? 'missing' : ''}`}>{node.label}</span>
          {index < nodes.length - 1 ? <span className="dep-arrow" aria-hidden="true">→</span> : null}
        </span>
      ))}
    </div>
  );
}
