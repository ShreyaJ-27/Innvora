import React from 'react';
import { SearchInput } from '../common/SearchInput';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { RefreshCw, Filter } from 'lucide-react';
import { LOCATIONS } from '../layout/LocationSelector';

export interface InventoryFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
  locationId: string;
  onLocationChange: (val: string) => void;
  status: string;
  onStatusChange: (val: string) => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export const InventoryFilters: React.FC<InventoryFiltersProps> = ({
  search,
  onSearchChange,
  locationId,
  onLocationChange,
  status,
  onStatusChange,
  onRefresh,
  isRefreshing = false,
}) => {
  const statusOptions = [
    { value: 'ALL', label: 'All Health Statuses' },
    { value: 'CRITICAL', label: 'Critical' },
    { value: 'REORDER_SOON', label: 'Reorder Soon' },
    { value: 'HEALTHY', label: 'Healthy' },
    { value: 'OVERSTOCKED', label: 'Overstocked' },
  ];

  return (
    <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-card flex flex-col md:flex-row items-center justify-between gap-3">
      {/* Search Input */}
      <div className="w-full md:w-80">
        <SearchInput
          value={search}
          onChange={onSearchChange}
          placeholder="Search by SKU, product name, category..."
          sizeVariant="md"
        />
      </div>

      {/* Filter Selects & Actions */}
      <div className="flex items-center gap-2.5 w-full md:w-auto justify-end flex-wrap">
        <Select
          options={LOCATIONS.map((l) => ({
            value: l.id,
            label: l.id === 'ALL' ? 'All Locations' : l.city,
          }))}
          value={locationId}
          onChange={(e) => onLocationChange(e.target.value)}
          sizeVariant="md"
        />

        <Select
          options={statusOptions}
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          sizeVariant="md"
        />

        <Button
          variant="outline"
          size="md"
          onClick={onRefresh}
          isLoading={isRefreshing}
          aria-label="Refresh inventory data"
          leftIcon={<RefreshCw className="w-4 h-4 text-slate-500" />}
        >
          <span className="hidden sm:inline">Refresh</span>
        </Button>
      </div>
    </div>
  );
};
