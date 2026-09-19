import React from 'react';
import { HelpCircle, Sparkles } from 'lucide-react';
import { DataTable, Column } from '../common/DataTable';
import { StatusBadge } from '../common/StatusBadge';
import { Button } from '../common/Button';
import { ReorderRecommendation } from '../../types/reorder';
import { formatCurrency } from '../../utils/formatters';

export interface ReorderTableProps {
  items: ReorderRecommendation[];
  isLoading: boolean;
  onWhyClick: (item: ReorderRecommendation) => void;
}

export const ReorderTable: React.FC<ReorderTableProps> = ({
  items,
  isLoading,
  onWhyClick,
}) => {
  const columns: Column<ReorderRecommendation>[] = [
    {
      key: 'productName',
      header: 'Product',
      sortable: true,
      render: (item) => (
        <div>
          <div className="font-semibold text-slate-900 leading-tight">{item.productName}</div>
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
        <span className="text-xs text-slate-600 truncate max-w-[140px] inline-block">
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
        <span
          className={`font-bold font-mono ${
            item.urgency === 'CRITICAL' ? 'text-rose-600' : 'text-slate-800'
          }`}
        >
          {item.availableStock}
        </span>
      ),
    },
    {
      key: 'dailyDemand',
      header: 'Daily Demand',
      sortable: true,
      align: 'right',
      render: (item) => <span className="text-xs text-slate-600">{item.dailyDemand}/d</span>,
    },
    {
      key: 'leadTimeDays',
      header: 'Lead Time',
      sortable: true,
      align: 'right',
      render: (item) => <span className="text-xs text-slate-600">{item.leadTimeDays}d</span>,
    },
    {
      key: 'reorderPoint',
      header: 'Reorder Point',
      sortable: true,
      align: 'right',
      render: (item) => <span className="text-xs text-slate-600">{item.reorderPoint}</span>,
    },
    {
      key: 'daysRemaining',
      header: 'Days Left',
      sortable: true,
      align: 'right',
      render: (item) => (
        <span
          className={`px-2 py-0.5 rounded text-xs font-semibold ${
            item.daysRemaining < 2
              ? 'bg-rose-100 text-rose-800'
              : item.daysRemaining < 5
              ? 'bg-amber-100 text-amber-800'
              : 'bg-slate-100 text-slate-700'
          }`}
        >
          {item.daysRemaining}d
        </span>
      ),
    },
    {
      key: 'recommendedQuantity',
      header: 'Recommended Qty',
      sortable: true,
      align: 'right',
      render: (item) => (
        <div className="text-right">
          <div className="font-bold text-blue-600">{item.recommendedQuantity} units</div>
          <div className="text-[10px] text-slate-400">{formatCurrency(item.estimatedCost)}</div>
        </div>
      ),
    },
    {
      key: 'urgency',
      header: 'Urgency',
      sortable: true,
      align: 'center',
      render: (item) => <StatusBadge status={item.urgency} size="sm" />,
    },
    {
      key: 'action',
      header: 'Action',
      align: 'center',
      render: (item) => (
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onWhyClick(item);
          }}
          className="border-blue-200 text-blue-700 hover:bg-blue-50 text-xs px-2.5 py-1"
          leftIcon={<HelpCircle className="w-3.5 h-3.5 text-blue-600" />}
        >
          Why?
        </Button>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={items}
      keyExtractor={(item) => item.id}
      isLoading={isLoading}
      onRowClick={onWhyClick}
      pageSize={8}
      emptyTitle="No replenishment recommendations"
      emptyDescription="All inventory is operating above calculated safety buffers."
    />
  );
};
