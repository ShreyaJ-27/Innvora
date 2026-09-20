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

const labelClass = 'text-[10px] font-bold uppercase tracking-widest text-charcoal-400 mb-3';

const Metric: React.FC<{ label: string; value: React.ReactNode; sub?: string; accent?: boolean }> = ({
  label, value, sub, accent
}) => (
  <div className={`p-3 rounded-lg border ${accent ? 'bg-terracotta-50 border-terracotta-200' : 'bg-sand-200 border-sand-300'}`}>
    <p className="text-[10px] font-semibold text-charcoal-400 uppercase tracking-wider mb-1">{label}</p>
    <p className={`text-xl font-extrabold leading-none ${accent ? 'text-terracotta-700' : 'text-charcoal-900'}`}>{value}</p>
    {sub && <p className="text-[10px] text-charcoal-400 mt-0.5">{sub}</p>}
  </div>
);

const WarmTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-sand-100 border border-sand-400 rounded-lg px-3 py-2 text-xs" style={{ boxShadow: '0 4px 12px rgba(39,37,34,0.10)' }}>
      <p className="font-semibold text-charcoal-900 mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-charcoal-600">
          <span style={{ color: p.color }}>●</span> {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
};

export const ProductDetailsDrawer: React.FC<ProductDetailsDrawerProps> = ({
  product,
  reorderRecommendation,
  isOpen,
  onClose,
  onWhyReorder,
}) => {
  if (!product) return null;

  const isUrgent = product.status === 'CRITICAL' || product.status === 'REORDER_SOON';

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={product.name}
      subtitle={`${product.sku} · ${product.locationName}`}
      width="lg"
    >
      <div className="space-y-6 text-sm">
        {/* Status Banner */}
        <div className="flex items-center justify-between px-3 py-2.5 bg-sand-200 border border-sand-300 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-charcoal-400">Status</span>
            <StatusBadge status={product.status} />
          </div>
          <span className="text-[10px] uppercase tracking-wider text-charcoal-400 font-medium">
            {product.category}
          </span>
        </div>

        {/* Stock Breakdown */}
        <div>
          <p className={labelClass}>Inventory Levels</p>
          <div className="grid grid-cols-3 gap-2.5">
            <Metric label="Physical Stock" value={product.currentStock} sub="total on hand" />
            <Metric label="Reserved" value={product.reservedStock} sub="committed" />
            <Metric
              label="Net Available"
              value={product.availableStock}
              sub="ready to fulfill"
              accent={isUrgent}
            />
          </div>
          <div className="grid grid-cols-3 gap-2.5 mt-2.5">
            <Metric label="Reorder Point" value={product.reorderPoint} sub="trigger threshold" />
            <Metric label="Safety Buffer" value={product.safetyStock} sub="emergency stock" />
            <Metric
              label="Days of Stock"
              value={`${product.daysOfStock}d`}
              sub={`~${product.dailyDemand}/day`}
              accent={product.daysOfStock < 3}
            />
          </div>
        </div>

        {/* Replenishment Recommendation */}
        {reorderRecommendation && (
          <div className="p-4 rounded-xl bg-terracotta-50 border border-terracotta-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-terracotta-800">
                <Sparkles className="w-4 h-4 text-terracotta-500" />
                <span>Replenishment Recommendation</span>
              </div>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded border bg-terracotta-100 text-terracotta-800 border-terracotta-300 uppercase tracking-wider">
                {reorderRecommendation.urgency.replace('_', ' ')}
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-terracotta-900">
                {reorderRecommendation.recommendedQuantity} units
              </span>
              <span className="text-xs text-terracotta-700">
                (~{formatCurrency(reorderRecommendation.estimatedCost)})
              </span>
            </div>

            <p className="text-xs text-terracotta-800/90 leading-relaxed">
              {reorderRecommendation.explanation.reason}
            </p>

            {onWhyReorder && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onWhyReorder(reorderRecommendation)}
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                className="border-terracotta-300 text-terracotta-800 hover:bg-terracotta-100"
              >
                Why reorder? Step-by-step
              </Button>
            )}
          </div>
        )}

        {/* Stock History Chart */}
        {product.history && product.history.length > 0 && (
          <div>
            <p className={labelClass}>7-Day Stock Trend</p>
            <div className="h-44 w-full bg-sand-200 border border-sand-300 rounded-xl p-3">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={product.history}
                  margin={{ top: 5, right: 5, left: -25, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="2 4" stroke="#D7CABB" vertical={false} />
                  <XAxis dataKey="date" stroke="#A89580" fontSize={10} tickLine={false} />
                  <YAxis stroke="#A89580" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip content={<WarmTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="stockLevel"
                    name="Stock"
                    stroke="#5A5349"
                    strokeWidth={2}
                    dot={{ r: 3, fill: '#5A5349', strokeWidth: 0 }}
                  />
                  <Line
                    type="step"
                    dataKey="reorderPoint"
                    name="Reorder Point"
                    stroke="#C6745A"
                    strokeDasharray="4 3"
                    strokeWidth={1.5}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Supplier Info */}
        <div>
          <p className={labelClass}>Supplier & Lead Time</p>
          <div className="p-4 bg-sand-200 border border-sand-300 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-charcoal-500" />
                <span className="font-medium text-charcoal-900">{product.supplier.name}</span>
              </div>
              <span className="text-[11px] text-charcoal-400">{product.supplier.contactEmail}</span>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-sand-400 text-xs">
              <div className="flex items-center gap-1.5 text-charcoal-600">
                <Clock className="w-3.5 h-3.5 text-charcoal-400" />
                <span>Lead Time:</span>
                <span className="font-bold text-charcoal-800">{product.supplier.leadTimeDays}d</span>
              </div>
              <div className="flex items-center gap-1.5 text-charcoal-600">
                <CheckCircle className="w-3.5 h-3.5 text-olive-500" />
                <span>On-Time:</span>
                <span className="font-bold text-olive-700">{formatPercent(product.supplier.reliabilityRate)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Audit Row */}
        <div className="pt-2 border-t border-sand-300 flex items-center justify-between text-[11px] text-charcoal-400">
          <span>Unit cost: {formatCurrency(product.unitCost)}</span>
          <span>Updated: {formatDate(product.lastUpdated)}</span>
        </div>
      </div>
    </Drawer>
  );
};
