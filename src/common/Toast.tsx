import { MaterialIcon } from './Ui';

import { sanitizeText } from '../lib/redaction';

export type ToastKind = 'error' | 'info' | 'success';

export type ToastMessage = {
  actionLabel?: string;
  id: number;
  kind: ToastKind;
  message: string;
  onAction?: () => void;
};

export type ToastPayload = {
  kind: ToastKind;
  message: string;
};

export const toastEventName = 'skill-panel:toast';

export function publishToast(payload: ToastPayload) {
  window.dispatchEvent(new CustomEvent<ToastPayload>(toastEventName, {
    detail: { ...payload, message: sanitizeText(payload.message) },
  }));
}

const toastIcons: Record<ToastKind, string> = {
  error: 'error',
  info: 'info',
  success: 'check_circle',
};

export function ToastViewport({ messages, onDismiss }: { messages: ToastMessage[]; onDismiss: (id: number) => void }) {
  if (messages.length === 0) {
    return null;
  }

  return (
    <div className="toast-viewport" aria-live="polite" aria-label="Notifications">
      {messages.map((message) => (
        <div key={message.id} className={`toast-message toast-${message.kind}`}>
          <MaterialIcon name={toastIcons[message.kind]} size={18} />
              <span>{sanitizeText(message.message)}</span>
          {message.actionLabel && message.onAction ? (
            <button type="button" onClick={message.onAction}>
              {message.actionLabel}
            </button>
          ) : null}
          <button type="button" aria-label="Dismiss notification" onClick={() => onDismiss(message.id)}>
            <MaterialIcon name="close" size={15} />
          </button>
        </div>
      ))}
    </div>
  );
}
