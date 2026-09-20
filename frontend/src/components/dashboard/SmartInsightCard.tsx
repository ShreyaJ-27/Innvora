import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, AlertTriangle } from 'lucide-react';

export interface SmartInsightCardProps {
  criticalCount: number;
  reorderSoonCount: number;
}

export const SmartInsightCard: React.FC<SmartInsightCardProps> = ({
  criticalCount,
  reorderSoonCount,
}) => {
  const total = criticalCount + reorderSoonCount;

  if (total === 0) {
    return (
      <div className="rounded-xl border border-olive-200 bg-olive-50 px-5 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-olive-500" />
          <p className="text-sm font-medium text-olive-800">
            All {total === 0 ? 'inventory' : `${total} SKUs`} operating within healthy thresholds. No replenishment action required.
          </p>
        </div>
        <Link
          to="/reorders"
          className="text-xs font-semibold text-olive-700 hover:text-olive-900 inline-flex items-center gap-1 shrink-0"
        >
          View replenishment <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-terracotta-200 bg-terracotta-50 px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-start gap-3">
        <div className="p-1.5 bg-terracotta-100 border border-terracotta-300 rounded-lg text-terracotta-700 shrink-0 mt-0.5">
          <AlertTriangle className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-terracotta-600">
              Replenishment Alert
            </span>
            {criticalCount > 0 && (
              <span className="text-[10px] font-bold bg-terracotta-100 text-terracotta-800 border border-terracotta-300 px-1.5 py-0.5 rounded uppercase tracking-wider">
                {criticalCount} Critical
              </span>
            )}
          </div>
          <p className="text-sm font-semibold text-terracotta-900">
            {total} SKU{total !== 1 ? 's' : ''} are projected to fall below safety stock or reorder threshold within the next 5 days.
          </p>
          <p className="text-xs text-terracotta-600/80 mt-0.5">
            Review replenishment recommendations and initiate purchase orders.
          </p>
        </div>
      </div>

      <div className="shrink-0">
        <Link to="/reorders">
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-charcoal-900 text-sand-100 text-xs font-semibold rounded-lg hover:bg-charcoal-800 transition-colors">
            Review Recommendations
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </Link>
      </div>
    </div>
  );
};
