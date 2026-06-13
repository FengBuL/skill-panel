import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
    mockNavigatorLanguages(['en-US']);
    mockEditorInvoke();
  });

  it('loads selected skill details into editable fields', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(await screen.findByRole('row', { name: /imagegen/i }));

    expect(await screen.findByDisplayValue('imagegen')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Generate or edit raster images')).toBeInTheDocument();
    expect(screen.getByLabelText('Markdown body')).toHaveValue('# Imagegen\n\nCreate bitmap assets.');
    expect(
      within(screen.getByRole('complementary', { name: 'Skill details' })).getByRole('button', { name: scanResults[0].path }),
    ).toBeInTheDocument();
    expect(screen.getAllByText('Parsed').length).toBeGreaterThan(0);
    expect(invokeMock).toHaveBeenCalledWith('read_skill', { path: scanResults[0].path });
  });

  it('keeps the latest selected skill when detail responses resolve out of order', async () => {
    const user = userEvent.setup();
    const firstRead = deferred<SkillDetail>();
    invokeMock.mockImplementation((command: string, payload?: unknown) => {
      if (command === 'load_app_settings') {
        return Promise.resolve(settings);
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

    expect(await screen.findByDisplayValue('imagegen')).toBeInTheDocument();
  });

  it('saves edited skill metadata and markdown body', async () => {
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
    await user.clear(await screen.findByLabelText('Name'));
    await user.type(screen.getByLabelText('Name'), 'imagegen updated');
    await user.clear(screen.getByLabelText('Description'));
    await user.type(screen.getByLabelText('Description'), 'Updated description');
    await user.clear(screen.getByLabelText('Markdown body'));
    await user.type(screen.getByLabelText('Markdown body'), '# Updated\n\nNew body');
    await user.click(screen.getByRole('button', { name: 'Save Changes' }));

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
  });

  it('does not replace the current editor when a previous save resolves after another selection', async () => {
    const user = userEvent.setup();
    const saveRequest = deferred<SkillDetail>();
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
        return saveRequest.promise;
      }

      return Promise.reject(new Error(`Unexpected command: ${command}`));
    });

    render(<App />);

    await user.click(await screen.findByRole('row', { name: /imagegen/i }));
    await user.click(await screen.findByRole('button', { name: 'Save Changes' }));
    await user.click(screen.getByRole('row', { name: /browser control/i }));
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
        return Promise.resolve(settings);
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

      return Promise.reject(new Error(`Unexpected command: ${command}`));
    });

    render(<App />);

    await user.click(await screen.findByRole('row', { name: /imagegen/i }));
    await user.click(screen.getByRole('button', { name: 'Delete Skill' }));
    expect(screen.getByRole('dialog', { name: 'Delete Skill' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Confirm delete' })).toHaveFocus();

    await user.click(screen.getByRole('button', { name: 'Confirm delete' }));

    await waitFor(() => expect(invokeMock).toHaveBeenCalledWith('delete_skill', { path: scanResults[0].path }));
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

    const detailPanel = screen.getByRole('complementary', { name: 'Skill details' });
    const descriptionField = await screen.findByRole('textbox', { name: 'Description' });
    const markdownEditor = screen.getByRole('textbox', { name: 'Markdown body' });

    expect(detailPanel.querySelector('.detail-content')).toBeInTheDocument();
    expect(detailPanel.querySelector('.detail-meta-strip')).toHaveTextContent('Agents user');
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

  it('opens and cancels the new skill dialog without creating a skill', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(await screen.findByRole('button', { name: 'New Skill' }));

    expect(screen.getByRole('dialog', { name: 'New Skill' })).toBeInTheDocument();
    await user.type(screen.getByLabelText('Target directory'), 'D:\\Team\\skills');
    await user.type(screen.getByRole('textbox', { name: 'Name' }), 'review-helper');
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(screen.queryByRole('dialog', { name: 'New Skill' })).not.toBeInTheDocument();
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
    await user.type(screen.getByLabelText('Target directory'), 'D:\\Team\\skills');
    await user.type(screen.getByRole('textbox', { name: 'Name' }), 'review-helper');
    await user.type(screen.getByRole('textbox', { name: 'Description' }), 'Review pull request feedback');
    await user.type(screen.getByRole('textbox', { name: 'Markdown body' }), '# Review helper\n\nSummarize review comments.');
    await user.click(screen.getByRole('button', { name: 'Create Skill' }));

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
    expect(screen.queryByRole('dialog', { name: 'New Skill' })).not.toBeInTheDocument();
    expect(await screen.findByRole('row', { name: /review-helper/i })).toBeInTheDocument();
    expect(screen.getByDisplayValue('review-helper')).toBeInTheDocument();
    expect(
      within(screen.getByRole('complementary', { name: 'Skill details' })).getByRole('button', { name: createdSkill.path }),
    ).toBeInTheDocument();
  });

  it('shows create errors inside the dialog and keeps the draft intact', async () => {
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
    await user.type(screen.getByLabelText('Target directory'), 'D:\\Locked\\skills');
    await user.type(screen.getByRole('textbox', { name: 'Name' }), 'locked-skill');
    await user.type(screen.getByRole('textbox', { name: 'Description' }), 'Cannot write here');
    await user.type(screen.getByRole('textbox', { name: 'Markdown body' }), '# Locked');
    await user.click(screen.getByRole('button', { name: 'Create Skill' }));

    expect(await screen.findByText('Create failed')).toBeInTheDocument();
    expect(screen.getByText('directory is not writable')).toBeInTheDocument();
    expect(screen.getByLabelText('Target directory')).toHaveValue('D:\\Locked\\skills');
    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue('locked-skill');
    expect(screen.getByRole('textbox', { name: 'Markdown body' })).toHaveValue('# Locked');
  });

  it('keeps the create dialog open and locked while create is in progress', async () => {
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
    await user.type(screen.getByLabelText('Target directory'), 'D:\\Team\\skills');
    await user.type(screen.getByRole('textbox', { name: 'Name' }), 'review-helper');
    await user.click(screen.getByRole('button', { name: 'Create Skill' }));

    expect(screen.getByRole('dialog', { name: 'New Skill' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Close' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Creating...' })).toBeDisabled();
  });
});
