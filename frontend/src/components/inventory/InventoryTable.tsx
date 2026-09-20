import React from 'react';
import { DataTable, Column } from '../common/DataTable';
import { StatusBadge } from '../common/StatusBadge';
import { ProductInventory } from '../../types/inventory';
import { formatDate } from '../../utils/formatters';
import { ArrowRight, Eye, MoreHorizontal } from 'lucide-react';

export interface InventoryTableProps {
  items: ProductInventory[];
  isLoading: boolean;
  onSelectProduct: (product: ProductInventory) => void;
}

export const InventoryTable: React.FC<InventoryTableProps> = ({
  items,
  isLoading,
  onSelectProduct,
}) => {
  const columns: Column<ProductInventory>[] = [
    {
      key: 'name',
      header: 'Product',
      sortable: true,
      render: (item) => (
        <div className="min-w-[210px]">
          <div className="font-bold text-charcoal-900 leading-tight">{item.name}</div>
          <div className="mt-1 flex items-center gap-2">
            <span className="font-mono text-[10px] text-charcoal-500">{item.sku}</span>
            <span className="h-1 w-1 rounded-full bg-sand-500" />
            <span className="text-[10px] text-charcoal-400 uppercase tracking-wider">{item.category}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'sku',
      header: 'Stock Coverage',
      sortable: false,
      render: (item) => {
        const threshold = item.reorderPoint + item.safetyStock;
        const coverage = Math.min(100, Math.max(4, (item.availableStock / Math.max(threshold, 1)) * 100));
        return (
          <div className="min-w-[150px]">
            <div className="mb-1 flex items-center justify-between text-[10px] text-charcoal-500">
              <span>{item.availableStock} available</span>
              <span>ROP {item.reorderPoint}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-sm bg-sand-300">
              <div
                className={`ops-progress h-full ${item.status === 'CRITICAL' ? 'bg-terracotta-700' : item.status === 'REORDER_SOON' ? 'bg-terracotta-500' : item.status === 'OVERSTOCKED' ? 'bg-charcoal-500' : 'bg-olive-500'}`}
                style={{ width: `${coverage}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      key: 'locationName',
      header: 'Hub',
      sortable: true,
      render: (item) => (
        <span className="text-xs text-charcoal-600 truncate max-w-[140px] inline-block">
          {item.locationName}
        </span>
      ),
    },
    {
      key: 'availableStock',
      header: 'On Hand',
      sortable: true,
      align: 'right',
      render: (item) => (
        <div className="font-mono">
          <span className={`font-black text-sm ${item.status === 'CRITICAL' ? 'text-terracotta-700' : item.status === 'REORDER_SOON' ? 'text-terracotta-500' : 'text-charcoal-800'}`}>{item.currentStock}</span>
          <div className="text-[10px] text-charcoal-400">{item.reservedStock} reserved</div>
        </div>
      ),
    },
    {
      key: 'reorderPoint',
      header: 'Reorder Point',
      sortable: true,
      align: 'right',
      render: (item) => <span className="text-xs text-charcoal-500">{item.reorderPoint}</span>,
    },
    {
      key: 'daysOfStock',
      header: 'Days Left',
      sortable: true,
      align: 'right',
      render: (item) => (
        <span className={`text-[11px] px-1.5 py-0.5 rounded border font-semibold ${
          item.daysOfStock < 2
            ? 'bg-terracotta-100 text-terracotta-800 border-terracotta-300'
            : item.daysOfStock < 5
            ? 'bg-terracotta-50 text-terracotta-700 border-terracotta-200'
            : 'bg-sand-200 text-charcoal-600 border-sand-400'
        }`}>
          {item.daysOfStock}d
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      align: 'center',
      render: (item) => <StatusBadge status={item.status} size="sm" />,
    },
    {
      key: 'lastUpdated',
      header: 'Updated',
      sortable: true,
      align: 'right',
      render: (item) => (
        <span className="text-[10px] text-charcoal-400">{formatDate(item.lastUpdated)}</span>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: () => (
        <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-sand-400 bg-sand-50 text-charcoal-600"><Eye className="h-3.5 w-3.5" /></span>
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-sand-400 bg-sand-50 text-charcoal-600"><MoreHorizontal className="h-3.5 w-3.5" /></span>
          <ArrowRight className="h-3.5 w-3.5 text-charcoal-400" />
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={items}
      keyExtractor={(item) => item.id}
      isLoading={isLoading}
      onRowClick={onSelectProduct}
      pageSize={10}
      emptyTitle="No inventory items yet"
      emptyDescription="Stock data will appear here once inventory events are processed."
      className="inventory-control-table"
    />
  );
};
