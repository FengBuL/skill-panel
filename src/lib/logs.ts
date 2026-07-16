import { invoke } from '@tauri-apps/api/core';
import { sanitizeText } from './redaction';

export interface CallLogRow {
  time: string;
  skillName: string;
  prompt: string;
  status: string;
  durationMs: number;
  tokens: number;
}

export async function getCallLogs(range = '7d'): Promise<{ logs: CallLogRow[]; isMock: boolean }> {
  try {
    const logs = await invoke<CallLogRow[]>('get_call_logs', { range });
    return {
      logs: logs.map((log) => ({
        ...log,
        time: sanitizeText(log.time),
        skillName: sanitizeText(log.skillName),
        prompt: sanitizeText(log.prompt),
        status: sanitizeText(log.status),
      })),
      isMock: false,
    };
  } catch {
    return { logs: [], isMock: true };
  }
}
