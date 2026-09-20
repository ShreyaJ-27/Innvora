import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const base =
    'inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const variants = {
    primary:
      'bg-charcoal-900 text-sand-100 hover:bg-charcoal-800 active:bg-charcoal-900 focus:ring-charcoal-800 rounded-lg shadow-subtle',
    secondary:
      'bg-sand-300 text-charcoal-800 hover:bg-sand-400 active:bg-sand-500 focus:ring-sand-500 border border-sand-400 rounded-lg',
    outline:
      'bg-sand-100 text-charcoal-700 hover:bg-sand-200 active:bg-sand-300 border border-sand-500 focus:ring-charcoal-700 rounded-lg shadow-subtle',
    ghost:
      'text-charcoal-600 hover:text-charcoal-900 hover:bg-sand-200 active:bg-sand-300 focus:ring-charcoal-400 rounded-lg',
    danger:
      'bg-terracotta-600 text-white hover:bg-terracotta-700 active:bg-terracotta-800 focus:ring-terracotta-500 rounded-lg shadow-subtle',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-sm px-5 py-2.5 gap-2',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin text-current" />
      ) : (
        leftIcon && <span className="shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
};
