import React from 'react';
import { DataTable, Column } from '../common/DataTable';
import { StatusBadge } from '../common/StatusBadge';
import { ProductInventory } from '../../types/inventory';
import { formatDate } from '../../utils/formatters';

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
        <div>
          <div className="font-medium text-charcoal-900 leading-tight">{item.name}</div>
          <div className="text-[10px] text-charcoal-400 mt-0.5 uppercase tracking-wider">{item.category}</div>
        </div>
      ),
    },
    {
      key: 'sku',
      header: 'SKU',
      sortable: true,
      render: (item) => <span className="font-mono text-[10px] text-charcoal-500">{item.sku}</span>,
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
      header: 'Available',
      sortable: true,
      align: 'right',
      render: (item) => (
        <span className={`font-bold font-mono text-sm ${
          item.status === 'CRITICAL'
            ? 'text-terracotta-700'
            : item.status === 'REORDER_SOON'
            ? 'text-terracotta-500'
            : 'text-charcoal-800'
        }`}>
          {item.availableStock}{' '}
          <span className="text-[10px] font-normal text-charcoal-400">/ {item.currentStock}</span>
        </span>
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
    />
  );
};
