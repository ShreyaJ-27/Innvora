import React from 'react';
import { SearchInput } from '../common/SearchInput';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { RefreshCw } from 'lucide-react';
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
    { value: 'ALL', label: 'All Statuses' },
    { value: 'CRITICAL', label: 'Critical' },
    { value: 'REORDER_SOON', label: 'Reorder Soon' },
    { value: 'HEALTHY', label: 'Healthy' },
    { value: 'OVERSTOCKED', label: 'Overstocked' },
  ];

  return (
    <div className="bg-sand-100 border border-sand-400 rounded-xl px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-3" style={{ boxShadow: '0 1px 3px rgba(39,37,34,0.06)' }}>
      {/* Search */}
      <div className="w-full md:w-80">
        <SearchInput
          value={search}
          onChange={onSearchChange}
          placeholder="Search by SKU, product name, category…"
        />
      </div>

      {/* Filters */}
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
          options={statusOptions}
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
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
