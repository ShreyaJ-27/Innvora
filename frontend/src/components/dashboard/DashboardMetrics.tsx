import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, TrendingDown, AlertTriangle, Clock, ArrowRight } from 'lucide-react';
import { InventoryHealthSummary } from '../../types/inventory';

interface DashboardMetricsProps {
  summary: InventoryHealthSummary | null;
  isLoading: boolean;
  onNavigateToReorders: () => void;
}

const MetricSkeleton = () => (
  <div className="bg-sand-100 border border-sand-400 rounded-xl p-5 animate-pulse">
    <div className="h-3 bg-sand-300 rounded w-20 mb-3" />
    <div className="h-8 bg-sand-300 rounded w-16 mb-2" />
    <div className="h-2.5 bg-sand-200 rounded w-24" />
  </div>
);

export const DashboardMetrics: React.FC<DashboardMetricsProps> = ({
  summary,
  isLoading,
  onNavigateToReorders,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => <MetricSkeleton key={i} />)}
      </div>
    );
  }

  const metrics = [
    {
      label: 'Total SKUs',
      value: summary?.totalSkus ?? 0,
      sub: 'across all hubs',
      icon: <Package className="w-4 h-4" />,
      onClick: undefined,
      accent: false,
    },
    {
      label: 'Inventory Value',
      value: summary?.totalValue
        ? `₹${(summary.totalValue / 1000).toFixed(0)}K`
        : '—',
      sub: 'estimated in stock',
      icon: <TrendingDown className="w-4 h-4" />,
      onClick: undefined,
      accent: false,
    },
    {
      label: 'At Risk',
      value: summary?.criticalCount ?? 0,
      sub: 'critical — act now',
      icon: <AlertTriangle className="w-4 h-4" />,
      onClick: onNavigateToReorders,
      accent: (summary?.criticalCount ?? 0) > 0,
      accentClass: 'terracotta',
    },
    {
      label: 'Reorder Soon',
      value: summary?.reorderSoonCount ?? 0,
      sub: 'approaching threshold',
      icon: <Clock className="w-4 h-4" />,
      onClick: onNavigateToReorders,
      accent: (summary?.reorderSoonCount ?? 0) > 0,
      accentClass: 'amber',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((m) => (
        <div
          key={m.label}
          onClick={m.onClick}
          className={`bg-sand-100 border rounded-xl p-5 transition-all group ${
            m.onClick ? 'cursor-pointer hover:border-charcoal-700' : ''
          } ${
            m.accent && m.accentClass === 'terracotta'
              ? 'border-terracotta-200 bg-terracotta-50'
              : m.accent && m.accentClass === 'amber'
              ? 'border-sand-500 bg-sand-200'
              : 'border-sand-400'
          }`}
          style={{ boxShadow: '0 1px 3px rgba(39,37,34,0.06)' }}
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-charcoal-400">
              {m.label}
            </p>
            <div className={`${
              m.accent && m.accentClass === 'terracotta'
                ? 'text-terracotta-600'
                : 'text-charcoal-400'
            }`}>
              {m.icon}
            </div>
          </div>
          <p className={`text-3xl font-extrabold leading-none mb-1 ${
            m.accent && m.accentClass === 'terracotta'
              ? 'text-terracotta-700'
              : 'text-charcoal-900'
          }`}>
            {m.value}
          </p>
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-charcoal-400">{m.sub}</p>
            {m.onClick && (
              <ArrowRight className="w-3.5 h-3.5 text-charcoal-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
