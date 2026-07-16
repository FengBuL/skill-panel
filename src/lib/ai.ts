// AI 调用封装 — invoke + listen + cancel + diff 工具
import { invoke } from '@tauri-apps/api/core';
import { safeListen } from './tauriEvents';
import { previewText, sanitizeText } from './redaction';

export type AiAction = 'struct' | 'desc' | 'polish' | 'fm' | 'safe';
export type AiVendor = 'openai' | 'claude' | 'glm' | 'ollama';
export type AiStatus = 'idle' | 'confirming' | 'generating' | 'diffing' | 'applied' | 'error';

export interface AiUsage {
  promptTokens: number;
  completionTokens: number;
}

export interface AiResult {
  content: string;
  usage: AiUsage;
  costCny: number;
}

export interface AiActionDef {
  id: AiAction;
  icon: string;
  labelKey: string;
  writeBack: boolean;
}

export function sanitizeForAI(content: string): string {
  return sanitizeText(content);
}

export function buildAIPreview(content: string, desensitize: boolean): string {
  return previewText(desensitize ? sanitizeForAI(content) : content);
}

export const AI_ACTIONS: AiActionDef[] = [
  { id: 'struct', icon: 'account_tree', labelKey: 'ai.action.struct', writeBack: true },
  { id: 'desc', icon: 'notes', labelKey: 'ai.action.desc', writeBack: true },
  { id: 'polish', icon: 'auto_fix_high', labelKey: 'ai.action.polish', writeBack: true },
  { id: 'fm', icon: 'sell', labelKey: 'ai.action.fm', writeBack: true },
  { id: 'safe', icon: 'policy', labelKey: 'ai.action.safe', writeBack: false },
];

// CNY per 1M tokens (mirror of Rust model_pricing)
export const PRICING: Record<AiVendor, { input: number; output: number }> = {
  openai: { input: 18, output: 72 },
  claude: { input: 22, output: 108 },
  glm: { input: 0.1, output: 0.1 },
  ollama: { input: 0, output: 0 },
};

export function estimateCost(vendor: AiVendor, usage: AiUsage): number {
  const p = PRICING[vendor];
  return (usage.promptTokens * p.input + usage.completionTokens * p.output) / 1_000_000;
}

// ---- Run AI with streaming ----

export async function runAI(params: {
  content: string;
  action: AiAction;
  vendor: AiVendor;
  desensitize: boolean;
  sendConfirmed: boolean;
  rawContentConfirmed: boolean;
  preview: string;
  onChunk: (chunk: string) => void;
  onDone: (result: AiResult) => void;
  onError: (msg: string) => void;
}): Promise<void> {
  const { content, action, vendor, desensitize, sendConfirmed, rawContentConfirmed, preview, onChunk, onDone, onError } = params;

  const unlistenChunk = await safeListen<{ chunk: string; done: boolean }>('ai-chunk', (e) => {
    if (e.payload.done) return;
    onChunk(e.payload.chunk);
  });

  const unlistenDone = await safeListen<{ content: string; usage: { prompt_tokens: number; completion_tokens: number }; cost_cny: f64 }>('ai-done', (e) => {
    onDone({
      content: e.payload.content,
      usage: {
        promptTokens: e.payload.usage.prompt_tokens,
        completionTokens: e.payload.usage.completion_tokens,
      },
      costCny: e.payload.cost_cny,
    });
  });

  const unlistenError = await safeListen<{ message: string }>('ai-error', (e) => {
    onError(e.payload.message);
  });

  try {
    await invoke('ai_optimize', { content, action, vendor, desensitize, sendConfirmed, rawContentConfirmed, preview });
  } catch (err) {
    onError(sanitizeText(err));
  } finally {
    unlistenChunk();
    unlistenDone();
    unlistenError();
  }
}

export async function cancelAI(): Promise<void> {
  try {
    await invoke('ai_cancel');
  } catch {
    // ignore
  }
}

export async function hasApiKey(vendor: AiVendor): Promise<boolean> {
  try {
    return await invoke<boolean>('get_ai_key', { vendor });
  } catch {
    return false;
  }
}

export async function setApiKey(vendor: AiVendor, key: string): Promise<void> {
  await invoke('set_ai_key', { vendor, key });
}

export async function setAIKey(vendor: AiVendor, key: string): Promise<void> {
  await setApiKey(vendor, key);
}

// ---- Diff utilities ----

import { structuredPatch } from 'diff';

export interface ParsedHunk {
  id: number;
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
  lines: string[];
  addedCount: number;
  removedCount: number;
}

export function parseDiff(original: string, modified: string): ParsedHunk[] {
  const result = structuredPatch('', '', original, modified, '', '', { context: 3 });
  return result.hunks.map((hunk, i) => ({
    id: i,
    oldStart: hunk.oldStart,
    oldLines: hunk.oldLines,
    newStart: hunk.newStart,
    newLines: hunk.newLines,
    lines: hunk.lines,
    addedCount: hunk.lines.filter((l) => l.startsWith('+')).length,
    removedCount: hunk.lines.filter((l) => l.startsWith('-')).length,
  }));
}

export function applyDiffHunks(original: string, hunks: ParsedHunk[], selectedIds: Set<number>): string {
  const result = original.split('\n');

  // Sort by oldStart descending to apply from bottom up
  const selected = hunks
    .filter((h) => selectedIds.has(h.id))
    .sort((a, b) => b.oldStart - a.oldStart);

  for (const hunk of selected) {
    const newLines: string[] = [];
    for (const line of hunk.lines) {
      if (line.startsWith('+')) {
        newLines.push(line.slice(1));
      } else if (line.startsWith(' ')) {
        newLines.push(line.slice(1));
      }
      // Skip '-' lines (removed)
    }
    result.splice(hunk.oldStart - 1, hunk.oldLines, ...newLines);
  }

  return result.join('\n');
}

// f64 type alias for TypeScript (Tauri serializes as number)
type f64 = number;
