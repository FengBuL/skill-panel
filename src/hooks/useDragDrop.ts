import { useRef, useState, type DragEvent, type PointerEvent } from 'react';

type PointerCardDrag = {
  categoryId: string;
  hasMoved: boolean;
  path: string;
  startX: number;
  startY: number;
};

export function useDragDrop({
  onReorder,
}: {
  onReorder: (categoryId: string, targetPath: string, sourcePath?: string | null) => void;
}) {
  const [draggedSkillPath, setDraggedSkillPath] = useState<string | null>(null);
  const [dragOverSkillPath, setDragOverSkillPath] = useState<string | null>(null);
  const pointerCardDragRef = useRef<PointerCardDrag | null>(null);

  const startCategorySkillDrag = (event: DragEvent<HTMLElement>, path: string) => {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', path);
    setDraggedSkillPath(path);
  };

  const startPointerCategorySkillDrag = (event: PointerEvent<HTMLElement>, categoryId: string, path: string) => {
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
    const target = (event.currentTarget as HTMLElement).dataset.skillCardPath;
    if (target && target !== dragState.path) {
      setDragOverSkillPath(target);
    }
  };

  const finishPointerCategorySkillDrag = (event: PointerEvent<HTMLElement>, categoryId: string, targetPath: string) => {
    const dragState = pointerCardDragRef.current;
    pointerCardDragRef.current = null;

    if (dragState?.hasMoved) {
      event.preventDefault();
      onReorder(categoryId, targetPath, dragState.path);
    }

    setDraggedSkillPath(null);
    setDragOverSkillPath(null);
  };

  const resetDragDrop = () => {
    pointerCardDragRef.current = null;
    setDraggedSkillPath(null);
    setDragOverSkillPath(null);
  };

  return {
    draggedSkillPath,
    dragOverSkillPath,
    finishPointerCategorySkillDrag,
    movePointerCategorySkillDrag,
    resetDragDrop,
    setDraggedSkillPath,
    setDragOverSkillPath,
    startCategorySkillDrag,
    startPointerCategorySkillDrag,
  };
}
