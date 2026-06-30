import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { readFileSync } from 'node:fs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
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

const settings: AppSettings = {
  language: 'system',
  customScanDirectories: [],
  showDefaultScanDirectories: true,
};

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
];

const skillDetails: Record<string, SkillDetail> = {
  [scanResults[0].path]: {
    ...scanResults[0],
    markdown: '---\nname: imagegen\ndescription: Generate or edit raster images\n---\n\n# Imagegen\n\nCreate bitmap assets.',
    bodyMarkdown: '# Imagegen\n\nCreate bitmap assets.',
    rawContent: '---\nname: imagegen\ndescription: Generate or edit raster images\n---\n\n# Imagegen\n\nCreate bitmap assets.',
    frontmatter: {
      name: 'imagegen',
      description: 'Generate or edit raster images',
    },
  },
  [scanResults[1].path]: {
    ...scanResults[1],
    markdown:
      '---\nname: browser control\ndescription: Control local web targets\n---\n\n# Browser control\n\nOpen local web pages.',
    bodyMarkdown: '# Browser control\n\nOpen local web pages.',
    rawContent:
      '---\nname: browser control\ndescription: Control local web targets\n---\n\n# Browser control\n\nOpen local web pages.',
    frontmatter: {
      name: 'browser control',
      description: 'Control local web targets',
    },
  },
};

const createdSkill: SkillDetail = {
  path: 'D:\\Team\\skills\\review-helper\\SKILL.md',
  name: 'review-helper',
  description: 'Review pull request feedback',
  source: 'codex-user',
  parseStatus: 'parsed',
  modifiedAt: '2026-06-11T12:00:00Z',
  markdown:
    '---\nname: review-helper\ndescription: Review pull request feedback\n---\n\n# Review helper\n\nSummarize review comments.',
  bodyMarkdown: '# Review helper\n\nSummarize review comments.',
  rawContent:
    '---\nname: review-helper\ndescription: Review pull request feedback\n---\n\n# Review helper\n\nSummarize review comments.',
  frontmatter: {
    name: 'review-helper',
    description: 'Review pull request feedback',
  },
};

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((innerResolve, innerReject) => {
    resolve = innerResolve;
    reject = innerReject;
  });

  return { promise, reject, resolve };
}

function mockEditorInvoke(skills = scanResults) {
  invokeMock.mockImplementation((command: string, payload?: unknown) => {
    if (command === 'load_app_settings') {
      return Promise.resolve(settings);
    }

    if (command === 'scan_skills') {
      return Promise.resolve(skills);
    }

    if (command === 'read_skill') {
      return Promise.resolve(skillDetails[(payload as { path: string }).path]);
    }

    if (command === 'save_app_settings') {
      return Promise.resolve(settings);
    }

    return Promise.reject(new Error(`Unexpected command: ${command}`));
  });
}

