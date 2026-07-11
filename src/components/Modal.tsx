import type { ReactNode } from 'react';
import './ui.css';

type ModalProps = {
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  onClose?: () => void;
};

export function Modal({ title, children, footer, onClose }: ModalProps) {
  return (
    <div className="modal-overlay" role="presentation">
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal-header">
          <h2 className="modal-title" id="modal-title">{title}</h2>
          {onClose ? (
            <button className="modal-close" type="button" onClick={onClose} aria-label="关闭">
              ×
            </button>
          ) : null}
        </div>
        <div className="modal-body">{children}</div>
        {footer ? <div className="modal-footer">{footer}</div> : null}
      </section>
    </div>
  );
}
