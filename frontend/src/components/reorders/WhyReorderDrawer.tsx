import React from 'react';
import {
  ArrowDown,
  Sparkles,
  Info,
  Check,
  ShieldCheck,
  Building,
  Clock,
  Send,
} from 'lucide-react';
import { Drawer } from '../common/Drawer';
import { Button } from '../common/Button';
import { StatusBadge } from '../common/StatusBadge';
import { ReorderRecommendation } from '../../types/reorder';
import { formatCurrency } from '../../utils/formatters';

export interface WhyReorderDrawerProps {
  recommendation: ReorderRecommendation | null;
  isOpen: boolean;
  onClose: () => void;
  onApproveOrder?: (rec: ReorderRecommendation) => void;
}

export const WhyReorderDrawer: React.FC<WhyReorderDrawerProps> = ({
  recommendation,
  isOpen,
  onClose,
  onApproveOrder,
}) => {
  if (!recommendation) return null;

  const { explanation } = recommendation;

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Why Reorder This Item?"
      subtitle={`${recommendation.productName} (${recommendation.sku})`}
      width="lg"
    >
      <div className="space-y-6">
        {/* Prominent Authoritative Backend Explanation */}
        <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50/70 border border-blue-200 rounded-xl space-y-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-600 text-white rounded-md">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-blue-950 uppercase tracking-wider">
              StockPulse Smart Reasoning Engine
            </span>
          </div>
          <p className="text-sm font-medium text-slate-800 leading-relaxed pt-1">
            "{explanation.reason}"
          </p>
          <div className="text-[11px] text-blue-700/80 font-medium pt-1">
            Authoritative calculation generated server-side by StockPulse Replenishment Service.
          </div>
        </div>

        {/* 6 Key Baseline Metrics Grid */}
        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Replenishment Model Inputs
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-white border border-slate-200 rounded-xl">
              <div className="text-slate-500">Available Stock</div>
              <div
                className={`text-lg font-bold mt-0.5 ${
                  recommendation.urgency === 'CRITICAL' ? 'text-rose-600' : 'text-slate-900'
                }`}
              >
                {explanation.currentStock} units
              </div>
              <div className="text-[10px] text-slate-400">~{explanation.stockCoverageDays}d coverage</div>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-xl">
              <div className="text-slate-500">Daily Demand Velocity</div>
              <div className="text-lg font-bold text-slate-900 mt-0.5">
                {explanation.dailyDemand} units/day
              </div>
              <div className="text-[10px] text-slate-400">Moving 14-day average</div>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-xl">
              <div className="text-slate-500">Supplier Lead Time</div>
              <div className="text-lg font-bold text-slate-900 mt-0.5">
                {explanation.leadTimeDays} days
              </div>
              <div className="text-[10px] text-slate-400">{recommendation.supplierName}</div>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-xl">
              <div className="text-slate-500">Lead-Time Demand</div>
              <div className="text-lg font-bold text-amber-600 mt-0.5">
                {explanation.leadTimeDemand} units
              </div>
              <div className="text-[10px] text-slate-400">Units sold during transit</div>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-xl">
              <div className="text-slate-500">Safety Buffer</div>
              <div className="text-lg font-bold text-slate-900 mt-0.5">
                {explanation.safetyStock} units
              </div>
              <div className="text-[10px] text-slate-400">Volatilty protection</div>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-xl">
              <div className="text-slate-500">Reorder Point (ROP)</div>
              <div className="text-lg font-bold text-slate-900 mt-0.5">
                {explanation.reorderPoint} units
              </div>
              <div className="text-[10px] text-slate-400">ROP = Transit + Safety</div>
            </div>
          </div>
        </div>

        {/* Visual Pipeline Flow */}
        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Replenishment Logic Pipeline
          </h4>
          <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 space-y-2">
            {/* Step 1 */}
            <div className="flex items-center gap-3 p-2.5 bg-white rounded-lg border border-slate-200">
              <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                1
              </div>
              <div className="flex-1">
                <span className="font-semibold text-slate-900 text-xs">Current Stock</span>
                <p className="text-[11px] text-slate-500">
                  {explanation.currentStock} units ready on shelf at {recommendation.locationName}.
                </p>
              </div>
              <span className="text-xs font-bold font-mono text-slate-800">
                {explanation.currentStock}
              </span>
            </div>

            <div className="flex justify-center text-slate-400">
              <ArrowDown className="w-4 h-4" />
            </div>

            {/* Step 2 */}
            <div className="flex items-center gap-3 p-2.5 bg-white rounded-lg border border-slate-200">
              <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                2
              </div>
              <div className="flex-1">
                <span className="font-semibold text-slate-900 text-xs">Daily Demand Velocity</span>
                <p className="text-[11px] text-slate-500">
                  Customer run rate is {explanation.dailyDemand} units per day.
                </p>
              </div>
              <span className="text-xs font-bold font-mono text-slate-800">
                × {explanation.dailyDemand}/d
              </span>
            </div>

            <div className="flex justify-center text-slate-400">
              <ArrowDown className="w-4 h-4" />
            </div>

            {/* Step 3 */}
            <div className="flex items-center gap-3 p-2.5 bg-white rounded-lg border border-slate-200">
              <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                3
              </div>
              <div className="flex-1">
                <span className="font-semibold text-slate-900 text-xs">Lead-Time Demand</span>
                <p className="text-[11px] text-slate-500">
                  {explanation.dailyDemand} units × {explanation.leadTimeDays} days transit = {explanation.leadTimeDemand} units needed while waiting.
                </p>
              </div>
              <span className="text-xs font-bold font-mono text-amber-600">
                {explanation.leadTimeDemand}
              </span>
            </div>

            <div className="flex justify-center text-slate-400">
              <ArrowDown className="w-4 h-4" />
            </div>

            {/* Step 4 */}
            <div className="flex items-center gap-3 p-2.5 bg-white rounded-lg border border-slate-200">
              <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                4
              </div>
              <div className="flex-1">
                <span className="font-semibold text-slate-900 text-xs">Safety Stock Buffer</span>
                <p className="text-[11px] text-slate-500">
                  Buffer of {explanation.safetyStock} units prevents stockouts if sales spike or freight is delayed.
                </p>
              </div>
              <span className="text-xs font-bold font-mono text-slate-800">
                + {explanation.safetyStock}
              </span>
            </div>

            <div className="flex justify-center text-slate-400">
              <ArrowDown className="w-4 h-4" />
            </div>

            {/* Step 5 */}
            <div className="flex items-center gap-3 p-2.5 bg-blue-50 rounded-lg border border-blue-200">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                5
              </div>
              <div className="flex-1">
                <span className="font-semibold text-blue-900 text-xs">Reorder Threshold Trigger</span>
                <p className="text-[11px] text-blue-700">
                  Threshold ({explanation.leadTimeDemand} + {explanation.safetyStock} = {explanation.reorderPoint}) is breached by {explanation.reorderPoint - explanation.currentStock} units!
                </p>
              </div>
              <span className="text-xs font-bold font-mono text-blue-700">
                {explanation.reorderPoint}
              </span>
            </div>
          </div>
        </div>

        {/* Recommended Action Card */}
        <div className="p-4 bg-slate-900 text-white rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs uppercase text-slate-400 font-bold tracking-wider">
              Recommended Batch Order
            </span>
            <div className="text-2xl font-black mt-0.5">
              {recommendation.recommendedQuantity} Units
            </div>
            <div className="text-xs text-slate-300">
              Est. Cost: {formatCurrency(recommendation.estimatedCost)} (@ {formatCurrency(recommendation.unitCost)}/unit)
            </div>
          </div>

          <Button
            variant="primary"
            size="md"
            className="bg-blue-600 hover:bg-blue-500 text-white"
            onClick={() => {
              if (onApproveOrder) {
                onApproveOrder(recommendation);
              } else {
                alert(`Purchase Order drafted for ${recommendation.recommendedQuantity} units of ${recommendation.sku}!`);
              }
            }}
            rightIcon={<Send className="w-4 h-4" />}
          >
            Create PO
          </Button>
        </div>
      </div>
    </Drawer>
  );
};
