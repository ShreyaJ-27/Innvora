import React from 'react';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'sm' | 'md';
  children: React.ReactNode;
}

export const IconButton: React.FC<IconButtonProps> = ({
  size = 'md',
  children,
  className = '',
  ...props
}) => {
  const sizeClasses = {
    sm: 'w-7 h-7',
    md: 'w-8 h-8',
  };

  return (
    <button
      className={`inline-flex items-center justify-center rounded-lg
        text-charcoal-500 hover:text-charcoal-900 hover:bg-sand-300
        transition-colors focus:outline-none focus:ring-1 focus:ring-charcoal-400
        disabled:opacity-50 disabled:cursor-not-allowed
        ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
