import React from 'react';
import { HelpCircle } from 'lucide-react';
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
          <div className="font-medium text-charcoal-900 leading-tight">{item.productName}</div>
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
        <span className="text-xs text-charcoal-600 truncate max-w-[120px] inline-block">
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
          item.urgency === 'CRITICAL' ? 'text-terracotta-700' : 'text-charcoal-800'
        }`}>
          {item.availableStock}
        </span>
      ),
    },
    {
      key: 'dailyDemand',
      header: 'Demand/d',
      sortable: true,
      align: 'right',
      render: (item) => <span className="text-xs text-charcoal-500">{item.dailyDemand}</span>,
    },
    {
      key: 'leadTimeDays',
      header: 'Lead Time',
      sortable: true,
      align: 'right',
      render: (item) => <span className="text-xs text-charcoal-500">{item.leadTimeDays}d</span>,
    },
    {
      key: 'daysRemaining',
      header: 'Days Left',
      sortable: true,
      align: 'right',
      render: (item) => (
        <span className={`text-[11px] px-1.5 py-0.5 rounded border font-semibold ${
          item.daysRemaining < 2
            ? 'bg-terracotta-100 text-terracotta-800 border-terracotta-300'
            : item.daysRemaining < 5
            ? 'bg-terracotta-50 text-terracotta-700 border-terracotta-200'
            : 'bg-sand-200 text-charcoal-600 border-sand-400'
        }`}>
          {item.daysRemaining}d
        </span>
      ),
    },
    {
      key: 'recommendedQuantity',
      header: 'Reorder Qty',
      sortable: true,
      align: 'right',
      render: (item) => (
        <div className="text-right">
          <div className="font-bold text-charcoal-900">{item.recommendedQuantity} units</div>
          <div className="text-[10px] text-charcoal-400">{formatCurrency(item.estimatedCost)}</div>
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
      header: '',
      align: 'center',
      render: (item) => (
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onWhyClick(item);
          }}
          leftIcon={<HelpCircle className="w-3.5 h-3.5" />}
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
      pageSize={10}
      emptyTitle="No replenishment recommendations"
      emptyDescription="All inventory is operating above calculated safety buffers."
    />
  );
};
