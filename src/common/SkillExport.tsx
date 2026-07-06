import { type ChangeEvent, useRef } from 'react';
import { MaterialIcon } from './Ui';

type SkillExportActionsProps = {
  canExport: boolean;
  exportLabel: string;
  importLabel: string;
  onExport: () => void;
  onImport: (file: File) => void;
};

export function SkillExportActions({ canExport, exportLabel, importLabel, onExport, onImport }: SkillExportActionsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = '';
    if (file) {
      onImport(file);
    }
  };

  return (
    <div className="skill-export-actions">
      <button type="button" className="secondary-action" disabled={!canExport} onClick={onExport}>
        <MaterialIcon name="download" size={17} />
        {exportLabel}
      </button>
      <button type="button" className="secondary-action" onClick={() => fileInputRef.current?.click()}>
        <MaterialIcon name="upload_file" size={17} />
        {importLabel}
      </button>
      <input ref={fileInputRef} type="file" accept="application/json,.json" className="visually-hidden" onChange={handleFileChange} />
    </div>
  );
}
