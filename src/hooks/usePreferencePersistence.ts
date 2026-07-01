import { useCallback, useEffect, useRef } from 'react';

export function usePreferencePersistence<TSettings>({
  debounceMs = 500,
  onError,
  save,
}: {
  debounceMs?: number;
  onError?: (error: unknown) => void;
  save: (settings: TSettings) => Promise<unknown>;
}) {
  const timerRef = useRef<number | null>(null);
  const pendingSettingsRef = useRef<TSettings | null>(null);

  const flush = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    const pendingSettings = pendingSettingsRef.current;
    pendingSettingsRef.current = null;

    if (pendingSettings) {
      void save(pendingSettings).catch((error) => {
        onError?.(error);
      });
    }
  }, [onError, save]);

  const schedule = useCallback(
    (settings: TSettings) => {
      pendingSettingsRef.current = settings;

      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }

      timerRef.current = window.setTimeout(flush, debounceMs);
    },
    [debounceMs, flush],
  );

  useEffect(() => flush, [flush]);

  return { flushPreferences: flush, persistPreferences: schedule };
}
