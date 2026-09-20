import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowRight } from 'lucide-react';
import { Card } from '../common/Card';
import { StatusBadge } from '../common/StatusBadge';
import { ProductInventory } from '../../types/inventory';
import { ReorderRecommendation } from '../../types/reorder';

export interface NeedsAttentionTableProps {
  items: ProductInventory[];
  reorders: ReorderRecommendation[];
  isLoading?: boolean;
}

export const NeedsAttentionTable: React.FC<NeedsAttentionTableProps> = ({
  items,
  reorders,
  isLoading = false,
}) => {
  const urgentItems = items
    .filter((i) => i.status === 'CRITICAL' || i.status === 'REORDER_SOON')
    .slice(0, 6);

  const getRecommendedQty = (sku: string) => {
    const reorder = reorders.find((r) => r.sku === sku);
    return reorder ? `${reorder.recommendedQuantity} units` : '—';
  };

  return (
    <Card
      header={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-terracotta-50 border border-terracotta-200 rounded text-terracotta-600">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-charcoal-900">Needs Attention</h3>
              <p className="text-[11px] text-charcoal-400">Critical and reorder-soon items</p>
            </div>
          </div>
          <Link
            to="/reorders"
            className="text-xs font-medium text-charcoal-600 hover:text-charcoal-900 inline-flex items-center gap-1 transition-colors"
          >
            View replenishment
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      }
      noPadding
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-sand-300 text-charcoal-400 font-bold uppercase tracking-widest" style={{ backgroundColor: '#EDE5D8' }}>
              <th className="py-2.5 px-4 text-[10px]">Product</th>
              <th className="py-2.5 px-4 text-[10px]">SKU</th>
              <th className="py-2.5 px-4 text-[10px] hidden md:table-cell">Location</th>
              <th className="py-2.5 px-4 text-[10px] text-right">Available</th>
              <th className="py-2.5 px-4 text-[10px] text-right hidden sm:table-cell">Days Left</th>
              <th className="py-2.5 px-4 text-[10px] text-right hidden lg:table-cell">Reorder Qty</th>
              <th className="py-2.5 px-4 text-[10px] text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sand-200 text-charcoal-700">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="py-10 text-center text-charcoal-400 text-xs">
                  Loading inventory data…
                </td>
              </tr>
            ) : urgentItems.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-10 text-center text-charcoal-500 text-xs">
                  All inventory within healthy thresholds. No immediate action needed.
                </td>
              </tr>
            ) : (
              urgentItems.map((item) => (
                <tr
                  key={item.id}
                  className={`transition-colors hover:bg-sand-200 ${
                    item.status === 'CRITICAL' ? 'bg-terracotta-50/40' : ''
                  }`}
                >
                  <td className="py-3 px-4 font-medium text-charcoal-900 max-w-[200px] truncate">
                    {item.name}
                  </td>
                  <td className="py-3 px-4 font-mono text-[10px] text-charcoal-500">{item.sku}</td>
                  <td className="py-3 px-4 text-charcoal-500 hidden md:table-cell truncate max-w-[120px]">
                    {item.locationName}
                  </td>
                  <td className="py-3 px-4 text-right font-bold">
                    <span className={item.status === 'CRITICAL' ? 'text-terracotta-700' : 'text-charcoal-800'}>
                      {item.availableStock}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right hidden sm:table-cell">
                    <span className={`text-[11px] px-1.5 py-0.5 rounded border ${
                      item.daysOfStock < 2
                        ? 'bg-terracotta-100 text-terracotta-800 border-terracotta-300 font-bold'
                        : 'bg-sand-200 text-charcoal-600 border-sand-400'
                    }`}>
                      {item.daysOfStock}d
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-charcoal-600 font-medium hidden lg:table-cell">
                    {getRecommendedQty(item.sku)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <StatusBadge status={item.status} size="sm" />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
