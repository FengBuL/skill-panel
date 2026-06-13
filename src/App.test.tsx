import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from './App';
import type { AppSettings, SkillDetail, SkillSummary } from './types/skill';

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

const parsedScanResults: SkillSummary[] = scanResults.map((skill) => ({
  ...skill,
  parseStatus: 'parsed',
}));

const dateTimeFormatOptions: Intl.DateTimeFormatOptions = {
  dateStyle: 'medium',
  timeStyle: 'medium',
};

function expectedDateTime(locale: string, value: string | Date) {
  return new Intl.DateTimeFormat(locale, dateTimeFormatOptions).format(value instanceof Date ? value : new Date(value));
}

const paginatedScanResults: SkillSummary[] = Array.from({ length: 12 }, (_, index) => {
  const skillNumber = index + 1;
  const paddedNumber = String(skillNumber).padStart(2, '0');

  return {
    path: `C:\\Users\\demo\\.codex\\skills\\skill-${paddedNumber}\\SKILL.md`,
    name: `skill ${paddedNumber}`,
    description:
      skillNumber === 12
        ? 'A long description that should stay visually compact when rendered in the skill list table.'
        : `Description for skill ${paddedNumber}`,
    source: skillNumber === 12 ? 'plugin-cache' : 'codex-user',
    parseStatus: 'parsed',
    modifiedAt: null,
  };
});

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

    if (command === 'open_skill_folder') {
      return Promise.resolve();
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

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the empty desktop shell with zh-CN text from i18n', async () => {
    render(<App />);

    expect(await screen.findByRole('heading', { name: 'Skill Panel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '重新扫描' })).toBeInTheDocument();
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
    expect(screen.getByRole('button', { name: 'Rescan' })).toBeInTheDocument();
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
    expect(screen.getByText('Storage location')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /All Skills/i })).toBeInTheDocument();
    expect(screen.queryByText('Filters')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Writable' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'With issues' })).not.toBeInTheDocument();

    expect(screen.getByRole('region', { name: 'Skills' })).toBeInTheDocument();
    expect(screen.getByRole('searchbox', { name: 'Search skills' })).toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: 'Source filter' })).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: 'Status filter' })).not.toBeInTheDocument();

    expect(screen.getByRole('complementary', { name: 'Skill details' })).toBeInTheDocument();
    expect(screen.getByText('Metadata')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Tools')).toBeInTheDocument();
    expect(screen.getByText('Tags')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Open path' })).toBeInTheDocument();
  });

  it('aligns the top command bar as product name, centered scan status, and right-side commands', async () => {
    mockNavigatorLanguages(['en-US']);
    render(<App />);

    const commandBar = screen.getByRole('banner');
    const brand = commandBar.querySelector('.command-brand');
    const scanStatus = commandBar.querySelector('.command-status');
    const actions = commandBar.querySelector('.command-actions');

    expect(commandBar).toHaveClass('top-command-bar');
    expect(brand).toHaveTextContent('Skill Panel');
    expect(brand?.querySelector('.eyebrow')).not.toBeInTheDocument();
    expect(scanStatus).toHaveAccessibleName('Scan status');
    expect(scanStatus).toHaveTextContent(/Scan state:/);
    expect(scanStatus).toHaveTextContent(/Last scan:/);

    expect(within(actions as HTMLElement).getByRole('button', { name: 'Rescan' })).toBeInTheDocument();
    expect(within(actions as HTMLElement).getByRole('button', { name: 'New Skill' })).toBeInTheDocument();
    const languageSelect = within(actions as HTMLElement).getByRole('combobox', { name: 'Language' });
    const settingsButton = within(actions as HTMLElement).getByRole('button', { name: 'Settings' });
    expect(Boolean(languageSelect.compareDocumentPosition(settingsButton) & Node.DOCUMENT_POSITION_FOLLOWING)).toBe(true);
  });

  it('marks the top scan status as scanning while a scan request is in flight', async () => {
    const loadingScan = deferred<SkillSummary[]>();
    mockNavigatorLanguages(['en-US']);
    invokeMock.mockImplementation((command: string) => {
      if (command === 'load_app_settings') {
        return Promise.resolve({
          language: 'en-US',
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

    const scanStatus = await screen.findByLabelText('Scan status');
    expect(scanStatus).toHaveClass('scan-summary-scanning');
    expect(scanStatus).toHaveTextContent('Scanning');

    await act(async () => {
      loadingScan.resolve([]);
    });
  });

  it('renders the source rail with icons, counts, and current storage location', async () => {
    mockNavigatorLanguages(['en-US']);
    mockInvoke({
      skills: scanResults,
      settings: {
        language: 'en-US',
        customScanDirectories: ['D:\\Team\\skills'],
        showDefaultScanDirectories: true,
      },
    });

    render(<App />);

    await screen.findByRole('row', { name: /imagegen/i });

    const sources = screen.getByRole('complementary', { name: 'Sources' });
    const expectedItems = [
      ['All Skills', '3'],
      ['Codex', '1'],
      ['Agents', '1'],
      ['Plugin Skills', '1'],
      ['Custom directories', '0'],
    ];

    for (const [label, count] of expectedItems) {
      const button = within(sources).getByRole('button', { name: new RegExp(`${label}\\s+${count}`, 'i') });
      expect(within(button).getByText(label)).toBeInTheDocument();
      expect(within(button).getByText(count)).toBeInTheDocument();
      expect(button.querySelector('.source-nav-icon')).toBeInTheDocument();
    }

    expect(within(sources).getByText('Storage location')).toBeInTheDocument();
    expect(within(sources).getByText('%USERPROFILE%\\.codex\\skills')).toBeInTheDocument();
    expect(within(sources).getByText('%USERPROFILE%\\.agents\\skills')).toBeInTheDocument();
    expect(within(sources).getByText('D:\\Team\\skills')).toBeInTheDocument();
    expect(within(sources).getByRole('button', { name: 'Manage storage' })).toBeInTheDocument();
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

  it('shows a successful scan status with the scan completion time', async () => {
    const scanFinishedAt = new Date('2026-06-12T06:30:45Z');
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(scanFinishedAt);
    mockNavigatorLanguages(['en-US']);
    mockInvoke({ skills: parsedScanResults });

    render(<App />);

    expect(await screen.findByRole('row', { name: /imagegen/i })).toBeInTheDocument();
    expect(screen.getByText('Success')).toBeInTheDocument();
    expect(screen.getByText(expectedDateTime('en-US', scanFinishedAt))).toBeInTheDocument();
    expect(screen.queryByText('Not scanned')).not.toBeInTheDocument();
  });

  it('shows a partial success scan status when any scanned skill has parse issues', async () => {
    mockNavigatorLanguages(['en-US']);
    mockInvoke({ skills: scanResults });

    render(<App />);

    expect(await screen.findByRole('row', { name: /browser control/i })).toBeInTheDocument();
    expect(screen.getByText('Partial success')).toBeInTheDocument();
  });

  it('records failed scan status and completion time', async () => {
    const scanFailedAt = new Date('2026-06-12T07:15:10Z');
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(scanFailedAt);
    mockNavigatorLanguages(['en-US']);
    invokeMock.mockImplementation((command: string) => {
      if (command === 'load_app_settings') {
        return Promise.resolve({
          language: 'en-US',
          customScanDirectories: [],
          showDefaultScanDirectories: true,
        });
      }

      if (command === 'scan_skills') {
        return Promise.reject(new Error('scan failed'));
      }

      return Promise.reject(new Error('unexpected command'));
    });

    render(<App />);

    expect(await screen.findByText('Scan failed')).toBeInTheDocument();
    expect(screen.getByText('Failed')).toBeInTheDocument();
    expect(screen.getByText(expectedDateTime('en-US', scanFailedAt))).toBeInTheDocument();
  });

  it('formats skill modified times as localized date and time values', async () => {
    mockNavigatorLanguages(['en-US']);
    mockInvoke({ skills: scanResults });

    render(<App />);

    const row = await screen.findByRole('row', { name: /imagegen/i });
    expect(within(row).getByText(expectedDateTime('en-US', '2026-05-30T08:15:00Z'))).toBeInTheDocument();
    expect(screen.queryByText('2026-05-30T08:15:00Z')).not.toBeInTheDocument();
  });

  it('paginates the skill list ten skills at a time', async () => {
    const user = userEvent.setup();
    mockNavigatorLanguages(['en-US']);
    mockInvoke({ skills: paginatedScanResults });

    render(<App />);

    expect(await screen.findByRole('row', { name: /skill 01/i })).toBeInTheDocument();
    expect(screen.getByRole('row', { name: /skill 10/i })).toBeInTheDocument();
    expect(screen.queryByRole('row', { name: /skill 11/i })).not.toBeInTheDocument();
    expect(screen.getByText('Page 1 of 2')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Next page' }));

    expect(screen.queryByRole('row', { name: /skill 01/i })).not.toBeInTheDocument();
    expect(screen.getByRole('row', { name: /skill 11/i })).toBeInTheDocument();
    expect(screen.getByRole('row', { name: /skill 12/i })).toBeInTheDocument();
    expect(screen.getByText('Page 2 of 2')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
  });

  it('returns to the first page when search or the source rail changes', async () => {
    const user = userEvent.setup();
    mockNavigatorLanguages(['en-US']);
    mockInvoke({ skills: paginatedScanResults });

    render(<App />);

    await screen.findByRole('row', { name: /skill 01/i });
    await user.click(screen.getByRole('button', { name: 'Next page' }));
    await user.type(screen.getByRole('searchbox', { name: 'Search skills' }), 'skill 12');

    expect(screen.getByRole('row', { name: /skill 12/i })).toBeInTheDocument();
    expect(screen.getByText('Page 1 of 1')).toBeInTheDocument();

    await user.clear(screen.getByRole('searchbox', { name: 'Search skills' }));
    await user.click(screen.getByRole('button', { name: 'Next page' }));
    await user.click(screen.getByRole('button', { name: /Plugin Skills/i }));

    expect(screen.getByRole('row', { name: /skill 12/i })).toBeInTheDocument();
    expect(screen.getByText('Page 1 of 1')).toBeInTheDocument();
  });

  it('marks skill list descriptions for two-line visual clamping', async () => {
    mockNavigatorLanguages(['en-US']);
    mockInvoke({ skills: paginatedScanResults });

    render(<App />);

    const description = await screen.findByText('Description for skill 01');
    expect(description).toHaveClass('skill-description');
  });

  it('marks the dashboard, panels, and stretch regions with fluid layout hooks', async () => {
    const user = userEvent.setup();
    mockNavigatorLanguages(['en-US']);
    const selectedDetail: SkillDetail = {
      ...paginatedScanResults[0],
      markdown: '# Skill 01\n\nReadable body',
      bodyMarkdown: '# Skill 01\n\nReadable body',
      rawContent: '---\nname: skill 01\ndescription: Description for skill 01\n---\n# Skill 01\n\nReadable body',
      frontmatter: {
        name: 'skill 01',
        description: 'Description for skill 01',
      },
    };
    invokeMock.mockImplementation((command: string, args?: unknown) => {
      if (command === 'load_app_settings') {
        return Promise.resolve({
          language: 'en-US',
          customScanDirectories: [],
          showDefaultScanDirectories: true,
        });
      }

      if (command === 'scan_skills') {
        return Promise.resolve(paginatedScanResults);
      }

      if (command === 'read_skill') {
        expect(args).toEqual({ path: paginatedScanResults[0].path });
        return Promise.resolve(selectedDetail);
      }

      if (command === 'open_skill_folder') {
        return Promise.resolve();
      }

      return Promise.reject(new Error(`Unexpected command: ${command}`));
    });

    render(<App />);

    const dashboard = await screen.findByRole('region', { name: 'Skill management dashboard' });
    const listPanel = screen.getByRole('region', { name: 'Skills' });
    const detailPanel = screen.getByRole('complementary', { name: 'Skill details' });

    expect(screen.getByRole('main')).toHaveClass('fluid-app-shell');
    expect(dashboard).toHaveClass('fluid-dashboard-grid');
    expect(screen.getByRole('complementary', { name: 'Sources' })).toHaveClass('fluid-sidebar-panel');
    expect(listPanel).toHaveClass('fluid-list-panel');
    expect(detailPanel).toHaveClass('fluid-detail-panel');
    expect(listPanel.querySelector('.skill-table-wrap')).toHaveClass('fluid-table-region');

    await user.click(screen.getByRole('row', { name: /skill 01/i }));

    const markdownInput = await screen.findByRole('textbox', { name: 'Markdown body' });
    expect(markdownInput.closest('.detail-markdown-section')).toHaveClass('fluid-markdown-region');
    expect(markdownInput).toHaveClass('fluid-markdown-input');
  });

  it('opens a skill folder from the list path button', async () => {
    const user = userEvent.setup();
    mockNavigatorLanguages(['en-US']);
    mockInvoke({ skills: scanResults });

    render(<App />);

    const row = await screen.findByRole('row', { name: /browser control/i });
    const pathButton = within(row).getByRole('button', { name: scanResults[1].path });

    expect(pathButton).toHaveAttribute('title', scanResults[1].path);
    await user.click(pathButton);

    await waitFor(() => expect(invokeMock).toHaveBeenCalledWith('open_skill_folder', { path: scanResults[1].path }));
    expect(invokeMock).not.toHaveBeenCalledWith('read_skill', { path: scanResults[1].path });
  });

  it('loads Agents user skill details with metadata, markdown, source, modified time, and path', async () => {
    const user = userEvent.setup();
    mockNavigatorLanguages(['en-US']);
    const agentsDetail: SkillDetail = {
      ...scanResults[2],
      markdown: '# Standup\n\nDaily summary body.',
      bodyMarkdown: '# Standup\n\nDaily summary body.',
      rawContent: '---\nname: standup report\ndescription: Prepare daily task summaries\n---\n# Standup\n\nDaily summary body.',
      frontmatter: {
        name: 'standup report',
        description: 'Prepare daily task summaries',
      },
    };
    invokeMock.mockImplementation((command: string, args?: unknown) => {
      if (command === 'load_app_settings') {
        return Promise.resolve({
          language: 'en-US',
          customScanDirectories: [],
          showDefaultScanDirectories: true,
        });
      }

      if (command === 'scan_skills') {
        return Promise.resolve(scanResults);
      }

      if (command === 'read_skill') {
        expect(args).toEqual({ path: scanResults[2].path });
        return Promise.resolve(agentsDetail);
      }

      if (command === 'open_skill_folder') {
        return Promise.resolve();
      }

      return Promise.reject(new Error(`Unexpected command: ${command}`));
    });

    render(<App />);

    await user.click(await screen.findByRole('row', { name: /standup report/i }));

    expect(await screen.findByDisplayValue('standup report')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Prepare daily task summaries')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Markdown body' })).toHaveValue('# Standup\n\nDaily summary body.');
    expect(screen.getAllByText('Agents user').length).toBeGreaterThan(0);
    expect(screen.getAllByText(expectedDateTime('en-US', '2026-06-01T11:00:00Z')).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('button', { name: scanResults[2].path }).length).toBeGreaterThan(0);
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

  it('filters skills by source from the source rail', async () => {
    const user = userEvent.setup();
    mockInvoke({ skills: scanResults });

    render(<App />);

    await screen.findByRole('row', { name: /imagegen/i });
    await user.click(screen.getByRole('button', { name: /插件 Skill/i }));

    expect(screen.getByRole('row', { name: /browser control/i })).toBeInTheDocument();
    expect(screen.queryByRole('row', { name: /imagegen/i })).not.toBeInTheDocument();
  });

  it('combines sidebar source filtering and text search', async () => {
    const user = userEvent.setup();
    mockNavigatorLanguages(['en-US']);
    mockInvoke({ skills: scanResults });

    render(<App />);

    await screen.findByRole('row', { name: /imagegen/i });
    await user.click(screen.getByRole('button', { name: /Plugin Skills/i }));
    await user.type(screen.getByRole('searchbox', { name: 'Search skills' }), 'control');

    expect(screen.getByRole('row', { name: /browser control/i })).toBeInTheDocument();
    expect(screen.queryByRole('row', { name: /imagegen/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('row', { name: /standup report/i })).not.toBeInTheDocument();
    expect(screen.getByText('1 skills')).toBeInTheDocument();

    await user.clear(screen.getByRole('searchbox', { name: 'Search skills' }));
    await user.type(screen.getByRole('searchbox', { name: 'Search skills' }), 'missing skill');

    expect(screen.getByText('No matching skills')).toBeInTheDocument();
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

    await userEvent.click(screen.getByRole('button', { name: '重新扫描' }));

    expect(await screen.findByText('扫描失败')).toBeInTheDocument();
    expect(screen.getByText('scan failed')).toBeInTheDocument();
  });
  it('opens settings and renders language, default paths, and custom directories', async () => {
    const user = userEvent.setup();
    mockNavigatorLanguages(['en-US']);
    mockInvoke({
      settings: {
        language: 'en-US',
        customScanDirectories: ['D:\\Team\\skills'],
        showDefaultScanDirectories: true,
      },
    });

    render(<App />);

    await user.click(await screen.findByRole('button', { name: 'Settings' }));

    const settingsPanel = screen.getByRole('region', { name: 'Application settings' });
    expect(settingsPanel).toBeInTheDocument();
    expect(within(settingsPanel).getByRole('combobox', { name: 'Settings language' })).toHaveValue('en-US');
    expect(within(settingsPanel).getByText('Windows default paths')).toBeInTheDocument();
    expect(within(settingsPanel).getByText('%USERPROFILE%\\.codex\\skills')).toBeInTheDocument();
    expect(within(settingsPanel).getByText('%USERPROFILE%\\.agents\\skills')).toBeInTheDocument();
    expect(within(settingsPanel).getByText('macOS default paths')).toBeInTheDocument();
    expect(within(settingsPanel).getByText('~/.codex/skills')).toBeInTheDocument();
    expect(within(settingsPanel).getByText('~/.agents/skills')).toBeInTheDocument();
    expect(within(settingsPanel).getByText('D:\\Team\\skills')).toBeInTheDocument();
  });

  it('adds and removes custom directories before saving settings', async () => {
    const user = userEvent.setup();
    mockNavigatorLanguages(['en-US']);
    mockInvoke({
      settings: {
        language: 'en-US',
        customScanDirectories: ['D:\\Team\\skills'],
        showDefaultScanDirectories: true,
      },
    });

    render(<App />);

    await user.click(await screen.findByRole('button', { name: 'Settings' }));
    await user.type(screen.getByRole('textbox', { name: 'Custom directory path' }), 'E:\\AI\\skills');
    await user.click(screen.getByRole('button', { name: 'Add directory' }));
    await user.click(screen.getByRole('button', { name: 'Remove D:\\Team\\skills' }));
    await user.click(screen.getByRole('checkbox', { name: 'Show default scan directories' }));
    await user.click(screen.getByRole('button', { name: 'Save settings' }));

    await waitFor(() =>
      expect(invokeMock).toHaveBeenCalledWith('save_app_settings', {
        settings: {
          language: 'en-US',
          customScanDirectories: ['E:\\AI\\skills'],
          showDefaultScanDirectories: false,
        },
      }),
    );
    expect(screen.getByText('Settings saved')).toBeInTheDocument();
  });

  it('saves the language selected inside the settings panel', async () => {
    const user = userEvent.setup();
    mockNavigatorLanguages(['en-US']);
    mockInvoke({
      settings: {
        language: 'en-US',
        customScanDirectories: ['D:\\Team\\skills'],
        showDefaultScanDirectories: true,
      },
    });

    render(<App />);

    await user.click(await screen.findByRole('button', { name: 'Settings' }));
    await user.selectOptions(screen.getByRole('combobox', { name: 'Settings language' }), 'zh-CN');
    await user.click(screen.getByRole('button', { name: 'Save settings' }));

    await waitFor(() =>
      expect(invokeMock).toHaveBeenCalledWith('save_app_settings', {
        settings: {
          language: 'zh-CN',
          customScanDirectories: ['D:\\Team\\skills'],
          showDefaultScanDirectories: true,
        },
      }),
    );
    expect(screen.getByRole('heading', { name: 'Skill Panel' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: '语言' })).toHaveValue('zh-CN');
  });

  it('shows a settings load failure inside the settings panel', async () => {
    const user = userEvent.setup();
    mockNavigatorLanguages(['en-US']);
    invokeMock.mockImplementation((command: string) => {
      if (command === 'load_app_settings') {
        return Promise.reject(new Error('load failed'));
      }

      if (command === 'scan_skills') {
        return Promise.resolve([]);
      }

      return Promise.reject(new Error('unexpected command'));
    });

    render(<App />);

    await user.click(await screen.findByRole('button', { name: 'Settings' }));

    expect(screen.getByText('Settings load failed')).toBeInTheDocument();
    expect(screen.getByText('load failed')).toBeInTheDocument();
  });

  it('shows a settings save failure inside the settings panel', async () => {
    const user = userEvent.setup();
    mockNavigatorLanguages(['en-US']);
    invokeMock.mockImplementation((command: string) => {
      if (command === 'load_app_settings') {
        return Promise.resolve({
          language: 'en-US',
          customScanDirectories: [],
          showDefaultScanDirectories: true,
        });
      }

      if (command === 'scan_skills') {
        return Promise.resolve([]);
      }

      if (command === 'save_app_settings') {
        return Promise.reject(new Error('save failed'));
      }

      return Promise.reject(new Error('unexpected command'));
    });

    render(<App />);

    await user.click(await screen.findByRole('button', { name: 'Settings' }));
    await user.click(screen.getByRole('button', { name: 'Save settings' }));

    expect(await screen.findByText('Settings save failed')).toBeInTheDocument();
    expect(screen.getByText('save failed')).toBeInTheDocument();
  });
});
