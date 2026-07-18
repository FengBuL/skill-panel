import { describe, expect, it } from 'vitest';

import { resolveCargoCommand } from './run-cargo-tests.mjs';

describe('cargo test runner', () => {
  it('uses cargo from PATH on Windows', () => {
    expect(
      resolveCargoCommand({
        platform: 'win32',
        homeDirectory: 'C:\\Users\\runneradmin',
        fileExists: () => false,
      }),
    ).toBe('cargo');
  });

  it('uses the rustup cargo binary on macOS when available', () => {
    expect(
      resolveCargoCommand({
        platform: 'darwin',
        homeDirectory: '/Users/developer',
        fileExists: (path) => path === '/Users/developer/.cargo/bin/cargo',
      }),
    ).toBe('/Users/developer/.cargo/bin/cargo');
  });

  it('falls back to cargo from PATH on Unix', () => {
    expect(
      resolveCargoCommand({
        platform: 'linux',
        homeDirectory: '/home/developer',
        fileExists: () => false,
      }),
    ).toBe('cargo');
  });
});
