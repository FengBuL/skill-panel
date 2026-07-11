import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from './App';
import { useSettingsStore } from './store/settingsStore';
import { useSkillStore } from './store/skillStore';
import { useUIStore } from './store/uiStore';

const { invokeMock, listenMock } = vi.hoisted(() => ({
  invokeMock: vi.fn(),
  listenMock: vi.fn(),
}));

vi.mock('@tauri-apps/api/core', () => ({ invoke: invokeMock }));
vi.mock('@tauri-apps/api/event', () => ({ listen: listenMock }));

describe('App navigation and page shell', () => {
  beforeEach(() => {
    invokeMock.mockReset();
    listenMock.mockReset();
    invokeMock.mockImplementation((command: string) => {
      if (command === 'watch_scan_dirs') return Promise.resolve();
      if (command === 'scan_skills') return Promise.resolve([]);
      if (command === 'get_call_logs') return Promise.resolve([]);
      return Promise.resolve(null);
    });
    listenMock.mockRejectedValue(new Error('browser preview'));
    useUIStore.setState({ mainView: 'library', subView: null, subParam: null });
    useSkillStore.setState({
      skills: [],
      filtered: [],
      search: '',
      filters: { source: [], category: [], status: [] },
      drawerIdx: -1,
      drawerOpen: false,
    });
    useSettingsStore.setState({ aiVendor: 'glm', aiKeyStored: false });
    window.location.hash = '';
  });

  it('keeps the approved five-item primary navigation and a secondary New Skill entry', async () => {
    render(<App />);

    const navigation = screen.getByRole('navigation', { name: '主导航' });
    expect(within(navigation).getAllByRole('button').map(button => button.textContent)).toEqual([
      'Dashboard',
      'Library',
      'Logs',
      'Dependencies',
      'Settings',
    ]);
    expect(screen.getByRole('button', { name: 'New Skill' })).toBeInTheDocument();
    expect(await screen.findByText('Manage your Skills')).toBeInTheDocument();
  });

  it('routes every primary navigation item to its current page', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Dashboard' }));
    expect(await screen.findByText('Skill 仓库概览与待处理事项')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Logs' }));
    expect(await screen.findByText('调用日志')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Dependencies' }));
    expect(await screen.findByText('依赖分析')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Settings' }));
    expect(await screen.findByText('管理 Skill 根目录、扫描行为、AI 厂商与数据安全偏好')).toBeInTheDocument();
  });

  it('shows one contextual right-side entry in the AI Assistant', async () => {
    useUIStore.setState({ mainView: 'library', subView: 'ai', subParam: 'aihot-query' });
    render(<App />);

    expect(await screen.findByRole('heading', { name: 'AI 助手' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '返回编辑器' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'New Skill' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Library' })).toHaveClass('active');
  });

  it('opens New Skill as a secondary workflow and returns to Library after creation', async () => {
    const user = userEvent.setup();
    invokeMock.mockImplementation((command: string) => {
      if (command === 'watch_scan_dirs') return Promise.resolve();
      if (command === 'scan_skills') return Promise.resolve([]);
      if (command === 'create_skill') {
        return Promise.resolve({
          path: '/tmp/demo/SKILL.md',
          name: 'my-awesome-skill',
          description: 'Demo',
          source: 'codex-user',
          parseStatus: 'parsed',
          modifiedAt: '2026-07-11T00:00:00Z',
          markdown: '# Demo',
          bodyMarkdown: '# Demo',
          rawContent: '# Demo',
          frontmatter: {},
        });
      }
      return Promise.resolve(null);
    });
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'New Skill' }));
    expect(await screen.findByRole('heading', { name: '新建 Skill' })).toBeInTheDocument();
    await user.type(screen.getByPlaceholderText('简要描述功能'), 'Demo');
    await user.click(screen.getByRole('button', { name: '创建并编辑' }));

    await waitFor(() => expect(invokeMock).toHaveBeenCalledWith('create_skill', {
      input: expect.objectContaining({ name: 'my-awesome-skill', description: 'Demo' }),
    }));
    expect(await screen.findByText('Manage your Skills')).toBeInTheDocument();
  });
});
