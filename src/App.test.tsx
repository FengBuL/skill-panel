import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { readFileSync } from 'node:fs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from './App';
import type { AppSettings, SkillDetail, SkillSummary } from './types/skill';

const { invokeMock } = vi.hoisted(() => ({
  invokeMock: vi.fn(),
}));

vi.mock('@tauri-apps/api/core', () => ({
  invoke: invokeMock,
}));

const { openMock } = vi.hoisted(() => ({
  openMock: vi.fn(),
}));

vi.mock('@tauri-apps/plugin-dialog', () => ({
  open: openMock,
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

async function openSkillLibrary(user: ReturnType<typeof userEvent.setup>) {
  await user.click(await screen.findByRole('button', { name: /Skill Library/i }));
  await screen.findAllByRole('region', { name: /Skill category:/i });
}

function getSkillCardByPath(container: HTMLElement, path: string) {
  return Array.from(container.querySelectorAll<HTMLElement>('[data-skill-card-path]')).find(
    (element) => element.dataset.skillCardPath === path,
  );
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

const categorizedScanResults: SkillSummary[] = [
  {
    path: 'C:\\Users\\demo\\.codex\\skills\\stock-flow\\SKILL.md',
    name: 'stock-flow',
    description: 'Analyze stock and finance workflows with market data.',
    source: 'codex-user',
    parseStatus: 'parsed',
    modifiedAt: '2026-05-30T08:15:00Z',
  },
  {
    path: 'C:\\Users\\demo\\.codex\\skills\\sheet-flow\\SKILL.md',
    name: 'sheet-flow',
    description: 'Clean CSV sheet data and table exports.',
    source: 'codex-user',
    parseStatus: 'parsed',
    modifiedAt: '2026-05-30T08:15:00Z',
  },
  {
    path: 'C:\\Users\\demo\\.codex\\skills\\write-flow\\SKILL.md',
    name: 'write-flow',
    description: 'Write mail and document drafts.',
    source: 'codex-user',
    parseStatus: 'parsed',
    modifiedAt: '2026-05-30T08:15:00Z',
  },
];

const recentDashboardResults: SkillSummary[] = [
  {
    path: 'C:\\Users\\demo\\.codex\\skills\\recent-flow\\SKILL.md',
    name: 'recent-flow',
    description: 'Recently used local automation.',
    source: 'codex-user',
    parseStatus: 'parsed',
    modifiedAt: '2026-06-29T08:15:00Z',
  },
  {
    path: 'C:\\Users\\demo\\.codex\\skills\\recent-write\\SKILL.md',
    name: 'recent-write',
    description: 'Recently updated writing skill.',
    source: 'codex-user',
    parseStatus: 'parsed',
    modifiedAt: '2026-06-30T09:00:00Z',
  },
];

const manyDataSkills: SkillSummary[] = Array.from({ length: 9 }, (_, index) => ({
  path: `C:\\Users\\demo\\.codex\\skills\\sheet-flow-${index + 1}\\SKILL.md`,
  name: `sheet-flow-${index + 1}`,
  description: `Clean CSV sheet data and table exports ${index + 1}.`,
  source: 'codex-user',
  parseStatus: 'parsed',
  modifiedAt: '2026-05-30T08:15:00Z',
}));

const defaultScanPathGroups = [
  {
    labelKey: 'settings.windowsDefaultPaths',
    paths: ['C:\\Users\\demo\\.codex\\skills', 'C:\\Users\\demo\\.agents\\skills'],
  },
];

function getTestCategoryAssignments(skills: SkillSummary[]): Record<string, string[]> {
  const assignments: Record<string, string[]> = {};

  for (const skill of skills) {
    if (skill.name === 'stock-flow') {
      assignments[skill.path] = ['finance', 'data'];
    }
    if (skill.name === 'sheet-flow' || skill.name.startsWith('sheet-flow-') || skill.name === 'skill 12') {
      assignments[skill.path] = ['data'];
    }
    if (skill.name === 'write-flow') {
      assignments[skill.path] = ['writing'];
    }
  }

  return assignments;
}

function mockInvoke({
  skills = [],
  settings,
}: {
  skills?: SkillSummary[];
  settings?: AppSettings;
} = {}) {
  const resolvedSettings: AppSettings =
    settings ?? {
      language: 'system',
      customScanDirectories: [],
      showDefaultScanDirectories: true,
      skillCategoryAssignments: getTestCategoryAssignments(skills),
    };
  if (settings && !settings.skillCategoryAssignments) {
    resolvedSettings.skillCategoryAssignments = getTestCategoryAssignments(skills);
  }
  invokeMock.mockImplementation((command: string, payload?: unknown) => {
    if (command === 'load_app_settings') {
      return Promise.resolve(resolvedSettings);
    }

    if (command === 'scan_skills') {
      return Promise.resolve(skills);
    }

    if (command === 'default_scan_path_groups') {
      return Promise.resolve(defaultScanPathGroups);
    }

    if (command === 'save_app_settings') {
      return Promise.resolve(resolvedSettings);
    }

    if (command === 'open_skill_folder') {
      return Promise.resolve();
    }

    if (command === 'read_skill') {
      const path = (payload as { path?: string } | undefined)?.path;
      const skill = skills.find((currentSkill) => currentSkill.path === path);
      if (skill) {
        return Promise.resolve({
          ...skill,
          bodyMarkdown: `# ${skill.name}`,
          frontmatter: { description: skill.description, name: skill.name },
          markdown: `# ${skill.name}`,
          rawContent: `---\nname: ${skill.name}\ndescription: ${skill.description}\n---\n\n# ${skill.name}`,
        } satisfies SkillDetail);
      }
    }

    if (command === 'delete_skill') {
      return Promise.resolve();
    }

    return Promise.reject(new Error(`Unexpected command: ${command}`));
  });
}

describe('App shell', () => {
  beforeEach(() => {
    invokeMock.mockReset();
    openMock.mockReset();
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
    expect(screen.getByLabelText('语言')).toHaveValue('zh-CN');
    expect(invokeMock).toHaveBeenCalledWith('load_app_settings');
  });

  it('shows a scan error instead of demo skills when the desktop bridge is unavailable', async () => {
    invokeMock.mockImplementation((command: string) => {
      if (command === 'load_app_settings') {
        return Promise.resolve({
          language: 'zh-CN',
          customScanDirectories: [],
          showDefaultScanDirectories: true,
        });
      }

      if (command === 'scan_skills') {
        return Promise.reject(new Error('__TAURI__ invoke is not available'));
      }

      return Promise.reject(new Error(`Unexpected command: ${command}`));
    });

    render(<App />);

    expect(await screen.findByText('扫描失败')).toBeInTheDocument();
    expect(screen.getByText('__TAURI__ invoke is not available')).toBeInTheDocument();
    expect(screen.queryByText('a-share-daily-update')).not.toBeInTheDocument();
  });

  it('turns scan failures into actionable diagnostics', async () => {
    const user = userEvent.setup();
    mockNavigatorLanguages(['en-US']);
    invokeMock.mockImplementation((command: string) => {
      if (command === 'load_app_settings') {
        return Promise.resolve({
          language: 'en-US',
          customScanDirectories: ['D:\\Team\\skills'],
          showDefaultScanDirectories: true,
        });
      }

      if (command === 'scan_skills') {
        return Promise.reject(new Error('__TAURI__ invoke is not available'));
      }

      return Promise.reject(new Error(`Unexpected command: ${command}`));
    });

    render(<App />);

    expect(await screen.findByRole('region', { name: 'Scan diagnostics' })).toBeInTheDocument();
    expect(screen.getByText('Desktop bridge unavailable')).toBeInTheDocument();
    expect(screen.getByText('The app is running without the desktop bridge, so local skill commands cannot run.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Review scan settings' }));
    expect(await screen.findByText('D:\\Team\\skills')).toBeInTheDocument();
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
          categoryColors: {},
          categoryLabels: {},
          skillTags: {},
        },
      }),
    );
  });

  it('offers only Chinese and English in the top language switcher', async () => {
    render(<App />);

    const languageSelect = await screen.findByLabelText('语言');
    expect(within(languageSelect).getAllByRole('option').map((option) => option.textContent)).toEqual(['简体中文', 'English']);
    expect(within(languageSelect).queryByRole('option', { name: '跟随系统' })).not.toBeInTheDocument();
  });

  it('renders the management console regions and key controls after switching to English', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.selectOptions(await screen.findByLabelText('语言'), 'en-US');

    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Settings' })).toBeInTheDocument();
    const navigation = screen.getByRole('navigation', { name: 'Primary navigation' });
    expect(navigation).toBeInTheDocument();
    expect(within(navigation).getByRole('button', { name: /Dashboard/i })).toBeInTheDocument();
    expect(within(navigation).getByRole('button', { name: /Skill Library/i })).toBeInTheDocument();
    expect(within(navigation).getByRole('button', { name: /Skill Editor/i })).toBeInTheDocument();
    expect(screen.queryByText('Filters')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Writable' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'With issues' })).not.toBeInTheDocument();

    expect(screen.getByRole('region', { name: 'Skills' })).toBeInTheDocument();
    await user.click(within(navigation).getByRole('button', { name: /Dashboard/i }));
    expect(screen.getByRole('region', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByRole('searchbox', { name: 'Search skills' })).toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: 'Source filter' })).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: 'Status filter' })).not.toBeInTheDocument();

    expect(screen.queryByRole('complementary', { name: 'Skill details' })).not.toBeInTheDocument();
  });

  it('presents governance-first navigation for sources, safety, and tags', async () => {
    mockNavigatorLanguages(['en-US']);
    mockInvoke({ skills: scanResults });

    render(<App />);

    const primaryNavigation = await screen.findByRole('navigation', { name: 'Primary navigation' });
    const organizeInsights = screen.getByRole('region', { name: 'Organize insights' });

    expect(within(primaryNavigation).getByRole('button', { name: /Dashboard/i })).toBeInTheDocument();
    expect(within(primaryNavigation).getByRole('button', { name: /Skill Library/i })).toBeInTheDocument();
    expect(within(primaryNavigation).getByRole('button', { name: /Skill Editor/i })).toBeInTheDocument();
    expect(within(organizeInsights).getByRole('button', { name: /Parse issues\s+1/i })).toBeInTheDocument();
    expect(within(organizeInsights).getByRole('button', { name: /Protected source\s+1/i })).toBeInTheDocument();
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

  it('renders the category rail with icons, counts, and current storage location', async () => {
    const user = userEvent.setup();
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
    await user.click(screen.getByRole('button', { name: /Skill Library/i }));

    const libraryFilters = screen.getAllByLabelText('Categories')[0];
    const expectedItems = [
      ['All Skills', '3'],
      ['Finance', '0'],
      ['Data', '0'],
      ['Writing', '0'],
      ['Uncategorized', '3'],
    ];

    for (const [label, count] of expectedItems) {
      const button = within(libraryFilters).getByRole('button', { name: new RegExp(`^${label}\\s+${count}$`, 'i') });
      expect(within(button).getByText(label)).toBeInTheDocument();
      expect(within(button).getByText(count)).toBeInTheDocument();
      expect(button.querySelector('.source-nav-icon')).toBeInTheDocument();
    }

    const storageSummary = screen.getByRole('region', { name: 'Storage location' });
    expect(within(storageSummary).getByText('3 scan locations')).toBeInTheDocument();
    expect(within(storageSummary).getByRole('button', { name: 'Manage storage' })).toBeInTheDocument();
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

  it('loads and renders scanned skills without user-facing source metadata and partial scan state', async () => {
    mockNavigatorLanguages(['en-US']);
    mockInvoke({ skills: scanResults });

    render(<App />);

    expect(await screen.findByRole('row', { name: /imagegen/i })).toBeInTheDocument();
    expect(screen.getByRole('row', { name: /browser control/i })).toBeInTheDocument();
    expect(screen.getByRole('row', { name: /standup report/i })).toBeInTheDocument();
    expect(screen.getAllByText('3 skills').length).toBeGreaterThan(0);
    expect(screen.queryByText('Codex user')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Scan status')).toHaveTextContent('Partial success');
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

  it('renders the resource table columns in the design order', async () => {
    mockNavigatorLanguages(['en-US']);
    mockInvoke({ skills: scanResults });

    render(<App />);

    const table = await screen.findByRole('table', { name: 'Skill list' });
    const headers = within(table)
      .getAllByRole('columnheader')
      .map((header) => header.textContent);

    expect(headers).toEqual(['Name', 'Description', 'Modified', 'Path']);
  });

  it('paginates the skill list twenty-four skills at a time by default', async () => {
    const user = userEvent.setup();
    mockNavigatorLanguages(['en-US']);
    const manyPaginatedSkills = Array.from({ length: 30 }, (_, index) => ({
      ...paginatedScanResults[index % paginatedScanResults.length],
      description: `Description for skill ${String(index + 1).padStart(2, '0')}`,
      name: `skill ${String(index + 1).padStart(2, '0')}`,
      path: `C:\\Users\\demo\\.codex\\skills\\skill-${String(index + 1).padStart(2, '0')}\\SKILL.md`,
    }));
    mockInvoke({ skills: manyPaginatedSkills });

    render(<App />);

    await openSkillLibrary(user);
    await user.click(await screen.findByRole('tab', { name: 'List View' }));

    expect(await screen.findByRole('row', { name: /skill 01/i })).toBeInTheDocument();
    expect(screen.getByRole('row', { name: /skill 24/i })).toBeInTheDocument();
    expect(screen.queryByRole('row', { name: /skill 25/i })).not.toBeInTheDocument();
    expect(screen.getByText('Page 1 of 2')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Next page' }));

    expect(screen.queryByRole('row', { name: /skill 01/i })).not.toBeInTheDocument();
    expect(screen.getByRole('row', { name: /skill 25/i })).toBeInTheDocument();
    expect(screen.getByRole('row', { name: /skill 30/i })).toBeInTheDocument();
    expect(screen.getByText('Page 2 of 2')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
  }, 15000);

  it('returns to the first page when search or the category rail changes', async () => {
    const user = userEvent.setup();
    mockNavigatorLanguages(['en-US']);
    mockInvoke({ skills: paginatedScanResults });

    render(<App />);

    await openSkillLibrary(user);
    await user.click(await screen.findByRole('tab', { name: 'List View' }));

    await screen.findByRole('row', { name: /skill 01/i });
    await user.click(screen.getByRole('button', { name: 'Next page' }));
    await user.type(screen.getByRole('searchbox', { name: 'Search skills' }), 'skill 12');

    expect(screen.getByRole('row', { name: /skill 12/i })).toBeInTheDocument();
    expect(screen.getByText('Page 1 of 1')).toBeInTheDocument();

    await user.clear(screen.getByRole('searchbox', { name: 'Search skills' }));
    await user.click(screen.getByRole('button', { name: 'Next page' }));
    await user.click(screen.getByRole('button', { name: /Data 1/i }));

    expect(screen.getByRole('row', { name: /skill 12/i })).toBeInTheDocument();
    expect(screen.getByText('Page 1 of 1')).toBeInTheDocument();
  }, 15000);

  it('marks skill list descriptions for two-line visual clamping', async () => {
    mockNavigatorLanguages(['en-US']);
    mockInvoke({ skills: paginatedScanResults });

    render(<App />);

    const description = await screen.findByText('Description for skill 01');
    expect(description).toHaveClass('skill-description');
  });

  it('filters skill cards by clicking a Chinese category', async () => {
    const user = userEvent.setup();
    mockNavigatorLanguages(['zh-CN']);
    mockInvoke({ skills: categorizedScanResults });

    render(<App />);

    await openSkillLibrary(user);
    await screen.findByRole('row', { name: /stock-flow/i });
    const cardGrid = document.querySelector('.skill-card-grid.active') as HTMLElement;
    expect((await within(cardGrid).findAllByText('stock-flow')).length).toBeGreaterThan(0);
    expect(within(cardGrid).getByText('sheet-flow')).toBeInTheDocument();
    expect(within(cardGrid).getByText('write-flow')).toBeInTheDocument();

    const categoryRail = screen.getByRole('complementary', { name: '类目' });
    await user.click(within(categoryRail).getByRole('button', { name: /金融 1/i }));

    expect(within(cardGrid).getByText('stock-flow')).toBeInTheDocument();
    expect(within(cardGrid).queryByText('sheet-flow')).not.toBeInTheDocument();
    expect(within(cardGrid).queryByText('write-flow')).not.toBeInTheDocument();
  });

  it('groups card view by category sections sorted by visible label', async () => {
    mockNavigatorLanguages(['en-US']);
    mockInvoke({
      skills: categorizedScanResults,
      settings: {
        language: 'en-US',
        customScanDirectories: [],
        showDefaultScanDirectories: true,
        categoryLabels: {
          data: 'Alpha Tables',
          finance: 'Beta Finance',
          writing: 'Gamma Writing',
        },
      },
    });

    render(<App />);

    let sections = await screen.findAllByRole('region', { name: /Skill category:/i });
    await waitFor(() => {
      sections = screen.getAllByRole('region', { name: /Skill category:/i });
      expect(sections.map((section) => within(section).getByRole('heading').textContent)).toEqual([
        'Alpha Tables',
        'Beta Finance',
        'Gamma Writing',
      ]);
    });
    expect(within(sections[0]).getByRole('button', { name: /sheet-flow/i })).toBeInTheDocument();
  });

  it('caps each category card section to a two-row internal scroller', async () => {
    mockNavigatorLanguages(['en-US']);
    mockInvoke({ skills: manyDataSkills });

    render(<App />);

    const [section] = await screen.findAllByRole('region', { name: /Skill category:/i });
    const body = section.querySelector('.category-card-scroll');
    expect(body).toHaveClass('two-row-card-scroll');
    expect(body).toHaveStyle({ overflowY: 'auto' });
  });

  it('keeps card view on the shared twenty-four item pagination model', async () => {
    mockNavigatorLanguages(['en-US']);
    mockInvoke({ skills: manyDataSkills });

    render(<App />);

    expect((await screen.findAllByRole('region', { name: /Skill category:/i })).length).toBeGreaterThan(0);
    expect(screen.getByLabelText('Pagination')).toHaveTextContent('Showing 1-9 of 9 skills');
  });

  it('uses fixed card rows so skill cards stay the same size', () => {
    const css = readFileSync('src/styles.css', 'utf8');

    expect(css).toMatch(/--skill-card-width:\s*260px;/);
    expect(css).toMatch(/\.category-card-scroll\s*\{[^}]*grid-template-columns:\s*repeat\(auto-fill,\s*var\(--skill-card-width\)\);/s);
    expect(css).toMatch(/\.category-card-scroll\s*\{[^}]*grid-auto-rows:\s*var\(--skill-card-height\);/s);
    expect(css).toMatch(/\.skill-card\s*\{[^}]*height:\s*100%;/s);
    expect(css).toMatch(/\.two-row-card-scroll\s*\{[^}]*max-height:\s*calc\(var\(--skill-card-height\) \* 2 \+ var\(--skill-card-row-gap\) \+ 8px\);/s);
  });

  it('renders draggable card buttons as divs so desktop drag sorting can start reliably', async () => {
    const user = userEvent.setup();
    mockNavigatorLanguages(['en-US']);
    mockInvoke({ skills: categorizedScanResults });

    render(<App />);

    await openSkillLibrary(user);
    const cardGrid = document.querySelector('.skill-card-grid.active') as HTMLElement;
    const stockCard = (await within(cardGrid).findAllByRole('button', { name: /stock-flow/i }))[0];

    expect(stockCard.tagName).toBe('DIV');
    expect(stockCard).toHaveAttribute('draggable', 'true');
    expect(stockCard).toHaveAttribute('tabindex', '0');
  });

  it('reorders cards within a category by dragging and persists the category order', async () => {
    mockNavigatorLanguages(['en-US']);
    mockInvoke({
      skills: categorizedScanResults,
      settings: {
        language: 'en-US',
        customScanDirectories: [],
        showDefaultScanDirectories: true,
        skillCategoryAssignments: {
          [categorizedScanResults[0].path]: ['data'],
          [categorizedScanResults[1].path]: ['data'],
        },
      },
    });

    render(<App />);

    const dataSection = await screen.findByRole('region', { name: /Skill category: Data/i });
    expect(dataSection).toBeDefined();
    if (!dataSection) {
      return;
    }
    const stockCard = getSkillCardByPath(dataSection, categorizedScanResults[0].path) as HTMLElement;
    const sheetCard = getSkillCardByPath(dataSection, categorizedScanResults[1].path) as HTMLElement;
    expect(stockCard).toBeInTheDocument();
    expect(sheetCard).toBeInTheDocument();
    const dataTransfer = {
      dropEffect: '',
      effectAllowed: '',
      getData: vi.fn(() => categorizedScanResults[0].path),
      setData: vi.fn(),
    };
    fireEvent.dragStart(stockCard, { dataTransfer });
    expect(dataTransfer.setData).toHaveBeenCalledWith('text/plain', categorizedScanResults[0].path);
    fireEvent.dragEnter(sheetCard, { dataTransfer });
    fireEvent.dragOver(sheetCard, { dataTransfer });
    fireEvent.drop(sheetCard, { dataTransfer });

    expect(stockCard).not.toHaveClass('dragging-card');
    expect(sheetCard).not.toHaveClass('drag-over-card');

    await waitFor(() =>
      expect(invokeMock).toHaveBeenCalledWith('save_app_settings', {
        settings: expect.objectContaining({
          categorySkillOrder: expect.objectContaining({
            data: [categorizedScanResults[1].path, categorizedScanResults[0].path],
          }),
        }),
      }),
    );
  });

  it('persists category order from a second category card drag path', async () => {
    mockNavigatorLanguages(['en-US']);
    mockInvoke({
      skills: categorizedScanResults,
      settings: {
        language: 'en-US',
        customScanDirectories: [],
        showDefaultScanDirectories: true,
        skillCategoryAssignments: {
          [categorizedScanResults[0].path]: ['data'],
          [categorizedScanResults[1].path]: ['data'],
        },
      },
    });

    render(<App />);

    const dataSection = await screen.findByRole('region', { name: /Skill category: Data/i });
    expect(dataSection).toBeDefined();
    if (!dataSection) {
      return;
    }

    const stockCard = getSkillCardByPath(dataSection, categorizedScanResults[0].path) as HTMLElement;
    const sheetCard = getSkillCardByPath(dataSection, categorizedScanResults[1].path) as HTMLElement;
    expect(stockCard).toBeInTheDocument();
    expect(sheetCard).toBeInTheDocument();

    const dataTransfer = {
      dropEffect: '',
      effectAllowed: '',
      getData: vi.fn(() => categorizedScanResults[0].path),
      setData: vi.fn(),
    };
    fireEvent.dragStart(stockCard, { dataTransfer });
    fireEvent.dragEnter(sheetCard, { dataTransfer });
    fireEvent.dragOver(sheetCard, { dataTransfer });
    fireEvent.drop(sheetCard, { dataTransfer });

    await waitFor(() =>
      expect(invokeMock).toHaveBeenCalledWith('save_app_settings', {
        settings: expect.objectContaining({
          categorySkillOrder: expect.objectContaining({
            data: [categorizedScanResults[1].path, categorizedScanResults[0].path],
          }),
        }),
      }),
    );
  });

  it('shows lock state on read-only cards and unlock state on editable cards', async () => {
    const user = userEvent.setup();
    mockNavigatorLanguages(['en-US']);
    mockInvoke({ skills: scanResults });

    render(<App />);

    await openSkillLibrary(user);
    const cardGrid = document.querySelector('.skill-card-grid.active') as HTMLElement;
    const editableCard = (await within(cardGrid).findAllByRole('button', { name: /imagegen/i }))[0];
    const pluginCard = (await within(cardGrid).findAllByRole('button', { name: /browser control/i }))[0];

    expect(within(editableCard).getByLabelText('Editable skill')).toHaveTextContent('lock_open');
    expect(within(pluginCard).getByLabelText('Locked skill')).toHaveTextContent('lock');
  });

  it('filters the library from dashboard metric cards', async () => {
    const user = userEvent.setup();
    mockNavigatorLanguages(['en-US']);
    mockInvoke({ skills: scanResults });

    render(<App />);

    await user.click(await screen.findByRole('button', { name: /Dashboard/i }));
    const dashboard = screen.getByRole('region', { name: 'Dashboard' });
    await user.click(within(dashboard).getByRole('button', { name: /Needs review/i }));

    expect(screen.getByText('Showing 1 skills')).toBeInTheDocument();
    expect(screen.getByRole('row', { name: /browser control/i })).toBeInTheDocument();
    expect(screen.queryByRole('row', { name: /imagegen/i })).not.toBeInTheDocument();

    await user.click(within(dashboard).getByRole('button', { name: /All Skills/i }));
    expect(screen.getByText('Showing 3 skills')).toBeInTheDocument();
  });

  it('keeps dashboard favorite counts in sync with skill lock changes', async () => {
    const user = userEvent.setup();
    mockNavigatorLanguages(['en-US']);
    mockInvoke({
      skills: categorizedScanResults,
      settings: {
        language: 'en-US',
        customScanDirectories: [],
        showDefaultScanDirectories: true,
      },
    });

    render(<App />);

    await user.click(await screen.findByRole('button', { name: /Dashboard/i }));
    const dashboard = await screen.findByRole('region', { name: 'Dashboard' });
    const favoritesMetric = within(dashboard).getByText('Favorites').closest('button');
    expect(favoritesMetric).toBeInTheDocument();
    expect(within(favoritesMetric as HTMLElement).getByText('0')).toBeInTheDocument();

    await openSkillLibrary(user);

    const cardGrid = document.querySelector('.skill-card-grid.active') as HTMLElement;
    const stockCard = (await within(cardGrid).findAllByRole('button', { name: /stock-flow/i }))[0];
    fireEvent.contextMenu(stockCard);
    await user.click(screen.getByRole('button', { name: 'Lock skill' }));

    await user.click(screen.getByRole('button', { name: /Dashboard/i }));
    const updatedDashboard = await screen.findByRole('region', { name: 'Dashboard' });
    const updatedFavoritesMetric = within(updatedDashboard).getByText('Favorites').closest('button');
    expect(updatedFavoritesMetric).toBeInTheDocument();
    expect(within(updatedFavoritesMetric as HTMLElement).getByText('1')).toBeInTheDocument();
  });

  it('renders trend hover details and an invocation empty state', async () => {
    const user = userEvent.setup();
    mockNavigatorLanguages(['en-US']);
    mockInvoke({ skills: recentDashboardResults });

    const { unmount } = render(<App />);

    await user.click(await screen.findByRole('button', { name: /Dashboard/i }));
    const trendPanel = await screen.findByRole('region', { name: 'Invocation trend' });
    const trendBar = trendPanel.querySelector('.trend-bar');
    expect(trendBar).toHaveAttribute('title', expect.stringContaining('calls'));
    expect(trendBar).toHaveAttribute('title', expect.stringContaining('Top Skill'));
    expect(screen.getByRole('tab', { name: '14d' })).toHaveAttribute('aria-selected', 'true');
    await user.click(screen.getByRole('tab', { name: '30d' }));
    expect(screen.getByRole('tab', { name: '30d' })).toHaveAttribute('aria-selected', 'true');

    unmount();
    mockInvoke({ skills: [] });
    render(<App />);
    await user.click(await screen.findByRole('button', { name: /Dashboard/i }));
    expect(await screen.findByText('No invocation data yet')).toBeInTheDocument();
  });

  it('locks and unlocks editable skills from the context menu and persists the choice', async () => {
    const user = userEvent.setup();
    mockNavigatorLanguages(['en-US']);
    mockInvoke({ skills: categorizedScanResults });

    render(<App />);

    await openSkillLibrary(user);
    const cardGrid = document.querySelector('.skill-card-grid.active') as HTMLElement;
    const stockCard = (await within(cardGrid).findAllByRole('button', { name: /stock-flow/i }))[0];

    fireEvent.contextMenu(stockCard);
    await user.click(screen.getByRole('button', { name: 'Lock skill' }));

    expect(within(stockCard).getByLabelText('Locked skill')).toHaveTextContent('lock');
    await waitFor(() =>
      expect(invokeMock).toHaveBeenCalledWith('save_app_settings', {
        settings: expect.objectContaining({
          skillLocks: { [categorizedScanResults[0].path]: true },
        }),
      }),
    );

    fireEvent.contextMenu(stockCard);
    await user.click(screen.getByRole('button', { name: 'Unlock skill' }));
    expect(within(stockCard).getByLabelText('Editable skill')).toHaveTextContent('lock_open');
  });

  it('keeps protected skills permanently locked in the context menu', async () => {
    const user = userEvent.setup();
    mockNavigatorLanguages(['en-US']);
    mockInvoke({ skills: scanResults });

    render(<App />);

    await openSkillLibrary(user);
    const cardGrid = document.querySelector('.skill-card-grid.active') as HTMLElement;
    const pluginCard = (await within(cardGrid).findAllByRole('button', { name: /browser control/i }))[0];
    fireEvent.contextMenu(pluginCard);

    expect(screen.getByRole('button', { name: 'Permanently locked' })).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Unlock skill' })).not.toBeInTheDocument();
  });

  it('selects all skills or one category and applies bulk metadata changes', async () => {
    const user = userEvent.setup();
    mockNavigatorLanguages(['en-US']);
    mockInvoke({ skills: categorizedScanResults });

    render(<App />);

    await openSkillLibrary(user);
    await user.click(screen.getByRole('button', { name: 'Batch select' }));
    await user.click(screen.getByRole('button', { name: 'Select all results' }));
    expect(screen.getByRole('toolbar', { name: 'Bulk actions' })).toHaveTextContent('3 selected');

    await user.click(screen.getByRole('button', { name: 'Clear selection' }));
    await user.click(screen.getByRole('button', { name: 'Select category Data' }));
    expect(screen.getByRole('toolbar', { name: 'Bulk actions' })).toHaveTextContent('2 selected');

    await user.selectOptions(screen.getByRole('combobox', { name: 'Bulk category' }), 'finance');
    await user.click(screen.getByRole('button', { name: 'Change category' }));
    await waitFor(() =>
      expect(invokeMock).toHaveBeenCalledWith('save_app_settings', {
        settings: expect.objectContaining({
          skillCategoryAssignments: expect.objectContaining({
            [categorizedScanResults[0].path]: ['finance'],
            [categorizedScanResults[1].path]: ['finance'],
          }),
        }),
      }),
    );

    await user.type(screen.getByRole('textbox', { name: 'Bulk tag' }), 'Priority');
    await user.click(screen.getByRole('button', { name: 'Add tag to selected' }));
    await user.selectOptions(screen.getByRole('combobox', { name: 'Bulk color' }), '#fee2e2');
    await user.click(screen.getByRole('button', { name: 'Apply color' }));
    await user.click(screen.getByRole('button', { name: 'Lock selected' }));

    await waitFor(() =>
      expect(invokeMock).toHaveBeenCalledWith('save_app_settings', {
        settings: expect.objectContaining({
          skillLocks: expect.objectContaining({
            [categorizedScanResults[0].path]: true,
            [categorizedScanResults[1].path]: true,
          }),
        }),
      }),
    );
  }, 15000);

  it('deletes selected skills through real desktop commands after confirmation', async () => {
    const user = userEvent.setup();
    mockNavigatorLanguages(['en-US']);
    mockInvoke({ skills: categorizedScanResults });

    try {
      render(<App />);

      await openSkillLibrary(user);
      await user.click(screen.getByRole('button', { name: 'Batch select' }));
      await user.click(screen.getByRole('button', { name: 'Select category Data' }));
      await user.click(screen.getByRole('button', { name: 'Delete selected' }));

      const dialog = screen.getByRole('dialog', { name: 'Delete selected skills' });
      expect(dialog).toHaveTextContent('2 selected');
      vi.useFakeTimers();
      fireEvent.click(within(dialog).getByRole('button', { name: 'Confirm delete' }));
      expect(screen.getByRole('status')).toHaveTextContent('2 skills will be deleted in 8 seconds');
      expect(screen.getByRole('button', { name: 'Undo delete' })).toBeInTheDocument();
      expect(invokeMock).not.toHaveBeenCalledWith('delete_skill', { path: categorizedScanResults[0].path });

      await act(async () => {
        vi.advanceTimersByTime(8000);
        await Promise.resolve();
      });
      vi.useRealTimers();
      await waitFor(() => expect(invokeMock).toHaveBeenCalledWith('delete_skill', { path: categorizedScanResults[0].path }));
      expect(invokeMock).toHaveBeenCalledWith('delete_skill', { path: categorizedScanResults[1].path });
      expect(invokeMock.mock.calls.filter(([command]) => command === 'scan_skills').length).toBeGreaterThan(1);
    } finally {
      vi.useRealTimers();
    }
  });

  it('uses shared health rules for dashboard insights and library filters', async () => {
    const user = userEvent.setup();
    mockNavigatorLanguages(['en-US']);
    mockInvoke({
      skills: [
        {
          ...categorizedScanResults[0],
          description: '',
        },
        {
          ...categorizedScanResults[1],
          parseStatus: 'invalid-frontmatter',
        },
        categorizedScanResults[2],
      ],
    });

    render(<App />);

    const organizeInsights = await screen.findByRole('region', { name: 'Organize insights' });
    expect(within(organizeInsights).getByRole('button', { name: /Needs description 1/i })).toBeInTheDocument();
    expect(within(organizeInsights).getByRole('button', { name: /Parse issues 1/i })).toBeInTheDocument();

    await user.click(within(organizeInsights).getByRole('button', { name: /Needs description 1/i }));
    const listPanel = screen.getByRole('region', { name: 'Skills' });
    await waitFor(() => {
      expect(within(listPanel).getAllByRole('button', { name: /stock-flow/i }).length).toBeGreaterThan(0);
      expect(within(listPanel).queryAllByRole('button', { name: /sheet-flow/i })).toHaveLength(0);
    });

    await user.click(screen.getByRole('button', { name: 'Filter skills' }));
    await user.click(screen.getByRole('menuitemradio', { name: 'Parse issues' }));
    await waitFor(() => {
      expect(within(listPanel).getAllByRole('button', { name: /sheet-flow/i }).length).toBeGreaterThan(0);
      expect(within(listPanel).queryAllByRole('button', { name: /stock-flow/i })).toHaveLength(0);
    });
  });

  it('favorites and archives selected skills with count feedback and archived filtering', async () => {
    const user = userEvent.setup();
    mockNavigatorLanguages(['en-US']);
    mockInvoke({ skills: categorizedScanResults });

    render(<App />);

    await openSkillLibrary(user);
    await user.click(screen.getByRole('button', { name: 'Batch select' }));
    await user.click(screen.getByRole('button', { name: 'Select category Data' }));
    await user.click(screen.getByRole('button', { name: 'Favorite selected' }));
    expect(screen.getByRole('status')).toHaveTextContent('2 skills updated');

    await user.click(screen.getByRole('button', { name: 'Archive selected' }));
    await waitFor(() =>
      expect(invokeMock).toHaveBeenCalledWith('save_app_settings', {
        settings: expect.objectContaining({
          skillArchives: expect.objectContaining({
            [categorizedScanResults[0].path]: true,
            [categorizedScanResults[1].path]: true,
          }),
          skillFavorites: expect.objectContaining({
            [categorizedScanResults[0].path]: true,
            [categorizedScanResults[1].path]: true,
          }),
        }),
      }),
    );
    expect(screen.queryByRole('button', { name: /stock-flow/i })).not.toBeInTheDocument();

    const organizeInsights = screen.getByRole('region', { name: 'Organize insights' });
    await user.click(within(organizeInsights).getByRole('button', { name: /Archived 2/i }));
    expect(screen.getAllByRole('button', { name: /stock-flow/i }).length).toBeGreaterThan(0);
  });

  it('disables dangerous bulk deletion when only protected skills are selected', async () => {
    const user = userEvent.setup();
    mockNavigatorLanguages(['en-US']);
    mockInvoke({ skills: scanResults });

    render(<App />);

    await openSkillLibrary(user);
    await user.click(screen.getByRole('button', { name: 'Batch select' }));
    const cardGrid = document.querySelector('.skill-card-grid.active') as HTMLElement;
    const pluginCard = (await within(cardGrid).findAllByRole('button', { name: /browser control/i }))[0];
    await user.click(within(pluginCard).getByRole('checkbox', { name: 'Select browser control' }));

    expect(screen.getByRole('button', { name: 'Delete selected' })).toBeDisabled();
    expect(screen.getByText('1 protected skills skipped for dangerous actions.')).toBeInTheDocument();
  });

  it('restores a category card order to the default order', async () => {
    const customOrder = {
      data: [categorizedScanResults[0].path, categorizedScanResults[1].path],
    };
    mockNavigatorLanguages(['en-US']);
    mockInvoke({
      skills: categorizedScanResults,
      settings: {
        language: 'en-US',
        customScanDirectories: [],
        showDefaultScanDirectories: true,
        categorySkillOrder: customOrder,
      },
    });

    render(<App />);

    const sections = await screen.findAllByRole('region', { name: /Skill category:/i });
    const dataSection = sections.find((section) => within(section).queryByRole('button', { name: /sheet-flow/i }));
    expect(dataSection).toBeDefined();
    if (!dataSection) {
      return;
    }
    await userEvent.click(within(dataSection).getByRole('button', { name: /Restore default/i }));

    await waitFor(() => {
      const saveCall = invokeMock.mock.calls.filter(([command]) => command === 'save_app_settings').at(-1);
      expect((saveCall?.[1] as { settings: AppSettings } | undefined)?.settings.categorySkillOrder).toBeUndefined();
    });
  });

  it('opens skill details in a drawer and closes with Escape', async () => {
    const user = userEvent.setup();
    mockNavigatorLanguages(['en-US']);
    mockInvoke({ skills: categorizedScanResults });

    render(<App />);

    await user.click(await screen.findByRole('button', { name: /Skill Library/i }));
    const stockRow = await screen.findByRole('row', { name: /stock-flow/i });
    await user.click(stockRow);

    const detailPanel = await screen.findByRole('complementary', { name: 'Skill details' });
    expect(detailPanel).toHaveClass('detail-drawer');
    expect(screen.queryByRole('separator', { name: 'Resize detail panel' })).not.toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'Escape' });

    await waitFor(() => expect(screen.queryByRole('complementary', { name: 'Skill details' })).not.toBeInTheDocument());
    await waitFor(() => expect(stockRow).toHaveFocus());
  });

  it('updates category and matching skill tag colors from the category context menu', async () => {
    const user = userEvent.setup();
    mockNavigatorLanguages(['zh-CN']);
    mockInvoke({ skills: categorizedScanResults });

    render(<App />);

    await openSkillLibrary(user);
    const categoryRail = screen.getByRole('complementary', { name: '类目' });
    const financeCategory = await within(categoryRail).findByRole('button', { name: /金融 1/i });
    fireEvent.contextMenu(financeCategory);
    await user.click(screen.getByRole('button', { name: '将 金融 设置为 紫色' }));

    expect(financeCategory).toHaveStyle({ '--category-color': '#f5e8ff' });
    expect(screen.getAllByTestId(`skill-category-${categorizedScanResults[0].path}-finance`)[0]).toHaveStyle({
      '--category-color': '#f5e8ff',
    });
    await waitFor(() =>
      expect(invokeMock).toHaveBeenCalledWith('save_app_settings', {
        settings: expect.objectContaining({
          categoryColors: expect.objectContaining({ finance: '#f5e8ff' }),
          skillTags: {},
        }),
      }),
    );
  });

  it('renames a category from the category context menu and persists it', async () => {
    const user = userEvent.setup();
    mockNavigatorLanguages(['zh-CN']);
    mockInvoke({ skills: categorizedScanResults });

    render(<App />);

    await openSkillLibrary(user);
    const categoryRail = screen.getByRole('complementary', { name: '类目' });
    const financeCategory = await within(categoryRail).findByRole('button', { name: /金融 1/i });
    fireEvent.contextMenu(financeCategory);
    const labelInput = screen.getByLabelText('类目名称');
    await user.clear(labelInput);
    await user.type(labelInput, '投资');
    await user.click(screen.getByRole('button', { name: '保存类目' }));

    expect(within(categoryRail).getByRole('button', { name: /投资 1/i })).toBeInTheDocument();
    await waitFor(() =>
      expect(invokeMock).toHaveBeenCalledWith('save_app_settings', {
        settings: expect.objectContaining({
          categoryLabels: expect.objectContaining({ finance: '投资' }),
        }),
      }),
    );
  });

  it('customizes a category icon from the category context menu and persists it', async () => {
    const user = userEvent.setup();
    mockNavigatorLanguages(['en-US']);
    mockInvoke({ skills: categorizedScanResults });

    render(<App />);

    await openSkillLibrary(user);
    const categoryRail = screen.getByRole('complementary', { name: 'Categories' });
    const financeCategory = await within(categoryRail).findByRole('button', { name: /Finance 1/i });
    fireEvent.contextMenu(financeCategory);
    await user.click(screen.getByRole('button', { name: 'Category icon Star' }));

    expect(within(financeCategory).getByText('star')).toBeInTheDocument();
    await waitFor(() =>
      expect(invokeMock).toHaveBeenCalledWith('save_app_settings', {
        settings: expect.objectContaining({
          categoryIcons: expect.objectContaining({ finance: 'star' }),
        }),
      }),
    );
  });

  it('adds a custom colored tag to a skill from its context menu', async () => {
    const user = userEvent.setup();
    mockNavigatorLanguages(['zh-CN']);
    mockInvoke({ skills: categorizedScanResults });

    render(<App />);

    await openSkillLibrary(user);
    const cardGrid = document.querySelector('.skill-card-grid.active') as HTMLElement;
    const stockCard = (await within(cardGrid).findAllByRole('button', { name: /stock-flow/i }))[0];
    fireEvent.contextMenu(stockCard);
    await user.type(screen.getByLabelText('标签名称'), '重点');
    await user.click(screen.getByRole('button', { name: '添加标签' }));

    const tag = within(cardGrid).getAllByText('重点')[0];
    expect(tag).toHaveClass('custom-skill-tag');
    expect(tag).toHaveStyle({ '--tag-color': '#e0f2fe' });
    await waitFor(() =>
      expect(invokeMock).toHaveBeenCalledWith('save_app_settings', {
        settings: expect.objectContaining({
          skillTags: {
            [categorizedScanResults[0].path]: [{ color: '#e0f2fe', label: '重点' }],
          },
        }),
      }),
    );
  });

  it('adds a skill default category from the skill context menu and persists assignments', async () => {
    const user = userEvent.setup();
    mockNavigatorLanguages(['en-US']);
    mockInvoke({ skills: categorizedScanResults });

    render(<App />);

    await screen.findAllByRole('region', { name: /Skill category:/i });
    const cardGrid = document.querySelector('.skill-card-grid.active') as HTMLElement;
    const sheetCard = (await within(cardGrid).findAllByRole('button', { name: /sheet-flow/i }))[0];
    fireEvent.contextMenu(sheetCard);
    await user.selectOptions(screen.getByLabelText('Add default category'), 'finance');

    await waitFor(() =>
      expect(invokeMock).toHaveBeenCalledWith('save_app_settings', {
        settings: expect.objectContaining({
          skillCategoryAssignments: expect.objectContaining({
            [categorizedScanResults[1].path]: ['data', 'finance'],
          }),
        }),
      }),
    );
  });

  it('sets a custom skill card color from the skill context menu', async () => {
    const user = userEvent.setup();
    mockNavigatorLanguages(['en-US']);
    mockInvoke({ skills: categorizedScanResults });

    render(<App />);

    await screen.findAllByRole('region', { name: /Skill category:/i });
    const cardGrid = document.querySelector('.skill-card-grid.active') as HTMLElement;
    const stockCard = (await within(cardGrid).findAllByRole('button', { name: /stock-flow/i }))[0];
    fireEvent.contextMenu(stockCard);
    await user.click(screen.getByRole('button', { name: 'Card color Red' }));

    expect(stockCard).toHaveStyle({ '--skill-card-color': '#fee2e2' });
    await waitFor(() =>
      expect(invokeMock).toHaveBeenCalledWith('save_app_settings', {
        settings: expect.objectContaining({
          skillCardColors: {
            [categorizedScanResults[0].path]: '#fee2e2',
          },
        }),
      }),
    );
  });

  it('removes a custom skill tag from its context menu and persists the removal', async () => {
    const user = userEvent.setup();
    mockNavigatorLanguages(['zh-CN']);
    mockInvoke({
      skills: categorizedScanResults,
      settings: {
        language: 'zh-CN',
        customScanDirectories: [],
        showDefaultScanDirectories: true,
        skillTags: {
          [categorizedScanResults[0].path]: [{ color: '#e0f2fe', label: '重点' }],
        },
      },
    });

    render(<App />);

    await waitFor(() => expect(screen.getAllByText('重点').length).toBeGreaterThan(0));
    await screen.findAllByRole('region', { name: /Skill category:/i });
    const cardGrid = document.querySelector('.skill-card-grid.active') as HTMLElement;
    const stockCard = (await within(cardGrid).findAllByRole('button', { name: /stock-flow/i }))[0];
    fireEvent.contextMenu(stockCard);
    await user.click(screen.getByRole('button', { name: '删除 重点' }));

    expect(within(cardGrid).queryAllByText('重点')).toHaveLength(0);
    await waitFor(() =>
      expect(invokeMock).toHaveBeenCalledWith('save_app_settings', {
        settings: expect.objectContaining({
          skillTags: {},
        }),
      }),
    );
  });

  it('sorts skills by name and filters to issue skills from toolbar buttons', async () => {
    const user = userEvent.setup();
    mockNavigatorLanguages(['en-US']);
    mockInvoke({
      skills: [
        {
          path: 'C:\\skills\\zeta\\SKILL.md',
          name: 'zeta-flow',
          description: 'Parsed skill',
          source: 'codex-user',
          parseStatus: 'parsed',
          modifiedAt: '2026-05-30T08:15:00Z',
        },
        {
          path: 'C:\\skills\\alpha\\SKILL.md',
          name: 'alpha-broken',
          description: 'Broken skill',
          source: 'codex-user',
          parseStatus: 'read-error',
          modifiedAt: '2026-05-29T08:15:00Z',
        },
      ],
    });

    render(<App />);

    await screen.findByRole('row', { name: /zeta-flow/i });
    await user.click(screen.getByRole('button', { name: 'Sort skills' }));
    const sortedRows = screen.getAllByRole('row').slice(1);
    expect(sortedRows[0]).toHaveTextContent('alpha-broken');

    await user.click(screen.getByRole('button', { name: 'Filter skills' }));
    expect(screen.getByRole('row', { name: /alpha-broken/i })).toBeInTheDocument();
    expect(screen.getByRole('row', { name: /zeta-flow/i })).toBeInTheDocument();
  });

  it('uses explicit sort and filter menus for list controls', async () => {
    const user = userEvent.setup();
    mockNavigatorLanguages(['en-US']);
    mockInvoke({ skills: scanResults });

    render(<App />);

    await screen.findByRole('row', { name: /imagegen/i });
    await user.click(screen.getByRole('button', { name: 'Sort skills' }));

    expect(screen.getByRole('menu', { name: 'Sort skills' })).toBeInTheDocument();
    expect(screen.getByRole('menuitemradio', { name: 'Name A-Z' })).toBeInTheDocument();
    expect(screen.getByRole('menuitemradio', { name: 'Modified time' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Filter skills' }));
    expect(screen.getByRole('menu', { name: 'Filter skills' })).toBeInTheDocument();
    expect(screen.queryByRole('menuitemcheckbox', { name: 'Needs attention' })).not.toBeInTheDocument();
    expect(screen.getByRole('menuitemcheckbox', { name: 'Writable only' })).toBeInTheDocument();
    expect(screen.getByRole('menuitemcheckbox', { name: 'Read-only plugins' })).toBeInTheDocument();
  });

  it('closes toolbar menus when clicking outside them', async () => {
    const user = userEvent.setup();
    mockNavigatorLanguages(['en-US']);
    mockInvoke({ skills: scanResults });

    render(<App />);

    await screen.findByRole('row', { name: /imagegen/i });
    await user.click(screen.getByRole('button', { name: 'Filter skills' }));
    expect(screen.getByRole('menu', { name: 'Filter skills' })).toBeInTheDocument();

    fireEvent.mouseDown(document.body);

    await waitFor(() => expect(screen.queryByRole('menu', { name: 'Filter skills' })).not.toBeInTheDocument());
  });

  it('adds custom skill tags to the left category rail and filters by tag', async () => {
    const user = userEvent.setup();
    mockNavigatorLanguages(['zh-CN']);
    mockInvoke({ skills: categorizedScanResults });

    render(<App />);

    await openSkillLibrary(user);
    const cardGrid = document.querySelector('.skill-card-grid.active') as HTMLElement;
    const stockCard = (await within(cardGrid).findAllByRole('button', { name: /stock-flow/i }))[0];
    fireEvent.contextMenu(stockCard);
    await user.type(screen.getByLabelText('标签名称'), '重点');
    await user.click(screen.getByRole('button', { name: '添加标签' }));

    const categoryRail = screen.getByRole('complementary', { name: '类目' });
    const tagCategory = within(categoryRail).getByRole('button', { name: '重点 1' });
    expect(tagCategory).toHaveStyle({ '--category-color': '#e0f2fe' });

    await user.click(tagCategory);

    expect(screen.getByRole('row', { name: /stock-flow/i })).toBeInTheDocument();
    expect(screen.queryByRole('row', { name: /sheet-flow/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('row', { name: /write-flow/i })).not.toBeInTheDocument();
  });

  it('closes skill tag context menus when clicking outside them', async () => {
    const user = userEvent.setup();
    mockNavigatorLanguages(['zh-CN']);
    mockInvoke({ skills: categorizedScanResults });

    render(<App />);

    await openSkillLibrary(user);
    const cardGrid = document.querySelector('.skill-card-grid.active') as HTMLElement;
    const stockCard = (await within(cardGrid).findAllByRole('button', { name: /stock-flow/i }))[0];
    fireEvent.contextMenu(stockCard);
    expect(document.querySelector('.tag-context-menu')).toBeInTheDocument();

    fireEvent.mouseDown(document.body);

    await waitFor(() => expect(document.querySelector('.tag-context-menu')).not.toBeInTheDocument());
  });

  it('closes category context menus when clicking outside them', async () => {
    const user = userEvent.setup();
    mockNavigatorLanguages(['zh-CN']);
    mockInvoke({ skills: categorizedScanResults });

    render(<App />);

    await openSkillLibrary(user);
    const categoryRail = await screen.findByRole('complementary', { name: /类目/ });
    const financeCategory = await within(categoryRail).findByRole('button', { name: /金融 1/i });
    fireEvent.contextMenu(financeCategory);
    expect(document.querySelector('.color-context-menu')).toBeInTheDocument();

    fireEvent.mouseDown(document.body);

    await waitFor(() => expect(document.querySelector('.color-context-menu')).not.toBeInTheDocument());
  });

  it('keeps the pagination controls fixed at the skill list bottom', () => {
    const css = readFileSync('src/styles.css', 'utf8');

    expect(css).toMatch(/\.pagination-controls\s*\{[^}]*position:\s*static;/s);
    expect(css).toMatch(/\.pagination-controls\s*\{[^}]*margin:\s*10px 0 0;[^}]*padding:\s*10px 0 0;/s);
  });

  it('styles selected resource rows with a pale fill and thin outline', () => {
    const css = readFileSync('src/styles.css', 'utf8');

    expect(css).toMatch(/\.skill-table tbody tr\.selected-row\s*\{[^}]*background:\s*var\(--accent-soft\);[^}]*\}/s);
    expect(css).toMatch(
      /\.skill-table tbody tr\.selected-row td\s*\{[^}]*border-(?:top|bottom|left|right):\s*1px solid var\(--accent-border\);/s,
    );
    expect(css).not.toMatch(/\.skill-table tbody tr\.selected-row\s*\{[^}]*box-shadow:\s*inset 3px 0 0 var\(--accent\);/s);
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

    expect(screen.getByRole('main')).toHaveClass('fluid-app-shell');
    expect(dashboard).toHaveClass('fluid-dashboard-grid');
    expect(screen.getByRole('complementary', { name: 'Primary navigation' })).toHaveClass('fluid-sidebar-panel');
    expect(listPanel).toHaveClass('fluid-list-panel');
    expect(screen.queryByRole('complementary', { name: 'Skill details' })).not.toBeInTheDocument();
    expect(listPanel.querySelector('.skill-table-wrap')).toHaveClass('fluid-table-region');

    await user.click(screen.getByRole('row', { name: /skill 01/i }));
    await user.click(await screen.findByRole('tab', { name: 'Edit' }));

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

  it('loads Agents user skill details with metadata, markdown, modified time, and path', async () => {
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
    await user.click(await screen.findByRole('tab', { name: 'Edit' }));

    expect(await screen.findByDisplayValue('standup report')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Prepare daily task summaries')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Markdown body' })).toHaveValue('# Standup\n\nDaily summary body.');
    expect(screen.queryByText('Agents user')).not.toBeInTheDocument();
    expect(screen.getAllByText(expectedDateTime('en-US', '2026-06-01T11:00:00Z')).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('button', { name: scanResults[2].path }).length).toBeGreaterThan(0);
  });

  it('filters skills by name, description, and path search text', async () => {
    const user = userEvent.setup();
    mockInvoke({ skills: scanResults });

    render(<App />);

    await screen.findByRole('row', { name: /imagegen/i });
    await user.type(screen.getByRole('searchbox', { name: '搜索 Skill' }), 'plugins');

    await waitFor(() => {
      expect(screen.getByRole('row', { name: /browser control/i })).toBeInTheDocument();
      expect(screen.queryByRole('row', { name: /imagegen/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('row', { name: /standup report/i })).not.toBeInTheDocument();
    });
  });

  it('filters skills by category from the category rail', async () => {
    const user = userEvent.setup();
    mockInvoke({ skills: categorizedScanResults });

    render(<App />);

    await openSkillLibrary(user);
    const categoryRail = screen.getByRole('complementary', { name: '类目' });
    await user.click(within(categoryRail).getByRole('button', { name: /金融/i }));

    expect(screen.getByRole('row', { name: /stock-flow/i })).toBeInTheDocument();
    expect(screen.queryByRole('row', { name: /write-flow/i })).not.toBeInTheDocument();
  });

  it('combines sidebar category filtering and text search', async () => {
    const user = userEvent.setup();
    mockNavigatorLanguages(['en-US']);
    mockInvoke({ skills: categorizedScanResults });

    render(<App />);

    await openSkillLibrary(user);
    await user.click(within(screen.getByRole('complementary', { name: 'Categories' })).getByRole('button', { name: /^Data 2$/i }));
    await user.type(screen.getByRole('searchbox', { name: 'Search skills' }), 'sheet');

    await waitFor(() => {
      expect(screen.getByRole('row', { name: /sheet-flow/i })).toBeInTheDocument();
      expect(screen.queryByRole('row', { name: /stock-flow/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('row', { name: /write-flow/i })).not.toBeInTheDocument();
    });
    expect(screen.getAllByText('1 skills').length).toBeGreaterThan(0);

    await user.clear(screen.getByRole('searchbox', { name: 'Search skills' }));
    await user.type(screen.getByRole('searchbox', { name: 'Search skills' }), 'missing skill');

    expect(await screen.findByText('No matching skills')).toBeInTheDocument();
  });

  it('shows an empty filtered state when no skill matches filters', async () => {
    const user = userEvent.setup();
    mockInvoke({ skills: scanResults });

    render(<App />);

    await screen.findByRole('row', { name: /imagegen/i });
    await user.type(screen.getByRole('searchbox', { name: '搜索 Skill' }), 'missing skill name');

    expect(await screen.findByText('没有匹配的 Skill')).toBeInTheDocument();
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
    expect(within(settingsPanel).getByText('C:\\Users\\demo\\.codex\\skills')).toBeInTheDocument();
    expect(within(settingsPanel).getByText('C:\\Users\\demo\\.agents\\skills')).toBeInTheDocument();
    expect(within(settingsPanel).getByText('D:\\Team\\skills')).toBeInTheDocument();
    expect(within(settingsPanel).getByRole('heading', { name: 'Migration' })).toBeInTheDocument();
    expect(within(settingsPanel).getByRole('button', { name: 'Export migration package' })).toBeInTheDocument();
    expect(within(settingsPanel).getByRole('button', { name: 'Import migration package' })).toBeInTheDocument();
    expect(within(settingsPanel).getByRole('button', { name: 'Validate migration' })).toBeInTheDocument();
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
          categoryColors: {
            data: '#e8f0ff',
            default: '#eef4ff',
            finance: '#fff4d8',
            writing: '#eaf3ff',
          },
          categoryLabels: {},
          skillTags: {},
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
          categoryColors: {
            data: '#e8f0ff',
            default: '#eef4ff',
            finance: '#fff4d8',
            writing: '#eaf3ff',
          },
          categoryLabels: {},
          skillTags: {},
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
