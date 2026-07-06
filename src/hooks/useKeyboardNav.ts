import { useEffect } from 'react';

type KeyboardNavOptions = {
  disabled?: boolean;
  onCommandEdit?: () => void;
  onCommandNew?: () => void;
  onCommandSave?: () => void;
  onEnter?: () => void;
  onEscape?: () => void;
  onFocusSearch?: () => void;
  onMoveDown?: () => void;
  onMoveUp?: () => void;
};

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return Boolean(target.closest('input, textarea, select, [contenteditable="true"]'));
}

export function useKeyboardNav({
  disabled = false,
  onCommandEdit,
  onCommandNew,
  onCommandSave,
  onEnter,
  onEscape,
  onFocusSearch,
  onMoveDown,
  onMoveUp,
}: KeyboardNavOptions) {
  useEffect(() => {
    if (disabled) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      const commandPressed = event.metaKey || event.ctrlKey;

      if (commandPressed && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        onFocusSearch?.();
        return;
      }

      if (commandPressed && event.key.toLowerCase() === 'n') {
        event.preventDefault();
        onCommandNew?.();
        return;
      }

      if (commandPressed && event.key.toLowerCase() === 's') {
        event.preventDefault();
        onCommandSave?.();
        return;
      }

      if (commandPressed && event.key.toLowerCase() === 'e') {
        event.preventDefault();
        onCommandEdit?.();
        return;
      }

      if (event.key === 'Escape') {
        onEscape?.();
        return;
      }

      if (isEditableTarget(event.target)) {
        return;
      }

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        onMoveDown?.();
        return;
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault();
        onMoveUp?.();
        return;
      }

      if (event.key === 'Enter') {
        event.preventDefault();
        onEnter?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [disabled, onCommandEdit, onCommandNew, onCommandSave, onEnter, onEscape, onFocusSearch, onMoveDown, onMoveUp]);
}
