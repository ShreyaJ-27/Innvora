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
          <div className="font-semibold text-slate-900 leading-tight">{item.name}</div>
          <div className="text-xs text-slate-400 mt-0.5">{item.category}</div>
        </div>
      ),
    },
    {
      key: 'sku',
      header: 'SKU',
      sortable: true,
      render: (item) => <span className="font-mono text-xs text-slate-600">{item.sku}</span>,
    },
    {
      key: 'locationName',
      header: 'Location',
      sortable: true,
      render: (item) => (
        <span className="text-xs text-slate-600 truncate max-w-[150px] inline-block">
          {item.locationName}
        </span>
      ),
    },
    {
      key: 'availableStock',
      header: 'Available Stock',
      sortable: true,
      align: 'right',
      render: (item) => (
        <span
          className={`font-bold font-mono ${
            item.status === 'CRITICAL'
              ? 'text-rose-600'
              : item.status === 'REORDER_SOON'
              ? 'text-amber-700'
              : 'text-slate-800'
          }`}
        >
          {item.availableStock}{' '}
          <span className="text-[10px] font-normal text-slate-400">/ {item.currentStock}</span>
        </span>
      ),
    },
    {
      key: 'reorderPoint',
      header: 'Reorder Point',
      sortable: true,
      align: 'right',
      render: (item) => <span className="text-xs text-slate-600">{item.reorderPoint}</span>,
    },
    {
      key: 'daysOfStock',
      header: 'Days of Stock',
      sortable: true,
      align: 'right',
      render: (item) => (
        <span
          className={`px-2 py-0.5 rounded text-xs font-semibold ${
            item.daysOfStock < 2
              ? 'bg-rose-100 text-rose-800'
              : item.daysOfStock < 5
              ? 'bg-amber-100 text-amber-800'
              : 'bg-slate-100 text-slate-700'
          }`}
        >
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
      header: 'Last Updated',
      sortable: true,
      align: 'right',
      render: (item) => (
        <span className="text-xs text-slate-400">{formatDate(item.lastUpdated)}</span>
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
      pageSize={8}
      emptyTitle="No inventory matches found"
      emptyDescription="Try adjusting your search query, location selection, or health status filter."
    />
  );
};
