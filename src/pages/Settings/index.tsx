import { useState } from 'react';
import { ActionButton } from '../../components/ActionButton';
import { PageHeader } from '../../components/PageHeader';
import { SettingCard } from '../../components/SettingCard';
import { SettingsNav } from '../../components/SettingsNav';
import { Toggle } from '../../components/ui';
import { setAIKey } from '../../lib/ai';
import { useSettingsStore, type AIVendor, type Theme } from '../../store/settingsStore';
import { useUIStore } from '../../store/uiStore';
import './Settings.css';

const vendors: { value: AIVendor; label: string }[] = [
  { value: 'glm', label: '智谱 GLM' },
  { value: 'openai', label: 'OpenAI GPT-4o' },
  { value: 'claude', label: 'Claude Sonnet' },
  { value: 'ollama', label: 'Ollama 本地' },
];

const themes: { value: Theme; label: string }[] = [
  { value: 'light', label: '浅色' },
  { value: 'dark', label: '深色' },
  { value: 'auto', label: '跟随系统' },
];

export default function SettingsPage() {
  const settings = useSettingsStore();
  const ui = useUIStore();
  const [configuringKey, setConfiguringKey] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [keyError, setKeyError] = useState('');
  const [savingKey, setSavingKey] = useState(false);
  const budgetPercent = Math.min(100, Math.max(0, (settings.aiMonthlyUsed / Math.max(settings.aiMonthlyBudget, 1)) * 100));

  const saveApiKey = async () => {
    const key = apiKey.trim();
    if (!key || savingKey) return;
    setSavingKey(true);
    setKeyError('');
    try {
      await setAIKey(settings.aiVendor, key);
      settings.setAIKeyStored(true);
      setApiKey('');
      setConfiguringKey(false);
    } catch (error) {
      setKeyError(String(error));
    } finally {
      setSavingKey(false);
    }
  };

  return (
    <div className="settings-page">
      <PageHeader
        title="设置"
        subtitle="管理 Skill 根目录、扫描行为、AI 厂商与数据安全偏好"
        actions={<ActionButton variant="text" size="small" className="settings-return-button" onClick={() => ui.setMainView('library')}>返回</ActionButton>}
      />

      <div className="settings-grid">
        <SettingsNav />

        <div className="settings-stack">
          <SettingCard title="目录与扫描">
            <div className="form-row">
              <label htmlFor="skill-root">Skill 根目录</label>
              <input id="skill-root" className="input" value="~/.../skills" readOnly />
            </div>
            <div className="form-row">
              <label htmlFor="scan-interval">扫描间隔</label>
              <input id="scan-interval" className="input" value="启动时 + 每 30 分钟" readOnly />
            </div>
            <div className="form-row form-row-top">
              <label>自动扫描</label>
              <div className="setting-inline">
                <Toggle on={settings.autoScan} onClick={() => settings.setAutoScan(!settings.autoScan)} />
                <span className="text-sm text-secondary">在后台检测新增、修改和删除</span>
              </div>
            </div>
          </SettingCard>

          <SettingCard title="AI 厂商">
            <div className="form-row">
              <label>默认模型</label>
              <div className="settings-pill-group">
                {vendors.map(vendor => (
                  <button
                    className={`pill ${settings.aiVendor === vendor.value ? 'pill-active' : 'pill-default'}`}
                    type="button"
                    key={vendor.value}
                    onClick={() => settings.setAIVendor(vendor.value)}
                  >
                    {vendor.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="form-row">
              <label>API Key</label>
              {configuringKey ? (
                <div className="settings-key-row">
                  <input
                    className="input"
                    type="password"
                    value={apiKey}
                    onChange={event => setApiKey(event.target.value)}
                    placeholder="输入 API Key"
                    autoComplete="off"
                  />
                  <ActionButton variant="primary" size="small" disabled={!apiKey.trim() || savingKey} onClick={saveApiKey}>
                    {savingKey ? '保存中...' : '保存'}
                  </ActionButton>
                  <ActionButton variant="text" size="small" onClick={() => { setApiKey(''); setConfiguringKey(false); }}>
                    取消
                  </ActionButton>
                </div>
              ) : (
                <div className="settings-key-row">
                  <div className="settings-key-readonly" aria-label="API Key 脱敏展示">
                    {settings.aiKeyStored ? '已通过 Keychain 保存' : '尚未配置'}
                  </div>
                  <ActionButton variant="text" size="small" onClick={() => setConfiguringKey(true)}>
                    {settings.aiKeyStored ? '重新配置' : '配置'}
                  </ActionButton>
                </div>
              )}
            </div>
            {keyError ? <p className="text-sm settings-key-error">保存失败：{keyError}</p> : null}
            <p className="text-sm text-secondary settings-help">API Key 仅通过系统 Keychain 保存，前端不保存原始 Key。</p>
          </SettingCard>

          <SettingCard title="预算与安全">
            <div className="form-row">
              <label htmlFor="monthly-budget">月度预算</label>
              <input
                id="monthly-budget"
                className="input"
                value={`¥ ${settings.aiMonthlyBudget}`}
                onChange={event => settings.setAIBudget(Number(event.target.value.replace(/[^\d.]/g, '')) || 0)}
              />
            </div>
            <div className="form-row">
              <label htmlFor="monthly-used">已使用</label>
              <input id="monthly-used" className="input input-muted" value={`¥ ${settings.aiMonthlyUsed} (23.7%)`} readOnly />
            </div>
            <div className="form-row settings-budget-row" aria-label="预算使用进度">
              <label>预算进度</label>
              <div className="settings-budget-track">
                <span style={{ width: `${budgetPercent}%` }} />
              </div>
            </div>
            <div className="form-row form-row-top">
              <label>日志脱敏</label>
              <div className="setting-inline">
                <Toggle on={settings.aiDesensitize} onClick={() => settings.setAIDesensitize(!settings.aiDesensitize)} />
                <span className="text-sm text-secondary">在日志中自动隐藏路径、邮箱与密钥</span>
              </div>
            </div>
            <div className="form-row form-row-top">
              <label>diff 确认</label>
              <div className="setting-inline">
                <Toggle on={settings.aiDiffConfirm} onClick={() => settings.setAIDiffConfirm(!settings.aiDiffConfirm)} />
                <span className="text-sm text-secondary">AI 写回前必须确认差异</span>
              </div>
            </div>
          </SettingCard>

          <SettingCard title="外观">
            <div className="form-row form-row-top">
              <label>主题</label>
              <div className="settings-pill-group">
                {themes.map(theme => (
                  <button
                    className={`pill ${settings.theme === theme.value ? 'pill-active' : 'pill-default'}`}
                    type="button"
                    key={theme.value}
                    onClick={() => settings.setTheme(theme.value)}
                  >
                    {theme.label}
                  </button>
                ))}
              </div>
            </div>
          </SettingCard>

          <SettingCard title="数据安全说明" danger>
            <ul className="settings-safety-list text-sm text-secondary">
              <li>扫描只读取文件信息，不会修改用户文件。</li>
              <li>删除 Skill 仅移除应用内管理记录，本地文件需手动清理。</li>
              <li>AI 写回前必须经 diff 确认，并自动生成版本快照。</li>
              <li>所有敏感信息在前端展示时已脱敏处理。</li>
            </ul>
          </SettingCard>
        </div>
      </div>
    </div>
  );
}
