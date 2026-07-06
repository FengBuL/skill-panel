import { invoke } from '@tauri-apps/api/core';
import type { AIVendor } from '../store/settingsStore';

export async function setAIKey(vendor: AIVendor, key: string): Promise<void> {
  await invoke('set_ai_key', { vendor, key });
}
