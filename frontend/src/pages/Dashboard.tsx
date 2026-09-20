import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  Calendar,
  CheckCircle2,
  MapPin,
  PackageSearch,
  RefreshCw,
  Route,
  TrendingUp,
  Warehouse,
  Zap,
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { ErrorState } from '../components/common/ErrorState';
import { StatusBadge } from '../components/common/StatusBadge';
import { PageContainer } from '../components/layout/PageContainer';
import { LOCATIONS } from '../components/layout/LocationSelector';
import { ProductInventory } from '../types/inventory';
import { useInventoryHealth } from '../hooks/useInventoryHealth';
import { useInventory } from '../hooks/useInventory';
import { useReorders } from '../hooks/useReorders';
import { useSearch } from '../hooks/useSearch';
import { formatCurrency, formatNumber, formatRelativeTime } from '../utils/formatters';

export interface DashboardProps {
  selectedLocation: string;
  onLocationChange: (loc: string) => void;
}

const statusRank: Record<string, number> = {
  CRITICAL: 0,
  REORDER_SOON: 1,
  OVERSTOCKED: 2,
  HEALTHY: 3,
};

const statusGroups = [
  { key: 'CRITICAL', label: 'Critical', tone: 'bg-terracotta-100 text-terracotta-900 border-terracotta-300' },
  { key: 'REORDER_SOON', label: 'Reorder soon', tone: 'bg-terracotta-50 text-terracotta-800 border-terracotta-200' },
  { key: 'HEALTHY', label: 'Healthy', tone: 'bg-olive-50 text-olive-800 border-olive-200' },
  { key: 'OVERSTOCKED', label: 'Overstocked', tone: 'bg-sand-200 text-charcoal-700 border-sand-400' },
] as const;

const MiniMetric: React.FC<{ label: string; value: React.ReactNode; sub?: string; accent?: string }> = ({ label, value, sub, accent = 'text-charcoal-900' }) => (
  <div className="ops-kpi p-4">
    <p className="text-[10px] font-bold uppercase tracking-widest text-charcoal-400">{label}</p>
    <div className={`ops-number mt-2 text-3xl font-black leading-none ${accent}`}>{value}</div>
    {sub && <p className="mt-1 text-[11px] text-charcoal-500">{sub}</p>}
  </div>
);

