import React from 'react';
import { Package, Layers, DollarSign, AlertTriangle } from 'lucide-react';
import { MetricCard } from '../common/MetricCard';
import { InventoryHealthSummary } from '../../types/inventory';
import { formatCurrency, formatNumber } from '../../utils/formatters';

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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total SKUs */}
      <MetricCard
        title="Total SKUs"
        value={formatNumber(summary.totalSkus)}
        icon={<Package className="w-5 h-5" />}
        supportingText="Active catalog items"
        trend={{ value: '+4 this month', isPositive: true }}
        accentColor="blue"
      />

      {/* 2. Total Inventory Units */}
      <MetricCard
        title="Total Units"
        value={formatNumber(summary.totalUnits)}
        icon={<Layers className="w-5 h-5" />}
        supportingText="In-stock physical units"
        trend={{ value: '-2.4% vs last week', isNeutral: true }}
        accentColor="indigo"
      />

      {/* 3. Inventory Value */}
      <MetricCard
        title="Inventory Value"
        value={formatCurrency(summary.totalValue)}
        icon={<DollarSign className="w-5 h-5" />}
        supportingText="Valuation at cost"
        trend={{ value: '+5.1% YoY', isPositive: true }}
        accentColor="emerald"
      />

      {/* 4. Items Needing Reorder */}
      <MetricCard
        title="Needing Reorder"
        value={formatNumber(summary.itemsNeedingReorder)}
        icon={<AlertTriangle className="w-5 h-5" />}
        supportingText={`${summary.criticalCount} Critical, ${summary.reorderSoonCount} Reorder Soon`}
        trend={{
          value: summary.itemsNeedingReorder > 0 ? 'Action Required' : 'All Stock Healthy',
          isPositive: summary.itemsNeedingReorder === 0,
        }}
        accentColor={summary.itemsNeedingReorder > 0 ? 'rose' : 'emerald'}
        onClick={onNavigateToReorders}
      />
    </div>
  );
};
