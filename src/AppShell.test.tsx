import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { readFileSync } from 'node:fs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppShell } from './AppShell';
import { useSettingsStore } from './store/settingsStore';
import { useSkillStore, type Skill } from './store/skillStore';
import { useUIStore } from './store/uiStore';
import type { SkillDetail } from './types/skill';

const { invokeMock, listenMock } = vi.hoisted(() => ({
  invokeMock: vi.fn(),
  listenMock: vi.fn(),
}));

const editableSkill: Skill = {
  name: 'editable skill',
  description: 'Editable local source',
  source: 'mine',
  category: 'AI',
  path: '/tmp/editable-skill/SKILL.md',
  modifiedAt: '2026-07-16',
  size: 100,
  starred: false,
  disabled: false,
  protected: false,
};

const protectedSkillFixture: Skill = {
  name: 'protected skill',
  description: 'Protected plugin source',
  source: 'plugin',
  category: 'AI',
  path: '/tmp/protected-skill/SKILL.md',
  modifiedAt: '2026-07-16',
  size: 100,
  starred: false,
  disabled: false,
  protected: true,
};

function skillDetailFor(skill: Skill): SkillDetail {
  return {
    path: skill.path,
    name: skill.name,
    description: skill.description,
    source: skill.source === 'mine' ? 'codex-user' : 'plugin-cache',
    parseStatus: 'parsed',
    modifiedAt: skill.modifiedAt,
    markdown: `# ${skill.name}\n\nBody`,
    bodyMarkdown: `# ${skill.name}\n\nBody`,
    rawContent: `# ${skill.name}\n\nBody`,
    frontmatter: { name: skill.name, description: skill.description },
  };
}

function mockShellCommands(skills: Skill[]) {
  invokeMock.mockImplementation((command: string, payload?: unknown) => {
    if (command === 'watch_scan_dirs') return Promise.resolve();
    if (command === 'scan_skills') return Promise.resolve(skills);
    if (command === 'load_app_settings') {
      return Promise.resolve({ language: 'zh-CN', customScanDirectories: [], showDefaultScanDirectories: true, skillArchives: {} });
    }
    if (command === 'read_skill') {
      const path = (payload as { path?: string } | undefined)?.path;
      const skill = skills.find((item) => item.path === path) || skills[0];
      return Promise.resolve(skillDetailFor(skill));
    }
    if (command === 'get_version_history') {
      return Promise.resolve([{ id: 'v1', time: '2026-07-16', note: 'snapshot', diffLines: 1, source: 'manual' }]);
    }
    if (command === 'clone_skill') {
      return Promise.resolve({ newPath: '/tmp/editable-copy/SKILL.md' });
    }
    return Promise.resolve([]);
  });
}

function expectEditorHeaderActionsOrder() {
  const actionRow = document.querySelector('.editor-header-actions');
  expect(actionRow).toBeTruthy();
  const actionLabels = Array.from(actionRow?.querySelectorAll('button') || []).map((button) => button.textContent?.replace(/\s+/g, ' ').trim());
  expect(actionLabels).toEqual(['AI 辅助', '← 返回']);
}

vi.mock('@tauri-apps/api/core', () => ({
  invoke: invokeMock,
}));

vi.mock('@tauri-apps/api/event', () => ({
  listen: listenMock,
}));

