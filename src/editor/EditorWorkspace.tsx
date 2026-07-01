import { type ReactNode } from 'react';

type EditorWorkspaceProps = {
  ariaLabel: string;
  children: ReactNode;
};

export function EditorWorkspace({ ariaLabel, children }: EditorWorkspaceProps) {
  return (
    <section className="editor-workspace" aria-label={ariaLabel}>
      {children}
    </section>
  );
}
