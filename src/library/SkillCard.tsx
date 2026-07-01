import { type CSSProperties, type KeyboardEvent, type MouseEvent, type PointerEvent, type ReactNode } from 'react';

type SkillCardProps = {
  ariaPressed: boolean;
  categoryId?: string;
  children: ReactNode;
  className?: string;
  draggable?: boolean;
  isDragOver?: boolean;
  isDragging?: boolean;
  onClick: () => void;
  onContextMenu: (event: MouseEvent<HTMLDivElement>) => void;
  onDragEnd?: () => void;
  onDragEnter?: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragOver?: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragStart?: (event: React.DragEvent<HTMLDivElement>) => void;
  onDrop?: (event: React.DragEvent<HTMLDivElement>) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLDivElement>) => void;
  onPointerCancel?: () => void;
  onPointerDown?: (event: PointerEvent<HTMLDivElement>) => void;
  onPointerMove?: (event: PointerEvent<HTMLDivElement>) => void;
  onPointerUp?: (event: PointerEvent<HTMLDivElement>) => void;
  path: string;
  selected: boolean;
  style?: CSSProperties;
};

export function SkillCard({
  ariaPressed,
  categoryId,
  children,
  className = '',
  draggable = true,
  isDragOver = false,
  isDragging = false,
  onClick,
  onContextMenu,
  path,
  selected,
  style,
  ...dragHandlers
}: SkillCardProps) {
  const stateClassName = `${selected ? 'selected-card' : ''} ${isDragging ? 'dragging-card' : ''} ${isDragOver ? 'drag-over-card' : ''}`.trim();
  const mergedClassName = ['skill-card', className, stateClassName].filter(Boolean).join(' ');

  return (
    <div
      role="button"
      tabIndex={0}
      className={mergedClassName}
      aria-pressed={ariaPressed}
      draggable={draggable}
      data-skill-card-category={categoryId}
      data-skill-card-path={path}
      style={style}
      onClick={onClick}
      onContextMenu={onContextMenu}
      {...dragHandlers}
    >
      {children}
    </div>
  );
}
