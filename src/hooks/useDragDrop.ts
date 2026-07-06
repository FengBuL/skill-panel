import { useRef, useState, type DragEvent, type PointerEvent } from 'react';

type PointerCardDrag = {
  categoryId: string;
  hasMoved: boolean;
  path: string;
  startX: number;
  startY: number;
};

export type DragOverPosition = 'after' | 'before';

type DragOffset = {
  x: number;
  y: number;
};

export function useDragDrop({
  disabled = false,
  onPointerReorder,
  onReorder,
}: {
  disabled?: boolean;
  onPointerReorder?: () => void;
  onReorder: (categoryId: string, targetPath: string, sourcePath?: string | null, position?: DragOverPosition) => void;
}) {
  const [draggedSkillPath, setDraggedSkillPath] = useState<string | null>(null);
  const [dragOverSkillPath, setDragOverSkillPath] = useState<string | null>(null);
  const [dragOverPosition, setDragOverPosition] = useState<DragOverPosition>('before');
  const [dragOffset, setDragOffset] = useState<DragOffset>({ x: 0, y: 0 });
  const [releaseOffset, setReleaseOffset] = useState<DragOffset>({ x: 0, y: 0 });
  const [releaseSkillPath, setReleaseSkillPath] = useState<string | null>(null);
  const pointerCardDragRef = useRef<PointerCardDrag | null>(null);
  const releaseTimerRef = useRef<ReturnType<typeof window.setTimeout> | null>(null);

  const clearReleaseState = () => {
    if (releaseTimerRef.current) {
      window.clearTimeout(releaseTimerRef.current);
      releaseTimerRef.current = null;
    }
    setReleaseSkillPath(null);
    setReleaseOffset({ x: 0, y: 0 });
  };

  const scheduleReleaseState = (path: string | null, offset = dragOffset) => {
    clearReleaseState();
    if (!path) {
      return;
    }
    setReleaseOffset(offset);
    setReleaseSkillPath(path);
    releaseTimerRef.current = window.setTimeout(() => {
      setReleaseSkillPath(null);
      releaseTimerRef.current = null;
    }, 180);
  };

  const getDropPosition = (event: DragEvent<HTMLElement> | PointerEvent<HTMLElement>): DragOverPosition => {
    const bounds = event.currentTarget.getBoundingClientRect();
    return event.clientX > bounds.left + bounds.width / 2 ? 'after' : 'before';
  };

  const startCategorySkillDrag = (event: DragEvent<HTMLElement>, path: string) => {
    if (disabled) {
      event.preventDefault();
      return;
    }

    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', path);
    clearReleaseState();
    setDraggedSkillPath(path);
  };

  const startPointerCategorySkillDrag = (event: PointerEvent<HTMLElement>, categoryId: string, path: string) => {
    if (disabled || event.button !== 0) {
      return;
    }

    event.preventDefault();
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Pointer capture support varies across desktop WebViews.
    }
    clearReleaseState();
    pointerCardDragRef.current = {
      categoryId,
      hasMoved: false,
      path,
      startX: event.clientX,
      startY: event.clientY,
    };
  };

  const movePointerCategorySkillDrag = (event: PointerEvent<HTMLElement>) => {
    const dragState = pointerCardDragRef.current;
    if (!dragState) {
      return;
    }

    const moved = Math.abs(event.clientX - dragState.startX) > 4 || Math.abs(event.clientY - dragState.startY) > 4;
    if (!moved) {
      return;
    }

    dragState.hasMoved = true;
    setDraggedSkillPath(dragState.path);
    setDragOffset({
      x: event.clientX - dragState.startX,
      y: event.clientY - dragState.startY,
    });
    const target = (event.currentTarget as HTMLElement).dataset.skillCardPath;
    if (target && target !== dragState.path) {
      setDragOverSkillPath(target);
      setDragOverPosition(getDropPosition(event));
    }
  };

  const finishPointerCategorySkillDrag = (event: PointerEvent<HTMLElement>, categoryId: string, targetPath: string) => {
    const dragState = pointerCardDragRef.current;
    pointerCardDragRef.current = null;

    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      // Pointer capture may already be released by the host WebView.
    }

    if (dragState?.hasMoved && dragState.categoryId === categoryId && dragState.path !== targetPath) {
      event.preventDefault();
      onPointerReorder?.();
      onReorder(categoryId, targetPath, dragState.path, getDropPosition(event));
    }

    scheduleReleaseState(dragState?.path ?? null, {
      x: event.clientX - (dragState?.startX ?? event.clientX),
      y: event.clientY - (dragState?.startY ?? event.clientY),
    });
    setDragOffset({ x: 0, y: 0 });
    setDraggedSkillPath(null);
    setDragOverSkillPath(null);
  };

  const resetDragDrop = () => {
    scheduleReleaseState(pointerCardDragRef.current?.path ?? draggedSkillPath, dragOffset);
    pointerCardDragRef.current = null;
    setDragOffset({ x: 0, y: 0 });
    setDraggedSkillPath(null);
    setDragOverSkillPath(null);
  };

  return {
    dragOffset,
    dragOverPosition,
    draggedSkillPath,
    dragOverSkillPath,
    finishPointerCategorySkillDrag,
    getDropPosition,
    movePointerCategorySkillDrag,
    releaseOffset,
    releaseSkillPath,
    resetDragDrop,
    setDragOverPosition,
    setDraggedSkillPath,
    setDragOverSkillPath,
    startCategorySkillDrag,
    startPointerCategorySkillDrag,
  };
}
