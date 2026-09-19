import React from 'react';
import {
  ShoppingCart,
  PackageCheck,
  RotateCcw,
  ArrowRightLeft,
  Sliders,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { InventoryEvent, InventoryEventType } from '../../types/events';
import { EVENT_TYPE_CONFIG } from '../../utils/colors';
import { formatDate, formatRelativeTime } from '../../utils/formatters';
import { DataTable, Column } from '../common/DataTable';

export interface ActivityTimelineTableProps {
  events: InventoryEvent[];
  isLoading: boolean;
}

export const ActivityTimelineTable: React.FC<ActivityTimelineTableProps> = ({
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
        return <Clock className="w-3.5 h-3.5" />;
    }
  };

  const columns: Column<InventoryEvent>[] = [
    {
      key: 'eventType',
      header: 'Event Type',
      sortable: true,
      render: (item) => {
        const config = EVENT_TYPE_CONFIG[item.eventType];
        return (
          <div className="flex items-center gap-2">
            <span
              className={`p-1.5 rounded-md border shrink-0 ${config.badgeBg} ${config.badgeBorder} ${config.iconColor}`}
            >
              {getEventIcon(item.eventType)}
            </span>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded border ${config.badgeBg} ${config.badgeBorder} ${config.badgeText}`}
            >
              {config.label}
            </span>
          </div>
        );
      },
    },
    {
      key: 'productName',
      header: 'Product & SKU',
      sortable: true,
      render: (item) => (
        <div>
          <div className="font-semibold text-slate-900 leading-tight">{item.productName}</div>
          <div className="font-mono text-[11px] text-slate-400 mt-0.5">{item.sku}</div>
        </div>
      ),
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
      key: 'quantityChange',
      header: 'Quantity Delta',
      sortable: true,
      align: 'right',
      render: (item) => {
        const isPositive = item.quantityChange > 0;
        return (
          <span
            className={`font-mono font-bold text-xs ${
              isPositive ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {isPositive ? `+${item.quantityChange}` : item.quantityChange}
          </span>
        );
      },
    },
    {
      key: 'stockLevels',
      header: 'Stock Shift',
      align: 'center',
      render: (item) => (
        <div className="flex items-center justify-center gap-1.5 font-mono text-xs text-slate-500">
          <span>{item.previousStock}</span>
          <ArrowRight className="w-3 h-3 text-slate-400" />
          <span className="font-bold text-slate-900">{item.newStock}</span>
        </div>
      ),
    },
    {
      key: 'source',
      header: 'Source / Ingestion',
      sortable: true,
      render: (item) => (
        <div>
          <span className="text-xs text-slate-700">{item.source}</span>
          {item.referenceId && (
            <span className="text-[10px] text-slate-400 font-mono block">
              {item.referenceId}
            </span>
          )}
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
          <div className="text-xs text-slate-800">{formatRelativeTime(item.timestamp)}</div>
          <div className="text-[10px] text-slate-400">{formatDate(item.timestamp)}</div>
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
      pageSize={10}
      emptyTitle="No activity recorded"
      emptyDescription="Try selecting a different location or event type filter."
    />
  );
};
