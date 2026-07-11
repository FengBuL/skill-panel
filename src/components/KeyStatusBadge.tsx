type KeyStatusBadgeProps = {
  stored: boolean;
  maskedKey?: string;
};

export function KeyStatusBadge({ stored, maskedKey = 'sk-••••••••4f2a' }: KeyStatusBadgeProps) {
  return (
    <div className="key-status-row">
      <span className={`status-pill ${stored ? 'status-healthy' : 'status-review'}`}>
        {stored ? '已配置' : '未配置'}
      </span>
      <span className="text-sm text-secondary">密钥通过系统 Keychain 保存，前端不保存原始 Key</span>
      <span className="key-status-mask">{stored ? maskedKey : '请先在设置中添加'}</span>
    </div>
  );
}
