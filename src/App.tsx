import { useMemo, useState } from 'react';
import { defaultLanguage, getText, isLanguage, languageOptions, type Language } from './i18n';

export function App() {
  const [language, setLanguage] = useState<Language>(defaultLanguage);
  const t = useMemo(() => (key: Parameters<typeof getText>[1]) => getText(language, key), [language]);

  return (
    <main className="app-shell">
      <header className="top-bar">
        <div>
          <p className="eyebrow">{t("app.subtitle")}</p>
          <h1>{t("app.title")}</h1>
        </div>
        <label className="locale-switcher">
          <span>{t("language.label")}</span>
          <select
            aria-label={t("language.label")}
            value={language}
            onChange={(event) => {
              if (isLanguage(event.target.value)) {
                setLanguage(event.target.value);
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
      </header>

      <section className="dashboard-grid" aria-label={t("layout.dashboard")}>
        <aside className="panel sidebar">
          <h2>{t("sources.title")}</h2>
          <button type="button">{t("actions.scan")}</button>
          <button type="button">{t("actions.newSkill")}</button>
          <nav aria-label={t("sources.title")}>
            <a href="#codex">{t("sources.codex")}</a>
            <a href="#agents">{t("sources.agents")}</a>
            <a href="#plugins">{t("sources.plugins")}</a>
          </nav>
        </aside>

        <section className="panel list-panel">
          <div className="section-heading">
            <h2>{t("skills.title")}</h2>
            <input aria-label={t("search.label")} placeholder={t("search.placeholder")} />
          </div>
          <div className="empty-state">
            <strong>{t("skills.emptyTitle")}</strong>
            <p>{t("skills.emptyDescription")}</p>
          </div>
        </section>

        <aside className="panel detail-panel">
          <h2>{t("details.title")}</h2>
          <dl>
            <div>
              <dt>{t("details.name")}</dt>
              <dd>{t("details.placeholder")}</dd>
            </div>
            <div>
              <dt>{t("details.path")}</dt>
              <dd>{t("details.placeholder")}</dd>
            </div>
          </dl>
          <div className="detail-actions">
            <button type="button">{t("actions.save")}</button>
            <button type="button">{t("actions.delete")}</button>
            <button type="button">{t("actions.openFolder")}</button>
          </div>
        </aside>
      </section>
    </main>
  );
}
