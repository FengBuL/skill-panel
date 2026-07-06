import { describe, it, expect } from 'vitest';
import { parseDiff, applyDiffHunks } from './ai';

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
});
