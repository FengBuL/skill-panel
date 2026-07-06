import { listen, type EventCallback, type UnlistenFn } from '@tauri-apps/api/event';

const noopUnlisten: UnlistenFn = () => {};

export async function safeListen<T>(
  event: string,
  handler: EventCallback<T>,
): Promise<UnlistenFn> {
  try {
    return await listen<T>(event, handler);
  } catch {
    return noopUnlisten;
  }
}
