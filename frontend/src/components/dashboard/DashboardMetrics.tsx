import React from 'react';
import { Package, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { MetricCard } from '../common/MetricCard';
import { InventoryHealthSummary } from '../../types/inventory';
import { formatNumber } from '../../utils/formatters';

export interface DashboardMetricsProps {
  summary: InventoryHealthSummary | null;
  isLoading: boolean;
  onNavigateToReorders?: () => void;
}

export const DashboardMetrics: React.FC<DashboardMetricsProps> = ({
  summary,
  isLoading,
  onNavigateToReorders,
}) => {
  if (isLoading || !summary) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse">
            <div className="h-3 w-20 bg-slate-200 rounded mb-3" />
            <div className="h-7 w-28 bg-slate-200 rounded mb-2" />
            <div className="h-3 w-36 bg-slate-100 rounded" />
          </div>
        ))}
      </div>
    );
  }

  const itemsNeedingReorder = summary.itemsNeedingReorder ?? (summary.criticalCount + summary.reorderSoonCount);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total SKUs */}
      <MetricCard
        title="Total SKUs"
        value={formatNumber(summary.totalSkus)}
        icon={<Package className="w-5 h-5" />}
        supportingText="Active catalog items tracked"
        accentColor="blue"
      />

      {/* 2. Healthy Items */}
      <MetricCard
        title="Healthy"
        value={formatNumber(summary.healthyCount)}
        icon={<CheckCircle2 className="w-5 h-5" />}
        supportingText="SKUs at safe stock levels"
        trend={
          summary.totalSkus > 0
            ? {
                value: `${Math.round((summary.healthyCount / summary.totalSkus) * 100)}% of catalog`,
                isPositive: true,
              }
            : undefined
        }
        accentColor="emerald"
      />

      {/* 3. Reorder Soon */}
      <MetricCard
        title="Reorder Soon"
        value={formatNumber(summary.reorderSoonCount)}
        icon={<Clock className="w-5 h-5" />}
        supportingText="Approaching reorder point"
        trend={
          summary.reorderSoonCount > 0
            ? { value: 'Monitor closely', isNeutral: true }
            : { value: 'None pending', isPositive: true }
        }
        accentColor="amber"
      />

      {/* 4. Items Needing Reorder (Critical + Reorder Soon) */}
      <MetricCard
        title="Needing Reorder"
        value={formatNumber(itemsNeedingReorder)}
        icon={<AlertTriangle className="w-5 h-5" />}
        supportingText={`${summary.criticalCount} Critical · ${summary.reorderSoonCount} Reorder Soon`}
        trend={{
          value: itemsNeedingReorder > 0 ? 'Action Required' : 'All Stock Healthy',
          isPositive: itemsNeedingReorder === 0,
        }}
        accentColor={itemsNeedingReorder > 0 ? 'rose' : 'emerald'}
        onClick={onNavigateToReorders}
      />
    </div>
  );
};
