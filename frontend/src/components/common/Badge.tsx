import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'healthy' | 'reorder' | 'critical' | 'overstocked' | 'info' | 'neutral';
  size?: 'sm' | 'md';
  dot?: boolean;
  className?: string;
}

const VARIANT_STYLES: Record<string, string> = {
  default:     'bg-sand-200 text-charcoal-600 border-sand-400',
  healthy:     'bg-olive-50 text-olive-700 border-olive-200',
  reorder:     'bg-terracotta-50 text-terracotta-700 border-terracotta-200',
  critical:    'bg-terracotta-100 text-terracotta-800 border-terracotta-300',
  overstocked: 'bg-sand-100 text-charcoal-600 border-sand-400',
  info:        'bg-sand-200 text-charcoal-700 border-sand-500',
  neutral:     'bg-sand-100 text-charcoal-500 border-sand-300',
};

const DOT_STYLES: Record<string, string> = {
  default:     'bg-charcoal-400',
  healthy:     'bg-olive-500',
  reorder:     'bg-terracotta-400',
  critical:    'bg-terracotta-600',
  overstocked: 'bg-charcoal-400',
  info:        'bg-charcoal-500',
  neutral:     'bg-charcoal-300',
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'sm',
  dot = false,
  className = '',
}) => {
  const sizeStyle = size === 'sm'
    ? 'text-[10px] px-1.5 py-0.5 gap-1'
    : 'text-xs px-2 py-0.5 gap-1.5';

  return (
    <span
      className={`inline-flex items-center font-semibold uppercase tracking-wider border rounded
        ${sizeStyle} ${VARIANT_STYLES[variant] ?? VARIANT_STYLES.default} ${className}`}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${DOT_STYLES[variant] ?? DOT_STYLES.default}`}
        />
      )}
      {children}
    </span>
  );
};
