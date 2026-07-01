import { type ReactNode } from 'react';

type SettingsProps = {
  ariaLabel: string;
  children: ReactNode;
};

export function Settings({ ariaLabel, children }: SettingsProps) {
  return (
    <section className="settings-panel" aria-label={ariaLabel}>
      {children}
    </section>
  );
}
