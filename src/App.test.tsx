import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from './App';
import type { AppSettings, SkillSummary } from './types/skill';

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

const scanResults: SkillSummary[] = [
  {
    path: 'C:\\Users\\demo\\.codex\\skills\\imagegen\\SKILL.md',
    name: 'imagegen',
    description: 'Generate or edit raster images',
    source: 'codex-user',
    parseStatus: 'parsed',
    modifiedAt: '2026-05-30T08:15:00Z',
  },
  {
    path: 'C:\\Users\\demo\\.codex\\plugins\\cache\\browser\\skills\\control\\SKILL.md',
    name: 'browser control',
    description: 'Control local web targets',
    source: 'plugin-cache',
    parseStatus: 'invalid-frontmatter',
    modifiedAt: null,
  },
  {
    path: 'C:\\Users\\demo\\.agents\\skills\\standup\\SKILL.md',
    name: 'standup report',
    description: 'Prepare daily task summaries',
    source: 'agents-user',
    parseStatus: 'parsed',
    modifiedAt: '2026-06-01T11:00:00Z',
  },
];

function mockInvoke({
  skills = [],
  settings = {
    language: 'system',
    customScanDirectories: [],
    showDefaultScanDirectories: true,
  },
}: {
  skills?: SkillSummary[];
  settings?: AppSettings;
} = {}) {
  invokeMock.mockImplementation((command: string) => {
    if (command === 'load_app_settings') {
      return Promise.resolve(settings);
    }

    if (command === 'scan_skills') {
      return Promise.resolve(skills);
    }

    if (command === 'save_app_settings') {
      return Promise.resolve(settings);
    }

    return Promise.reject(new Error(`Unexpected command: ${command}`));
  });
}

describe('App shell', () => {
  beforeEach(() => {
    invokeMock.mockReset();
    mockInvoke();
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

  it('renders the management console regions and key controls after switching to English', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.selectOptions(await screen.findByLabelText('语言'), 'en-US');

    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Settings' })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Sources' })).toBeInTheDocument();
    expect(screen.getByText('Source status')).toBeInTheDocument();
    expect(screen.getByText('Filters')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'All sources' })).toBeInTheDocument();

    expect(screen.getByRole('region', { name: 'Skills' })).toBeInTheDocument();
    expect(screen.getByRole('searchbox', { name: 'Search skills' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Source filter' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Status filter' })).toBeInTheDocument();

    expect(screen.getByRole('complementary', { name: 'Skill details' })).toBeInTheDocument();
    expect(screen.getByText('Metadata')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Tools')).toBeInTheDocument();
    expect(screen.getByText('Tags')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Open path' })).toBeInTheDocument();
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

      if (command === 'scan_skills') {
        return Promise.resolve([]);
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

  it('loads and renders scanned skills with source and status metadata', async () => {
    mockNavigatorLanguages(['en-US']);
    mockInvoke({ skills: scanResults });

    render(<App />);

    expect(await screen.findByRole('row', { name: /imagegen/i })).toBeInTheDocument();
    expect(screen.getByRole('row', { name: /browser control/i })).toBeInTheDocument();
    expect(screen.getByRole('row', { name: /standup report/i })).toBeInTheDocument();
    expect(screen.getByText('3 skills')).toBeInTheDocument();
    expect(screen.getAllByText('Codex user').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Invalid frontmatter').length).toBeGreaterThan(0);
    expect(invokeMock).toHaveBeenCalledWith('scan_skills');
  });

  it('filters skills by name, description, and path search text', async () => {
    const user = userEvent.setup();
    mockInvoke({ skills: scanResults });

    render(<App />);

    await screen.findByRole('row', { name: /imagegen/i });
    await user.type(screen.getByRole('searchbox', { name: '搜索 Skill' }), 'plugins');

    expect(screen.getByRole('row', { name: /browser control/i })).toBeInTheDocument();
    expect(screen.queryByRole('row', { name: /imagegen/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('row', { name: /standup report/i })).not.toBeInTheDocument();
  });

  it('filters skills by source', async () => {
    const user = userEvent.setup();
    mockInvoke({ skills: scanResults });

    render(<App />);

    await screen.findByRole('row', { name: /imagegen/i });
    await user.selectOptions(screen.getByRole('combobox', { name: '来源筛选' }), 'plugin-cache');

    expect(screen.getByRole('row', { name: /browser control/i })).toBeInTheDocument();
    expect(screen.queryByRole('row', { name: /imagegen/i })).not.toBeInTheDocument();
  });

  it('filters skills by parse status', async () => {
    const user = userEvent.setup();
    mockInvoke({ skills: scanResults });

    render(<App />);

    await screen.findByRole('row', { name: /browser control/i });
    await user.selectOptions(screen.getByRole('combobox', { name: '状态筛选' }), 'invalid-frontmatter');

    expect(screen.getByRole('row', { name: /browser control/i })).toBeInTheDocument();
    expect(screen.queryByRole('row', { name: /imagegen/i })).not.toBeInTheDocument();
  });

  it('shows an empty filtered state when no skill matches filters', async () => {
    const user = userEvent.setup();
    mockInvoke({ skills: scanResults });

    render(<App />);

    await screen.findByRole('row', { name: /imagegen/i });
    await user.type(screen.getByRole('searchbox', { name: '搜索 Skill' }), 'missing skill name');

    expect(screen.getByText('没有匹配的 Skill')).toBeInTheDocument();
    expect(screen.queryByRole('table', { name: 'Skill 列表' })).not.toBeInTheDocument();
  });

  it('shows loading and error states for skill scanning', async () => {
    const loadingScan = deferred<SkillSummary[]>();
    invokeMock.mockImplementation((command: string) => {
      if (command === 'load_app_settings') {
        return Promise.resolve({
          language: 'system',
          customScanDirectories: [],
          showDefaultScanDirectories: true,
        });
      }

      if (command === 'scan_skills') {
        return loadingScan.promise;
      }

      return Promise.reject(new Error('unexpected command'));
    });

    render(<App />);

    expect(screen.getByText('正在加载 Skill...')).toBeInTheDocument();
    await act(async () => {
      loadingScan.resolve([]);
    });
    expect(await screen.findByText('暂无已扫描的 Skill')).toBeInTheDocument();

    invokeMock.mockImplementation((command: string) => {
      if (command === 'scan_skills') {
        return Promise.reject(new Error('scan failed'));
      }

      if (command === 'load_app_settings') {
        return Promise.resolve({
          language: 'system',
          customScanDirectories: [],
          showDefaultScanDirectories: true,
        });
      }

      return Promise.reject(new Error('unexpected command'));
    });

    await userEvent.click(screen.getByRole('button', { name: '手动扫描' }));

    expect(await screen.findByText('扫描失败')).toBeInTheDocument();
    expect(screen.getByText('scan failed')).toBeInTheDocument();
  });
});
