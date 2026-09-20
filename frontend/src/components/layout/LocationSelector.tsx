import React, { useEffect, useState } from 'react';
import { MapPin } from 'lucide-react';
import { fetchLocations } from '../../api/inventory-api';

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
  const [locations, setLocations] = useState<LocationOption[]>(LOCATIONS);

  useEffect(() => {
    let mounted = true;
    fetchLocations().then((remoteLocations) => {
      if (!mounted || !remoteLocations?.length) return;
      const options: LocationOption[] = [
        { id: 'ALL', name: 'All Fulfillment Hubs', city: 'All Hubs' },
        ...remoteLocations.map((loc) => ({
          id: loc.locationId,
          name: loc.locationName,
          city: loc.city || loc.locationName || loc.locationId,
        })),
      ];
      setLocations(options);
    }).catch(() => {
      // Keep static fallback
    });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-sand-200 border border-sand-400 rounded-lg hover:border-sand-500 transition-colors">
        <MapPin className="w-3.5 h-3.5 text-charcoal-500 shrink-0" />
        <select
          value={selectedLocation}
          onChange={(e) => onLocationChange(e.target.value)}
          aria-label="Select inventory location"
          className="bg-transparent text-xs font-medium text-charcoal-700 focus:outline-none cursor-pointer"
        >
          {locations.map((loc) => (
            <option key={loc.id} value={loc.id} style={{ backgroundColor: '#F8F4EC', color: '#272522' }}>
              {loc.id === 'ALL' ? 'All Hubs' : (loc.city || loc.name || loc.id)}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
