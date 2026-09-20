import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, Bell, PlayCircle, Search, CheckCircle2, AlertTriangle, Clock3, Warehouse, Activity } from 'lucide-react';
import { IconButton } from '../common/IconButton';
import { LocationSelector } from './LocationSelector';
import { Button } from '../common/Button';
import { useInventory } from '../../hooks/useInventory';
import { useReorders } from '../../hooks/useReorders';
import { useSearch } from '../../hooks/useSearch';
import { fetchNotifications } from '../../api/inventory-api';
import { NotificationAlert } from '../../types/inventory';

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
  const [backendAlerts, setBackendAlerts] = useState<NotificationAlert[]>([]);

  const enableDemoTools = import.meta.env.VITE_ENABLE_DEMO_TOOLS === 'true';
  const { inventory } = useInventory({ locationId: selectedLocation, limit: 100 });
  const { reorders } = useReorders({ locationId: selectedLocation });
  const { events } = useSearch({ locationId: selectedLocation });

  useEffect(() => {
    let active = true;
    fetchNotifications(selectedLocation).then((alerts) => {
      if (active && Array.isArray(alerts)) {
        setBackendAlerts(alerts);
      }
    }).catch(() => {
      // Ignore network errors
    });
    return () => {
      active = false;
    };
  }, [selectedLocation, showNotifications]);

  const criticalItems = inventory.filter((item) => item.status === 'CRITICAL').slice(0, 3);
  const reorderSoon = inventory.filter((item) => item.status === 'REORDER_SOON').slice(0, 3);
  const hubAlerts = Array.from(
    inventory.reduce((map, item) => {
      const current = map.get(item.locationName) ?? { critical: 0, reorder: 0 };
      if (item.status === 'CRITICAL') current.critical += 1;
      if (item.status === 'REORDER_SOON') current.reorder += 1;
      map.set(item.locationName, current);
      return map;
    }, new Map<string, { critical: number; reorder: number }>())
  )
    .filter(([, value]) => value.critical || value.reorder)
    .slice(0, 3);
  const notificationCount = backendAlerts.length > 0
    ? backendAlerts.length
    : (criticalItems.length + reorderSoon.length + hubAlerts.length);

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
      className="h-16 border-b border-sand-400 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30"
      style={{ backgroundColor: 'rgba(248,244,236,0.94)', backdropFilter: 'blur(16px)' }}
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
          <span className="text-charcoal-800 font-black tracking-tight hidden sm:inline">INNVORA</span>
          <span className="text-charcoal-300 hidden sm:inline">/</span>
          <span className="text-charcoal-700 font-semibold">
            {breadcrumbMap[pathName] || 'Dashboard'}
          </span>
          <span className="hidden lg:inline-flex items-center gap-1.5 ml-2 px-2 py-1 border border-olive-200 bg-olive-50 text-olive-700 rounded-md text-[10px] font-bold uppercase tracking-wider">
            <span className="ops-live-dot" /> Live
          </span>
        </div>
      </div>

      {/* Right: Search + Location + Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Global Search */}
        <form onSubmit={handleSearchSubmit} className="relative hidden md:block w-56 lg:w-72">
          <Search className="w-3.5 h-3.5 text-charcoal-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search SKU, product, hub…"
            className="w-full pl-8 pr-3 py-2 ops-command-input text-xs"
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
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 bg-terracotta-600 text-sand-50 rounded-full text-[9px] font-bold flex items-center justify-center">
                {notificationCount}
              </span>
            )}
          </IconButton>

          {showNotifications && (
            <div
              className="absolute right-0 mt-3 w-[min(92vw,380px)] rounded-lg border border-sand-500 py-3 z-50 animate-rise-in"
              style={{ backgroundColor: '#F8F4EC', boxShadow: '0 20px 54px rgba(39,37,34,0.18)' }}
            >
              <div className="px-4 pb-2 border-b border-sand-300 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-charcoal-900">Operational Alerts</span>
                  <p className="text-[10px] text-charcoal-400 mt-0.5">Panel stays open until the bell is toggled</p>
                </div>
                <span className="text-[10px] bg-terracotta-50 text-terracotta-700 font-bold px-1.5 py-0.5 rounded-md border border-terracotta-200">
                  {criticalItems.length} Critical
                </span>
              </div>
              <div className="max-h-[24rem] overflow-y-auto">
                {backendAlerts.length > 0 && (
                  <div className="px-3 py-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-charcoal-400 mb-2">Live Backend Alerts</p>
                    {backendAlerts.map((alert) => (
                      <button
                        key={alert.id}
                        onClick={() => navigate(alert.severity === 'CRITICAL' ? '/inventory' : '/reorders')}
                        className={`w-full p-2.5 mb-1.5 rounded-md border text-left transition-colors ${
                          alert.severity === 'CRITICAL'
                            ? 'border-terracotta-200 bg-terracotta-50 hover:bg-terracotta-100'
                            : 'border-sand-400 bg-sand-100 hover:bg-sand-200'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {alert.severity === 'CRITICAL' ? (
                            <AlertTriangle className="w-3.5 h-3.5 text-terracotta-700 mt-0.5 shrink-0" />
                          ) : (
                            <Clock3 className="w-3.5 h-3.5 text-terracotta-600 mt-0.5 shrink-0" />
                          )}
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-charcoal-900 truncate">{alert.title}</p>
                            <p className="text-[11px] text-charcoal-600 mt-0.5">{alert.message}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                <div className={`px-3 py-2 ${backendAlerts.length > 0 ? 'border-t border-sand-300' : ''}`}>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-charcoal-400 mb-2">Critical inventory</p>
                  {(criticalItems.length ? criticalItems : reorders.slice(0, 2)).map((item: any) => (
                    <button key={`${item.sku}-${item.locationId || item.locationName}`} onClick={() => navigate('/inventory')} className="w-full p-2.5 mb-1.5 rounded-md border border-terracotta-200 bg-terracotta-50 text-left hover:bg-terracotta-100 transition-colors">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-terracotta-700 mt-0.5 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-charcoal-900 truncate">{item.name || item.productName || item.sku}</p>
                          <p className="text-[11px] text-terracotta-800 mt-0.5">{item.locationName}: {item.availableStock ?? item.currentStock} units available</p>
                        </div>
                      </div>
                    </button>
                  ))}
                  {!criticalItems.length && !reorders.length && (
                    <p className="text-xs text-charcoal-500 bg-sand-200 border border-sand-300 rounded-md p-2">No critical inventory at the current hub.</p>
                  )}
                </div>
                <div className="px-3 py-2 border-t border-sand-300">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-charcoal-400 mb-2">Reorder soon</p>
                  {reorderSoon.map((item) => (
                    <button key={item.id} onClick={() => navigate('/reorders')} className="w-full p-2.5 mb-1.5 rounded-md border border-sand-400 bg-sand-100 text-left hover:bg-sand-200 transition-colors">
                      <div className="flex items-start gap-2">
                        <Clock3 className="w-3.5 h-3.5 text-terracotta-600 mt-0.5 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-charcoal-900 truncate">{item.name}</p>
                          <p className="text-[11px] text-charcoal-500">{item.daysOfStock} days remaining at {item.locationName}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                  {!reorderSoon.length && <p className="text-xs text-charcoal-500">No reorder-soon items in this view.</p>}
                </div>
                <div className="px-3 py-2 border-t border-sand-300">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-charcoal-400 mb-2">Hub alerts</p>
                  {hubAlerts.map(([hub, value]) => (
                    <button key={hub} onClick={() => navigate('/dashboard')} className="w-full p-2.5 mb-1.5 rounded-md border border-sand-400 bg-sand-100 text-left hover:bg-sand-200 transition-colors">
                      <div className="flex items-center gap-2">
                        <Warehouse className="w-3.5 h-3.5 text-charcoal-500" />
                        <span className="text-xs font-semibold text-charcoal-900 flex-1 truncate">{hub}</span>
                        <span className="text-[10px] font-bold text-terracotta-700">{value.critical} critical</span>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="px-3 py-2 border-t border-sand-300">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-charcoal-400 mb-2">Recent inventory events</p>
                  {events.slice(0, 3).map((event: any) => (
                    <button key={event.id || `${event.sku}-${event.timestamp}`} onClick={() => navigate('/activity')} className="w-full flex items-center gap-2 p-2 rounded-md hover:bg-sand-200 text-left transition-colors">
                      <Activity className="w-3.5 h-3.5 text-charcoal-500" />
                      <span className="text-xs text-charcoal-700 flex-1 truncate">{event.eventType || event.type} {event.sku}</span>
                      <span className="text-[10px] text-charcoal-400">{event.quantityChange ?? event.quantity ?? ''}</span>
                    </button>
                  ))}
                  {!events.length && <p className="text-xs text-charcoal-500">No recent indexed events for the current filter.</p>}
                </div>
              </div>
              <div className="px-4 pt-2 border-t border-sand-300 flex items-center justify-between">
                <span className="text-[10px] text-charcoal-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-olive-500" /> SQS Stream Active
                </span>
                <span className="text-[10px] text-charcoal-400">Bell toggles panel</span>
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
