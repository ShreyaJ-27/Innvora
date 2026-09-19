import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldAlert } from 'lucide-react';
import { Button } from '../common/Button';

export interface SmartInsightCardProps {
  criticalCount: number;
  reorderSoonCount: number;
}

export const SmartInsightCard: React.FC<SmartInsightCardProps> = ({
  criticalCount,
  reorderSoonCount,
}) => {
  const totalNeedingAttention = criticalCount + reorderSoonCount;

  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-5 sm:p-6 shadow-md border border-blue-800/40">
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5 max-w-2xl">
          <div className="p-2.5 bg-blue-500/20 text-blue-300 rounded-lg shrink-0 border border-blue-400/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-300">
                Smart Replenishment Insight
              </span>
              {criticalCount > 0 && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-rose-500/30 text-rose-300 border border-rose-500/40 px-1.5 py-0.5 rounded">
                  <ShieldAlert className="w-3 h-3" /> {criticalCount} Stockout Risk
                </span>
              )}
            </div>
            <p className="mt-1 text-sm sm:text-base font-semibold text-white leading-snug">
              {totalNeedingAttention > 0
                ? `${totalNeedingAttention} SKUs are projected to fall below their safety buffer or reorder threshold within the next 5 days.`
                : 'All SKUs are operating comfortably above safety thresholds with zero stockouts predicted.'}
            </p>
            <p className="mt-1 text-xs text-blue-200/80">
              Demand forecast and supplier lead-time analysis generated authoritative replenishment recommendations.
            </p>
          </div>
        </div>

        <div className="shrink-0 flex items-center">
          <Link to="/reorders">
            <Button
              variant="primary"
              size="md"
              className="bg-white text-blue-950 hover:bg-blue-50 active:bg-blue-100 shadow-md font-semibold text-xs"
              rightIcon={<ArrowRight className="w-4 h-4 text-blue-950" />}
            >
              Review recommendations
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
