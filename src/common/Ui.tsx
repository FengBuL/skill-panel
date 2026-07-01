import { type RefObject, type ReactNode, type UIEvent } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function getMarkdownNodeText(value: ReactNode): string {
  if (typeof value === 'string' || typeof value === 'number') {
    return String(value);
  }
  if (Array.isArray(value)) {
    return value.map(getMarkdownNodeText).join('');
  }
  return '';
}

function getMarkdownHeadingId(value: ReactNode) {
  const text = getMarkdownNodeText(value);
  const slug = text
    .toLowerCase()
    .trim()
    .replace(/[`~!@#$%^&*()+=[\]{}\\|;:'",.<>/?]/g, '')
    .replace(/\s+/g, '-');
  return `markdown-heading-${slug || 'section'}`;
}

export function MaterialIcon({ name, size = 18 }: { name: string; size?: number }) {
  return (
    <span aria-hidden="true" className="material-symbols-outlined app-icon" style={{ fontSize: `${size}px` }}>
      {name}
    </span>
  );
}

export function MarkdownPreviewBlock({
  ariaLabel,
  emptyText,
  markdown,
  onScroll,
  previewRef,
}: {
  ariaLabel: string;
  emptyText: string;
  markdown: string;
  onScroll?: (event: UIEvent<HTMLDivElement>) => void;
  previewRef?: RefObject<HTMLDivElement | null>;
}) {
  return (
    <div ref={previewRef} className="markdown-preview markdown-content" role="region" aria-label={ariaLabel} onScroll={onScroll}>
      {markdown.trim() ? (
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ node: _node, ...props }) => <h1 id={getMarkdownHeadingId(props.children)} {...props} />,
            h2: ({ node: _node, ...props }) => <h2 id={getMarkdownHeadingId(props.children)} {...props} />,
            h3: ({ node: _node, ...props }) => <h3 id={getMarkdownHeadingId(props.children)} {...props} />,
            h4: ({ node: _node, ...props }) => <h4 id={getMarkdownHeadingId(props.children)} {...props} />,
            h5: ({ node: _node, ...props }) => <h5 id={getMarkdownHeadingId(props.children)} {...props} />,
            h6: ({ node: _node, ...props }) => <h6 id={getMarkdownHeadingId(props.children)} {...props} />,
          }}
        >
          {markdown}
        </ReactMarkdown>
      ) : (
        <p>{emptyText}</p>
      )}
    </div>
  );
}

export function PathButton({
  className = 'path-button',
  onOpen,
  path,
}: {
  className?: string;
  onOpen: (path: string) => void | Promise<void>;
  path: string;
}) {
  return (
    <button
      type="button"
      className={className}
      title={path}
      onClick={(event) => {
        event.stopPropagation();
        void onOpen(path);
      }}
      onKeyDown={(event) => {
        event.stopPropagation();
      }}
    >
      {path}
    </button>
  );
}
