import React from 'react';
import { AlertCircle, Clock, PackageCheck, IndianRupee } from 'lucide-react';
import { ReorderSummary } from '../../types/reorder';
import { formatCurrency, formatNumber } from '../../utils/formatters';

export interface ReorderSummaryCardsProps {
  summary: ReorderSummary;
  isLoading?: boolean;
}

interface SummaryCardProps {
  label: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
  accent?: 'terracotta' | 'amber' | 'neutral' | 'charcoal';
}

const SummaryCard: React.FC<SummaryCardProps> = ({ label, value, sub, icon, accent = 'neutral' }) => {
  const accentMap = {
    terracotta: {
      bg: 'bg-terracotta-50',
      border: 'border-terracotta-200',
      iconBg: 'bg-terracotta-100 text-terracotta-700',
      value: 'text-terracotta-800',
    },
    amber: {
      bg: 'bg-sand-200',
      border: 'border-sand-400',
      iconBg: 'bg-terracotta-50 text-terracotta-500',
      value: 'text-terracotta-600',
    },
    neutral: {
      bg: 'bg-sand-100',
      border: 'border-sand-400',
      iconBg: 'bg-sand-300 text-charcoal-600',
      value: 'text-charcoal-900',
    },
    charcoal: {
      bg: 'bg-sand-100',
      border: 'border-sand-400',
      iconBg: 'bg-charcoal-800 text-sand-200',
      value: 'text-charcoal-900',
    },
  };
  const a = accentMap[accent];

  return (
    <div className={`${a.bg} border ${a.border} rounded-xl p-5`} style={{ boxShadow: '0 1px 3px rgba(39,37,34,0.06)' }}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-charcoal-400">{label}</p>
        <div className={`p-1.5 rounded-lg ${a.iconBg}`}>{icon}</div>
      </div>
      <p className={`text-3xl font-extrabold leading-none mb-1 ${a.value}`}>{value}</p>
      <p className="text-[11px] text-charcoal-400">{sub}</p>
    </div>
  );
};

export const ReorderSummaryCards: React.FC<ReorderSummaryCardsProps> = ({
  summary,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-sand-100 border border-sand-400 rounded-xl p-5 animate-pulse">
            <div className="h-3 w-20 bg-sand-300 rounded mb-3" />
            <div className="h-8 w-24 bg-sand-300 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <SummaryCard
        label="Critical Stockouts"
        value={formatNumber(summary.criticalCount)}
        sub="Runout within lead time"
        icon={<AlertCircle className="w-4 h-4" />}
        accent={summary.criticalCount > 0 ? 'terracotta' : 'neutral'}
      />
      <SummaryCard
        label="Reorder Soon"
        value={formatNumber(summary.reorderSoonCount)}
        sub="Below reorder threshold"
        icon={<Clock className="w-4 h-4" />}
        accent={summary.reorderSoonCount > 0 ? 'amber' : 'neutral'}
      />
      <SummaryCard
        label="Recommended Units"
        value={formatNumber(summary.recommendedUnits)}
        sub="Batch replenishment total"
        icon={<PackageCheck className="w-4 h-4" />}
        accent="neutral"
      />
      <SummaryCard
        label="Est. Order Value"
        value={formatCurrency(summary.estimatedTotalValue)}
        sub="Capital required at cost"
        icon={<IndianRupee className="w-4 h-4" />}
        accent="charcoal"
      />
    </div>
  );
};
