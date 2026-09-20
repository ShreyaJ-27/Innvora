import React from 'react';
import { InventoryStatus } from '../../types/inventory';
import { STATUS_CONFIG } from '../../utils/colors';

interface StatusBadgeProps {
  status: InventoryStatus;
  showDot?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  showDot = true,
  size = 'sm',
  className = '',
}) => {
  const cfg = STATUS_CONFIG[status];
  const sizeStyle = size === 'sm'
    ? 'text-[10px] px-1.5 py-0.5 gap-1'
    : 'text-xs px-2 py-0.5 gap-1.5';

  return (
    <span
      className={`inline-flex items-center font-semibold uppercase tracking-wider border rounded
        ${sizeStyle} ${cfg.badgeBg} ${cfg.badgeText} ${cfg.badgeBorder} ${className}`}
    >
      {showDot && (
        <span
          className="w-1.5 h-1.5 rounded-full shrink-0"
          style={{ backgroundColor: cfg.chartColor }}
        />
      )}
      {cfg.label}
    </span>
  );
};
