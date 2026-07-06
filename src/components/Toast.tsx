// Toast 系统 — wt-0-foundation 产出
import { useEffect, useState } from 'react';
import './Toast.css';

interface ToastMsg { id: number; text: string; action?: string; onAction?: () => void }
let toastId = 0;
const listeners = new Set<(t: ToastMsg) => void>();

export function showToast(text: string, action?: string, onAction?: () => void) {
  const t: ToastMsg = { id: ++toastId, text, action, onAction };
  listeners.forEach(fn => fn(t));
}

export function ToastHost() {
  const [toast, setToast] = useState<ToastMsg | null>(null);
  useEffect(() => {
    const fn = (t: ToastMsg) => {
      setToast(t);
      setTimeout(() => setToast(cur => (cur && cur.id === t.id ? null : cur)), 4000);
    };
    listeners.add(fn);
    return () => { listeners.delete(fn); };
  }, []);
  if (!toast) return null;
  return (
    <div className="sp-toast show">
      <span>{toast.text}</span>
      {toast.action && <span className="sp-toast-action" onClick={() => { toast.onAction?.(); setToast(null); }}>{toast.action}</span>}
    </div>
  );
}
