import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  Building2,
  Clock,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  Package,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { Drawer } from '../common/Drawer';
import { StatusBadge } from '../common/StatusBadge';
import { Button } from '../common/Button';
import { ProductInventory } from '../../types/inventory';
import { ReorderRecommendation } from '../../types/reorder';
import { formatCurrency, formatPercent, formatDate } from '../../utils/formatters';

export interface ProductDetailsDrawerProps {
  product: ProductInventory | null;
  reorderRecommendation?: ReorderRecommendation | null;
  isOpen: boolean;
  onClose: () => void;
  onWhyReorder?: (rec: ReorderRecommendation) => void;
}

export const ProductDetailsDrawer: React.FC<ProductDetailsDrawerProps> = ({
  product,
  reorderRecommendation,
  isOpen,
  onClose,
  onWhyReorder,
}) => {
  if (!product) return null;

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={product.name}
      subtitle={`SKU: ${product.sku} • Location: ${product.locationName}`}
      width="lg"
    >
      <div className="space-y-6 text-sm">
        {/* Top Status & Category Banner */}
        <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase">Status:</span>
            <StatusBadge status={product.status} />
          </div>
          <div className="text-xs text-slate-500">
            Category: <span className="font-semibold text-slate-800">{product.category}</span>
          </div>
        </div>

        {/* Stock Breakdown Grid */}
        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Inventory Level Breakdown
          </h4>
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-white border border-slate-200 rounded-xl">
              <div className="text-[11px] text-slate-500 font-medium">Current Physical</div>
              <div className="text-xl font-bold text-slate-900 mt-1">{product.currentStock}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Total units on hand</div>
            </div>
            <div className="p-3 bg-white border border-slate-200 rounded-xl">
              <div className="text-[11px] text-slate-500 font-medium">Allocated / Reserved</div>
              <div className="text-xl font-bold text-slate-600 mt-1">{product.reservedStock}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Committed to orders</div>
            </div>
            <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl">
              <div className="text-[11px] text-blue-700 font-semibold">Net Available</div>
              <div className="text-xl font-black text-blue-700 mt-1">{product.availableStock}</div>
              <div className="text-[10px] text-blue-600/80 mt-0.5">Ready for fulfillment</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-3">
            <div className="p-3 bg-white border border-slate-200 rounded-xl">
              <div className="text-[11px] text-slate-500 font-medium">Reorder Point</div>
              <div className="text-base font-bold text-slate-800 mt-1">{product.reorderPoint}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Threshold trigger</div>
            </div>
            <div className="p-3 bg-white border border-slate-200 rounded-xl">
              <div className="text-[11px] text-slate-500 font-medium">Safety Buffer</div>
              <div className="text-base font-bold text-slate-800 mt-1">{product.safetyStock}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Emergency buffer</div>
            </div>
            <div className="p-3 bg-white border border-slate-200 rounded-xl">
              <div className="text-[11px] text-slate-500 font-medium">Days of Stock</div>
              <div
                className={`text-base font-bold mt-1 ${
                  product.daysOfStock < 3 ? 'text-rose-600' : 'text-slate-800'
                }`}
              >
                {product.daysOfStock} days
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">At ~{product.dailyDemand}/day demand</div>
            </div>
          </div>
        </div>

        {/* Smart Reorder Recommendation Section (If applicable) */}
        {reorderRecommendation && (
          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Replenishment Recommendation</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-200 text-amber-800">
                {reorderRecommendation.urgency}
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-amber-950">
                {reorderRecommendation.recommendedQuantity} units
              </span>
              <span className="text-xs text-amber-800">
                (~{formatCurrency(reorderRecommendation.estimatedCost)})
              </span>
            </div>

            <p className="text-xs text-amber-800/90 leading-relaxed">
              {reorderRecommendation.explanation.reason}
            </p>

            {onWhyReorder && (
              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onWhyReorder(reorderRecommendation)}
                  className="bg-white border-amber-300 text-amber-900 hover:bg-amber-100 text-xs"
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  View Step-by-Step Reason ("Why?")
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Inventory History Recharts Graph */}
        {product.history && product.history.length > 0 && (
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              7-Day Stock Depletion History
            </h4>
            <div className="h-44 w-full bg-slate-50/50 p-2 border border-slate-200 rounded-xl">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={product.history}
                  margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      color: '#fff',
                      borderRadius: '8px',
                      fontSize: '11px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="stockLevel"
                    name="Stock Units"
                    stroke="#2563eb"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                  <Line
                    type="step"
                    dataKey="reorderPoint"
                    name="Reorder Point"
                    stroke="#ef4444"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Supplier Information */}
        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Supplier Performance & Lead Time
          </h4>
          <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-slate-500" />
                <span className="font-semibold text-slate-900">{product.supplier.name}</span>
              </div>
              <span className="text-xs text-slate-500">{product.supplier.contactEmail}</span>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100 text-xs">
              <div className="flex items-center gap-1.5 text-slate-600">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Lead Time:</span>
                <span className="font-bold text-slate-800">{product.supplier.leadTimeDays} days</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-600">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                <span>On-Time Rate:</span>
                <span className="font-bold text-emerald-700">
                  {formatPercent(product.supplier.reliabilityRate)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Audit Metadata */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <span>Unit Cost: {formatCurrency(product.unitCost)}</span>
          <span>Last Ingested: {formatDate(product.lastUpdated)}</span>
        </div>
      </div>
    </Drawer>
  );
};
