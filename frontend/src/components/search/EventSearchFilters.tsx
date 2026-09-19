import React from 'react';
import { Select } from '../common/Select';
import { SearchInput } from '../common/SearchInput';
import { LOCATIONS } from '../layout/LocationSelector';

export interface EventSearchFiltersProps {
  query: string;
  onQueryChange: (q: string) => void;
  locationId: string;
  onLocationChange: (loc: string) => void;
  eventType: string;
  onEventTypeChange: (type: string) => void;
}

export const EventSearchFilters: React.FC<EventSearchFiltersProps> = ({
  query,
  onQueryChange,
  locationId,
  onLocationChange,
  eventType,
  onEventTypeChange,
}) => {
  const eventTypeOptions = [
    { value: 'ALL', label: 'All Event Types' },
    { value: 'SALE', label: 'Sale (Outbound)' },
    { value: 'RESTOCK', label: 'Restock (Inbound)' },
    { value: 'RETURN', label: 'Customer Return' },
    { value: 'TRANSFER_IN', label: 'Transfer In' },
    { value: 'TRANSFER_OUT', label: 'Transfer Out' },
    { value: 'ADJUSTMENT', label: 'Adjustment' },
  ];

  return (
    <div className="space-y-4">
      {/* Prominent Large Search Bar */}
      <div className="w-full">
        <SearchInput
          value={query}
          onChange={onQueryChange}
          placeholder="Search SKUs, products, locations, or inventory events..."
          sizeVariant="lg"
          className="shadow-sm"
        />
      </div>

      {/* Secondary Filter Row */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="w-full sm:w-56">
          <Select
            label="Location Filter"
            options={LOCATIONS.map((l) => ({
              value: l.id,
              label: l.id === 'ALL' ? 'Network Wide' : `${l.name} (${l.city})`,
            }))}
            value={locationId}
            onChange={(e) => onLocationChange(e.target.value)}
            sizeVariant="sm"
          />
        </div>

        <div className="w-full sm:w-52">
          <Select
            label="Event Type"
            options={eventTypeOptions}
            value={eventType}
            onChange={(e) => onEventTypeChange(e.target.value)}
            sizeVariant="sm"
          />
        </div>
      </div>
    </div>
  );
};
