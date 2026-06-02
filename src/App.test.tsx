import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from './App';
import type { AppSettings } from './types/skill';

const { invokeMock } = vi.hoisted(() => ({
  invokeMock: vi.fn(),
}));

vi.mock('@tauri-apps/api/core', () => ({
  invoke: invokeMock,
}));

function mockNavigatorLanguages(languages: readonly string[]) {
  Object.defineProperty(window.navigator, 'languages', {
    configurable: true,
    value: languages,
  });
  Object.defineProperty(window.navigator, 'language', {
    configurable: true,
    value: languages[0],
  });
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((innerResolve) => {
    resolve = innerResolve;
  });
  return { promise, resolve };
}

describe('App shell', () => {
  beforeEach(() => {
    invokeMock.mockReset();
    invokeMock.mockResolvedValue({
      language: 'system',
      customScanDirectories: [],
      showDefaultScanDirectories: true,
    });
    mockNavigatorLanguages(['zh-CN']);
  });

  it('renders the empty desktop shell with zh-CN text from i18n', async () => {
    render(<App />);

    expect(await screen.findByRole('heading', { name: 'Skill 面板' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '手动扫描' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '新建 Skill' })).toBeInTheDocument();
    expect(screen.getByText('暂无已扫描的 Skill')).toBeInTheDocument();
    expect(screen.getByLabelText('语言')).toHaveValue('system');
    expect(invokeMock).toHaveBeenCalledWith('load_app_settings');
  });

  it('switches all visible shell text to English and saves the setting', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.selectOptions(await screen.findByLabelText('语言'), 'en-US');

    expect(screen.getByRole('heading', { name: 'Skill Panel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Scan' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'New Skill' })).toBeInTheDocument();
    expect(screen.getByText('No scanned skills yet')).toBeInTheDocument();
    expect(screen.getByLabelText('Language')).toHaveValue('en-US');
    await waitFor(() =>
      expect(invokeMock).toHaveBeenCalledWith('save_app_settings', {
        settings: {
          language: 'en-US',
          customScanDirectories: [],
          showDefaultScanDirectories: true,
        },
      }),
    );
  });

  it('keeps local language state when saving settings fails', async () => {
    const user = userEvent.setup();
    invokeMock.mockImplementation((command: string) => {
      if (command === 'load_app_settings') {
        return Promise.resolve({
          language: 'system',
          customScanDirectories: [],
          showDefaultScanDirectories: true,
        });
      }
      return Promise.reject(new Error('settings unavailable'));
    });

    render(<App />);

    await user.selectOptions(await screen.findByLabelText('语言'), 'en-US');

    expect(screen.getByRole('heading', { name: 'Skill Panel' })).toBeInTheDocument();
    expect(screen.getByLabelText('Language')).toHaveValue('en-US');
  });

  it('keeps a user-selected language when settings load returns late', async () => {
    const user = userEvent.setup();
    const loadSettings = deferred<AppSettings>();
    invokeMock.mockImplementation((command: string) => {
      if (command === 'load_app_settings') {
        return loadSettings.promise;
      }

      return Promise.resolve({
        language: 'en-US',
        customScanDirectories: [],
        showDefaultScanDirectories: true,
      });
    });

    render(<App />);

    await user.selectOptions(screen.getByLabelText('语言'), 'en-US');
    expect(screen.getByRole('heading', { name: 'Skill Panel' })).toBeInTheDocument();

    loadSettings.resolve({
      language: 'zh-CN',
      customScanDirectories: [],
      showDefaultScanDirectories: true,
    });

    await waitFor(() => expect(invokeMock).toHaveBeenCalledWith('load_app_settings'));
    expect(screen.getByRole('heading', { name: 'Skill Panel' })).toBeInTheDocument();
    expect(screen.getByLabelText('Language')).toHaveValue('en-US');
  });
});
