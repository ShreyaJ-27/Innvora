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
    .slice(0, 5);

  const getRecommendedQty = (sku: string) => {
    const reorder = reorders.find((r) => r.sku === sku);
    return reorder ? `${reorder.recommendedQuantity} units` : 'Calculating...';
  };

  return (
    <Card
      header={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-rose-50 rounded text-rose-600">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-slate-900">Needs Immediate Attention</h3>
              <p className="text-xs text-slate-500">Critical & Reorder-Soon items requiring PO release</p>
            </div>
          </div>
          <Link
            to="/reorders"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 hover:underline"
          >
            <span>View all reorders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      }
      noPadding
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <th className="py-2.5 px-4">Product</th>
              <th className="py-2.5 px-4">SKU</th>
              <th className="py-2.5 px-4">Location</th>
              <th className="py-2.5 px-4 text-right">Available Stock</th>
              <th className="py-2.5 px-4 text-right">Reorder Point</th>
              <th className="py-2.5 px-4 text-right">Days Left</th>
              <th className="py-2.5 px-4 text-right">Recommended</th>
              <th className="py-2.5 px-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400">
                  Loading critical SKUs...
                </td>
              </tr>
            ) : urgentItems.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-500 font-medium">
                  All inventory healthy. No SKUs currently breach reorder thresholds!
                </td>
              </tr>
            ) : (
              urgentItems.map((item) => (
                <tr
                  key={item.id}
                  className={`hover:bg-slate-50 transition-colors ${
                    item.status === 'CRITICAL' ? 'bg-rose-50/20' : ''
                  }`}
                >
                  <td className="py-3 px-4 font-semibold text-slate-900 max-w-xs truncate">
                    {item.name}
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{item.sku}</td>
                  <td className="py-3 px-4 text-slate-600 truncate max-w-[140px]">
                    {item.locationName}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900">
                    <span
                      className={
                        item.status === 'CRITICAL' ? 'text-rose-600 font-extrabold' : 'text-slate-800'
                      }
                    >
                      {item.availableStock}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-slate-600">
                    {item.reorderPoint}
                  </td>
                  <td className="py-3 px-4 text-right font-semibold">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[11px] ${
                        item.daysOfStock < 2
                          ? 'bg-rose-100 text-rose-800 font-bold'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {item.daysOfStock}d
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-blue-600">
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
