import React from 'react';
import { AlertCircle, Clock, PackageCheck, DollarSign } from 'lucide-react';
import { MetricCard } from '../common/MetricCard';
import { ReorderSummary } from '../../types/reorder';
import { formatCurrency, formatNumber } from '../../utils/formatters';

export interface ReorderSummaryCardsProps {
  summary: ReorderSummary;
  isLoading?: boolean;
}

export const ReorderSummaryCards: React.FC<ReorderSummaryCardsProps> = ({
  summary,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse">
            <div className="h-3 w-20 bg-slate-200 rounded mb-2" />
            <div className="h-7 w-24 bg-slate-200 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Critical Replenishments */}
      <MetricCard
        title="Critical Stockouts"
        value={formatNumber(summary.criticalCount)}
        icon={<AlertCircle className="w-5 h-5" />}
        supportingText="Runout predicted within lead time"
        accentColor="rose"
        trend={{ value: 'Immediate Action', isPositive: false }}
      />

      {/* Reorder Soon */}
      <MetricCard
        title="Reorder Soon"
        value={formatNumber(summary.reorderSoonCount)}
        icon={<Clock className="w-5 h-5" />}
        supportingText="Below reorder threshold"
        accentColor="amber"
        trend={{ value: 'Buffer eroding', isNeutral: true }}
      />

      {/* Recommended Units */}
      <MetricCard
        title="Recommended Units"
        value={formatNumber(summary.recommendedUnits)}
        icon={<PackageCheck className="w-5 h-5" />}
        supportingText="Batch replenishment total"
        accentColor="blue"
      />

      {/* Estimated Reorder Value */}
      <MetricCard
        title="Est. Order Value"
        value={formatCurrency(summary.estimatedTotalValue)}
        icon={<DollarSign className="w-5 h-5" />}
        supportingText="Capital required at wholesale cost"
        accentColor="emerald"
        trend={{ value: 'Working Capital', isPositive: true }}
      />
    </div>
  );
};
