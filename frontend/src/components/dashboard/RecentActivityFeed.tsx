import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingCart,
  PackageCheck,
  RotateCcw,
  ArrowRightLeft,
  Sliders,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { Card } from '../common/Card';
import { InventoryEvent, InventoryEventType } from '../../types/events';
import { EVENT_TYPE_CONFIG } from '../../utils/colors';
import { formatRelativeTime } from '../../utils/formatters';

export interface RecentActivityFeedProps {
  events: InventoryEvent[];
  isLoading?: boolean;
}

export const RecentActivityFeed: React.FC<RecentActivityFeedProps> = ({
  events,
  isLoading = false,
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

  const displayedEvents = events.slice(0, 6);

  return (
    <Card
      header={
        <div className="flex items-center justify-between w-full">
          <div>
            <h3 className="font-semibold text-sm text-slate-900">Recent Inventory Telemetry</h3>
            <p className="text-xs text-slate-500">Live stream from POS, ERP, and Fulfillment Scanners</p>
          </div>
          <Link
            to="/activity"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 hover:underline"
          >
            <span>Full Ledger</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      }
      noPadding
    >
      <div className="divide-y divide-slate-100">
        {isLoading ? (
          <div className="p-6 text-center text-xs text-slate-400">Loading live telemetry...</div>
        ) : displayedEvents.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500">No recent events recorded.</div>
        ) : (
          displayedEvents.map((evt) => {
            const config = EVENT_TYPE_CONFIG[evt.eventType];
            const isPositive = evt.quantityChange > 0;
            return (
              <div
                key={evt.id}
                className="p-3.5 px-5 hover:bg-slate-50/60 transition-colors flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`p-2 rounded-lg border shrink-0 ${config.badgeBg} ${config.badgeBorder} ${config.iconColor}`}
                  >
                    {getEventIcon(evt.eventType)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 truncate">
                        {evt.productName}
                      </span>
                      <span className="font-mono text-[10px] text-slate-400 shrink-0">
                        {evt.sku}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                      <span className="truncate">{evt.locationName}</span>
                      <span>•</span>
                      <span className="text-slate-400">{evt.source}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div
                    className={`font-bold font-mono text-xs ${
                      isPositive ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {isPositive ? `+${evt.quantityChange}` : evt.quantityChange} units
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {formatRelativeTime(evt.timestamp)}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
};
