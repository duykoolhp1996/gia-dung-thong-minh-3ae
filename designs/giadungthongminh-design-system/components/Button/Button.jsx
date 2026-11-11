import React from 'react';

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icon = null,
  children,
  className = '',
  ...props
}) {
  const baseClass = 'gdtm-btn';
  const variantClass = `gdtm-btn-${variant}`;
  const sizeClass = size !== 'md' ? `gdtm-btn-${size}` : '';
  const fullWidthClass = fullWidth ? 'gdtm-btn-full' : '';

  return (
    <button
      className={`${baseClass} ${variantClass} ${sizeClass} ${fullWidthClass} ${className}`.trim()}
      {...props}
    >
      {icon && <span className="gdtm-btn-icon-wrap">{icon}</span>}
      {children}
    </button>
  );
}
