import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export function resolveCargoCommand({
  platform,
  homeDirectory,
  fileExists,
}) {
  if (platform !== 'win32') {
    const rustupCargo = join(homeDirectory, '.cargo', 'bin', 'cargo');
    if (fileExists(rustupCargo)) {
      return rustupCargo;
    }
  }

  return 'cargo';
}

export function runCargoTests() {
  const cargo = resolveCargoCommand({
    platform: process.platform,
    homeDirectory: homedir(),
    fileExists: existsSync,
  });
  const result = spawnSync(
    cargo,
    [
      'test',
      '--manifest-path',
      'src-tauri/Cargo.toml',
      '--lib',
      '--bins',
      '--tests',
    ],
    { cwd: resolve(fileURLToPath(import.meta.url), '../..'), stdio: 'inherit' },
  );

  if (result.error) {
    console.error(result.error.message);
    return 1;
  }

  return result.status ?? 1;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = runCargoTests();
}
