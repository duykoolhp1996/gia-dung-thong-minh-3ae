import React from 'react';

export function Badge({
  variant = 'brand',
  children,
  className = '',
  ...props
}) {
  const baseClass = 'gdtm-badge';
  const variantClass = `gdtm-badge-${variant}`;

  return (
    <span className={`${baseClass} ${variantClass} ${className}`.trim()} {...props}>
      {children}
    </span>
  );
}