describe('AppShell Tauri event fallback', () => {
  beforeEach(() => {
    invokeMock.mockReset();
    listenMock.mockReset();
    useUIStore.setState({ mainView: 'library', subView: null, subParam: null });
    useSkillStore.setState({ skills: [], filtered: [], filters: { source: [], category: [], status: [] } });
    useSettingsStore.setState({ aiVendor: 'glm', aiKeyStored: false });
    invokeMock.mockImplementation((command: string) => {
      if (command === 'watch_scan_dirs') return Promise.resolve();
      if (command === 'scan_skills') return Promise.resolve([]);
      if (command === 'get_call_logs') return Promise.resolve([]);
      return Promise.reject(new Error(`Unexpected command: ${command}`));
    });
    listenMock.mockImplementation(() => {
      throw new Error('transformCallback is not available');
    });
    Reflect.deleteProperty(window, '__TAURI_INTERNALS__');
  });

  it('renders in a browser preview when Tauri event listeners are unavailable', async () => {
    render(<AppShell />);

    expect(await screen.findByText('Manage your Skills')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('搜索 Skill 名称、标签或描述...')).toBeInTheDocument();
    await waitFor(() => expect(listenMock).toHaveBeenCalledWith('scan-changed', expect.any(Function)));
  });

  it('renders Dashboard metrics from the live skill store', async () => {
    const skills: Skill[] = Array.from({ length: 9 }, (_, index) => ({
      name: `skill-${index + 1}`,
      description: `Skill ${index + 1}`,
      source: 'mine',
      category: '数据',
      path: `/tmp/skill-${index + 1}/SKILL.md`,
      modifiedAt: `2026-07-0${(index % 6) + 1}`,
      size: 0,
      starred: index === 0,
      disabled: false,
      protected: false,
    }));
    useUIStore.setState({ mainView: 'dashboard', subView: null, subParam: null });
    useSkillStore.getState().setSkills(skills);

    render(<AppShell />);

    expect(await screen.findByText('Skill 仓库概览与待处理事项')).toBeInTheDocument();
    expect(screen.getByText('Skill 总数')).toBeInTheDocument();
    expect(screen.getAllByText('9').length).toBeGreaterThan(0);
  });

  it('loads Logs rows from get_call_logs', async () => {
    useUIStore.setState({ subView: 'logs' });
    invokeMock.mockImplementation((command: string) => {
      if (command === 'watch_scan_dirs') return Promise.resolve();
      if (command === 'get_call_logs') {
        return Promise.resolve([
          { time: '刚刚', skillName: 'Live Skill', prompt: '真实调用', status: 'ok', durationMs: 640, tokens: 42 },
        ]);
      }
      return Promise.resolve([]);
    });

    render(<AppShell />);

    expect(await screen.findByText('真实调用')).toBeInTheDocument();
    expect(invokeMock).toHaveBeenCalledWith('get_call_logs', { range: '7d' });
  });

  it('persists a new skill through create_skill', async () => {
    const user = userEvent.setup();
    const created: SkillDetail = {
      path: '/tmp/created/SKILL.md',
      name: 'created skill',
      description: 'Created from test',
      source: 'codex-user',
      parseStatus: 'parsed',
      modifiedAt: '2026-07-06T00:00:00Z',
      markdown: '# Created',
      bodyMarkdown: '# Created',
      rawContent: '---\nname: created skill\ndescription: Created from test\n---\n# Created',
      frontmatter: { category: 'data' },
    };
    invokeMock.mockImplementation((command: string) => {
      if (command === 'watch_scan_dirs') return Promise.resolve();
      if (command === 'scan_skills') return Promise.resolve([]);
      if (command === 'create_skill') return Promise.resolve(created);
      return Promise.reject(new Error(`Unexpected command: ${command}`));
    });

    render(<AppShell />);

    await user.click(await screen.findByRole('button', { name: 'New Skill' }));
    await user.type(screen.getByPlaceholderText('简要描述功能'), 'Created from test');
    await user.click(screen.getByRole('button', { name: '创建并编辑' }));

    await waitFor(() => expect(invokeMock).toHaveBeenCalledWith('create_skill', {
      input: expect.objectContaining({
        name: 'my-awesome-skill',
        description: 'Created from test',
        source: 'codex-user',
        targetDirectory: '~/.codex/skills',
      }),
    }));
  });

  it('copies protected detail sources to an editable skill before opening the editor', async () => {
    const user = userEvent.setup();
    const protectedSkill: Skill = {
      name: 'plugin skill',
      description: 'Protected source',
      source: 'plugin',
      category: 'AI',
      path: '/tmp/plugin-skill/SKILL.md',
      modifiedAt: '2026-07-15',
      size: 100,
      starred: false,
      disabled: false,
      protected: true,
    };
    useSkillStore.setState({ skills: [protectedSkill], filtered: [protectedSkill], drawerIdx: 0 });
    useUIStore.setState({ mainView: 'library', subView: 'detail', subParam: protectedSkill.path });
    invokeMock.mockImplementation((command: string) => {
      if (command === 'watch_scan_dirs') return Promise.resolve();
      if (command === 'clone_skill') return Promise.resolve({ newPath: '/tmp/editable-copy/SKILL.md' });
      if (command === 'read_skill') {
        return Promise.resolve({
          path: '/tmp/editable-copy/SKILL.md',
          name: 'editable copy',
          description: 'Editable copy',
          source: 'codex-user',
          parseStatus: 'parsed',
          modifiedAt: '2026-07-15',
          markdown: '# Copy',
          bodyMarkdown: '# Copy',
          rawContent: '# Copy',
          frontmatter: {},
        });
      }
      return Promise.resolve([]);
    });

    render(<AppShell />);

    expect(await screen.findByText('受保护来源')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '编辑' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '复制到可编辑目录' }));
    await user.click(await screen.findByRole('button', { name: '复制并编辑' }));

    await waitFor(() => expect(invokeMock).toHaveBeenCalledWith('clone_skill', {
      destName: 'plugin skill',
      srcPath: protectedSkill.path,
    }));
  });

  it('archives and restores a detail skill through persisted app settings', async () => {
    const user = userEvent.setup();
    const skill: Skill = {
      name: 'local skill',
      description: 'Editable local source',
      source: 'mine',
      category: 'AI',
      path: '/tmp/local-skill/SKILL.md',
      modifiedAt: '2026-07-15',
      size: 100,
      starred: false,
      disabled: false,
      protected: false,
    };
    useSkillStore.setState({ skills: [skill], filtered: [skill], drawerIdx: 0 });
    useUIStore.setState({ mainView: 'library', subView: 'detail', subParam: skill.path });
    invokeMock.mockImplementation((command: string, payload?: unknown) => {
      if (command === 'watch_scan_dirs') return Promise.resolve();
      if (command === 'load_app_settings') {
        return Promise.resolve({ language: 'zh-CN', customScanDirectories: [], showDefaultScanDirectories: true, skillArchives: {} });
      }
      if (command === 'save_app_settings') return Promise.resolve((payload as { settings: unknown }).settings);
      return Promise.resolve([]);
    });

    render(<AppShell />);

    await user.click(await screen.findByRole('button', { name: '归档' }));
    expect(await screen.findByRole('dialog', { name: '应用内归档' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '确认归档' }));

    await waitFor(() => expect(invokeMock).toHaveBeenCalledWith('save_app_settings', {
      settings: expect.objectContaining({ skillArchives: { [skill.path]: true } }),
    }));
    expect(await screen.findByText('归档成功')).toBeInTheDocument();

    await user.click(screen.getAllByRole('button', { name: '取消归档' })[0]);
    await user.click(await screen.findByRole('button', { name: '确认取消归档' }));
    await waitFor(() => expect(invokeMock).toHaveBeenCalledWith('save_app_settings', {
      settings: expect.objectContaining({ skillArchives: {} }),
    }));
    expect(await screen.findByText('已取消归档')).toBeInTheDocument();
    expect(invokeMock).not.toHaveBeenCalledWith('toggle_skill_enabled', expect.anything());
  });

  it('confirms the editable copy name and reports the new user path', async () => {
    const user = userEvent.setup();
    const protectedSkill: Skill = {
      name: 'plugin skill',
      description: 'Protected source',
      source: 'plugin',
      category: 'AI',
      path: '/tmp/plugin-skill/SKILL.md',
      modifiedAt: '2026-07-15',
      size: 100,
      starred: false,
      disabled: false,
      protected: true,
    };
    useSkillStore.setState({ skills: [protectedSkill], filtered: [protectedSkill], drawerIdx: 0 });
    useUIStore.setState({ mainView: 'library', subView: 'detail', subParam: protectedSkill.path });
    invokeMock.mockImplementation((command: string) => {
      if (command === 'watch_scan_dirs') return Promise.resolve();
      if (command === 'load_app_settings') {
        return Promise.resolve({ language: 'zh-CN', customScanDirectories: [], showDefaultScanDirectories: true, skillArchives: {} });
      }
      if (command === 'clone_skill') return Promise.resolve({ newPath: '/tmp/editable-copy/SKILL.md' });
      return Promise.resolve([]);
    });

    render(<AppShell />);

    await user.click(await screen.findByRole('button', { name: '复制到可编辑目录' }));
    const dialog = await screen.findByRole('dialog', { name: '复制到可编辑目录' });
    expect(dialog).toBeInTheDocument();
    const nameInput = screen.getByLabelText('新 Skill 名称');
    await user.clear(nameInput);
    await user.type(nameInput, 'plugin skill editable');
    await user.click(screen.getByRole('button', { name: '复制并编辑' }));

    await waitFor(() => expect(invokeMock).toHaveBeenCalledWith('clone_skill', {
      destName: 'plugin skill editable',
      srcPath: protectedSkill.path,
    }));
    expect(await screen.findByText(/新路径：\/tmp\/editable-copy\/SKILL\.md/)).toBeInTheDocument();
    expect(await screen.findByText(/来源：User/)).toBeInTheDocument();
  });

  it('requires an explicit checkbox before deleting local files and removes the skill from the library after backend trash succeeds', async () => {
    const user = userEvent.setup();
    const skill: Skill = {
      name: 'delete me',
      description: 'Editable local source',
      source: 'mine',
      category: 'AI',
      path: '/tmp/delete-me/SKILL.md',
      modifiedAt: '2026-07-15',
      size: 100,
      starred: false,
      disabled: false,
      protected: false,
    };
    useSkillStore.setState({ skills: [skill], filtered: [skill], drawerIdx: 0 });
    useUIStore.setState({ mainView: 'library', subView: 'detail', subParam: skill.path });
    invokeMock.mockImplementation((command: string) => {
      if (command === 'watch_scan_dirs') return Promise.resolve();
      if (command === 'load_app_settings') {
        return Promise.resolve({ language: 'zh-CN', customScanDirectories: [], showDefaultScanDirectories: true, skillArchives: {} });
      }
      if (command === 'delete_skill') {
        return Promise.resolve({
          skillName: 'delete me',
          originalPath: '/tmp/delete-me',
          backupPath: '/tmp/.skill-panel-backups/delete-me-1',
          trashResult: 'moved-to-trash',
          restoreInstructions: '可从系统废纸篓或应用内备份恢复。',
        });
      }
      return Promise.resolve([]);
    });

    render(<AppShell />);

    await user.click(await screen.findByRole('button', { name: '删除本地文件' }));
    const dialog = await screen.findByRole('dialog', { name: '删除本地文件' });
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByText('文件将进入系统废纸篓，同时创建应用内备份')).toBeInTheDocument();
    const deleteButton = within(dialog).getByRole('button', { name: '删除本地文件' });
    expect(deleteButton).toBeDisabled();
    await user.click(within(dialog).getByLabelText('我已了解删除影响，并确认要删除本地文件'));
    await user.click(deleteButton);

    await waitFor(() => expect(invokeMock).toHaveBeenCalledWith('delete_skill', { path: skill.path }));
    expect(await screen.findByText('删除成功')).toBeInTheDocument();
    expect(screen.getByText(/备份：\/tmp\/\.skill-panel-backups\/delete-me-1/)).toBeInTheDocument();
    expect(useSkillStore.getState().skills).toEqual([]);
  });

  it('keeps protected detail sources from deleting local files', async () => {
    const protectedSkill: Skill = {
      name: 'plugin skill',
      description: 'Protected source',
      source: 'plugin',
      category: 'AI',
      path: '/tmp/plugin-skill/SKILL.md',
      modifiedAt: '2026-07-15',
      size: 100,
      starred: false,
      disabled: false,
      protected: true,
    };
    useSkillStore.setState({ skills: [protectedSkill], filtered: [protectedSkill], drawerIdx: 0 });
    useUIStore.setState({ mainView: 'library', subView: 'detail', subParam: protectedSkill.path });
    invokeMock.mockImplementation((command: string) => {
      if (command === 'watch_scan_dirs') return Promise.resolve();
      if (command === 'load_app_settings') {
        return Promise.resolve({ language: 'zh-CN', customScanDirectories: [], showDefaultScanDirectories: true, skillArchives: {} });
      }
      return Promise.resolve([]);
    });

    render(<AppShell />);

    expect(await screen.findByText('受保护来源')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '删除本地文件' })).toBeDisabled();
    expect(invokeMock).not.toHaveBeenCalledWith('delete_skill', expect.anything());
  });

  it('marks the standalone detail backup button as pending while no command contract exists', async () => {
    const skill: Skill = {
      name: 'local skill',
      description: 'Editable local source',
      source: 'mine',
      category: 'AI',
      path: '/tmp/local-skill/SKILL.md',
      modifiedAt: '2026-07-15',
      size: 100,
      starred: false,
      disabled: false,
      protected: false,
    };
    useSkillStore.setState({ skills: [skill], filtered: [skill], drawerIdx: 0 });
    useUIStore.setState({ mainView: 'library', subView: 'detail', subParam: skill.path });
    invokeMock.mockImplementation((command: string) => {
      if (command === 'watch_scan_dirs') return Promise.resolve();
      if (command === 'load_app_settings') {
        return Promise.resolve({ language: 'zh-CN', customScanDirectories: [], showDefaultScanDirectories: true, skillArchives: {} });
      }
      return Promise.resolve([]);
    });

    render(<AppShell />);

    expect(await screen.findByRole('button', { name: '备份待实现' })).toBeDisabled();
  });

  it('keeps detail header actions from wrapping button labels under long paths', () => {
    const css = readFileSync('src/detail/detail.css', 'utf8');

    expect(css).toMatch(/\.detail-title-block\s*{[^}]*flex:\s*1[^}]*min-width:\s*0/s);
    expect(css).toMatch(/\.detail-actions-row\s*{[^}]*flex-shrink:\s*0/s);
    expect(css).toMatch(/\.detail-actions-row\s+\.btn\s*{[^}]*white-space:\s*nowrap/s);
    expect(css).toMatch(/@media\s*\(max-width:\s*1200px\)\s*{[^}]*\.detail-page-header\s*{[^}]*flex-direction:\s*column/s);
  });

  it('selects a Library card on single click without leaving Library', async () => {
    const user = userEvent.setup();
    mockShellCommands([editableSkill, protectedSkillFixture]);

    render(<AppShell />);

    await user.click(await screen.findByRole('button', { name: /protected skill/i }));

    expect(useUIStore.getState().subView).toBeNull();
    expect(useSkillStore.getState().drawerIdx).toBe(1);
    expect(screen.getByText('Protected plugin source')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /protected skill/i })).toHaveClass('active');
    expect(screen.getByRole('button', { name: /protected skill/i })).toHaveAttribute('aria-pressed', 'true');
  });

  it('opens an editable Library card in full Detail on double click without entering Editor', async () => {
    const user = userEvent.setup();
    mockShellCommands([editableSkill, protectedSkillFixture]);

    render(<AppShell />);

    await user.dblClick(await screen.findByRole('button', { name: /editable skill/i }));

    await waitFor(() => expect(useUIStore.getState().subView).toBe('detail'));
    expect(useUIStore.getState().subParam).toBe(editableSkill.path);
    expect(screen.getByRole('button', { name: '编辑' })).toBeInTheDocument();
    expect(screen.queryByLabelText('Markdown body')).not.toBeInTheDocument();
  });

  it('opens a protected Library card in full Detail on double click without entering Editor', async () => {
    const user = userEvent.setup();
    mockShellCommands([editableSkill, protectedSkillFixture]);

    render(<AppShell />);

    await user.dblClick(await screen.findByRole('button', { name: /protected skill/i }));

    await waitFor(() => expect(useUIStore.getState().subView).toBe('detail'));
    expect(useUIStore.getState().subParam).toBe(protectedSkillFixture.path);
    expect(await screen.findByText('受保护来源')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '只读查看' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '复制到可编辑目录' })).toBeInTheDocument();
    expect(screen.queryByLabelText('Markdown body')).not.toBeInTheDocument();
  });

  it('opens full Detail from the Library side panel action', async () => {
    const user = userEvent.setup();
    mockShellCommands([editableSkill, protectedSkillFixture]);

    render(<AppShell />);

    await user.click(await screen.findByRole('button', { name: /protected skill/i }));
    await user.click(screen.getByRole('button', { name: '查看完整详情' }));

    await waitFor(() => expect(useUIStore.getState().subView).toBe('detail'));
    expect(useUIStore.getState().subParam).toBe(protectedSkillFixture.path);
  });

  it('returns from full Detail to Library while preserving the selected card', async () => {
    const user = userEvent.setup();
    mockShellCommands([editableSkill, protectedSkillFixture]);

    render(<AppShell />);

    await user.dblClick(await screen.findByRole('button', { name: /protected skill/i }));
    await user.click(await screen.findByRole('button', { name: '返回 Library' }));

    await waitFor(() => expect(useUIStore.getState().subView).toBeNull());
    expect(useSkillStore.getState().drawerIdx).toBe(1);
    expect(screen.getByRole('button', { name: /protected skill/i })).toHaveClass('active');
  });

  it('copies a protected read-only Editor skill into a normal editable Editor', async () => {
    const user = userEvent.setup();
    mockShellCommands([protectedSkillFixture]);

    render(<AppShell />);

    await user.dblClick(await screen.findByRole('button', { name: /protected skill/i }));
    await user.click(await screen.findByRole('button', { name: '只读查看' }));
    await user.click(await screen.findByRole('button', { name: '复制到可编辑目录' }));

    await waitFor(() => expect(invokeMock).toHaveBeenCalledWith('clone_skill', {
      destName: protectedSkillFixture.name,
      srcPath: protectedSkillFixture.path,
    }));
    await waitFor(() => expect(screen.queryByText(/这是受保护的 Skill/)).not.toBeInTheDocument());
    expect(screen.getByLabelText('Markdown body')).not.toHaveAttribute('readonly');
    expect(useUIStore.getState().subView).toBe('editor');
    expect(useUIStore.getState().subParam).toBe('/tmp/editable-copy/SKILL.md');
  });

  it('opens editable and protected Library cards from Enter key', async () => {
    const user = userEvent.setup();
    mockShellCommands([editableSkill, protectedSkillFixture]);

    const { unmount } = render(<AppShell />);

    const editableCard = await screen.findByRole('button', { name: /editable skill/i });
    editableCard.focus();
    await user.keyboard('{Enter}');
    await waitFor(() => expect(useUIStore.getState().subView).toBe('detail'));
    expect(useUIStore.getState().subParam).toBe(editableSkill.path);

    unmount();
    useUIStore.setState({ mainView: 'library', subView: null, subParam: null });
    useSkillStore.setState({ skills: [], filtered: [], filters: { source: [], category: [], status: [] }, drawerIdx: -1 });
    render(<AppShell />);

    const protectedCard = await screen.findByRole('button', { name: /protected skill/i });
    protectedCard.focus();
    await user.keyboard('{Enter}');
    await waitFor(() => expect(useUIStore.getState().subView).toBe('detail'));
    expect(useUIStore.getState().subParam).toBe(protectedSkillFixture.path);
    expect(screen.getByRole('button', { name: '只读查看' })).toBeInTheDocument();
  });

  it('opens a normal Editor from editable Detail and returns to that Detail', async () => {
    const user = userEvent.setup();
    mockShellCommands([editableSkill, protectedSkillFixture]);

    render(<AppShell />);

    await user.dblClick(await screen.findByRole('button', { name: /editable skill/i }));
    await user.click(await screen.findByRole('button', { name: '编辑' }));
    await waitFor(() => expect(useUIStore.getState().subView).toBe('editor'));
    expect(screen.getByLabelText('Markdown body')).not.toHaveAttribute('readonly');
    expectEditorHeaderActionsOrder();
    await user.click(await screen.findByRole('button', { name: '返回' }));

    await waitFor(() => expect(useUIStore.getState().subView).toBe('detail'));
    expect(useUIStore.getState().subParam).toBe(editableSkill.path);
  });

  it('opens a read-only Editor from protected Detail and returns to that Detail', async () => {
    const user = userEvent.setup();
    mockShellCommands([editableSkill, protectedSkillFixture]);

    render(<AppShell />);

    await user.dblClick(await screen.findByRole('button', { name: /protected skill/i }));
    await user.click(await screen.findByRole('button', { name: '只读查看' }));
    await waitFor(() => expect(useUIStore.getState().subView).toBe('editor'));
    expect(screen.getByText('这是受保护的 Skill。当前页面仅供查看，原文件不会被修改。如需编辑，请复制到可编辑目录。')).toBeInTheDocument();
    expect(screen.getByLabelText('name')).toHaveAttribute('readonly');
    expect(screen.getByLabelText('Markdown body')).toHaveAttribute('readonly');
    expect(screen.getByRole('button', { name: '保存' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'AI 辅助' })).toBeDisabled();
    expectEditorHeaderActionsOrder();
    await user.click(await screen.findByRole('button', { name: '返回' }));

    await waitFor(() => expect(useUIStore.getState().subView).toBe('detail'));
    expect(useUIStore.getState().subParam).toBe(protectedSkillFixture.path);
  });

  it('returns from Detail-opened Editor back to the original Detail page', async () => {
    const user = userEvent.setup();
    mockShellCommands([editableSkill]);
    useSkillStore.setState({ skills: [editableSkill], filtered: [editableSkill], drawerIdx: 0 });
    useUIStore.setState({ mainView: 'library', subView: 'detail', subParam: editableSkill.path });

    render(<AppShell />);

    await user.click(await screen.findByRole('button', { name: '编辑' }));
    await user.click(await screen.findByRole('button', { name: '返回' }));

    await waitFor(() => expect(useUIStore.getState().subView).toBe('detail'));
    expect(useUIStore.getState().subParam).toBe(editableSkill.path);
  });

  it('confirms before returning with unsaved Editor changes and keeps the correct target', async () => {
    const user = userEvent.setup();
    mockShellCommands([editableSkill]);

    render(<AppShell />);

    await user.dblClick(await screen.findByRole('button', { name: /editable skill/i }));
    await user.click(await screen.findByRole('button', { name: '编辑' }));
    await user.type(await screen.findByLabelText('Markdown body'), '\nchanged');
    await user.click(screen.getByRole('button', { name: '返回' }));

    const dialog = await screen.findByRole('dialog', { name: '离开编辑器？' });
    expect(dialog).toBeInTheDocument();
    await user.click(within(dialog).getByRole('button', { name: '继续编辑' }));
    expect(useUIStore.getState().subView).toBe('editor');

    await user.click(screen.getByRole('button', { name: '返回' }));
    await user.click(await screen.findByRole('button', { name: '确认返回' }));
    await waitFor(() => expect(useUIStore.getState().subView).toBe('detail'));
    expect(useUIStore.getState().subParam).toBe(editableSkill.path);
  });

  it('saves AI keys through set_ai_key without keeping the raw key in settings state', async () => {
    const user = userEvent.setup();
    useUIStore.setState({ subView: 'settings' });
    invokeMock.mockImplementation((command: string) => {
      if (command === 'watch_scan_dirs') return Promise.resolve();
      if (command === 'set_ai_key') return Promise.resolve();
      return Promise.resolve([]);
    });

    render(<AppShell />);

    await user.click(await screen.findByRole('button', { name: '配置' }));
    await user.type(await screen.findByPlaceholderText('输入 API Key'), 'sk-test-secret');
    await user.click(screen.getByRole('button', { name: '保存' }));

    await waitFor(() => expect(invokeMock).toHaveBeenCalledWith('set_ai_key', { vendor: 'glm', key: 'sk-test-secret' }));
    expect(useSettingsStore.getState().aiKeyStored).toBe(true);
    expect(JSON.stringify(useSettingsStore.getState())).not.toContain('sk-test-secret');
  });

  it('blocks editor AI actions until the selected vendor has a stored key', async () => {
    const user = userEvent.setup();
    useUIStore.setState({ subView: 'editor', subParam: null });
    useSettingsStore.setState({ aiVendor: 'glm', aiKeyStored: false, aiDesensitize: true });
    invokeMock.mockImplementation((command: string) => {
      if (command === 'watch_scan_dirs') return Promise.resolve();
      if (command === 'get_ai_key') return Promise.resolve(false);
      return Promise.resolve([]);
    });

    render(<AppShell />);

    await user.click(await screen.findByRole('button', { name: 'AI' }));
    await user.click(screen.getByRole('button', { name: '完善结构' }));

    await waitFor(() => expect(invokeMock).toHaveBeenCalledWith('get_ai_key', { vendor: 'glm' }));
    expect(invokeMock).not.toHaveBeenCalledWith('ai_optimize', expect.anything());
    expect(await screen.findByText('未配置 glm 的 API Key，请先在设置中添加')).toBeInTheDocument();
  });

  it('requires preview confirmation before sending editor AI content', async () => {
    const user = userEvent.setup();
    useUIStore.setState({ subView: 'editor', subParam: null });
    useSettingsStore.setState({ aiVendor: 'glm', aiKeyStored: true, aiDesensitize: true });
    invokeMock.mockImplementation((command: string) => {
      if (command === 'watch_scan_dirs') return Promise.resolve();
      if (command === 'get_ai_key') return Promise.resolve(true);
      return Promise.resolve([]);
    });

    render(<AppShell />);

    await user.click(await screen.findByRole('button', { name: 'AI' }));
    await user.click(screen.getByRole('button', { name: '润色正文' }));

    expect(await screen.findByText('发送前确认')).toBeInTheDocument();
    expect(screen.getByText('服务商：GLM')).toBeInTheDocument();
    expect(screen.getByText('脱敏状态：已开启')).toBeInTheDocument();
    expect(invokeMock).not.toHaveBeenCalledWith('ai_optimize', expect.anything());

    await user.click(screen.getByRole('button', { name: '取消发送' }));
    expect(invokeMock).not.toHaveBeenCalledWith('ai_optimize', expect.anything());
  });

  it('applies selected AI diff output back into the editor markdown', async () => {
    const user = userEvent.setup();
    const listeners = new Map<string, (event: { payload: unknown }) => void>();
    useUIStore.setState({ subView: 'editor', subParam: null });
    useSettingsStore.setState({
      aiVendor: 'glm',
      aiKeyStored: true,
      aiDesensitize: true,
      aiMonthlyBudget: 50,
      aiMonthlyUsed: 2.4,
    });
    listenMock.mockImplementation((event: string, handler: (event: { payload: unknown }) => void) => {
      listeners.set(event, handler);
      return Promise.resolve(() => listeners.delete(event));
    });
    invokeMock.mockImplementation((command: string) => {
      if (command === 'watch_scan_dirs') return Promise.resolve();
      if (command === 'get_ai_key') return Promise.resolve(true);
      if (command === 'ai_optimize') {
        listeners.get('ai-chunk')?.({ payload: { chunk: '# Improved', done: false } });
        listeners.get('ai-done')?.({
          payload: {
            content: '# Improved Skill\n\n## Steps\n\n- Do the safer thing',
            usage: { prompt_tokens: 12, completion_tokens: 18 },
            cost_cny: 0.002,
          },
        });
        return Promise.resolve();
      }
      return Promise.resolve([]);
    });

    render(<AppShell />);

    await user.click(await screen.findByRole('button', { name: 'AI' }));
    await user.click(screen.getByRole('button', { name: '润色正文' }));
    await user.click(await screen.findByRole('button', { name: '确认发送' }));

    expect(await screen.findByText('AI 修改对比 · polish')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '全部接受' }));

    expect(await screen.findByDisplayValue(/# Improved Skill/)).toBeInTheDocument();
    expect(screen.getByText('已采纳 1 条建议，点击保存后写回 SKILL.md')).toBeInTheDocument();
    expect(invokeMock).not.toHaveBeenCalledWith('update_skill', expect.anything());
    expect(invokeMock).toHaveBeenCalledWith('ai_optimize', {
      content: expect.stringContaining('# Browser Control'),
      action: 'polish',
      vendor: 'glm',
      desensitize: true,
      sendConfirmed: true,
      rawContentConfirmed: false,
      preview: expect.stringContaining('# Browser Control'),
    });
  });
});
