import packageJson from '../package.json';
import tauriConfig from '../src-tauri/tauri.conf.json';

describe('packaging configuration', () => {
  it('documents platform-specific Tauri build commands', () => {
    expect(packageJson.scripts).toMatchObject({
      build: 'tsc && vite build',
      test: 'vitest run',
      typecheck: 'tsc --noEmit',
      'tauri:build': 'tauri build',
      'tauri:build:windows': 'tauri build --bundles nsis',
      'tauri:build:windows:msi': 'tauri build --bundles msi',
      'tauri:build:macos': 'tauri build --bundles app,dmg',
      'tauri:icons': 'tauri icon src-tauri/icons/source.png',
      'packaging:check': 'vitest run src/packaging.config.test.ts',
    });
  });

  it('declares stable Windows and macOS application identity', () => {
    expect(tauriConfig.productName).toBe('Skill Panel');
    expect(tauriConfig.identifier).toBe('com.fengbul.skillpanel');
    expect(tauriConfig.app.windows[0].title).toBe('Skill Panel');
  });

  it('configures Windows and macOS bundle targets', () => {
    expect(tauriConfig.bundle).toMatchObject({
      active: true,
      targets: ['nsis', 'msi', 'app', 'dmg'],
      windows: {
        nsis: {
          installMode: 'both',
          displayLanguageSelector: true,
          languages: ['English', 'SimpChinese'],
        },
        wix: {
          language: 'en-US',
        },
      },
      macOS: {
        minimumSystemVersion: '10.13',
        hardenedRuntime: true,
      },
    });
  });

  it('includes lightweight icon assets required by Tauri builds', () => {
    expect(tauriConfig.bundle.icon).toEqual([
      'icons/32x32.png',
      'icons/128x128.png',
      'icons/128x128@2x.png',
      'icons/icon.png',
      'icons/icon.icns',
      'icons/icon.ico',
    ]);
  });
});
