import React from 'react';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { SearchInput } from '../common/SearchInput';
import { RefreshCw } from 'lucide-react';
import { LOCATIONS } from '../layout/LocationSelector';

export interface ActivityFiltersProps {
  locationId: string;
  onLocationChange: (val: string) => void;
  eventType: string;
  onEventTypeChange: (val: string) => void;
  skuSearch: string;
  onSkuSearchChange: (val: string) => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export const ActivityFilters: React.FC<ActivityFiltersProps> = ({
  locationId,
  onLocationChange,
  eventType,
  onEventTypeChange,
  skuSearch,
  onSkuSearchChange,
  onRefresh,
  isRefreshing = false,
}) => {
  const eventTypeOptions = [
    { value: 'ALL', label: 'All Event Types' },
    { value: 'SALE', label: 'Sale' },
    { value: 'RESTOCK', label: 'Restock' },
    { value: 'RETURN', label: 'Customer Return' },
    { value: 'TRANSFER_IN', label: 'Transfer In' },
    { value: 'TRANSFER_OUT', label: 'Transfer Out' },
    { value: 'ADJUSTMENT', label: 'Adjustment / Audit' },
  ];

  return (
    <div className="bg-sand-100 border border-sand-400 rounded-xl px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-3" style={{ boxShadow: '0 1px 3px rgba(39,37,34,0.06)' }}>
      <div className="w-full md:w-72">
        <SearchInput
          value={skuSearch}
          onChange={onSkuSearchChange}
          placeholder="Filter by SKU or product…"
        />
      </div>

      <div className="flex items-center gap-2.5 w-full md:w-auto justify-end flex-wrap">
        <Select
          options={LOCATIONS.map((l) => ({
            value: l.id,
            label: l.id === 'ALL' ? 'All Hubs' : l.city,
          }))}
          value={locationId}
          onChange={(e) => onLocationChange(e.target.value)}
        />

        <Select
          options={eventTypeOptions}
          value={eventType}
          onChange={(e) => onEventTypeChange(e.target.value)}
        />

        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          isLoading={isRefreshing}
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          <span className="hidden sm:inline">Refresh</span>
        </Button>
      </div>
    </div>
  );
};
