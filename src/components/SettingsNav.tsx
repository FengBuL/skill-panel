const settingsGroups = ['目录与扫描', 'AI 厂商', '预算与安全', '外观'];

export function SettingsNav() {
  return (
    <aside className="card settings-nav" aria-label="设置分组">
      {settingsGroups.map((item, index) => (
        <button className={`settings-nav-item ${index === 0 ? 'active' : ''}`} type="button" key={item}>
          {item}
        </button>
      ))}
    </aside>
  );
}
