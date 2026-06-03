import { isLanguage, useI18nRuntime } from './i18n';

const sourceItems = [
  { href: '#all', labelKey: 'sources.all', count: '0' },
  { href: '#codex', labelKey: 'sources.codex', count: '0' },
  { href: '#agents', labelKey: 'sources.agents', count: '0' },
  { href: '#plugins', labelKey: 'sources.plugins', count: '0' },
] as const;

const detailTagKeys = ['details.tagMcp', 'details.tagUi', 'details.tagLocal'] as const;

export function App() {
  const { language, languageOptions, t, updateLanguage } = useI18nRuntime();

  return (
    <main className="app-shell">
      <header className="top-bar">
        <div className="brand-block">
          <p className="eyebrow">{t('app.subtitle')}</p>
          <h1>{t('app.title')}</h1>
        </div>
        <div className="toolbar-actions">
          <button type="button" className="primary-action">
            {t('actions.scan')}
          </button>
          <button type="button">{t('actions.newSkill')}</button>
          <button type="button">{t('actions.settings')}</button>
          <label className="locale-switcher">
            <span>{t('language.label')}</span>
            <select
              aria-label={t('language.label')}
              value={language}
              onChange={(event) => {
                if (isLanguage(event.target.value)) {
                  updateLanguage(event.target.value);
                }
              }}
            >
              {languageOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {t(option.labelKey)}
                </option>
              ))}
            </select>
          </label>
        </div>
      </header>

      <section className="dashboard-grid" aria-label={t('layout.dashboard')}>
        <aside className="panel sidebar" aria-label={t('sources.title')}>
          <div className="panel-heading">
            <h2>{t('sources.title')}</h2>
            <span className="count-badge">0</span>
          </div>
          <nav aria-label={t('sources.title')}>
            {sourceItems.map((item) => (
              <a key={item.href} href={item.href} className={item.href === '#all' ? 'active' : undefined}>
                <span>{t(item.labelKey)}</span>
                <span>{item.count}</span>
              </a>
            ))}
          </nav>

          <section className="sidebar-section" aria-label={t('sources.statusTitle')}>
            <h3>{t('sources.statusTitle')}</h3>
            <dl className="status-grid">
              <div>
                <dt>{t('sources.lastScan')}</dt>
                <dd>{t('sources.notScanned')}</dd>
              </div>
              <div>
                <dt>{t('sources.scanState')}</dt>
                <dd>{t('sources.idle')}</dd>
              </div>
            </dl>
          </section>

          <section className="sidebar-section" aria-label={t('filters.title')}>
            <h3>{t('filters.title')}</h3>
            <div className="button-stack">
              <button type="button">{t('filters.allSources')}</button>
              <button type="button">{t('filters.writable')}</button>
              <button type="button">{t('filters.withIssues')}</button>
            </div>
          </section>
        </aside>

        <section className="panel list-panel" aria-label={t('skills.title')}>
          <div className="section-heading">
            <div>
              <h2>{t('skills.title')}</h2>
              <p>{t('skills.summary')}</p>
            </div>
            <div className="list-controls">
              <input type="search" aria-label={t('search.skillsLabel')} placeholder={t('search.placeholder')} />
              <button type="button">{t('filters.enabled')}</button>
              <button type="button">{t('filters.status')}</button>
            </div>
          </div>
          <div className="empty-state">
            <strong>{t('skills.emptyTitle')}</strong>
            <p>{t('skills.emptyDescription')}</p>
          </div>
        </section>

        <aside className="panel detail-panel" aria-label={t('details.ariaLabel')}>
          <div className="panel-heading">
            <h2>{t('details.title')}</h2>
            <span className="status-pill">{t('details.placeholderStatus')}</span>
          </div>
          <section className="detail-section" aria-label={t('details.metadata')}>
            <h3>{t('details.metadata')}</h3>
            <dl>
              <div>
                <dt>{t('details.name')}</dt>
                <dd>{t('details.placeholder')}</dd>
              </div>
              <div>
                <dt>{t('details.source')}</dt>
                <dd>{t('details.placeholder')}</dd>
              </div>
              <div>
                <dt>{t('details.modified')}</dt>
                <dd>{t('details.placeholder')}</dd>
              </div>
            </dl>
          </section>
          <section className="detail-section" aria-label={t('details.path')}>
            <h3>{t('details.path')}</h3>
            <p className="path-placeholder">{t('details.placeholder')}</p>
          </section>
          <section className="detail-section" aria-label={t('details.description')}>
            <h3>{t('details.description')}</h3>
            <p>{t('details.descriptionPlaceholder')}</p>
          </section>
          <section className="detail-section split-section">
            <div>
              <h3>{t('details.tools')}</h3>
              <p className="muted">{t('details.noTools')}</p>
            </div>
            <div>
              <h3>{t('details.tags')}</h3>
              <div className="tag-row">
                {detailTagKeys.map((tagKey) => (
                  <span key={tagKey}>{t(tagKey)}</span>
                ))}
              </div>
            </div>
          </section>
          <div className="detail-actions">
            <button type="button">{t('actions.save')}</button>
            <button type="button">{t('actions.delete')}</button>
            <button type="button">{t('actions.openPath')}</button>
          </div>
        </aside>
      </section>
    </main>
  );
}
