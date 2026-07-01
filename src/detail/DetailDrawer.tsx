import { type ReactNode } from 'react';

type DetailDrawerProps = {
  ariaLabel: string;
  children: ReactNode;
  closeLabel: string;
  isOpen: boolean;
  onClose: () => void;
};

export function DetailDrawer({ ariaLabel, children, closeLabel, isOpen, onClose }: DetailDrawerProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="detail-drawer-layer">
      <button type="button" className="detail-drawer-backdrop" aria-label={closeLabel} onClick={onClose} />
      <aside className="panel detail-panel detail-drawer fluid-detail-panel" aria-label={ariaLabel}>
        <button type="button" className="detail-drawer-close icon-button" aria-label={closeLabel} onClick={onClose}>
          <span aria-hidden="true" className="material-symbols-outlined app-icon">
            close
          </span>
        </button>
        {children}
      </aside>
    </div>
  );
}
