import { useState } from 'react';

export function DangerZone() {
  const [confirming, setConfirming] = useState(false);

  return (
    <section className="card mt-4 danger-zone">
      <div className="card-header"><h2 className="card-title">危险操作</h2></div>
      <div className="card-body">
        <p className="text-sm text-secondary mb-3">
          删除 Skill 会移除应用内的管理记录，但不会直接删除本地文件。如需彻底清理，请手动删除目录。
        </p>
        {confirming ? (
          <div className="danger-confirm">
            <span className="text-sm">需要确认：当前按钮仅展示确认流程，本批次不执行删除。</span>
            <button className="btn btn-danger-text" type="button" onClick={() => setConfirming(false)}>确认删除管理记录</button>
          </div>
        ) : (
          <button className="btn btn-danger-text" type="button" onClick={() => setConfirming(true)}>删除管理记录...</button>
        )}
      </div>
    </section>
  );
}
