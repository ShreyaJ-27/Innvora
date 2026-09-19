import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, Bell, PlayCircle, Search, CheckCircle2 } from 'lucide-react';
import { IconButton } from '../common/IconButton';
import { LocationSelector } from './LocationSelector';
import { Button } from '../common/Button';

export interface TopbarProps {
  onMenuClick: () => void;
  selectedLocation: string;
  onLocationChange: (loc: string) => void;
  onOpenDemoSimulator?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  onMenuClick,
  selectedLocation,
  onLocationChange,
  onOpenDemoSimulator,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

  const enableDemoTools = import.meta.env.VITE_ENABLE_DEMO_TOOLS === 'true';

  // Compute breadcrumb label
  const pathName = location.pathname.split('/')[1] || 'dashboard';
  const breadcrumbMap: Record<string, string> = {
    dashboard: 'Inventory Overview',
    inventory: 'Inventory Master',
    reorders: 'Smart Reorders',
    activity: 'Network Activity',
    search: 'Historical Event Search',
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left Context / Mobile Toggle */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="lg:hidden p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 focus:outline-none"
          aria-label="Open sidebar menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium">StockPulse</span>
          <span className="text-slate-300">/</span>
          <span className="text-slate-800 font-semibold">{breadcrumbMap[pathName] || 'Dashboard'}</span>
        </div>
      </div>

      {/* Center / Right: Global Search & Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Global Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative hidden md:block w-56 lg:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Global search (SKU, item, hub)..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </form>

        {/* Global Location Selector */}
        <LocationSelector
          selectedLocation={selectedLocation}
          onLocationChange={onLocationChange}
        />

        {/* Demo Simulator Trigger Button */}
        {enableDemoTools && onOpenDemoSimulator && (
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenDemoSimulator}
            leftIcon={<PlayCircle className="w-3.5 h-3.5 text-blue-600" />}
            className="hidden sm:inline-flex border-blue-200 bg-blue-50/60 text-blue-700 hover:bg-blue-100"
          >
            Simulate Event
          </Button>
        )}

        {/* Notification Bell */}
        <div className="relative">
          <IconButton
            aria-label="View notifications"
            onClick={() => setShowNotifications(!showNotifications)}
            size="sm"
            className="relative"
          >
            <Bell className="w-4 h-4 text-slate-600" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
          </IconButton>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-dropdown border border-slate-200 py-3 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-800">Operational Alerts</span>
                <span className="text-[10px] bg-rose-50 text-rose-700 font-bold px-1.5 py-0.5 rounded">
                  2 Critical
                </span>
              </div>
              <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                <div className="p-3 hover:bg-slate-50 cursor-pointer">
                  <div className="flex items-start gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-slate-900">
                        SKU-ERG-902 breached critical threshold
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Mumbai Hub: 10 units left (0.9 days remaining)
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-3 hover:bg-slate-50 cursor-pointer">
                  <div className="flex items-start gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-slate-900">
                        SKU-THERM-101 approaching reorder point
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Lead time demand exceeds current safety buffer
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-4 pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" /> SQS Stream Active
                </span>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-[11px] text-blue-600 hover:underline font-medium"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar */}
        <div className="flex items-center gap-2 pl-1 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-slate-900 text-white text-xs font-semibold flex items-center justify-center shadow-xs">
            OP
          </div>
          <div className="hidden xl:block text-left">
            <div className="text-xs font-semibold text-slate-800 leading-tight">Ops Lead</div>
            <div className="text-[10px] text-slate-400 leading-tight">Central Logistics</div>
          </div>
        </div>
      </div>
    </header>
  );
};
