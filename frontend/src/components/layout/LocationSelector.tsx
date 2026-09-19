import React from 'react';
import { MapPin } from 'lucide-react';

export interface LocationOption {
  id: string;
  name: string;
  city: string;
}

export const LOCATIONS: LocationOption[] = [
  { id: 'ALL', name: 'All Fulfillment Hubs', city: 'Network Wide' },
  { id: 'LOC-BOM-01', name: 'Mumbai Central Fulfillment', city: 'Mumbai' },
  { id: 'LOC-DEL-02', name: 'Delhi NCR Logistics Hub', city: 'Delhi NCR' },
  { id: 'LOC-BLR-01', name: 'Bengaluru Tech Park Warehouse', city: 'Bengaluru' },
  { id: 'LOC-HYD-01', name: 'Hyderabad Regional Depot', city: 'Hyderabad' },
];

export interface LocationSelectorProps {
  selectedLocation: string;
  onLocationChange: (locationId: string) => void;
  className?: string;
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({
  selectedLocation,
  onLocationChange,
  className = '',
}) => {
  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg shadow-subtle hover:border-slate-300 transition-colors">
        <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
        <select
          value={selectedLocation}
          onChange={(e) => onLocationChange(e.target.value)}
          aria-label="Select inventory location"
          className="bg-transparent text-xs font-medium text-slate-800 focus:outline-none cursor-pointer pr-1"
        >
          {LOCATIONS.map((loc) => (
            <option key={loc.id} value={loc.id}>
              {loc.name} {loc.id !== 'ALL' ? `(${loc.city})` : ''}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
