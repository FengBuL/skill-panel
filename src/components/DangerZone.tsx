interface DangerZoneProps {
  archived: boolean;
  canDelete: boolean;
  onArchive: () => void;
  onDelete: () => void;
}

export function DangerZone({ archived, canDelete, onArchive, onDelete }: DangerZoneProps) {
  return (
    <section className="card mt-4 danger-zone">
      <div className="card-header"><h2 className="card-title">危险操作</h2></div>
      <div className="card-body danger-zone-body">
        <div>
          <p className="text-sm text-secondary mb-2">
            应用内归档只影响 Skill Panel 的显示状态，本地文件保留。
          </p>
          <button className="btn btn-danger-text" type="button" onClick={onArchive}>
            {archived ? '取消归档' : '应用内归档'}
          </button>
        </div>
        <div>
          <p className="text-sm text-secondary mb-2">
            删除本地文件会创建应用内备份，并把 Skill 目录移入系统废纸篓。
          </p>
          <button className="btn btn-danger" type="button" onClick={onDelete} disabled={!canDelete}>
            删除本地文件
          </button>
        </div>
      </div>
    </section>
  );
}
