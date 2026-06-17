import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useI18nRuntime } from './runtime';

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

function I18nProbe() {
  const i18n = useI18nRuntime();

  return (
    <section>
      <p data-testid="language">{i18n.language}</p>
      <p data-testid="locale">{i18n.locale}</p>
      <h1>{i18n.t('app.title')}</h1>
      <select
        aria-label={i18n.t('language.label')}
        value={i18n.language}
        onChange={(event) => i18n.updateLanguage(event.target.value)}
      >
        {i18n.languageOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {i18n.t(option.labelKey)}
          </option>
        ))}
      </select>
    </section>
  );
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((innerResolve, innerReject) => {
    resolve = innerResolve;
    reject = innerReject;
  });
  return { promise, reject, resolve };
}

function SettingsSaveProbe() {
  const i18n = useI18nRuntime();

  return (
    <section>
      <p data-testid="settings-json">{JSON.stringify(i18n.settings)}</p>
      <button
        type="button"
        onClick={() =>
          void i18n.saveSettings({
            ...i18n.settings,
            categoryLabels: { finance: 'Old label' },
          })
        }
      >
        Save old
      </button>
      <button
        type="button"
        onClick={() =>
          void i18n.saveSettings({
            ...i18n.settings,
            categoryLabels: { finance: 'New label' },
            categoryColors: { finance: '#fee2e2' },
          })
        }
      >
        Save new
      </button>
    </section>
  );
}

describe('useI18n', () => {
  beforeEach(() => {
    invokeMock.mockReset();
    invokeMock.mockResolvedValue({
      language: 'system',
      customScanDirectories: [],
      showDefaultScanDirectories: true,
    });
    mockNavigatorLanguages(['zh-CN']);
  });

  it('exposes reusable language state, resolved locale, t, options, and updateLanguage', async () => {
    const user = userEvent.setup();
    render(<I18nProbe />);

    expect(await screen.findByRole('heading', { name: 'Skill 面板' })).toBeInTheDocument();
    expect(screen.getByTestId('language')).toHaveTextContent('system');
    expect(screen.getByTestId('locale')).toHaveTextContent('zh-CN');

    await user.selectOptions(screen.getByLabelText('语言'), 'en-US');

    expect(screen.getByRole('heading', { name: 'Skill Panel' })).toBeInTheDocument();
    expect(screen.getByTestId('language')).toHaveTextContent('en-US');
    expect(screen.getByTestId('locale')).toHaveTextContent('en-US');
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

  it('keeps the latest settings when overlapping saves resolve out of order', async () => {
    const user = userEvent.setup();
    const oldSave = deferred<unknown>();
    const newSave = deferred<unknown>();
    invokeMock.mockImplementation((command: string, payload?: unknown) => {
      if (command === 'load_app_settings') {
        return Promise.resolve({
          language: 'en-US',
          customScanDirectories: [],
          showDefaultScanDirectories: true,
        });
      }
      if (command === 'save_app_settings') {
        const settings = (payload as { settings: { categoryLabels?: Record<string, string> } }).settings;
        return settings.categoryLabels?.finance === 'Old label' ? oldSave.promise : newSave.promise;
      }
      return Promise.reject(new Error(`Unexpected command: ${command}`));
    });

    render(<SettingsSaveProbe />);

    await screen.findByText('Save old');
    await user.click(screen.getByRole('button', { name: 'Save old' }));
    await user.click(screen.getByRole('button', { name: 'Save new' }));

    newSave.resolve({
      language: 'en-US',
      customScanDirectories: [],
      showDefaultScanDirectories: true,
      categoryColors: { finance: '#fee2e2' },
      categoryLabels: { finance: 'New label' },
    });
    await waitFor(() => expect(screen.getByTestId('settings-json')).toHaveTextContent('New label'));

    oldSave.resolve({
      language: 'en-US',
      customScanDirectories: [],
      showDefaultScanDirectories: true,
      categoryLabels: { finance: 'Old label' },
    });

    await waitFor(() => expect(screen.getByTestId('settings-json')).toHaveTextContent('New label'));
    expect(screen.getByTestId('settings-json')).not.toHaveTextContent('Old label');
  });
});