const PulseChart: React.FC<{
  trend?: { date: string; totalStock: number; inboundUnits: number; outboundUnits: number }[];
  pressure: number;
}> = ({ trend = [], pressure }) => {
  const data = trend.length ? trend : Array.from({ length: 7 }, (_, i) => ({
    date: `D${i + 1}`,
    totalStock: 20 + i * 3,
    inboundUnits: 4 + i,
    outboundUnits: 3 + i,
  }));
  const max = Math.max(...data.flatMap((d) => [d.totalStock, d.inboundUnits * 4, d.outboundUnits * 4]), 1);
  const points = data.map((d, i) => {
    const x = 34 + i * (530 / Math.max(data.length - 1, 1));
    const y = 158 - (d.totalStock / max) * 112;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="ops-panel p-5 min-h-[320px]">
      <div className="relative z-10 flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-charcoal-400">Live Inventory Pulse</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-charcoal-900">Inbound, outbound, and reorder pressure</h2>
        </div>
        <div className="hidden sm:flex items-center gap-2 rounded-md border border-sand-400 bg-sand-50 px-3 py-2 text-xs font-semibold text-charcoal-700">
          <span className="ops-live-dot" />
          Streaming
        </div>
      </div>
      <div className="relative z-10 mt-5 h-44 rounded-lg border border-sand-400 bg-sand-200/70 p-3 overflow-hidden">
        <svg viewBox="0 0 600 190" className="h-full w-full" role="img" aria-label="Inventory movement trend">
          <defs>
            <linearGradient id="pulseFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#A89580" stopOpacity="0.34" />
              <stop offset="100%" stopColor="#A89580" stopOpacity="0.03" />
            </linearGradient>
          </defs>
          {[0, 1, 2, 3].map((line) => (
            <line key={line} x1="24" x2="580" y1={42 + line * 36} y2={42 + line * 36} stroke="#CFC0AC" strokeDasharray="4 7" />
          ))}
          <polygon points={`34,170 ${points} 564,170`} fill="url(#pulseFill)" />
          <polyline points={points} fill="none" stroke="#5A5349" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="animate-draw-line" />
          {data.map((d, i) => {
            const x = 34 + i * (530 / Math.max(data.length - 1, 1));
            const inbound = Math.max(10, (d.inboundUnits / max) * 150);
            const outbound = Math.max(8, (d.outboundUnits / max) * 150);
            return (
              <g key={d.date}>
                <rect x={x - 11} y={168 - inbound} width="8" height={inbound} rx="2" fill="#7E8B5A" opacity=".72" />
                <rect x={x + 4} y={168 - outbound} width="8" height={outbound} rx="2" fill="#C6745A" opacity=".72" />
                <text x={x} y="186" textAnchor="middle" fontSize="10" fill="#7B7164">{d.date}</text>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="relative z-10 mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: 'Inbound', value: data.at(-1)?.inboundUnits ?? 0, color: 'bg-olive-500' },
          { label: 'Outbound', value: data.at(-1)?.outboundUnits ?? 0, color: 'bg-terracotta-500' },
          { label: 'At Risk', value: `${Math.round(pressure)}%`, color: 'bg-terracotta-700' },
          { label: 'Reorder Load', value: `${Math.min(100, Math.round(pressure * 1.2))}%`, color: 'bg-charcoal-700' },
        ].map((item) => (
          <div key={item.label} className="rounded-md border border-sand-400 bg-sand-50 p-3">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-charcoal-400">
              {item.label}
              <span className={`h-2 w-2 rounded-full ${item.color}`} />
            </div>
            <p className="mt-1 text-xl font-black text-charcoal-900">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const AttentionSurface: React.FC<{ items: ProductInventory[]; onSelect: (item: ProductInventory) => void }> = ({ items, onSelect }) => {
  const sorted = [...items].sort((a, b) => (statusRank[a.status] ?? 9) - (statusRank[b.status] ?? 9) || a.daysOfStock - b.daysOfStock).slice(0, 10);
  return (
    <div className="ops-panel">
      <div className="relative z-10 border-b border-sand-400 px-5 py-4 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-charcoal-400">Operational Attention</p>
          <h2 className="mt-1 text-xl font-black text-charcoal-900">Items move by urgency</h2>
        </div>
        <PackageSearch className="h-5 w-5 text-charcoal-500" />
      </div>
      <div className="relative z-10 grid grid-cols-2 gap-px bg-sand-300 sm:grid-cols-4">
        {statusGroups.map((group) => (
          <div key={group.key} className="bg-sand-100 px-4 py-3 border-b border-sand-300">
            <span className={`inline-flex rounded-md border px-2 py-1 text-[10px] font-black uppercase tracking-wider ${group.tone}`}>{group.label}</span>
            <p className="mt-2 text-2xl font-black text-charcoal-900">{items.filter((item) => item.status === group.key).length}</p>
          </div>
        ))}
      </div>
      <div className="relative z-10 divide-y divide-sand-300">
        {sorted.map((item, index) => {
          const coverage = Math.min(100, Math.max(4, (item.availableStock / Math.max(item.reorderPoint + item.safetyStock, 1)) * 100));
          return (
            <button key={item.id} onClick={() => onSelect(item)} className="ops-row group w-full px-5 py-3 text-left animate-rise-in" style={{ animationDelay: `${index * 35}ms` }}>
              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={item.status} size="sm" />
                    <span className="font-mono text-[10px] text-charcoal-500">{item.sku}</span>
                  </div>
                  <p className="mt-1 truncate text-sm font-bold text-charcoal-900">{item.name}</p>
                  <p className="text-[11px] text-charcoal-500">{item.locationName}</p>
                </div>
                <div className="grid grid-cols-3 gap-3 md:w-[360px]">
                  <div><p className="text-[10px] uppercase tracking-widest text-charcoal-400">Available</p><p className="font-black text-charcoal-900">{item.availableStock}</p></div>
                  <div><p className="text-[10px] uppercase tracking-widest text-charcoal-400">ROP</p><p className="font-black text-charcoal-900">{item.reorderPoint}</p></div>
                  <div><p className="text-[10px] uppercase tracking-widest text-charcoal-400">Days</p><p className={item.daysOfStock < 3 ? 'font-black text-terracotta-700' : 'font-black text-charcoal-900'}>{item.daysOfStock}</p></div>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-sm bg-sand-300 md:w-28">
                  <div className={`ops-progress h-full ${item.status === 'CRITICAL' ? 'bg-terracotta-700' : item.status === 'REORDER_SOON' ? 'bg-terracotta-500' : item.status === 'OVERSTOCKED' ? 'bg-charcoal-500' : 'bg-olive-500'}`} style={{ width: `${coverage}%` }} />
                </div>
                <ArrowRight className="hidden h-4 w-4 text-charcoal-400 transition-transform group-hover:translate-x-1 md:block" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export const Dashboard: React.FC<DashboardProps> = ({ selectedLocation, onLocationChange }) => {
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductInventory | null>(null);
  const { summary, locations, loading: healthLoading, error: healthError, refetch: refetchHealth } = useInventoryHealth(selectedLocation);
  const { inventory, loading: invLoading, refetch: refetchInv } = useInventory({ locationId: selectedLocation, limit: 100 });
  const { reorders, loading: reordersLoading, refetch: refetchReorders } = useReorders({ locationId: selectedLocation });
  const { events, loading: eventsLoading, refetch: refetchEvents } = useSearch({ locationId: selectedLocation });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refetchHealth(), refetchInv(), refetchReorders(), refetchEvents()]);
    setIsRefreshing(false);
  };

  const activeHub = LOCATIONS.find((loc) => loc.id === selectedLocation);
  const totalUnits = summary?.totalUnits ?? inventory.reduce((sum, item) => sum + item.currentStock, 0);
  const atRisk = (summary?.criticalCount ?? 0) + (summary?.reorderSoonCount ?? 0);
  const pressure = inventory.length ? (atRisk / inventory.length) * 100 : 0;
  const hubCount = selectedLocation === 'ALL' ? locations.length : 1;
  const currentDate = new Intl.DateTimeFormat('en-IN', { weekday: 'short', month: 'short', day: 'numeric' }).format(new Date());

  const hubSummaries = useMemo(() => LOCATIONS.filter((loc) => loc.id !== 'ALL').map((loc) => {
    const live = locations.find((item) => item.locationId === loc.id);
    const items = inventory.filter((item) => item.locationId === loc.id);
    return {
      id: loc.id,
      city: loc.city,
      name: live?.locationName || loc.name,
      skus: live?.totalSkus ?? new Set(items.map((item) => item.productId)).size,
      units: live?.totalUnits ?? items.reduce((sum, item) => sum + item.currentStock, 0),
      critical: live?.criticalCount ?? items.filter((item) => item.status === 'CRITICAL').length,
      reorder: live?.reorderSoonCount ?? items.filter((item) => item.status === 'REORDER_SOON').length,
      health: live?.healthyPercent ?? (items.length ? (items.filter((item) => item.status === 'HEALTHY').length / items.length) * 100 : 0),
      value: live?.inventoryValue ?? items.reduce((sum, item) => sum + item.currentStock * item.unitCost, 0),
    };
  }), [inventory, locations]);

  if (healthError) {
    return (
      <PageContainer>
        <ErrorState title="Unable to Load Dashboard" message={healthError} onRetry={handleRefresh} />
      </PageContainer>
    );
  }

  return (
    <PageContainer className="max-w-[1600px]">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.26em] text-charcoal-400">INNVORA / OPERATIONS</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight text-charcoal-950 sm:text-5xl">Live inventory intelligence</h1>
          <p className="mt-2 max-w-2xl text-sm text-charcoal-600">
            {activeHub?.id === 'ALL' ? 'Network-wide command center' : `${activeHub?.city} operational context`} with live inventory health, movement, and reorder pressure.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-2 rounded-md border border-sand-400 bg-sand-100 px-3 py-2 text-xs font-semibold text-charcoal-600">
            <Calendar className="h-3.5 w-3.5 text-charcoal-400" />
            {currentDate}
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh} isLoading={isRefreshing} leftIcon={<RefreshCw className="h-3.5 w-3.5" />}>Refresh</Button>
        </div>
      </div>

      <section className="ops-panel mb-6 p-5">
        <div className="relative z-10 grid gap-5 xl:grid-cols-[1.2fr_.8fr]">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 rounded-md border border-olive-200 bg-olive-50 px-3 py-2 text-xs font-black uppercase tracking-wider text-olive-800">
                <span className="ops-live-dot" />
                Operational state live
              </div>
              <button onClick={() => navigate('/activity')} className="inline-flex items-center gap-2 text-xs font-bold text-charcoal-600 hover:text-charcoal-900">
                {eventsLoading ? 'Syncing stream' : `${events.length} indexed events`} <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              <MiniMetric label="Total Inventory" value={formatNumber(totalUnits)} sub={`${summary?.totalSkus ?? inventory.length} SKUs`} />
              <MiniMetric label="At Risk" value={atRisk} sub="critical + reorder soon" accent={atRisk ? 'text-terracotta-700' : 'text-olive-700'} />
              <MiniMetric label="Reorder Pressure" value={`${Math.round(pressure)}%`} sub={`${reorders.length} recommendations`} accent="text-terracotta-700" />
              <MiniMetric label="Active Hubs" value={hubCount} sub={selectedLocation === 'ALL' ? 'network context' : activeHub?.city} />
              <MiniMetric label="Events" value={events.length} sub="OpenSearch stream" />
            </div>
          </div>
          <div className="ops-surface p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-charcoal-400">Current hub</p>
            <div className="mt-3 flex items-start justify-between gap-3">
              <div>
                <p className="text-2xl font-black text-charcoal-900">{activeHub?.city || 'Network Wide'}</p>
                <p className="text-xs text-charcoal-500">{activeHub?.name}</p>
              </div>
              <Warehouse className="h-6 w-6 text-charcoal-500" />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <button onClick={() => navigate('/inventory')} className="rounded-md border border-sand-400 bg-sand-100 p-3 text-left hover:bg-sand-200">
                <Boxes className="mb-2 h-4 w-4 text-charcoal-500" />
                <strong className="block text-charcoal-900">{inventory.length}</strong>
                Inventory rows
              </button>
              <button onClick={() => navigate('/reorders')} className="rounded-md border border-sand-400 bg-sand-100 p-3 text-left hover:bg-sand-200">
                <TrendingUp className="mb-2 h-4 w-4 text-terracotta-600" />
                <strong className="block text-charcoal-900">{reorders.length}</strong>
                Reorder signals
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <PulseChart trend={summary?.stockTrend} pressure={pressure} />
        <div className="ops-panel p-5">
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-charcoal-400">Fulfillment Network</p>
              <h2 className="mt-1 text-xl font-black text-charcoal-900">Change operational context</h2>
            </div>
            <Route className="h-5 w-5 text-charcoal-500" />
          </div>
          <div className="relative z-10 mt-4 space-y-2">
            <button onClick={() => onLocationChange('ALL')} className={`w-full rounded-md border px-3 py-3 text-left transition-all ${selectedLocation === 'ALL' ? 'border-charcoal-700 bg-sand-200' : 'border-sand-400 bg-sand-50 hover:bg-sand-100'}`}>
              <div className="flex items-center justify-between"><span className="font-bold text-charcoal-900">Network Wide</span><span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-400">All hubs</span></div>
            </button>
            {hubSummaries.map((hub) => (
              <button key={hub.id} onClick={() => onLocationChange(hub.id)} className={`w-full rounded-md border px-3 py-3 text-left transition-all hover:-translate-y-0.5 ${selectedLocation === hub.id ? 'border-charcoal-700 bg-sand-200 shadow-[inset_3px_0_0_#5A5349]' : 'border-sand-400 bg-sand-50 hover:bg-sand-100'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-charcoal-500" /><span className="font-bold text-charcoal-900">{hub.city}</span></div>
                    <p className="mt-0.5 truncate text-[11px] text-charcoal-500">{hub.name}</p>
                  </div>
                  <div className="text-right"><p className="text-sm font-black text-charcoal-900">{Math.round(hub.health)}%</p><p className="text-[10px] text-charcoal-400">healthy</p></div>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-sm bg-sand-300">
                  <div className={`ops-progress h-full ${hub.critical ? 'bg-terracotta-700' : hub.reorder ? 'bg-terracotta-500' : 'bg-olive-500'}`} style={{ width: `${Math.max(4, hub.health)}%` }} />
                </div>
                <div className="mt-3 grid grid-cols-4 gap-2 text-[10px] text-charcoal-500">
                  <span><strong className="block text-xs text-charcoal-900">{hub.skus}</strong>SKUs</span>
                  <span><strong className="block text-xs text-charcoal-900">{formatNumber(hub.units)}</strong>Stock</span>
                  <span><strong className="block text-xs text-terracotta-700">{hub.critical}</strong>Critical</span>
                  <span><strong className="block text-xs text-charcoal-900">{formatCurrency(hub.value)}</strong>Value</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_420px]">
        <AttentionSurface items={inventory} onSelect={setSelectedProduct} />
        <div className="space-y-6">
          <div className="ops-panel p-5">
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-charcoal-400">Live Event Activity</p>
                <h2 className="mt-1 text-xl font-black text-charcoal-900">Recent movement</h2>
              </div>
              <Zap className="h-5 w-5 text-terracotta-600" />
            </div>
            <div className="relative z-10 mt-4 space-y-2">
              {events.slice(0, 7).map((event, index) => (
                <div key={event.id} className="animate-rise-in rounded-md border border-sand-400 bg-sand-50 p-3" style={{ animationDelay: `${index * 45}ms` }}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0"><p className="text-xs font-black uppercase tracking-wider text-charcoal-900">{event.eventType.replace('_', ' ')}</p><p className="truncate font-mono text-[11px] text-charcoal-500">{event.sku} at {event.locationName}</p></div>
                    <span className={event.quantityChange < 0 ? 'font-black text-terracotta-700' : 'font-black text-olive-700'}>{event.quantityChange > 0 ? '+' : ''}{event.quantityChange}</span>
                  </div>
                  <p className="mt-1 text-[10px] text-charcoal-400">{formatRelativeTime(event.timestamp)}</p>
                </div>
              ))}
              {!events.length && <div className="rounded-md border border-sand-400 bg-sand-50 p-4 text-xs text-charcoal-500">No event stream results for this context yet.</div>}
            </div>
          </div>
          <div className="ops-panel p-5">
            <div className="relative z-10 flex items-center gap-3">
              {atRisk ? <AlertTriangle className="h-5 w-5 text-terracotta-700" /> : <CheckCircle2 className="h-5 w-5 text-olive-600" />}
              <div>
                <p className="text-sm font-black text-charcoal-900">{atRisk ? 'Attention required' : 'Network is inside guardrails'}</p>
                <p className="text-xs text-charcoal-500">{invLoading || reordersLoading || healthLoading ? 'Refreshing live inventory state.' : `${atRisk} SKUs need operational review.`}</p>
              </div>
            </div>
            <button onClick={() => navigate('/reorders')} className="relative z-10 mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-charcoal-900 px-4 py-3 text-sm font-bold text-sand-100 hover:bg-charcoal-800">
              Open Replenishment Intelligence <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {selectedProduct && (
        <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xl border-l border-sand-500 bg-sand-100 p-5 shadow-2xl animate-slide-right overflow-y-auto">
          <button onClick={() => setSelectedProduct(null)} className="mb-4 text-xs font-bold uppercase tracking-widest text-charcoal-500 hover:text-charcoal-900">Close context</button>
          <p className="text-[10px] font-black uppercase tracking-widest text-charcoal-400">Product context</p>
          <h2 className="mt-2 text-2xl font-black text-charcoal-900">{selectedProduct.name}</h2>
          <p className="font-mono text-xs text-charcoal-500">{selectedProduct.sku} / {selectedProduct.locationName}</p>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <MiniMetric label="Current Stock" value={selectedProduct.currentStock} />
            <MiniMetric label="Available" value={selectedProduct.availableStock} accent={selectedProduct.status === 'CRITICAL' ? 'text-terracotta-700' : 'text-charcoal-900'} />
            <MiniMetric label="Reorder Point" value={selectedProduct.reorderPoint} />
            <MiniMetric label="Days Left" value={`${selectedProduct.daysOfStock}d`} />
          </div>
          <div className="mt-5 rounded-lg border border-sand-400 bg-sand-50 p-4">
            <StatusBadge status={selectedProduct.status} />
            <p className="mt-3 text-sm text-charcoal-600">Safety stock is {selectedProduct.safetyStock} units. Daily demand is modeled at {selectedProduct.dailyDemand} units per day.</p>
          </div>
        </div>
      )}
    </PageContainer>
  );
};
