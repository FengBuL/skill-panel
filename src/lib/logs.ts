import { invoke } from '@tauri-apps/api/core';

export interface CallLogRow {
  time: string;
  skillName: string;
  prompt: string;
  status: string;
  durationMs: number;
  tokens: number;
}

const MOCK_LOGS: CallLogRow[] = [
  { time: '2分钟前', skillName: 'Browser Control', prompt: '打开 localhost:3000 截图', status: 'ok', durationMs: 1200, tokens: 340 },
  { time: '1小时前', skillName: 'A-Share Daily Update', prompt: '更新今天的A股数据', status: 'ok', durationMs: 3400, tokens: 890 },
  { time: '3小时前', skillName: 'PDF Analysis Core', prompt: '解析这份财报PDF', status: 'fail', durationMs: 800, tokens: 120 },
];

export async function getCallLogs(range = '7d'): Promise<{ logs: CallLogRow[]; isMock: boolean }> {
  try {
    const logs = await invoke<CallLogRow[]>('get_call_logs', { range });
    return { logs, isMock: false };
  } catch {
    return { logs: MOCK_LOGS, isMock: true };
  }
}
