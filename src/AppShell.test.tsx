import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

    expect(await screen.findByText('全部 Skill')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('搜索名称/描述...')).toBeInTheDocument();
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

    expect(await screen.findByText('9 个 Skill · 来自当前扫描结果')).toBeInTheDocument();
    expect(screen.getByText('全部 Skill')).toBeInTheDocument();
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

    await user.click(await screen.findByRole('button', { name: /\+ 新建/ }));
    await user.type(screen.getByPlaceholderText('简要描述功能'), 'Created from test');
    await user.click(screen.getByRole('button', { name: '创建 Skill' }));

    await waitFor(() => expect(invokeMock).toHaveBeenCalledWith('create_skill', {
      input: expect.objectContaining({
        name: 'my-awesome-skill',
        description: 'Created from test',
        source: 'codex-user',
        targetDirectory: '~/.codex/skills',
      }),
    }));
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

    await user.type(await screen.findByPlaceholderText('输入 API Key'), 'sk-test-secret');
    await user.click(screen.getByRole('button', { name: '保存' }));

    await waitFor(() => expect(invokeMock).toHaveBeenCalledWith('set_ai_key', { vendor: 'glm', key: 'sk-test-secret' }));
    expect(useSettingsStore.getState().aiKeyStored).toBe(true);
    expect(JSON.stringify(useSettingsStore.getState())).not.toContain('sk-test-secret');
  });
});