describe('App skill editor', () => {
  beforeEach(() => {
    invokeMock.mockReset();
    window.localStorage.clear();
    mockNavigatorLanguages(['en-US']);
    mockEditorInvoke();
  });

  it('opens selected skill details in preview mode by default and switches to editable fields', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(await screen.findByRole('row', { name: /imagegen/i }));

    expect(await screen.findByRole('region', { name: 'Markdown preview' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Preview' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.queryByLabelText('Markdown body')).not.toBeInTheDocument();
    await user.click(screen.getByRole('tab', { name: 'Edit' }));
    expect(await screen.findByDisplayValue('imagegen')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Generate or edit raster images')).toBeInTheDocument();
    expect(screen.getByLabelText('Markdown body')).toHaveValue('# Imagegen\n\nCreate bitmap assets.');
    expect(
      within(screen.getByRole('complementary', { name: 'Skill details' })).getByRole('button', { name: scanResults[0].path }),
    ).toBeInTheDocument();
    expect(screen.getAllByText('Parsed').length).toBeGreaterThan(0);
    expect(invokeMock).toHaveBeenCalledWith('read_skill', { path: scanResults[0].path });
  });

  it('shows selected skill lint guidance without quick understanding or prompt tester sections', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(await screen.findByRole('row', { name: /imagegen/i }));

    const detailPanel = screen.getByRole('complementary', { name: 'Skill details' });
    expect(await within(detailPanel).findByRole('region', { name: 'Skill lint' })).toHaveTextContent('Description is present');
    expect(within(detailPanel).queryByRole('heading', { name: 'Quick understanding' })).not.toBeInTheDocument();
    expect(within(detailPanel).queryByRole('region', { name: 'Prompt match tester' })).not.toBeInTheDocument();
  });

  it('does not render duplicate prompt match testing content in the detail panel', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(await screen.findByRole('row', { name: /imagegen/i }));
    expect(screen.queryByRole('textbox', { name: 'Test a prompt against these skills' })).not.toBeInTheDocument();
    expect(screen.queryByText('Likely match: imagegen')).not.toBeInTheDocument();
  });

  it('treats plugin cache skills as read-only in the editor', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(await screen.findByRole('row', { name: /browser control/i }));

    expect(await screen.findByText('Read-only source')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save Changes' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Delete Skill' })).toBeDisabled();
  });

  it('keeps a user-locked skill in preview mode and disables editing', async () => {
    const user = userEvent.setup();
    invokeMock.mockImplementation((command: string, payload?: unknown) => {
      if (command === 'load_app_settings') {
        return Promise.resolve({
          ...settings,
          skillLocks: { [scanResults[0].path]: true },
        });
      }
      if (command === 'scan_skills') {
        return Promise.resolve(scanResults);
      }
      if (command === 'read_skill') {
        return Promise.resolve(skillDetails[(payload as { path: string }).path]);
      }
      return Promise.reject(new Error(`Unexpected command: ${command}`));
    });

    render(<App />);

    await user.click(await screen.findByRole('row', { name: /imagegen/i }));

    expect(await screen.findByRole('region', { name: 'Markdown preview' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Edit' })).toBeDisabled();
    expect(screen.getByText('Locked by user')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save Changes' })).toBeDisabled();
  });

  it('shows description as read-only content in preview mode and editable in edit mode', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(await screen.findByRole('row', { name: /imagegen/i }));
    await user.click(screen.getByRole('tab', { name: 'Preview' }));

    expect(screen.queryByRole('textbox', { name: 'Description' })).not.toBeInTheDocument();
    expect(within(screen.getByRole('complementary', { name: 'Skill details' })).getByText('Generate or edit raster images')).toHaveClass(
      'detail-description-preview',
    );

    await user.click(screen.getByRole('tab', { name: 'Edit' }));
    expect(screen.getByRole('textbox', { name: 'Description' })).toHaveValue('Generate or edit raster images');
  });

  it('shows a standard Markdown preview while editing the Markdown body', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(await screen.findByRole('row', { name: /imagegen/i }));
    await user.click(screen.getByRole('tab', { name: 'Edit' }));

    const editPreview = await screen.findByRole('region', { name: 'Markdown edit preview' });
    expect(within(editPreview).getByRole('heading', { level: 1, name: 'Imagegen' })).toBeInTheDocument();
    expect(editPreview).toHaveClass('markdown-preview');
    expect(screen.getByRole('textbox', { name: 'Markdown body' })).toHaveValue('# Imagegen\n\nCreate bitmap assets.');
  });

  it('localizes detail lint and new editor workspace chrome in Chinese mode', async () => {
    const user = userEvent.setup();
    mockNavigatorLanguages(['zh-CN']);
    invokeMock.mockImplementation((command: string, payload?: unknown) => {
      if (command === 'load_app_settings') {
        return Promise.resolve({
          ...settings,
          language: 'zh-CN',
        });
      }
      if (command === 'scan_skills') {
        return Promise.resolve(scanResults);
      }
      if (command === 'read_skill') {
        return Promise.resolve(skillDetails[(payload as { path: string }).path]);
      }
      if (command === 'save_app_settings') {
        return Promise.resolve({ ...settings, language: 'zh-CN' });
      }
      return Promise.reject(new Error(`Unexpected command: ${command}`));
    });

    render(<App />);

    await user.click(await screen.findByRole('row', { name: /imagegen/i }));
    const detailPanel = screen.getByRole('complementary', { name: 'Skill 详情' });
    expect(await within(detailPanel).findByRole('region', { name: 'Skill 检查' })).toHaveTextContent('描述已填写');
    expect(within(detailPanel).queryByRole('region', { name: 'Prompt 匹配测试' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '新建 Skill' }));
    expect(screen.getByRole('region', { name: 'Skill Editor' })).toBeInTheDocument();
    expect(screen.getByRole('complementary', { name: 'Editor 导航' })).toHaveTextContent('草稿');
    expect(screen.getByRole('region', { name: 'Skill Editor 主区' })).toHaveTextContent('Frontmatter');
    expect(screen.queryByText('Quick understanding')).not.toBeInTheDocument();
    expect(screen.queryByText('Automation template')).not.toBeInTheDocument();
  });

  it('renders markdown preview with standard heading, list, quote, and code block semantics', async () => {
    const user = userEvent.setup();
    const markdownSkill: SkillSummary = {
      path: 'C:\\Users\\demo\\.codex\\skills\\markdown-preview\\SKILL.md',
      name: 'markdown preview',
      description: 'Preview markdown using standard formatting',
      source: 'codex-user',
      parseStatus: 'parsed',
      modifiedAt: '2026-06-14T08:00:00Z',
    };
    const markdownBody = [
      '# Main Title',
      '',
      '## Section Title',
      '',
      '- First item',
      '- Second item',
      '',
      '> Important note',
      '',
      '```ts',
      'const value = 1;',
      '```',
    ].join('\n');
    invokeMock.mockImplementation((command: string, payload?: unknown) => {
      if (command === 'load_app_settings') {
        return Promise.resolve(settings);
      }

      if (command === 'scan_skills') {
        return Promise.resolve([markdownSkill]);
      }

      if (command === 'read_skill') {
        expect(payload).toEqual({ path: markdownSkill.path });
        return Promise.resolve({
          ...markdownSkill,
          markdown: markdownBody,
          bodyMarkdown: markdownBody,
          rawContent: markdownBody,
          frontmatter: {
            name: markdownSkill.name,
            description: markdownSkill.description,
          },
        });
      }

      return Promise.reject(new Error(`Unexpected command: ${command}`));
    });

    render(<App />);

    await user.click(await screen.findByRole('row', { name: /markdown preview/i }));
    await user.click(screen.getByRole('tab', { name: 'Preview' }));

    const preview = await screen.findByRole('region', { name: 'Markdown preview' });
    expect(within(preview).getByRole('heading', { level: 1, name: 'Main Title' })).toBeInTheDocument();
    expect(within(preview).getByRole('heading', { level: 2, name: 'Section Title' })).toBeInTheDocument();
    expect(within(preview).getByRole('list')).toHaveTextContent('First item');
    expect(preview.querySelector('blockquote')).toHaveTextContent('Important note');
    expect(preview.querySelector('pre code')).toHaveTextContent('const value = 1;');
    expect(screen.queryByRole('navigation', { name: 'Markdown outline' })).not.toBeInTheDocument();
    expect(screen.getAllByText('Main Title')).toHaveLength(1);
    expect(readFileSync('src/styles.css', 'utf8')).toMatch(/\.markdown-preview\s*\{[^}]*overflow-y:\s*auto;/s);
  });

  it('keeps detail actions inside the scrollable detail content so they cannot cover markdown content', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(await screen.findByRole('row', { name: /imagegen/i }));

    const detailPanel = screen.getByRole('complementary', { name: 'Skill details' });
    expect(detailPanel.querySelector('.detail-content .detail-actions')).toBeInTheDocument();
    expect(detailPanel.querySelector(':scope > .detail-actions')).not.toBeInTheDocument();
  });

  it('keeps markdown preview and detail actions in normal flow without forced overlap heights', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(await screen.findByRole('row', { name: /imagegen/i }));
    await user.click(screen.getByRole('tab', { name: 'Preview' }));

    const detailPanel = screen.getByRole('complementary', { name: 'Skill details' });
    const markdownPreview = await within(detailPanel).findByRole('region', { name: 'Markdown preview' });
    const actions = detailPanel.querySelector('.detail-actions') as HTMLElement;

    expect(window.getComputedStyle(markdownPreview).minHeight).not.toBe('500px');
    expect(window.getComputedStyle(actions).position).toBe('static');
    expect(Boolean(markdownPreview.compareDocumentPosition(actions) & Node.DOCUMENT_POSITION_FOLLOWING)).toBe(true);
  });

  it('keeps the latest selected skill when detail responses resolve out of order', async () => {
    const user = userEvent.setup();
    const firstRead = deferred<SkillDetail>();
    invokeMock.mockImplementation((command: string, payload?: unknown) => {
      if (command === 'load_app_settings') {
        return Promise.resolve({
          ...settings,
          skillTags: {
            [scanResults[0].path]: [{ color: '#e0f2fe', label: '重点' }],
          },
          skillCardColors: {
            [scanResults[0].path]: '#fee2e2',
          },
          skillLocks: {
            [scanResults[0].path]: true,
          },
        });
      }

      if (command === 'scan_skills') {
        return Promise.resolve(scanResults);
      }

      if (command === 'read_skill') {
        const path = (payload as { path: string }).path;
        return path === scanResults[0].path ? firstRead.promise : Promise.resolve(skillDetails[path]);
      }

      return Promise.reject(new Error(`Unexpected command: ${command}`));
    });

    render(<App />);

    await user.click(await screen.findByRole('row', { name: /imagegen/i }));
    await user.click(screen.getByRole('row', { name: /browser control/i }));
    await user.click(await screen.findByRole('tab', { name: 'Edit' }));
    expect(await screen.findByDisplayValue('browser control')).toBeInTheDocument();

    await act(async () => {
      firstRead.resolve(skillDetails[scanResults[0].path]);
    });

    expect(screen.getByDisplayValue('browser control')).toBeInTheDocument();
    expect(screen.queryByDisplayValue('imagegen')).not.toBeInTheDocument();
  });

  it('selects a skill row from the keyboard', async () => {
    const user = userEvent.setup();
    render(<App />);

    const row = await screen.findByRole('row', { name: /imagegen/i });
    row.focus();
    await user.keyboard('{Enter}');
    await user.click(await screen.findByRole('tab', { name: 'Edit' }));

    expect(await screen.findByDisplayValue('imagegen')).toBeInTheDocument();
  });

  it('saves edited skill metadata and markdown body', async () => {
    const user = userEvent.setup();
    invokeMock.mockImplementation((command: string, payload?: unknown) => {
      if (command === 'load_app_settings') {
        return Promise.resolve({
          ...settings,
          skillTags: {
            [scanResults[0].path]: [{ color: '#e0f2fe', label: '重点' }],
          },
        });
      }

      if (command === 'scan_skills') {
        return Promise.resolve(scanResults);
      }

      if (command === 'read_skill') {
        return Promise.resolve(skillDetails[(payload as { path: string }).path]);
      }

      if (command === 'update_skill') {
        return Promise.resolve({
          ...skillDetails[scanResults[0].path],
          name: 'imagegen updated',
          description: 'Updated description',
          bodyMarkdown: '# Updated\n\nNew body',
          markdown: '---\nname: imagegen updated\ndescription: Updated description\n---\n\n# Updated\n\nNew body',
        });
      }

      return Promise.reject(new Error(`Unexpected command: ${command}`));
    });

    render(<App />);

    await user.click(await screen.findByRole('row', { name: /imagegen/i }));
    await user.click(screen.getByRole('tab', { name: 'Edit' }));
    await user.clear(await screen.findByLabelText('Name'));
    await user.type(screen.getByLabelText('Name'), 'imagegen updated');
    await user.clear(screen.getByLabelText('Description'));
    await user.type(screen.getByLabelText('Description'), 'Updated description');
    await user.clear(screen.getByLabelText('Markdown body'));
    await user.type(screen.getByLabelText('Markdown body'), '# Updated\n\nNew body');
    await user.click(screen.getByRole('button', { name: 'Save Changes' }));

    expect(await screen.findByRole('dialog', { name: 'Review changes before saving' })).toBeInTheDocument();
    expect(screen.getByText('A backup will be created before writing the file.')).toBeInTheDocument();
    expect(screen.getByText('- imagegen')).toBeInTheDocument();
    expect(screen.getByText('+ imagegen updated')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Save with backup' }));

    await waitFor(() =>
      expect(invokeMock).toHaveBeenCalledWith('update_skill', {
        input: {
          path: scanResults[0].path,
          name: 'imagegen updated',
          description: 'Updated description',
          markdown: '# Updated\n\nNew body',
        },
      }),
    );
    expect(screen.getByRole('row', { name: /imagegen updated/i })).toBeInTheDocument();
  }, 15000);

  it('renders markdown preview once without duplicating headings in an outline', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(await screen.findByRole('row', { name: /imagegen/i }));
    await user.click(screen.getByRole('tab', { name: 'Preview' }));

    expect(screen.getByRole('heading', { name: 'Imagegen' })).toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: 'Markdown outline' })).not.toBeInTheDocument();
    expect(screen.getAllByText('Imagegen')).toHaveLength(1);
  });

  it('does not replace the current editor when a previous save resolves after another selection', async () => {
    const user = userEvent.setup();
    const saveRequest = deferred<SkillDetail>();
    invokeMock.mockImplementation((command: string, payload?: unknown) => {
      if (command === 'load_app_settings') {
        return Promise.resolve({
          ...settings,
          skillTags: {
            [scanResults[0].path]: [{ color: '#e0f2fe', label: '重点' }],
          },
        });
      }

      if (command === 'scan_skills') {
        return Promise.resolve(scanResults);
      }

      if (command === 'read_skill') {
        return Promise.resolve(skillDetails[(payload as { path: string }).path]);
      }

      if (command === 'update_skill') {
        return saveRequest.promise;
      }

      return Promise.reject(new Error(`Unexpected command: ${command}`));
    });

    render(<App />);

    await user.click(await screen.findByRole('row', { name: /imagegen/i }));
    await user.click(screen.getByRole('tab', { name: 'Edit' }));
    await user.clear(await screen.findByLabelText('Description'));
    await user.type(screen.getByLabelText('Description'), 'Late save description');
    await user.click(await screen.findByRole('button', { name: 'Save Changes' }));
    await user.click(await screen.findByRole('button', { name: 'Save with backup' }));
    await user.click(screen.getByRole('row', { name: /browser control/i }));
    await user.click(await screen.findByRole('tab', { name: 'Edit' }));
    expect(await screen.findByDisplayValue('browser control')).toBeInTheDocument();

    await act(async () => {
      saveRequest.resolve({
        ...skillDetails[scanResults[0].path],
        name: 'imagegen saved late',
      });
    });

    expect(screen.getByDisplayValue('browser control')).toBeInTheDocument();
    expect(screen.queryByDisplayValue('imagegen saved late')).not.toBeInTheDocument();
    expect(screen.getByRole('row', { name: /imagegen saved late/i })).toBeInTheDocument();
  });

  it('confirms deletion before deleting the selected skill and refreshing the list', async () => {
    const user = userEvent.setup();
    let scanCount = 0;
    invokeMock.mockImplementation((command: string, payload?: unknown) => {
      if (command === 'load_app_settings') {
        return Promise.resolve({
          ...settings,
          skillTags: {
            [scanResults[0].path]: [{ color: '#e0f2fe', label: '重点' }],
          },
        });
      }

      if (command === 'scan_skills') {
        scanCount += 1;
        return Promise.resolve(scanCount === 1 ? scanResults : scanResults.slice(1));
      }

      if (command === 'read_skill') {
        return Promise.resolve(skillDetails[(payload as { path: string }).path]);
      }

      if (command === 'delete_skill') {
        return Promise.resolve();
      }

      if (command === 'save_app_settings') {
        return Promise.resolve(payload);
      }

      return Promise.reject(new Error(`Unexpected command: ${command}`));
    });

    render(<App />);

    await user.click(await screen.findByRole('row', { name: /imagegen/i }));
    await user.click(screen.getByRole('button', { name: 'Delete Skill' }));
    expect(screen.getByRole('dialog', { name: 'Delete Skill' })).toBeInTheDocument();
    expect(screen.getByText('A backup will be created before deletion.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Confirm delete' })).toHaveFocus();

    await user.click(screen.getByRole('button', { name: 'Confirm delete' }));

    await waitFor(() => expect(invokeMock).toHaveBeenCalledWith('delete_skill', { path: scanResults[0].path }));
    await waitFor(() =>
      expect(invokeMock).toHaveBeenCalledWith('save_app_settings', {
        settings: expect.objectContaining({
          skillTags: {},
        }),
      }),
    );
    const saveCall = invokeMock.mock.calls.find(([command]) => command === 'save_app_settings');
    expect(saveCall?.[1]).toEqual({
      settings: expect.not.objectContaining({
        skillCardColors: expect.anything(),
        skillLocks: expect.anything(),
      }),
    });
    expect(screen.queryByRole('row', { name: /imagegen/i })).not.toBeInTheDocument();
  });

  it('deletes the skill that opened the confirmation when selection changes behind the dialog', async () => {
    const user = userEvent.setup();
    invokeMock.mockImplementation((command: string, payload?: unknown) => {
      if (command === 'load_app_settings') {
        return Promise.resolve(settings);
      }

      if (command === 'scan_skills') {
        return Promise.resolve(scanResults);
      }

      if (command === 'read_skill') {
        return Promise.resolve(skillDetails[(payload as { path: string }).path]);
      }

      if (command === 'delete_skill') {
        return Promise.resolve();
      }

      return Promise.reject(new Error(`Unexpected command: ${command}`));
    });

    render(<App />);

    await user.click(await screen.findByRole('row', { name: /imagegen/i }));
    await user.click(screen.getByRole('button', { name: 'Delete Skill' }));
    await user.click(screen.getByRole('row', { name: /browser control/i }));
    await user.click(screen.getByRole('button', { name: 'Confirm delete' }));

    await waitFor(() => expect(invokeMock).toHaveBeenCalledWith('delete_skill', { path: scanResults[0].path }));
  });

  it('opens the selected skill folder', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(await screen.findByRole('row', { name: /imagegen/i }));
    await user.click(await screen.findByRole('button', { name: 'Open Folder' }));

    await waitFor(() => expect(invokeMock).toHaveBeenCalledWith('open_skill_folder', { path: scanResults[0].path }));
  });

  it('opens the selected skill folder from the detail path button', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(await screen.findByRole('row', { name: /imagegen/i }));
    const detailPanel = screen.getByRole('complementary', { name: 'Skill details' });
    const detailPathButton = within(detailPanel).getByRole('button', { name: scanResults[0].path });

    expect(detailPathButton).toHaveAttribute('title', scanResults[0].path);
    await user.click(detailPathButton);

    await waitFor(() => expect(invokeMock).toHaveBeenCalledWith('open_skill_folder', { path: scanResults[0].path }));
  });

  it('marks the selected skill markdown editor as the expanding detail body area', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(await screen.findByRole('row', { name: /imagegen/i }));
    await user.click(screen.getByRole('tab', { name: 'Edit' }));

    const markdownEditor = await screen.findByLabelText('Markdown body');
    expect(markdownEditor).toHaveClass('detail-markdown-input');
    expect(markdownEditor.closest('.detail-markdown-section')).not.toBeNull();
  });

  it('renders Agents user skill details with inspector layout regions for metadata, description, body, and actions', async () => {
    const user = userEvent.setup();
    const agentsSkill: SkillSummary = {
      path: 'C:\\Users\\demo\\.agents\\skills\\deep-research\\SKILL.md',
      name: 'deep research',
      description:
        'Run a long research workflow with source collection, synthesis, and follow-up task extraction across multiple sections.',
      source: 'agents-user',
      parseStatus: 'parsed',
      modifiedAt: '2026-06-13T09:45:00Z',
    };
    const agentsDetail: SkillDetail = {
      ...agentsSkill,
      markdown:
        '# Deep research\n\n## Context\n\nCollect inputs.\n\n## Process\n\nSynthesize notes.\n\n## Output\n\nWrite a readable report.',
      bodyMarkdown:
        '# Deep research\n\n## Context\n\nCollect inputs.\n\n## Process\n\nSynthesize notes.\n\n## Output\n\nWrite a readable report.',
      rawContent:
        '---\nname: deep research\ndescription: Run a long research workflow with source collection, synthesis, and follow-up task extraction across multiple sections.\n---\n# Deep research\n\n## Context\n\nCollect inputs.\n\n## Process\n\nSynthesize notes.\n\n## Output\n\nWrite a readable report.',
      frontmatter: {
        name: 'deep research',
        description: agentsSkill.description,
      },
    };
    invokeMock.mockImplementation((command: string, payload?: unknown) => {
      if (command === 'load_app_settings') {
        return Promise.resolve(settings);
      }

      if (command === 'scan_skills') {
        return Promise.resolve([agentsSkill]);
      }

      if (command === 'read_skill') {
        expect(payload).toEqual({ path: agentsSkill.path });
        return Promise.resolve(agentsDetail);
      }

      if (command === 'open_skill_folder') {
        return Promise.resolve();
      }

      return Promise.reject(new Error(`Unexpected command: ${command}`));
    });

    render(<App />);

    await user.click(await screen.findByRole('row', { name: /deep research/i }));
    await user.click(screen.getByRole('tab', { name: 'Edit' }));

    const detailPanel = screen.getByRole('complementary', { name: 'Skill details' });
    const descriptionField = await screen.findByRole('textbox', { name: 'Description' });
    const markdownEditor = screen.getByRole('textbox', { name: 'Markdown body' });

    expect(detailPanel.querySelector('.detail-content')).toBeInTheDocument();
    expect(detailPanel.querySelector('.detail-meta-strip')).toHaveTextContent('Jun 13, 2026');
    expect(descriptionField.closest('.detail-description-section')).toHaveClass('detail-description-section');
    expect(descriptionField).toHaveValue(agentsSkill.description);
    expect(markdownEditor.closest('.detail-body-section')).toHaveClass('detail-body-section', 'fluid-markdown-region');
    expect(markdownEditor).toHaveValue(agentsDetail.bodyMarkdown);
    expect(detailPanel.querySelector('.detail-actions')).toHaveClass('detail-actions-pinned');
  });

  it('shows read errors when selected skill details fail to load', async () => {
    const user = userEvent.setup();
    invokeMock.mockImplementation((command: string) => {
      if (command === 'load_app_settings') {
        return Promise.resolve(settings);
      }

      if (command === 'scan_skills') {
        return Promise.resolve(scanResults);
      }

      if (command === 'read_skill') {
        return Promise.reject(new Error('read failed'));
      }

      return Promise.reject(new Error(`Unexpected command: ${command}`));
    });

    render(<App />);

    await user.click(await screen.findByRole('row', { name: /imagegen/i }));

    expect(await screen.findByText('Detail load failed')).toBeInTheDocument();
    expect(screen.getByText('read failed')).toBeInTheDocument();
  });

  it('labels save errors as action failures', async () => {
    const user = userEvent.setup();
    invokeMock.mockImplementation((command: string, payload?: unknown) => {
      if (command === 'load_app_settings') {
        return Promise.resolve(settings);
      }

      if (command === 'scan_skills') {
        return Promise.resolve(scanResults);
      }

      if (command === 'read_skill') {
        return Promise.resolve(skillDetails[(payload as { path: string }).path]);
      }

      if (command === 'update_skill') {
        return Promise.reject(new Error('save failed'));
      }

      return Promise.reject(new Error(`Unexpected command: ${command}`));
    });

    render(<App />);

    await user.click(await screen.findByRole('row', { name: /imagegen/i }));
    await user.click(await screen.findByRole('button', { name: 'Save Changes' }));

    expect(await screen.findByText('Action failed')).toBeInTheDocument();
    expect(screen.getByText('save failed')).toBeInTheDocument();
  });

  it('opens and leaves the new skill editor without creating a skill', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(await screen.findByRole('button', { name: 'New Skill' }));

    expect(screen.getByRole('region', { name: 'Skill Editor' })).toBeInTheDocument();
    await user.type(screen.getByLabelText('Target directory'), 'D:\\Team\\skills');
    await user.clear(screen.getByRole('textbox', { name: 'Name' }));
    await user.type(screen.getByRole('textbox', { name: 'Name' }), 'review-helper');
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    await user.click(screen.getAllByRole('button', { name: 'Back to Library' }).at(-1)!);

    expect(screen.queryByRole('region', { name: 'Skill Editor' })).not.toBeInTheDocument();
    expect(invokeMock).not.toHaveBeenCalledWith('create_skill', expect.anything());
  });

  it('creates a skill, refreshes the list, and selects the created detail', async () => {
    const user = userEvent.setup();
    invokeMock.mockImplementation((command: string) => {
      if (command === 'load_app_settings') {
        return Promise.resolve({
          language: 'en-US',
          customScanDirectories: ['D:\\Team\\skills'],
          showDefaultScanDirectories: true,
        });
      }

      if (command === 'scan_skills') {
        return Promise.resolve(scanResults);
      }

      if (command === 'create_skill') {
        return Promise.resolve(createdSkill);
      }

      return Promise.reject(new Error(`Unexpected command: ${command}`));
    });

    render(<App />);

    await user.click(await screen.findByRole('button', { name: 'New Skill' }));
    await user.clear(screen.getByLabelText('Target directory'));
    await user.type(screen.getByLabelText('Target directory'), 'D:\\Team\\skills');
    await user.clear(screen.getByRole('textbox', { name: 'Name' }));
    await user.type(screen.getByRole('textbox', { name: 'Name' }), 'review-helper');
    await user.clear(screen.getByRole('textbox', { name: 'Description' }));
    await user.type(screen.getByRole('textbox', { name: 'Description' }), 'Review pull request feedback');
    await user.clear(screen.getByRole('textbox', { name: 'Markdown body' }));
    await user.type(screen.getByRole('textbox', { name: 'Markdown body' }), '---\nname: review-helper\ndescription: Review pull request feedback\n---\n\n# Review helper\n\nSummarize review comments.');
    await user.click(screen.getByRole('button', { name: 'Save Changes' }));
    expect(await screen.findByRole('dialog', { name: 'Review changes before saving' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Save with backup' }));

    await waitFor(() =>
      expect(invokeMock).toHaveBeenCalledWith('create_skill', {
        input: {
          name: 'review-helper',
          description: 'Review pull request feedback',
          source: 'codex-user',
          targetDirectory: 'D:\\Team\\skills',
          markdown: '# Review helper\n\nSummarize review comments.',
        },
      }),
    );
    expect(await screen.findByRole('status')).toHaveTextContent('Done');
    expect(screen.getByDisplayValue('review-helper')).toBeInTheDocument();
    expect(within(screen.getByRole('region', { name: 'Drafts' })).getByRole('button', { name: /review-helper/i })).toBeInTheDocument();
  });

  it('creates a skill with the selected source', async () => {
    const user = userEvent.setup();
    invokeMock.mockImplementation((command: string) => {
      if (command === 'load_app_settings') {
        return Promise.resolve({
          language: 'en-US',
          customScanDirectories: ['D:\\Team\\skills'],
          showDefaultScanDirectories: true,
        });
      }

      if (command === 'scan_skills') {
        return Promise.resolve(scanResults);
      }

      if (command === 'create_skill') {
        return Promise.resolve(createdSkill);
      }

      return Promise.reject(new Error(`Unexpected command: ${command}`));
    });

    render(<App />);

    await user.click(await screen.findByRole('button', { name: 'New Skill' }));
    await user.selectOptions(screen.getByRole('combobox', { name: 'Skill source' }), 'custom');
    await user.clear(screen.getByLabelText('Target directory'));
    await user.type(screen.getByLabelText('Target directory'), 'D:\\Team\\skills');
    await user.clear(screen.getByRole('textbox', { name: 'Name' }));
    await user.type(screen.getByRole('textbox', { name: 'Name' }), 'custom-helper');
    await user.clear(screen.getByRole('textbox', { name: 'Description' }));
    await user.type(screen.getByRole('textbox', { name: 'Description' }), 'Custom root helper');
    await user.click(screen.getByRole('button', { name: 'Save Changes' }));
    await user.click(await screen.findByRole('button', { name: 'Save with backup' }));

    await waitFor(() =>
      expect(invokeMock).toHaveBeenCalledWith('create_skill', {
        input: expect.objectContaining({
          source: 'custom',
          targetDirectory: 'D:\\Team\\skills',
        }),
      }),
    );
  });

  it('syncs editor frontmatter fields and full markdown in both directions', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(await screen.findByRole('button', { name: 'New Skill' }));
    await user.clear(screen.getByRole('textbox', { name: 'Name' }));
    await user.type(screen.getByRole('textbox', { name: 'Name' }), 'frontmatter-sync');

    expect(screen.getByRole<HTMLTextAreaElement>('textbox', { name: 'Markdown body' }).value).toContain('name: "frontmatter-sync"');

    await user.clear(screen.getByRole('textbox', { name: 'Markdown body' }));
    await user.type(
      screen.getByRole('textbox', { name: 'Markdown body' }),
      '---\nname: markdown-wins\ndescription: Synced from markdown\n---\n\n# Markdown Wins',
    );
    expect(await screen.findByRole('dialog', { name: 'Frontmatter conflict' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Keep Markdown' }));

    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue('markdown-wins');
    expect(screen.getByRole('textbox', { name: 'Description' })).toHaveValue('Synced from markdown');
    expect(within(screen.getAllByRole('region', { name: 'Markdown preview' }).at(-1)!).getByRole('heading', { name: 'Markdown Wins' })).toBeInTheDocument();
  });

  it('can keep form fields when markdown frontmatter conflicts', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(await screen.findByRole('button', { name: 'New Skill' }));
    await user.clear(screen.getByRole('textbox', { name: 'Name' }));
    await user.type(screen.getByRole('textbox', { name: 'Name' }), 'form-wins');
    await user.clear(screen.getByRole('textbox', { name: 'Markdown body' }));
    await user.type(
      screen.getByRole('textbox', { name: 'Markdown body' }),
      '---\nname: markdown-loses\ndescription: Markdown description\n---\n\n# Body',
    );

    expect(await screen.findByRole('dialog', { name: 'Frontmatter conflict' })).toHaveTextContent('markdown-loses');
    await user.click(screen.getByRole('button', { name: 'Keep form' }));

    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue('form-wins');
    expect(screen.getByRole<HTMLTextAreaElement>('textbox', { name: 'Markdown body' }).value).toContain('name: "form-wins"');
   });

  it('prompts before leaving the editor with unsaved content', async () => {
    const user = userEvent.setup();
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
    render(<App />);

    await user.click(await screen.findByRole('button', { name: 'New Skill' }));
    await user.clear(screen.getByRole('textbox', { name: 'Name' }));
    await user.type(screen.getByRole('textbox', { name: 'Name' }), 'needs-confirmation');
    await user.click(screen.getByRole('button', { name: 'Settings' }));

    expect(confirmSpy).toHaveBeenCalled();
    expect(screen.getByRole('region', { name: 'Skill Editor' })).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Application settings' })).not.toBeInTheDocument();
  });

  it('copies a protected source into a user skill draft before saving', async () => {
    const user = userEvent.setup();
    invokeMock.mockImplementation((command: string, payload?: unknown) => {
      if (command === 'load_app_settings') {
        return Promise.resolve({
          language: 'en-US',
          customScanDirectories: ['D:\\Team\\skills'],
          showDefaultScanDirectories: true,
        });
      }

      if (command === 'scan_skills') {
        return Promise.resolve(scanResults);
      }

      if (command === 'read_skill') {
        return Promise.resolve(skillDetails[(payload as { path: string }).path]);
      }

      if (command === 'create_skill') {
        return Promise.resolve({
          ...createdSkill,
          name: 'browser control',
          description: 'Control local web targets',
        });
      }

      return Promise.reject(new Error(`Unexpected command: ${command}`));
    });

    render(<App />);

    await screen.findAllByText('browser control');
    await user.click(screen.getAllByRole('button', { name: 'Copy to user Skill' })[0]);

    expect(screen.getByRole('region', { name: 'Copy source' })).toHaveTextContent(scanResults[1].path);
    expect(screen.getByRole('combobox', { name: 'Skill source' })).toHaveValue('codex-user');
    expect(screen.getByLabelText('Target directory')).toHaveValue('D:\\Team\\skills');
    await user.click(screen.getByRole('button', { name: 'Save Changes' }));
    await user.click(await screen.findByRole('button', { name: 'Save with backup' }));

    await waitFor(() =>
      expect(invokeMock).toHaveBeenCalledWith('create_skill', {
        input: expect.objectContaining({
          name: 'browser control',
          source: 'codex-user',
          targetDirectory: 'D:\\Team\\skills',
        }),
      }),
    );
  });

  it('shows create errors inside the editor and keeps the draft intact', async () => {
    const user = userEvent.setup();
    invokeMock.mockImplementation((command: string) => {
      if (command === 'load_app_settings') {
        return Promise.resolve(settings);
      }

      if (command === 'scan_skills') {
        return Promise.resolve(scanResults);
      }

      if (command === 'create_skill') {
        return Promise.reject(new Error('directory is not writable'));
      }

      return Promise.reject(new Error(`Unexpected command: ${command}`));
    });

    render(<App />);

    await user.click(await screen.findByRole('button', { name: 'New Skill' }));
    await user.clear(screen.getByLabelText('Target directory'));
    await user.type(screen.getByLabelText('Target directory'), 'D:\\Locked\\skills');
    await user.clear(screen.getByRole('textbox', { name: 'Name' }));
    await user.type(screen.getByRole('textbox', { name: 'Name' }), 'locked-skill');
    await user.clear(screen.getByRole('textbox', { name: 'Description' }));
    await user.type(screen.getByRole('textbox', { name: 'Description' }), 'Cannot write here');
    await user.clear(screen.getByRole('textbox', { name: 'Markdown body' }));
    await user.type(screen.getByRole('textbox', { name: 'Markdown body' }), '---\nname: locked-skill\ndescription: Cannot write here\n---\n\n# Locked');
    await user.click(screen.getByRole('button', { name: 'Save Changes' }));
    await user.click(await screen.findByRole('button', { name: 'Save with backup' }));

    expect(await screen.findByText('Action failed')).toBeInTheDocument();
    expect(screen.getByText('directory is not writable')).toBeInTheDocument();
    expect(screen.getByLabelText('Target directory')).toHaveValue('D:\\Locked\\skills');
    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue('locked-skill');
    expect(screen.getByRole('textbox', { name: 'Markdown body' })).toHaveValue(
      '---\nname: locked-skill\ndescription: Cannot write here\n---\n\n# Locked',
    );
  });

  it('keeps the editor save button locked while create is in progress', async () => {
    const user = userEvent.setup();
    const createRequest = deferred<SkillDetail>();
    invokeMock.mockImplementation((command: string) => {
      if (command === 'load_app_settings') {
        return Promise.resolve(settings);
      }

      if (command === 'scan_skills') {
        return Promise.resolve(scanResults);
      }

      if (command === 'create_skill') {
        return createRequest.promise;
      }

      return Promise.reject(new Error(`Unexpected command: ${command}`));
    });

    render(<App />);

    await user.click(await screen.findByRole('button', { name: 'New Skill' }));
    await user.clear(screen.getByLabelText('Target directory'));
    await user.type(screen.getByLabelText('Target directory'), 'D:\\Team\\skills');
    await user.clear(screen.getByRole('textbox', { name: 'Name' }));
    await user.type(screen.getByRole('textbox', { name: 'Name' }), 'review-helper');
    await user.click(screen.getByRole('button', { name: 'Save Changes' }));
    await user.click(await screen.findByRole('button', { name: 'Save with backup' }));

    expect(screen.getByRole('region', { name: 'Skill Editor' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save Changes' })).toBeDisabled();
  });
});
