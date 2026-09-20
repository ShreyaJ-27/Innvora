import React from 'react';
import { MapPin } from 'lucide-react';
import { LocationInventorySummary } from '../../types/inventory';
import { formatCurrency } from '../../utils/formatters';

export interface LocationOverviewCardsProps {
  locations: LocationInventorySummary[];
  selectedLocation: string;
  onSelectLocation: (locationId: string) => void;
}

export const LocationOverviewCards: React.FC<LocationOverviewCardsProps> = ({
  locations,
  selectedLocation,
  onSelectLocation,
}) => {
  if (locations.length === 0) {
    return (
      <div className="py-8 text-center text-charcoal-400 text-sm bg-sand-100 border border-sand-400 rounded-xl">
        No hub data available.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {locations.map((loc) => {
        const isSelected = selectedLocation === loc.locationId;
        const healthGood = loc.healthyPercent >= 80;

        return (
          <div
            key={loc.locationId}
            onClick={() => onSelectLocation(loc.locationId)}
            className={`rounded-xl border p-4 cursor-pointer transition-all ${
              isSelected
                ? 'border-charcoal-700 bg-sand-200'
                : 'border-sand-400 bg-sand-100 hover:border-sand-500 hover:bg-sand-200'
            }`}
            style={{ boxShadow: '0 1px 3px rgba(39,37,34,0.06)' }}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-sand-300 rounded-lg text-charcoal-600 shrink-0">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-charcoal-900 leading-tight">{loc.city}</h4>
                  <p className="text-[10px] text-charcoal-400 mt-0.5 leading-tight line-clamp-1">{loc.locationName}</p>
                </div>
              </div>
              {isSelected && (
                <span className="text-[9px] font-bold uppercase tracking-widest text-charcoal-600 border border-charcoal-400 rounded px-1 py-0.5">
                  Active
                </span>
              )}
            </div>

            {/* Health bar */}
            <div className="mb-3">
              <div className="flex justify-between text-[10px] mb-1">
                <span className="text-charcoal-400">Health</span>
                <span className={`font-bold ${healthGood ? 'text-olive-700' : 'text-terracotta-600'}`}>
                  {loc.healthyPercent}%
                </span>
              </div>
              <div className="h-1 bg-sand-400 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${healthGood ? 'bg-olive-500' : loc.healthyPercent > 60 ? 'bg-terracotta-400' : 'bg-terracotta-600'}`}
                  style={{ width: `${loc.healthyPercent}%`, transition: 'width 0.5s ease' }}
                />
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-sand-300 text-center">
              <div>
                <p className="text-[9px] font-bold text-charcoal-400 uppercase tracking-wider mb-0.5">SKUs</p>
                <p className="text-xs font-bold text-charcoal-900">{loc.totalSkus}</p>
              </div>
              <div>
                <p className="text-[9px] font-bold text-charcoal-400 uppercase tracking-wider mb-0.5">Critical</p>
                <p className={`text-xs font-bold ${loc.criticalCount > 0 ? 'text-terracotta-700' : 'text-charcoal-900'}`}>
                  {loc.criticalCount}
                </p>
              </div>
              <div>
                <p className="text-[9px] font-bold text-charcoal-400 uppercase tracking-wider mb-0.5">Value</p>
                <p className="text-xs font-bold text-charcoal-900 truncate">{formatCurrency(loc.inventoryValue)}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
