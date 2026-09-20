import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  noPadding?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  header,
  footer,
  className = '',
  noPadding = false,
  onClick,
}) => {
  return (
    <div
      className={`bg-sand-100 border border-sand-400 rounded-xl overflow-hidden ${
        onClick ? 'cursor-pointer hover:border-sand-500 transition-colors' : ''
      } ${className}`}
      style={{ boxShadow: '0 1px 3px 0 rgba(39,37,34,0.06)' }}
      onClick={onClick}
    >
      {header && (
        <div className="px-5 py-4 border-b border-sand-300">
          {header}
        </div>
      )}
      <div className={noPadding ? '' : 'p-5'}>
        {children}
      </div>
      {footer && (
        <div className="px-5 py-3 border-t border-sand-300 bg-sand-200">
          {footer}
        </div>
      )}
    </div>
  );
};
