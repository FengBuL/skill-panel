import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppShell } from './AppShell';

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
    invokeMock.mockRejectedValue(new Error('__TAURI_INTERNALS__ unavailable'));
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
});
