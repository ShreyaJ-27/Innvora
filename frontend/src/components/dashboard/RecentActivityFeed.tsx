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
      case 'SALE': return <ShoppingCart className="w-3.5 h-3.5" />;
      case 'RESTOCK': return <PackageCheck className="w-3.5 h-3.5" />;
      case 'RETURN': return <RotateCcw className="w-3.5 h-3.5" />;
      case 'TRANSFER_IN':
      case 'TRANSFER_OUT': return <ArrowRightLeft className="w-3.5 h-3.5" />;
      case 'ADJUSTMENT': return <Sliders className="w-3.5 h-3.5" />;
      default: return <Clock className="w-3.5 h-3.5" />;
    }
  };

  const displayedEvents = events.slice(0, 6);

  return (
    <Card
      header={
        <div className="flex items-center justify-between w-full">
          <div>
            <h3 className="text-sm font-semibold text-charcoal-900">Recent Activity</h3>
            <p className="text-[11px] text-charcoal-400">Live inventory event stream</p>
          </div>
          <Link
            to="/activity"
            className="text-xs font-medium text-charcoal-600 hover:text-charcoal-900 inline-flex items-center gap-1 transition-colors"
          >
            Full history
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      }
      noPadding
    >
      <div className="divide-y divide-sand-200">
        {isLoading ? (
          <div className="py-8 text-center text-xs text-charcoal-400">Loading events…</div>
        ) : displayedEvents.length === 0 ? (
          <div className="py-8 text-center text-xs text-charcoal-500">No recent events recorded.</div>
        ) : (
          displayedEvents.map((evt) => {
            const config = EVENT_TYPE_CONFIG[evt.eventType];
            const isPositive = evt.quantityChange > 0;
            return (
              <div
                key={evt.id}
                className="px-5 py-3 hover:bg-sand-200 transition-colors flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Event type icon */}
                  <div className={`p-1.5 rounded-lg border shrink-0 ${config.badgeBg} ${config.badgeBorder} ${config.iconColor}`}>
                    {getEventIcon(evt.eventType)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-charcoal-900 truncate">{evt.productName}</span>
                      <span className="font-mono text-[10px] text-charcoal-400 shrink-0">{evt.sku}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-charcoal-400">
                      <span className="truncate">{evt.locationName}</span>
                      <span>·</span>
                      <span className={`font-semibold uppercase tracking-wider text-[9px] px-1 py-0.5 rounded border ${config.badgeBg} ${config.badgeText} ${config.badgeBorder}`}>
                        {evt.eventType.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className={`font-bold font-mono text-sm ${isPositive ? 'text-olive-600' : 'text-terracotta-600'}`}>
                    {isPositive ? `+${evt.quantityChange}` : evt.quantityChange}
                  </div>
                  <div className="text-[10px] text-charcoal-400 mt-0.5">
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
