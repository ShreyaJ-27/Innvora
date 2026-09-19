import React from 'react';
import { Warehouse, AlertOctagon } from 'lucide-react';
import { LocationInventorySummary } from '../../types/inventory';
import { formatCurrency, formatNumber } from '../../utils/formatters';

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
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {locations.map((loc) => {
        const isSelected = selectedLocation === loc.locationId;
        return (
          <div
            key={loc.locationId}
            onClick={() => onSelectLocation(loc.locationId)}
            className={`bg-white rounded-xl border p-4.5 shadow-card transition-all cursor-pointer ${
              isSelected
                ? 'border-blue-500 ring-2 ring-blue-100 bg-blue-50/20'
                : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-slate-100 rounded-lg text-slate-700 shrink-0">
                  <Warehouse className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 leading-tight">
                    {loc.locationName}
                  </h4>
                  <span className="text-[11px] text-slate-500">{loc.city}</span>
                </div>
              </div>
            </div>

            {/* Health progress bar */}
            <div className="space-y-1.5 mb-3">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 font-medium">Health Coverage</span>
                <span className="font-bold text-emerald-700">{loc.healthyPercent}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden flex">
                <div
                  className="bg-emerald-500 h-full"
                  style={{ width: `${loc.healthyPercent}%` }}
                />
                <div
                  className="bg-rose-500 h-full"
                  style={{ width: `${100 - loc.healthyPercent}%` }}
                />
              </div>
            </div>

            {/* Key counts */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">SKUs</p>
                <p className="text-xs font-bold text-slate-800">{loc.totalSkus}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Critical</p>
                <p
                  className={`text-xs font-bold flex items-center justify-center gap-0.5 ${
                    loc.criticalCount > 0 ? 'text-rose-600' : 'text-slate-700'
                  }`}
                >
                  {loc.criticalCount > 0 && <AlertOctagon className="w-3 h-3 text-rose-500 inline" />}
                  {loc.criticalCount}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Value</p>
                <p className="text-xs font-bold text-slate-800 truncate">
                  {formatCurrency(loc.inventoryValue)}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
