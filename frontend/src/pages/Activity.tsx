import React, { useState } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { PageContainer } from '../components/layout/PageContainer';
import { ActivityTimelineTable } from '../components/activity/ActivityTimelineTable';
import { ActivityFilters } from '../components/activity/ActivityFilters';
import { ErrorState } from '../components/common/ErrorState';
import { useSearch } from '../hooks/useSearch';
import { formatRelativeTime } from '../utils/formatters';
import {
  Activity as ActivityIcon,
  ListFilter,
  Layers,
  Clock,
  ShoppingCart,
  PackageCheck,
  RotateCcw,
  ArrowRightLeft,
  Sliders,
} from 'lucide-react';
import { InventoryEventType } from '../types/events';

export interface ActivityProps {
  selectedLocation: string;
  onLocationChange: (loc: string) => void;
}

export const Activity: React.FC<ActivityProps> = ({
  selectedLocation,
  onLocationChange,
}) => {
  const [eventType, setEventType] = useState('ALL');
  const [skuSearch, setSkuSearch] = useState('');
  const [viewMode, setViewMode] = useState<'timeline' | 'table'>('timeline');

  const {
    events,
    loading,
    error,
    refetch,
  } = useSearch({
    locationId: selectedLocation,
    eventType,
    q: skuSearch,
  });

  const getEventDotClass = (type: InventoryEventType) => {
    switch (type) {
      case 'SALE':
        return 'inn-event-dot-sale';
      case 'RESTOCK':
        return 'inn-event-dot-restock';
      case 'TRANSFER_IN':
      case 'TRANSFER_OUT':
        return 'inn-event-dot-transfer';
      case 'RETURN':
        return 'inn-event-dot-return';
      case 'ADJUSTMENT':
        return 'inn-event-dot-adjustment';
      default:
        return 'inn-event-dot-transfer';
    }
  };

  const getEventIcon = (type: InventoryEventType) => {
    switch (type) {
      case 'SALE':
        return <ShoppingCart className="w-4 h-4" />;
      case 'RESTOCK':
        return <PackageCheck className="w-4 h-4" />;
      case 'RETURN':
        return <RotateCcw className="w-4 h-4" />;
      case 'TRANSFER_IN':
      case 'TRANSFER_OUT':
        return <ArrowRightLeft className="w-4 h-4" />;
      case 'ADJUSTMENT':
        return <Sliders className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <PageContainer>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="ops-live-dot" />
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-charcoal-400">
              INNVORA / AUDIT TRAIL
            </p>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-charcoal-950">
            Inventory Activity Stream
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-charcoal-600">
            Live OpenSearch event ledger fed asynchronously via Amazon SQS and AWS Lambda.
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="inline-flex rounded-lg border border-sand-400 bg-sand-200/80 p-1">
          <button
            onClick={() => setViewMode('timeline')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-bold transition-colors ${
              viewMode === 'timeline'
                ? 'bg-charcoal-900 text-sand-100 shadow-sm'
                : 'text-charcoal-600 hover:text-charcoal-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Timeline Flow
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-bold transition-colors ${
              viewMode === 'table'
                ? 'bg-charcoal-900 text-sand-100 shadow-sm'
                : 'text-charcoal-600 hover:text-charcoal-900'
            }`}
          >
            <ListFilter className="w-3.5 h-3.5" />
            Ledger Table
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Filters */}
        <ActivityFilters
          locationId={selectedLocation}
          onLocationChange={onLocationChange}
          eventType={eventType}
          onEventTypeChange={setEventType}
          skuSearch={skuSearch}
          onSkuSearchChange={setSkuSearch}
          onRefresh={refetch}
          isRefreshing={loading}
        />

        {error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : viewMode === 'table' ? (
          <ActivityTimelineTable events={events} isLoading={loading} />
        ) : (
          /* Timeline Visual Flow */
          <div className="ops-panel p-6 sm:p-8">
            <div className="flex items-center justify-between pb-4 border-b border-sand-400/80 mb-6">
              <span className="text-xs font-black uppercase tracking-widest text-charcoal-400">
                Streaming Chronology
              </span>
              <span className="text-xs font-semibold text-charcoal-500">
                {events.length} movements recorded
              </span>
            </div>

            {events.length === 0 && !loading && (
              <div className="py-12 text-center text-charcoal-500 text-sm">
                No inventory events recorded matching this filter context.
              </div>
            )}

            <div className="inn-timeline pl-2 sm:pl-4 space-y-4">
              {events.map((ev, idx) => {
                const isPositive = ev.quantityChange > 0;
                return (
                  <div
                    key={ev.id || idx}
                    className="inn-event-marker animate-rise-in group"
                    style={{ animationDelay: `${Math.min(idx * 35, 400)}ms` }}
                  >
                    <div className={`inn-event-dot ${getEventDotClass(ev.eventType)}`}>
                      {getEventIcon(ev.eventType)}
                    </div>

                    <div className="flex-1 bg-sand-50 border border-sand-400/80 p-4 rounded-lg shadow-xs hover:border-sand-500 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-wider text-charcoal-800">
                              {ev.eventType.replace('_', ' ')}
                            </span>
                            <span className="font-mono text-xs font-bold text-charcoal-700 bg-sand-200 px-1.5 py-0.5 rounded">
                              {ev.sku}
                            </span>
                            <span className="text-xs text-charcoal-500 truncate font-semibold">
                              {ev.productName}
                            </span>
                          </div>
                          <p className="text-xs text-charcoal-500 mt-1">
                            Processed at <strong>{ev.locationName}</strong>
                          </p>
                        </div>

                        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center">
                          <span
                            className={`font-mono text-base font-black ${
                              isPositive ? 'text-olive-700' : 'text-terracotta-700'
                            }`}
                          >
                            {isPositive ? `+${ev.quantityChange}` : ev.quantityChange} units
                          </span>
                          <span className="text-[11px] text-charcoal-400 font-medium">
                            {formatRelativeTime(ev.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
};
