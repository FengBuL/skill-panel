import type { ButtonHTMLAttributes, ReactNode } from 'react';
import './ui.css';

type ActionButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'text';
type ActionButtonSize = 'small' | 'default' | 'large';

type ActionButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ActionButtonVariant;
  size?: ActionButtonSize;
  icon?: ReactNode;
  loading?: boolean;
};

export function ActionButton({
  variant = 'secondary',
  size = 'default',
  icon,
  loading = false,
  children,
  className,
  disabled,
  ...props
}: ActionButtonProps) {
  const classes = ['sp-action-button', `sp-action-button-${variant}`, `sp-action-button-${size}`];
  if (className) classes.push(className);
  if (loading) classes.push('is-loading');

  return (
    <button className={classes.join(' ')} disabled={disabled || loading} {...props}>
      {loading ? <span className="sp-action-button-spinner" aria-hidden="true" /> : icon}
      <span className="sp-action-button-label">{children}</span>
    </button>
  );
}
