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

  const pathName = location.pathname.split('/')[1] || 'dashboard';
  const breadcrumbMap: Record<string, string> = {
    dashboard: 'Dashboard',
    inventory: 'Inventory',
    reorders: 'Replenishment',
    activity: 'Activity',
    search: 'Search',
    settings: 'Settings',
    help: 'Help & Docs',
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header
      className="h-14 border-b border-sand-400 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30"
      style={{ backgroundColor: '#F8F4EC' }}
    >
      {/* Left: Mobile toggle + Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="lg:hidden p-1.5 text-charcoal-500 hover:text-charcoal-800 rounded-lg hover:bg-sand-300 focus:outline-none transition-colors"
          aria-label="Open sidebar menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-charcoal-400 font-medium hidden sm:inline">Innvora</span>
          <span className="text-charcoal-300 hidden sm:inline">/</span>
          <span className="text-charcoal-700 font-semibold">
            {breadcrumbMap[pathName] || 'Dashboard'}
          </span>
        </div>
      </div>

      {/* Right: Search + Location + Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Global Search */}
        <form onSubmit={handleSearchSubmit} className="relative hidden md:block w-52 lg:w-64">
          <Search className="w-3.5 h-3.5 text-charcoal-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search SKU, product, hub…"
            className="w-full pl-8 pr-3 py-1.5 bg-sand-200 border border-sand-400 rounded-lg text-xs
              text-charcoal-800 placeholder-charcoal-400 focus:outline-none focus:ring-1
              focus:ring-charcoal-700 focus:border-charcoal-700 transition-colors"
          />
        </form>

        {/* Location Selector */}
        <LocationSelector
          selectedLocation={selectedLocation}
          onLocationChange={onLocationChange}
        />

        {/* Demo Simulator */}
        {enableDemoTools && onOpenDemoSimulator && (
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenDemoSimulator}
            leftIcon={<PlayCircle className="w-3.5 h-3.5" />}
            className="hidden sm:inline-flex"
          >
            Simulate
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
            <Bell className="w-4 h-4 text-charcoal-500" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-terracotta-500 rounded-full" />
          </IconButton>

          {showNotifications && (
            <div
              className="absolute right-0 mt-2 w-76 rounded-xl border border-sand-400 py-3 z-50 animate-fade-in"
              style={{ backgroundColor: '#F8F4EC', boxShadow: '0 8px 24px rgba(39,37,34,0.12)', width: '300px' }}
            >
              <div className="px-4 pb-2 border-b border-sand-300 flex items-center justify-between">
                <span className="text-xs font-semibold text-charcoal-800">Operational Alerts</span>
                <span className="text-[10px] bg-terracotta-50 text-terracotta-700 font-bold px-1.5 py-0.5 rounded border border-terracotta-200">
                  2 Critical
                </span>
              </div>
              <div className="divide-y divide-sand-300 max-h-60 overflow-y-auto">
                <div className="p-3 hover:bg-sand-200 cursor-pointer transition-colors">
                  <div className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-terracotta-600 mt-1.5 shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-charcoal-900">
                        SKU-ERG-902 breached critical threshold
                      </p>
                      <p className="text-[11px] text-charcoal-500 mt-0.5">
                        Mumbai Hub: 10 units remaining
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-3 hover:bg-sand-200 cursor-pointer transition-colors">
                  <div className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-terracotta-400 mt-1.5 shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-charcoal-900">
                        SKU-THERM-101 approaching reorder point
                      </p>
                      <p className="text-[11px] text-charcoal-500 mt-0.5">
                        Lead time demand exceeds safety buffer
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-4 pt-2 border-t border-sand-300 flex items-center justify-between">
                <span className="text-[10px] text-charcoal-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-olive-500" /> SQS Stream Active
                </span>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-[11px] text-charcoal-600 hover:text-charcoal-900 font-medium"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-sand-400">
          <div className="w-7 h-7 rounded-lg bg-charcoal-800 text-sand-100 text-xs font-semibold flex items-center justify-center">
            OP
          </div>
          <div className="hidden xl:block text-left">
            <div className="text-xs font-semibold text-charcoal-800 leading-tight">Ops Lead</div>
            <div className="text-[10px] text-charcoal-400 leading-tight">Central Logistics</div>
          </div>
        </div>
      </div>
    </header>
  );
};
