import { describe, expect, it } from 'vitest';

import {
  checkActiveDocs,
  checkEntrypoints,
  checkLegacySources,
  checkVersionAlignment,
} from './repo-doctor.mjs';

describe('repo doctor', () => {
  it('accepts aligned application versions', () => {
    expect(
      checkVersionAlignment({
        packageVersion: '3.8.3',
        tauriVersion: '3.8.3',
        cargoVersion: '3.8.3',
      }),
    ).toEqual([]);
  });

  it('reports every mismatched application version', () => {
    expect(
      checkVersionAlignment({
        packageVersion: '3.8.3',
        tauriVersion: '3.8.2',
        cargoVersion: '3.8.1',
      }),
    ).toEqual([
      'src-tauri/tauri.conf.json version 3.8.2 does not match package.json 3.8.3',
      'src-tauri/Cargo.toml version 3.8.1 does not match package.json 3.8.3',
    ]);
  });

  it('accepts the current application entry chain', () => {
    expect(
      checkEntrypoints({
        mainSource: "import { AppShell } from './layout/AppShell';",
        appSource: "export { AppShell as default } from './layout/AppShell';",
      }),
    ).toEqual([]);
  });

  it('reports an entry file that bypasses the current shell', () => {
    expect(
      checkEntrypoints({
        mainSource: "import App from './App';",
        appSource: "import { SkillPanelWorkspace } from './SkillPanelWorkspace';",
      }),
    ).toEqual([
      'src/main.tsx must import ./layout/AppShell',
      'src/App.tsx must import ./layout/AppShell',
    ]);
  });

  it('rejects stale active branch and Obsidian references', () => {
    expect(
      checkActiveDocs([
        {
          path: 'README.md',
          content:
            'Use branch codex/skill-panel-app and codex/agent-codex-v3.8 from /Users/shovy/Documents/skill-panel-codex-v3.8 or /Users/shovy/Documents/skill-panel-workbuddy-v3.8.1-prototype, then read /notes/skill panel/PROJECT_STATE.md.',
        },
      ]),
    ).toEqual([
      'README.md contains retired branch codex/skill-panel-app',
      'README.md contains retired branch codex/agent-codex-v3.8',
      'README.md contains retired fixed worktree /Users/shovy/Documents/skill-panel-codex-v3.8',
      'README.md contains retired fixed worktree /Users/shovy/Documents/skill-panel-workbuddy-v3.8.1-prototype',
      'README.md contains the retired Obsidian project path',
    ]);
  });

  it('rejects retired application source files', () => {
    expect(
      checkLegacySources([
        'src/main.tsx',
        'src/AppShell.tsx',
        'src/SkillPanelWorkspace.tsx',
      ]),
    ).toEqual([
      'retired source file still exists: src/AppShell.tsx',
      'retired source file still exists: src/SkillPanelWorkspace.tsx',
    ]);
  });
});
