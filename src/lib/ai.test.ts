import { describe, it, expect } from 'vitest';
import { vi } from 'vitest';
import { invoke } from '@tauri-apps/api/core';
import { parseDiff, applyDiffHunks, runAI, sanitizeForAI } from './ai';

vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}));

vi.mock('./tauriEvents', () => ({
  safeListen: vi.fn(async () => vi.fn()),
}));

describe('ai diff utilities', () => {
  it('parses structured diff from two texts', () => {
    const original = 'line1\nline2\nline3';
    const modified = 'line1\nline2 modified\nline3\nline4';
    const hunks = parseDiff(original, modified);
    expect(hunks.length).toBeGreaterThan(0);
    expect(hunks[0].addedCount).toBeGreaterThanOrEqual(1);
  });

  it('applies selected hunks', () => {
    const original = 'A\nB\nC';
    const modified = 'A\nX\nC';
    const hunks = parseDiff(original, modified);
    expect(hunks.length).toBe(1);
    const result = applyDiffHunks(original, hunks, new Set([0]));
    expect(result).toContain('X');
    expect(result).not.toContain('B');
  });

  it('applies no hunks keeps original', () => {
    const original = 'A\nB\nC';
    const modified = 'A\nX\nC';
    const hunks = parseDiff(original, modified);
    const result = applyDiffHunks(original, hunks, new Set());
    expect(result).toBe(original);
  });

  it('handles multi-hunk partial apply', () => {
    const original = 'A\nB\nC\nD\nE';
    const modified = 'A\nB1\nC\nD1\nE';
    const hunks = parseDiff(original, modified);
    const selectedIds = new Set([hunks.findIndex((h) => h.lines.some((l) => l.includes('B1'))) ?? 0]);
    const result = applyDiffHunks(original, hunks, selectedIds);
    expect(result).toContain('B1');
  });

  it('sanitizes frontend preview content with the shared placeholder semantics', () => {
    const output = sanitizeForAI('sk-test-secret owner@example.com /Users/alice/demo Authorization: Bearer raw-token');

    expect(output).toContain('<API_KEY>');
    expect(output).toContain('<EMAIL>');
    expect(output).toContain('<PATH>');
    expect(output).toContain('<TOKEN>');
    expect(output).not.toContain('sk-test-secret');
    expect(output).not.toContain('owner@example.com');
    expect(output).not.toContain('/Users/alice');
    expect(output).not.toContain('raw-token');
  });

  it('sends AI only with explicit send confirmation metadata', async () => {
    vi.mocked(invoke).mockResolvedValue(undefined);

    await runAI({
      content: 'hello owner@example.com',
      action: 'polish',
      vendor: 'glm',
      desensitize: true,
      sendConfirmed: true,
      rawContentConfirmed: false,
      preview: 'hello <EMAIL>',
      onChunk: vi.fn(),
      onDone: vi.fn(),
      onError: vi.fn(),
    });

    expect(invoke).toHaveBeenCalledWith('ai_optimize', {
      content: 'hello owner@example.com',
      action: 'polish',
      vendor: 'glm',
      desensitize: true,
      sendConfirmed: true,
      rawContentConfirmed: false,
      preview: 'hello <EMAIL>',
    });
  });
});
