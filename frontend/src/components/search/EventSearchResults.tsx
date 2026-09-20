import React from 'react';
import {
  ShoppingCart,
  PackageCheck,
  RotateCcw,
  ArrowRightLeft,
  Sliders,
  ArrowRight,
} from 'lucide-react';
import { DataTable, Column } from '../common/DataTable';
import { InventoryEvent, InventoryEventType } from '../../types/events';
import { EVENT_TYPE_CONFIG } from '../../utils/colors';
import { formatDate, formatRelativeTime } from '../../utils/formatters';

export interface EventSearchResultsProps {
  events: InventoryEvent[];
  isLoading: boolean;
}

export const EventSearchResults: React.FC<EventSearchResultsProps> = ({
  events,
  isLoading,
}) => {
  const getEventIcon = (type: InventoryEventType) => {
    switch (type) {
      case 'SALE':
        return <ShoppingCart className="w-3.5 h-3.5" />;
      case 'RESTOCK':
        return <PackageCheck className="w-3.5 h-3.5" />;
      case 'RETURN':
        return <RotateCcw className="w-3.5 h-3.5" />;
      case 'TRANSFER_IN':
      case 'TRANSFER_OUT':
        return <ArrowRightLeft className="w-3.5 h-3.5" />;
      case 'ADJUSTMENT':
        return <Sliders className="w-3.5 h-3.5" />;
      default:
        return null;
    }
  };

  const columns: Column<InventoryEvent>[] = [
    {
      key: 'productName',
      header: 'Product / SKU',
      sortable: true,
      render: (item) => (
        <div>
          <div className="font-medium text-charcoal-900 leading-tight">{item.productName}</div>
          <div className="font-mono text-xs text-charcoal-400 mt-0.5">{item.sku}</div>
        </div>
      ),
    },
    {
      key: 'locationName',
      header: 'Location',
      sortable: true,
      render: (item) => (
        <span className="text-xs text-charcoal-600 truncate max-w-[150px] inline-block">
          {item.locationName}
        </span>
      ),
    },
    {
      key: 'eventType',
      header: 'Event',
      sortable: true,
      render: (item) => {
        const config = EVENT_TYPE_CONFIG[item.eventType];
        return (
          <span
            className={`inline-flex items-center gap-1.5 font-semibold rounded-md border text-xs px-2.5 py-1 ${config.badgeBg} ${config.badgeText} ${config.badgeBorder}`}
          >
            {getEventIcon(item.eventType)}
            {config.label}
          </span>
        );
      },
    },
    {
      key: 'quantityChange',
      header: 'Qty Change',
      sortable: true,
      align: 'right',
      render: (item) => {
        const isPositive = item.quantityChange > 0;
        return (
          <span
            className={`font-mono font-bold text-sm ${
              isPositive ? 'text-olive-600' : 'text-terracotta-600'
            }`}
          >
            {isPositive ? `+${item.quantityChange}` : item.quantityChange}
          </span>
        );
      },
    },
    {
      key: 'stockShift',
      header: 'Stock Shift',
      align: 'center',
      render: (item) => (
        <div className="flex items-center justify-center gap-1.5 font-mono text-xs text-charcoal-400">
          <span>{item.previousStock}</span>
          <ArrowRight className="w-3 h-3 text-charcoal-300" />
          <span className="font-bold text-charcoal-900">{item.newStock}</span>
        </div>
      ),
    },
    {
      key: 'timestamp',
      header: 'Timestamp',
      sortable: true,
      align: 'right',
      render: (item) => (
        <div className="text-right">
          <div className="text-xs text-charcoal-700">{formatRelativeTime(item.timestamp)}</div>
          <div className="text-[10px] text-charcoal-400">{formatDate(item.timestamp)}</div>
        </div>
      ),
    },
    {
      key: 'source',
      header: 'Source',
      sortable: true,
      render: (item) => (
        <div>
          <span className="text-xs text-charcoal-700">{item.source}</span>
          {item.referenceId && (
            <span className="text-[10px] text-charcoal-400 font-mono block">
              {item.referenceId}
            </span>
          )}
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={events}
      keyExtractor={(item) => item.id}
      isLoading={isLoading}
      pageSize={8}
      emptyTitle="No historical events found"
      emptyDescription="No indexed OpenSearch logs match your query parameters. Try widening your criteria."
    />
  );
};
