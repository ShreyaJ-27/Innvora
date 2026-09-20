import React from 'react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
}) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center gap-4">
    {icon && (
      <div className="w-12 h-12 rounded-xl bg-sand-200 border border-sand-400 flex items-center justify-center text-charcoal-400">
        {icon}
      </div>
    )}
    <div>
      <p className="text-sm font-semibold text-charcoal-700">{title}</p>
      {description && (
        <p className="text-xs text-charcoal-400 mt-1 max-w-xs">{description}</p>
      )}
    </div>
    {action && <div>{action}</div>}
  </div>
);
