import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from './App';
import { useSettingsStore } from './store/settingsStore';
import { useSkillStore, type Skill } from './store/skillStore';
import { useUIStore } from './store/uiStore';

const { invokeMock, listenMock } = vi.hoisted(() => ({
  invokeMock: vi.fn(),
  listenMock: vi.fn(),
}));

vi.mock('@tauri-apps/api/core', () => ({ invoke: invokeMock }));
vi.mock('@tauri-apps/api/event', () => ({ listen: listenMock }));

const skill: Skill = {
  name: 'aihot-query',
  description: 'AI 热点查询',
  source: 'mine',
  category: 'AI',
  path: '/tmp/aihot-query/SKILL.md',
  modifiedAt: '2026-07-11',
  size: 1200,
  starred: false,
  disabled: false,
  protected: false,
};

describe('App current editor workflow', () => {
  beforeEach(() => {
    invokeMock.mockReset();
    listenMock.mockReset();
    listenMock.mockRejectedValue(new Error('browser preview'));
    invokeMock.mockImplementation((command: string) => {
      if (command === 'watch_scan_dirs') return Promise.resolve();
      if (command === 'read_skill') {
        return Promise.resolve({
          markdown: '# Loaded skill\n\nLoaded from disk.',
          rawContent: '# Loaded skill\n\nLoaded from disk.',
          frontmatter: { display: 'AI 热点查询', version: '1.4.0', category: 'AI', tags: ['news'], author: 'User' },
        });
      }
      if (command === 'validate_skill') {
        return Promise.resolve({ score: 100, checks: [{ id: 'structure', label: '结构完整', status: 'ok' }] });
      }
      return Promise.resolve(null);
    });
    useUIStore.setState({ mainView: 'library', subView: 'editor', subParam: skill.path });
    useSkillStore.setState({ skills: [skill], filtered: [skill], drawerIdx: 0, drawerOpen: true });
    useSettingsStore.setState({ aiVendor: 'glm', aiKeyStored: false, aiDesensitize: true });
  });

  it('loads the selected skill into the three-pane editor', async () => {
    render(<App />);

    expect(await screen.findByRole('region', { name: 'Skill editor' })).toBeInTheDocument();
    await waitFor(() => expect(invokeMock).toHaveBeenCalledWith('read_skill', { path: skill.path }));
    expect(await screen.findByDisplayValue(/# Loaded skill/)).toBeInTheDocument();
    expect(screen.getByLabelText('version')).toHaveValue('1.4.0');
    expect(screen.getByRole('heading', { name: 'Preview' })).toBeInTheDocument();
    expect(screen.getByText('校验结果')).toBeInTheDocument();
  });

  it('marks edits as unsaved and returns to synchronized state after Save', async () => {
    const user = userEvent.setup();
    render(<App />);

    const body = await screen.findByLabelText('Markdown body');
    await user.type(body, '\nNew line');
    expect(screen.getByText('未保存')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '保存' }));
    expect(screen.getByText('已同步')).toBeInTheDocument();
  });

  it('uses the live validation command when a real skill path is selected', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(await screen.findByRole('button', { name: '重新校验' }));
    await waitFor(() => expect(invokeMock).toHaveBeenCalledWith('validate_skill', { path: skill.path }));
    expect(await screen.findByText('结构完整')).toBeInTheDocument();
  });

  it('opens the page-level AI Assistant with a single return entry', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(await screen.findByRole('button', { name: 'AI 辅助' }));
    expect(await screen.findByRole('heading', { name: 'AI 助手' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '返回编辑器' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'New Skill' })).not.toBeInTheDocument();
  });
});
