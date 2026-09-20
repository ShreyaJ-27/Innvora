import React, { useState, useRef, useEffect } from 'react';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

/**
 * Warm Innvora tooltip — replaces the old dark bg-slate-900 tooltip.
 * Sand surface, subtle border, readable charcoal text.
 */
export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  placement = 'top',
  className = '',
}) => {
  const [visible, setVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const placementStyles: Record<string, string> = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div
      ref={containerRef}
      className={`relative inline-flex ${className}`}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && content && (
        <div
          className={`absolute z-50 pointer-events-none animate-fade-in ${placementStyles[placement] ?? placementStyles.top}`}
        >
          <div
            className="bg-sand-100 border border-sand-400 text-charcoal-800 text-xs rounded-lg px-3 py-2 shadow-panel whitespace-nowrap max-w-xs"
            style={{ boxShadow: '0 4px 12px rgba(39,37,34,0.10)' }}
          >
            {content}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Warm custom tooltip for Recharts charts.
 * Use as: <Tooltip content={<WarmChartTooltip />} />
 */
export const WarmChartTooltip: React.FC<{
  active?: boolean;
  payload?: Array<{ name: string; value: number; color?: string; unit?: string }>;
  label?: string;
  formatter?: (value: number, name: string) => string;
}> = ({ active, payload, label, formatter }) => {
  if (!active || !payload?.length) return null;

  return (
    <div
      className="bg-sand-100 border border-sand-400 rounded-lg px-3 py-2.5 text-xs"
      style={{ boxShadow: '0 4px 12px rgba(39,37,34,0.10)' }}
    >
      {label && (
        <p className="font-semibold text-charcoal-900 mb-1.5 pb-1 border-b border-sand-300">
          {label}
        </p>
      )}
      <div className="space-y-1">
        {payload.map((entry, i) => (
          <div key={i} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5">
              {entry.color && (
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: entry.color }}
                />
              )}
              <span className="text-charcoal-600">{entry.name}</span>
            </div>
            <span className="font-semibold text-charcoal-900">
              {formatter ? formatter(entry.value, entry.name) : entry.value}
              {entry.unit ? ` ${entry.unit}` : ''}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
