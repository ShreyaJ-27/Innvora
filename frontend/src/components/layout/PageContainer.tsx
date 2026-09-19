import React from 'react';

export interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'default' | 'full';
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  className = '',
  maxWidth = 'default',
}) => {
  return (
    <main
      className={`w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 ${
        maxWidth === 'default' ? 'max-w-7xl' : 'max-w-full'
      } ${className}`}
    >
      {children}
    </main>
  );
};
