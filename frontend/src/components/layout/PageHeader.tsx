import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  eyebrow?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  actions,
  eyebrow,
}) => (
  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
    <div>
      {eyebrow && (
        <p className="text-[10px] font-bold tracking-widest uppercase text-charcoal-400 mb-1">
          {eyebrow}
        </p>
      )}
      <h1 className="text-xl font-bold text-charcoal-900 leading-tight">{title}</h1>
      {subtitle && (
        <p className="text-sm text-charcoal-500 mt-0.5 leading-relaxed">{subtitle}</p>
      )}
    </div>
    {actions && (
      <div className="flex items-center gap-2 shrink-0">
        {actions}
      </div>
    )}
  </div>
);
