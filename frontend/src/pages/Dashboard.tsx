import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  Calendar,
  CheckCircle2,
  ChevronRight,
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
import { TiltCard3D } from '../components/common/TiltCard3D';
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
  { key: 'REORDER_SOON', label: 'Reorder Soon', tone: 'bg-terracotta-50 text-terracotta-800 border-terracotta-200' },
  { key: 'HEALTHY', label: 'Healthy', tone: 'bg-olive-50 text-olive-800 border-olive-200' },
  { key: 'OVERSTOCKED', label: 'Overstocked', tone: 'bg-sand-200 text-charcoal-700 border-sand-400' },
] as const;

/* ── Centerpiece Trend Chart ─────────────────────────────────────────────── */
const PulseChart: React.FC<{
  trend?: { date: string; totalStock: number; inboundUnits: number; outboundUnits: number }[];
  pressure: number;
}> = ({ trend = [], pressure }) => {
  const data = trend.length
    ? trend
    : Array.from({ length: 7 }, (_, i) => ({
        date: `D${i + 1}`,
        totalStock: 22 + i * 3.5,
        inboundUnits: 5 + (i % 3) * 2,
        outboundUnits: 4 + (i % 4),
      }));

  const max = Math.max(...data.flatMap((d) => [d.totalStock, d.inboundUnits * 4, d.outboundUnits * 4]), 1);
  const points = data
    .map((d, i) => {
      const x = 34 + i * (530 / Math.max(data.length - 1, 1));
      const y = 158 - (d.totalStock / max) * 112;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="ops-panel p-6 min-h-[360px] flex flex-col justify-between">
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="ops-live-dot" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-charcoal-500">
              Live Stock Trend & Movement
            </p>
          </div>
          <h2 className="mt-1 text-2xl font-black tracking-tight text-charcoal-900">
            Fulfillment Velocity & Stock Trajectory
          </h2>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5 font-semibold text-charcoal-700">
            <span className="w-2.5 h-2.5 rounded-sm bg-olive-500" /> Inbound
          </span>
          <span className="flex items-center gap-1.5 font-semibold text-charcoal-700">
            <span className="w-2.5 h-2.5 rounded-sm bg-terracotta-500" /> Outbound
          </span>
          <span className="flex items-center gap-1.5 font-semibold text-charcoal-700">
            <span className="w-3 h-0.5 bg-charcoal-700" /> Total Stock
          </span>
        </div>
      </div>

      <div className="relative z-10 my-4 h-48 rounded-lg border border-sand-400/80 bg-sand-200/60 p-3 overflow-hidden">
        <svg viewBox="0 0 600 190" className="h-full w-full" role="img" aria-label="Inventory movement trend">
          <defs>
            <linearGradient id="pulseFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#8C7A65" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#8C7A65" stopOpacity="0.01" />
            </linearGradient>
          </defs>
          {[0, 1, 2, 3].map((line) => (
            <line
              key={line}
              x1="24"
              x2="580"
              y1={38 + line * 38}
              y2={38 + line * 38}
              stroke="#D4C5B3"
              strokeDasharray="4 6"
            />
          ))}
          <polygon points={`34,170 ${points} 564,170`} fill="url(#pulseFill)" />
          <polyline
            points={points}
            fill="none"
            stroke="#272522"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="animate-draw-line"
          />
          {data.map((d, i) => {
            const x = 34 + i * (530 / Math.max(data.length - 1, 1));
            const inbound = Math.max(8, (d.inboundUnits / max) * 140);
            const outbound = Math.max(8, (d.outboundUnits / max) * 140);
            return (
              <g key={d.date}>
                <rect x={x - 10} y={166 - inbound} width="8" height={inbound} rx="2" fill="#6B7C3D" opacity=".8" />
                <rect x={x + 3} y={166 - outbound} width="8" height={outbound} rx="2" fill="#C6745A" opacity=".8" />
                <text x={x} y="184" textAnchor="middle" fontSize="10" fill="#6B655C" fontWeight="bold">
                  {d.date}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="relative z-10 grid grid-cols-2 gap-3 sm:grid-cols-4 border-t border-sand-300 pt-4">
        {[
          { label: 'Recent Inbound', value: `+${data.at(-1)?.inboundUnits ?? 0} units`, color: 'text-olive-700' },
          { label: 'Recent Outbound', value: `-${data.at(-1)?.outboundUnits ?? 0} units`, color: 'text-terracotta-700' },
          { label: 'At Risk Ratio', value: `${Math.round(pressure)}%`, color: pressure > 30 ? 'text-terracotta-700' : 'text-charcoal-900' },
          { label: 'Replenishment Load', value: `${Math.min(100, Math.round(pressure * 1.2))}%`, color: 'text-charcoal-900' },
        ].map((item) => (
          <div key={item.label} className="px-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-charcoal-400">{item.label}</p>
            <p className={`mt-0.5 text-base font-black ${item.color}`}>{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── Urgent Attention List ────────────────────────────────────────────────── */
const AttentionSurface: React.FC<{
  items: ProductInventory[];
  onSelect: (item: ProductInventory) => void;
}> = ({ items, onSelect }) => {
  const sorted = [...items]
    .sort((a, b) => (statusRank[a.status] ?? 9) - (statusRank[b.status] ?? 9) || a.daysOfStock - b.daysOfStock)
    .slice(0, 8);

  return (
    <div className="ops-panel">
      <div className="relative z-10 border-b border-sand-400 px-6 py-4 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-charcoal-400">Inventory Attention Queue</p>
          <h2 className="mt-0.5 text-xl font-black text-charcoal-900">Ranked by Operational Urgency</h2>
        </div>
        <PackageSearch className="h-5 w-5 text-charcoal-500" />
      </div>

      <div className="relative z-10 grid grid-cols-2 gap-px bg-sand-300 sm:grid-cols-4">
        {statusGroups.map((group) => (
          <div key={group.key} className="bg-sand-100 px-4 py-3 border-b border-sand-300">
            <span className={`inline-flex rounded border px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${group.tone}`}>
              {group.label}
            </span>
            <p className="mt-1.5 text-2xl font-black text-charcoal-900">
              {items.filter((item) => item.status === group.key).length}
            </p>
          </div>
        ))}
      </div>

      <div className="relative z-10 divide-y divide-sand-300">
        {sorted.map((item, index) => {
          const coverage = Math.min(100, Math.max(4, (item.availableStock / Math.max(item.reorderPoint + item.safetyStock, 1)) * 100));
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item)}
              className="ops-row group w-full px-6 py-3.5 text-left animate-rise-in flex items-center justify-between gap-4"
              style={{ animationDelay: `${index * 30}ms` }}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <StatusBadge status={item.status} size="sm" />
                  <span className="font-mono text-[10px] text-charcoal-500">{item.sku}</span>
                  <span className="text-[10px] text-charcoal-400">• {item.locationName}</span>
                </div>
                <p className="mt-0.5 truncate text-sm font-bold text-charcoal-900">{item.name}</p>
              </div>

              <div className="hidden sm:grid grid-cols-3 gap-4 w-[280px] text-xs">
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-charcoal-400">On Hand</p>
                  <p className="font-black text-charcoal-900">{item.availableStock}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-charcoal-400">ROP</p>
                  <p className="font-black text-charcoal-900">{item.reorderPoint}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-charcoal-400">Days</p>
                  <p className={item.daysOfStock < 3 ? 'font-black text-terracotta-700' : 'font-black text-charcoal-900'}>
                    {item.daysOfStock}d
                  </p>
                </div>
              </div>

              <div className="w-24 hidden md:block">
                <div className="h-2 w-full overflow-hidden rounded-sm bg-sand-300">
                  <div
                    className={`ops-progress h-full ${
                      item.status === 'CRITICAL'
                        ? 'bg-terracotta-700'
                        : item.status === 'REORDER_SOON'
                        ? 'bg-terracotta-500'
                        : item.status === 'OVERSTOCKED'
                        ? 'bg-charcoal-500'
                        : 'bg-olive-500'
                    }`}
                    style={{ width: `${coverage}%` }}
                  />
                </div>
              </div>

              <ChevronRight className="h-4 w-4 text-charcoal-400 transition-transform group-hover:translate-x-1 shrink-0" />
            </button>
          );
        })}
      </div>
    </div>
  );
};

/* ── Main Dashboard ───────────────────────────────────────────────────────── */
export const Dashboard: React.FC<DashboardProps> = ({ selectedLocation, onLocationChange }) => {
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductInventory | null>(null);
  const { summary, locations, error: healthError, refetch: refetchHealth } = useInventoryHealth(selectedLocation);
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
  const totalInventoryValue = summary?.totalValue ?? inventory.reduce((sum, item) => sum + item.currentStock * item.unitCost, 0);
  const atRisk = (summary?.criticalCount ?? 0) + (summary?.reorderSoonCount ?? 0);
  const pressure = inventory.length ? (atRisk / inventory.length) * 100 : 0;
  const hubCount = selectedLocation === 'ALL' ? locations.length : 1;
  const currentDate = new Intl.DateTimeFormat('en-IN', { weekday: 'short', month: 'short', day: 'numeric' }).format(new Date());

  const hubSummaries = useMemo(
    () =>
      LOCATIONS.filter((loc) => loc.id !== 'ALL').map((loc) => {
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
      }),
    [inventory, locations]
  );

  if (healthError) {
    return (
      <PageContainer>
        <ErrorState title="Unable to Load Dashboard" message={healthError} onRetry={handleRefresh} />
      </PageContainer>
    );
  }

  return (
    <PageContainer className="max-w-[1600px]">
      {/* Top Header */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="ops-live-dot" />
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-charcoal-400">
              INNVORA / CONTROL CENTER
            </p>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-charcoal-950">
            {activeHub?.id === 'ALL' ? 'Network Fulfillment Command' : `${activeHub?.city} Hub Command`}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-charcoal-600">
            Real-time stock trajectory, replenishment pressure, and active warehouse movement.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded border border-sand-400 bg-sand-100 px-3 py-2 text-xs font-semibold text-charcoal-600">
            <Calendar className="h-3.5 w-3.5 text-charcoal-400" />
            {currentDate}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            isLoading={isRefreshing}
            leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
          >
            Refresh Stream
          </Button>
        </div>
      </div>

      {/* ── Dominant KPI Canvas (Replaced the 5-box pattern) ── */}
      <section className="ops-panel mb-6 overflow-hidden">
        <div className="p-6 lg:p-8 bg-gradient-to-r from-sand-100 via-sand-200/50 to-sand-100">
          <div className="grid lg:grid-cols-[1.4fr_1fr] gap-8 items-center">
            {/* Dominant KPI */}
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <span className="text-[10px] font-black uppercase tracking-[0.22em] text-charcoal-400">
                  Total Active Inventory
                </span>
                <span className="text-[10px] font-bold text-olive-800 bg-olive-50 border border-olive-200 px-2 py-0.5 rounded">
                  Live Synced
                </span>
              </div>

              <div className="flex flex-wrap items-baseline gap-4">
                <span className="text-5xl sm:text-7xl font-black tracking-tight text-charcoal-950 font-mono">
                  {formatNumber(totalUnits)}
                </span>
                <span className="text-lg sm:text-xl font-bold text-charcoal-500">
                  units across {summary?.totalSkus ?? inventory.length} SKUs
                </span>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-charcoal-600">
                <span>
                  Gross Inventory Value:{' '}
                  <strong className="text-charcoal-900 font-bold">{formatCurrency(totalInventoryValue)}</strong>
                </span>
                <span>•</span>
                <span>
                  Context:{' '}
                  <strong className="text-charcoal-900 font-bold">
                    {activeHub?.id === 'ALL' ? '4 Regional Hubs' : activeHub?.name}
                  </strong>
                </span>
              </div>
            </div>

            {/* Context Switcher Hero Card */}
            <div className="p-5 rounded-lg border border-sand-400 bg-sand-100/90 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Warehouse className="w-4 h-4 text-charcoal-700" />
                  <span className="text-xs font-black uppercase tracking-wider text-charcoal-800">
                    Selected Node
                  </span>
                </div>
                <span className="text-[10px] font-bold text-charcoal-500 uppercase tracking-widest">
                  {activeHub?.id === 'ALL' ? 'Network Hubs' : activeHub?.id.toUpperCase()}
                </span>
              </div>

              <div className="my-3">
                <p className="text-2xl font-black text-charcoal-950">{activeHub?.city || 'Network Wide'}</p>
                <p className="text-xs text-charcoal-500 mt-0.5">{activeHub?.name}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-sand-300">
                <button
                  onClick={() => navigate('/inventory')}
                  className="flex items-center justify-between p-2 rounded bg-sand-200 hover:bg-sand-300 text-xs font-bold text-charcoal-800 transition-colors"
                >
                  <span>{inventory.length} SKUs</span>
                  <Boxes className="w-3.5 h-3.5 text-charcoal-500" />
                </button>
                <button
                  onClick={() => navigate('/reorders')}
                  className="flex items-center justify-between p-2 rounded bg-sand-200 hover:bg-sand-300 text-xs font-bold text-terracotta-700 transition-colors"
                >
                  <span>{reorders.length} Reorders</span>
                  <TrendingUp className="w-3.5 h-3.5 text-terracotta-600" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Supporting Context Metric Strip */}
        <div className="border-t border-sand-400 bg-sand-100/80 px-6 py-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="border-r border-sand-300 pr-3 last:border-0">
            <p className="text-[9px] font-black uppercase tracking-widest text-charcoal-400">At Risk SKUs</p>
            <p className={`mt-1 text-2xl font-black ${atRisk > 0 ? 'text-terracotta-700' : 'text-olive-700'}`}>
              {atRisk}
            </p>
            <p className="text-[10px] text-charcoal-500 mt-0.5">Critical & low buffers</p>
          </div>

          <div className="border-r border-sand-300 pr-3 last:border-0">
            <p className="text-[9px] font-black uppercase tracking-widest text-charcoal-400">Reorder Pressure</p>
            <p className="mt-1 text-2xl font-black text-terracotta-700">{Math.round(pressure)}%</p>
            <p className="text-[10px] text-charcoal-500 mt-0.5">{reorders.length} actions needed</p>
          </div>

          <div className="border-r border-sand-300 pr-3 last:border-0">
            <p className="text-[9px] font-black uppercase tracking-widest text-charcoal-400">Fulfillment Hubs</p>
            <p className="mt-1 text-2xl font-black text-charcoal-900">{hubCount}</p>
            <p className="text-[10px] text-charcoal-500 mt-0.5">{selectedLocation === 'ALL' ? 'Full cluster' : activeHub?.city}</p>
          </div>

          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-charcoal-400">Indexed Events</p>
            <p className="mt-1 text-2xl font-black text-charcoal-900">{events.length}</p>
            <p className="text-[10px] text-charcoal-500 mt-0.5">OpenSearch ledger</p>
          </div>
        </div>
      </section>

      {/* Center Layout: Chart + Interactive Hub Switcher */}
      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <PulseChart trend={summary?.stockTrend} pressure={pressure} />

        <div className="ops-panel p-6 flex flex-col justify-between">
          <div className="relative z-10 flex items-center justify-between border-b border-sand-300 pb-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-charcoal-400">
                Fulfillment Network
              </p>
              <h2 className="mt-0.5 text-xl font-black text-charcoal-900">Change Context</h2>
            </div>
            <Route className="h-5 w-5 text-charcoal-500" />
          </div>

          <div className="relative z-10 my-3 space-y-2.5">
            <button
              onClick={() => onLocationChange('ALL')}
              className={`w-full rounded-md border px-4 py-3 text-left transition-all ${
                selectedLocation === 'ALL'
                  ? 'border-charcoal-900 bg-sand-200 border-l-4 border-l-charcoal-900 shadow-sm'
                  : 'border-sand-400 bg-sand-50 hover:bg-sand-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-charcoal-900">Network Wide</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-500 bg-sand-300 px-2 py-0.5 rounded">
                  All 4 Hubs
                </span>
              </div>
            </button>

            {hubSummaries.map((hub) => (
              <button
                key={hub.id}
                onClick={() => onLocationChange(hub.id)}
                className={`w-full rounded-md border px-4 py-3 text-left transition-all ${
                  selectedLocation === hub.id
                    ? 'border-charcoal-900 bg-sand-200 border-l-4 border-l-charcoal-900 shadow-sm'
                    : 'border-sand-400 bg-sand-50 hover:bg-sand-100'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-charcoal-600" />
                      <span className="font-bold text-sm text-charcoal-900">{hub.city}</span>
                    </div>
                    <p className="mt-0.5 truncate text-[11px] text-charcoal-500">{hub.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-charcoal-900">{Math.round(hub.health)}%</p>
                    <p className="text-[9px] uppercase font-bold text-charcoal-400">healthy</p>
                  </div>
                </div>

                <div className="mt-2.5 h-1.5 overflow-hidden rounded-sm bg-sand-300">
                  <div
                    className={`ops-progress h-full ${
                      hub.critical ? 'bg-terracotta-700' : hub.reorder ? 'bg-terracotta-500' : 'bg-olive-500'
                    }`}
                    style={{ width: `${Math.max(4, hub.health)}%` }}
                  />
                </div>
              </button>
            ))}
          </div>

          <div className="relative z-10 pt-3 border-t border-sand-300 flex items-center justify-between text-xs text-charcoal-500">
            <span>Dynamic AWS SQS Routing</span>
            <span className="ops-live-dot" />
          </div>
        </div>
      </div>

      {/* Bottom Grid: Urgency Attention + Live Event Stream */}
      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_420px]">
        <AttentionSurface items={inventory} onSelect={setSelectedProduct} />

        <div className="space-y-6">
          {/* Live Activity Stream */}
          <div className="ops-panel p-6">
            <div className="relative z-10 flex items-center justify-between border-b border-sand-300 pb-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-charcoal-400">
                  Live Event Feed
                </p>
                <h2 className="mt-0.5 text-xl font-black text-charcoal-900">Recent Movements</h2>
              </div>
              <Zap className="h-5 w-5 text-terracotta-600" />
            </div>

            <div className="relative z-10 mt-4 space-y-2.5">
              {events.slice(0, 6).map((event, index) => {
                const isSale = event.eventType === 'SALE';
                const isRestock = event.eventType === 'RESTOCK';
                const isPositive = event.quantityChange > 0;
                return (
                  <div
                    key={event.id}
                    className="animate-rise-in rounded-md border border-sand-400/80 bg-sand-50 p-3"
                    style={{ animationDelay: `${index * 40}ms` }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                              isSale
                                ? 'bg-terracotta-100 text-terracotta-800 border-terracotta-200'
                                : isRestock
                                ? 'bg-olive-100 text-olive-800 border-olive-200'
                                : 'bg-sand-200 text-charcoal-700 border-sand-400'
                            }`}
                          >
                            {event.eventType.replace('_', ' ')}
                          </span>
                          <span className="truncate font-mono text-[11px] text-charcoal-600 font-semibold">
                            {event.sku}
                          </span>
                        </div>
                        <p className="text-[10px] text-charcoal-400 mt-1 truncate">
                          {event.locationName} • {formatRelativeTime(event.timestamp)}
                        </p>
                      </div>
                      <span
                        className={`font-mono text-sm font-black ${
                          isPositive ? 'text-olive-700' : 'text-terracotta-700'
                        }`}
                      >
                        {isPositive ? `+${event.quantityChange}` : event.quantityChange}
                      </span>
                    </div>
                  </div>
                );
              })}

              {!events.length && (
                <div className="rounded-md border border-sand-400 bg-sand-50 p-4 text-xs text-charcoal-500 text-center">
                  No event stream results for this context yet.
                </div>
              )}
            </div>

            <button
              onClick={() => navigate('/activity')}
              className="relative z-10 mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded border border-sand-400 bg-sand-100 hover:bg-sand-200 text-xs font-bold text-charcoal-800 transition-colors"
            >
              View Full Event Ledger <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Replenishment Intelligence Prompt */}
          <div className="ops-panel p-6">
            <div className="relative z-10 flex items-start gap-3">
              {atRisk ? (
                <AlertTriangle className="h-5 w-5 text-terracotta-700 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="h-5 w-5 text-olive-600 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="text-sm font-black text-charcoal-900">
                  {atRisk ? 'Operational Action Recommended' : 'Stock Guardrails Intact'}
                </p>
                <p className="text-xs text-charcoal-500 mt-1">
                  {invLoading || reordersLoading
                    ? 'Computing demand buffers across network...'
                    : `${atRisk} SKUs are trending toward stockout. Automated purchase orders are drafted.`}
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/reorders')}
              className="relative z-10 mt-4 inline-flex w-full items-center justify-center gap-2 rounded bg-charcoal-900 px-4 py-3 text-xs font-bold text-sand-100 hover:bg-charcoal-800 transition-colors"
            >
              Open Replenishment Intelligence <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Product Detail Drawer */}
      {selectedProduct && (
        <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg border-l border-sand-400 bg-sand-100 p-6 shadow-2xl animate-slide-right overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-charcoal-400">Product Context</span>
            <button
              onClick={() => setSelectedProduct(null)}
              className="text-xs font-bold uppercase tracking-wider text-charcoal-500 hover:text-charcoal-900"
            >
              Close
            </button>
          </div>

          <h2 className="text-2xl font-black text-charcoal-900">{selectedProduct.name}</h2>
          <p className="font-mono text-xs text-charcoal-500 mt-1">
            {selectedProduct.sku} • {selectedProduct.locationName}
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="p-3 bg-sand-200 rounded border border-sand-300">
              <p className="text-[9px] uppercase font-bold text-charcoal-400">Current Stock</p>
              <p className="text-xl font-black text-charcoal-900 mt-1">{selectedProduct.currentStock}</p>
            </div>
            <div className="p-3 bg-sand-200 rounded border border-sand-300">
              <p className="text-[9px] uppercase font-bold text-charcoal-400">Available</p>
              <p className="text-xl font-black text-charcoal-900 mt-1">{selectedProduct.availableStock}</p>
            </div>
            <div className="p-3 bg-sand-200 rounded border border-sand-300">
              <p className="text-[9px] uppercase font-bold text-charcoal-400">Reorder Point</p>
              <p className="text-xl font-black text-charcoal-900 mt-1">{selectedProduct.reorderPoint}</p>
            </div>
            <div className="p-3 bg-sand-200 rounded border border-sand-300">
              <p className="text-[9px] uppercase font-bold text-charcoal-400">Days of Stock</p>
              <p
                className={`text-xl font-black mt-1 ${
                  selectedProduct.daysOfStock < 3 ? 'text-terracotta-700' : 'text-charcoal-900'
                }`}
              >
                {selectedProduct.daysOfStock}d
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-lg border border-sand-300 bg-sand-50 p-4">
            <StatusBadge status={selectedProduct.status} />
            <p className="mt-3 text-xs text-charcoal-600 leading-relaxed">
              Calculated safety stock buffer is {selectedProduct.safetyStock} units. Daily velocity modeled at{' '}
              {selectedProduct.dailyDemand} units/day. Lead time with supplier is {selectedProduct.supplier?.leadTimeDays || 7} days.
            </p>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={() => {
                setSelectedProduct(null);
                navigate('/reorders');
              }}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-sand-100 bg-charcoal-900 rounded hover:bg-charcoal-800"
            >
              Check Reorder Status <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </PageContainer>
  );
};
