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
});
