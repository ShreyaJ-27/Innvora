import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Warehouse,
  BarChart3,
  MapPin,
  Zap,
  Search,
  RefreshCw,
  Package,
  TrendingUp,
  ChevronDown,
  Activity,
  Database,
  Shield,
  Clock,
} from 'lucide-react';

// ─── Landing Nav ───────────────────────────────────────────────────────────────
const LandingNav: React.FC<{ onEnter: () => void }> = ({ onEnter }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 border-b border-sand-400 flex items-center justify-between px-6 sm:px-10 h-14"
      style={{ backgroundColor: 'rgba(242, 236, 226, 0.96)', backdropFilter: 'blur(8px)' }}
    >
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-charcoal-900 flex items-center justify-center">
          <Warehouse className="w-3.5 h-3.5 text-sand-200" />
        </div>
        <span className="font-bold text-charcoal-900 text-sm tracking-tight">Innvora</span>
      </div>

      {/* Desktop nav links */}
      <div className="hidden md:flex items-center gap-6 text-xs font-medium text-charcoal-500">
        <a href="#features" className="hover:text-charcoal-900 transition-colors">Features</a>
        <a href="#how-it-works" className="hover:text-charcoal-900 transition-colors">How It Works</a>
        <a href="#aws" className="hover:text-charcoal-900 transition-colors">Architecture</a>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onEnter}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-charcoal-900 text-sand-100 text-xs font-semibold rounded-lg hover:bg-charcoal-800 transition-colors"
        >
          Open Control Center
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </nav>
  );
};

// ─── Hero Section ──────────────────────────────────────────────────────────────
const HeroSection: React.FC<{ onEnter: () => void }> = ({ onEnter }) => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden" style={{ backgroundColor: '#E9E0D2' }}>
      {/* Background image — right side */}
      <div className="absolute inset-0">
        <img
          src="/images/warehouse-hero.jpg"
          alt="Warehouse operations"
          className="w-full h-full object-cover object-center"
          style={{ opacity: 0.25 }}
        />
        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to right, rgba(233,224,210,0.99) 0%, rgba(233,224,210,0.95) 35%, rgba(233,224,210,0.7) 65%, rgba(233,224,210,0.3) 100%)',
          }}
        />
      </div>

      <div className="relative z-10 max-w-screen-xl mx-auto px-6 sm:px-10 lg:px-16 pt-24 pb-16 grid lg:grid-cols-2 gap-12 items-center">
        {/* Left: headline */}
        <div className="animate-fade-in-up">
          <p className="text-[10px] font-bold tracking-widest uppercase text-charcoal-400 mb-4">
            Inventory Operations Platform
          </p>
          <h1 className="text-5xl sm:text-6xl font-extrabold text-charcoal-900 leading-[1.05] tracking-tight mb-6">
            Know what
            <br />
            you have.
            <br />
            <span className="text-charcoal-500">Know what</span>
            <br />
            needs action.
          </h1>
          <p className="text-base text-charcoal-600 leading-relaxed mb-8 max-w-md">
            Real-time inventory operations and intelligent replenishment
            for independent retailers, warehouse teams, and
            multi-channel D2C businesses.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onEnter}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-charcoal-900 text-sand-100 text-sm font-semibold rounded-lg hover:bg-charcoal-800 active:bg-charcoal-900 transition-colors"
              id="hero-cta-primary"
            >
              Open Control Center
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 text-charcoal-700 text-sm font-medium rounded-lg border border-sand-500 hover:bg-sand-200 transition-colors"
              id="hero-cta-secondary"
            >
              See How It Works
              <ChevronDown className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Right: Operational data panel */}
        <div className="hidden lg:block animate-slide-right">
          <div
            className="rounded-xl border border-sand-400 overflow-hidden"
            style={{ backgroundColor: 'rgba(248,244,236,0.92)', boxShadow: '0 8px 32px rgba(39,37,34,0.12)' }}
          >
            {/* Panel header */}
            <div className="px-5 py-3.5 border-b border-sand-300 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-charcoal-900 flex items-center justify-center">
                  <BarChart3 className="w-3 h-3 text-sand-200" />
                </div>
                <span className="text-xs font-semibold text-charcoal-800">Inventory Operations</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-olive-400 animate-pulse" />
                <span className="text-[10px] text-charcoal-400 font-medium">Live</span>
              </div>
            </div>

            {/* Metrics band */}
            <div className="grid grid-cols-2 gap-px bg-sand-300">
              {[
                { label: 'Total SKUs', value: '47', sub: 'across 4 hubs' },
                { label: 'Inventory Value', value: '₹2.4L', sub: 'in stock' },
                { label: 'At Risk', value: '8', sub: 'need action', warn: true },
                { label: 'Reorder Soon', value: '5', sub: 'within 3 days', amber: true },
              ].map((m) => (
                <div key={m.label} className="bg-sand-100 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-charcoal-400 mb-1">{m.label}</p>
                  <p className={`text-2xl font-extrabold leading-none ${m.warn ? 'text-terracotta-700' : m.amber ? 'text-terracotta-500' : 'text-charcoal-900'}`}>
                    {m.value}
                  </p>
                  <p className="text-[11px] text-charcoal-400 mt-0.5">{m.sub}</p>
                </div>
              ))}
            </div>

            {/* Events feed */}
            <div className="p-4 space-y-2.5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-charcoal-400 mb-3">Recent Events</p>
              {[
                { type: 'SALE', sku: 'PROD-EAR-01', loc: 'Mumbai', qty: '-12', color: 'text-terracotta-600' },
                { type: 'RESTOCK', sku: 'PROD-CHG-02', loc: 'Delhi NCR', qty: '+50', color: 'text-olive-600' },
                { type: 'CRITICAL', sku: 'PROD-SPK-04', loc: 'Bengaluru', qty: '8 left', color: 'text-terracotta-700' },
              ].map((e, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-sand-200 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                      e.type === 'SALE' ? 'bg-terracotta-50 text-terracotta-700 border-terracotta-200' :
                      e.type === 'RESTOCK' ? 'bg-olive-50 text-olive-700 border-olive-200' :
                      'bg-terracotta-100 text-terracotta-800 border-terracotta-300'
                    }`}>{e.type}</span>
                    <div>
                      <p className="text-xs font-medium text-charcoal-800">{e.sku}</p>
                      <p className="text-[10px] text-charcoal-400">{e.loc}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-bold ${e.color}`}>{e.qty}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 animate-bounce">
        <ChevronDown className="w-5 h-5 text-charcoal-400" />
      </div>
    </section>
  );
};

// ─── Stats Band ─────────────────────────────────────────────────────────────
const StatsBand: React.FC = () => (
  <section className="border-y border-sand-400" style={{ backgroundColor: '#F8F4EC' }}>
    <div className="max-w-screen-xl mx-auto px-6 sm:px-10 lg:px-16 py-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0 md:divide-x divide-sand-400">
        {[
          { num: '4', unit: 'Hubs', label: 'Fulfillment locations tracked' },
          { num: '47+', unit: 'SKUs', label: 'Products monitored in real time' },
          { num: '<2s', unit: 'Latency', label: 'Event-to-dashboard update' },
          { num: '100%', unit: 'AWS', label: 'Serverless event-driven stack' },
        ].map((s) => (
          <div key={s.label} className="md:px-8 first:pl-0 last:pr-0">
            <div className="flex items-baseline gap-1.5 mb-1">
              <span className="text-3xl font-extrabold text-charcoal-900">{s.num}</span>
              <span className="text-sm font-semibold text-charcoal-500">{s.unit}</span>
            </div>
            <p className="text-xs text-charcoal-400">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// ─── Value Proposition ────────────────────────────────────────────────────────
const ValueSection: React.FC = () => (
  <section id="features" className="py-20 px-6 sm:px-10 lg:px-16 max-w-screen-xl mx-auto">
    <div className="mb-12">
      <p className="text-[10px] font-bold tracking-widest uppercase text-charcoal-400 mb-3">What Innvora Does</p>
      <h2 className="text-3xl font-bold text-charcoal-900 leading-tight max-w-xl">
        Operational visibility across your entire inventory network.
      </h2>
    </div>

    <div className="grid md:grid-cols-3 gap-6">
      {[
        {
          icon: <BarChart3 className="w-5 h-5" />,
          title: 'Real-Time Inventory Visibility',
          description: 'See every SKU, at every location, updated the moment a transaction is recorded. Stock levels, reserved quantities, and days of coverage — all in one operational view.',
        },
        {
          icon: <TrendingUp className="w-5 h-5" />,
          title: 'Replenishment Intelligence',
          description: 'Deterministic reorder recommendations based on current stock, daily demand, supplier lead times, and safety stock buffers. No guessing. Actionable signals only.',
        },
        {
          icon: <MapPin className="w-5 h-5" />,
          title: 'Multi-Location Operations',
          description: 'Manage inventory across Mumbai, Delhi NCR, Bengaluru, and Hyderabad simultaneously. Location-level health scores, stock distribution, and critical alerts — per hub.',
        },
      ].map((f) => (
        <div key={f.title} className="bg-sand-100 border border-sand-400 rounded-xl p-6" style={{ boxShadow: '0 1px 3px rgba(39,37,34,0.06)' }}>
          <div className="w-9 h-9 rounded-lg bg-sand-300 flex items-center justify-center text-charcoal-700 mb-4">
            {f.icon}
          </div>
          <h3 className="text-sm font-semibold text-charcoal-900 mb-2">{f.title}</h3>
          <p className="text-sm text-charcoal-500 leading-relaxed">{f.description}</p>
        </div>
      ))}
    </div>
  </section>
);

// ─── Inventory Visibility Section ─────────────────────────────────────────────
const InventorySection: React.FC = () => (
  <section className="py-20 border-t border-sand-400" style={{ backgroundColor: '#F8F4EC' }}>
    <div className="max-w-screen-xl mx-auto px-6 sm:px-10 lg:px-16">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <p className="text-[10px] font-bold tracking-widest uppercase text-charcoal-400 mb-3">Inventory Visibility</p>
          <h2 className="text-3xl font-bold text-charcoal-900 leading-tight mb-4">
            Where is your stock?
            <br />
            How much is available?
          </h2>
          <p className="text-sm text-charcoal-500 leading-relaxed mb-6">
            Every SKU across every fulfillment hub is tracked from the moment an inventory event occurs.
            Sales, restocks, transfers, returns — all update the operational state in real time through
            the event-driven SQS pipeline.
          </p>
          <div className="space-y-3">
            {[
              'On-hand, reserved, and available quantity per SKU',
              'Per-location inventory health classification',
              'Visual stock level indicators and coverage days',
              'Instant filter by location, health status, or SKU',
            ].map((item) => (
              <div key={item} className="flex items-center gap-2.5">
                <span className="w-4 h-4 rounded-full bg-olive-100 border border-olive-200 flex items-center justify-center shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-olive-500" />
                </span>
                <span className="text-sm text-charcoal-700">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stock health mockup */}
        <div className="bg-sand-200 rounded-xl border border-sand-400 overflow-hidden">
          <div className="px-5 py-3 border-b border-sand-400 flex items-center justify-between">
            <span className="text-xs font-semibold text-charcoal-800">Stock Health — Mumbai Hub</span>
            <span className="text-[10px] font-bold text-olive-600 bg-olive-50 border border-olive-200 px-1.5 py-0.5 rounded uppercase tracking-wider">Live</span>
          </div>
          <div className="divide-y divide-sand-400">
            {[
              { sku: 'PROD-EAR-01', name: 'Noise Cancelling Earbuds', qty: 320, status: 'HEALTHY', days: 64 },
              { sku: 'PROD-CHG-02', name: '65W GaN Wall Charger', qty: 45, status: 'REORDER_SOON', days: 9 },
              { sku: 'PROD-SPK-04', name: 'Portable BT Speaker', qty: 8, status: 'CRITICAL', days: 1.6 },
              { sku: 'PROD-KBD-06', name: 'RGB Mechanical Keyboard', qty: 512, status: 'OVERSTOCKED', days: 102 },
            ].map((row) => (
              <div key={row.sku} className="flex items-center justify-between px-5 py-3.5 hover:bg-sand-100 transition-colors">
                <div>
                  <p className="text-xs font-mono text-charcoal-500">{row.sku}</p>
                  <p className="text-sm font-medium text-charcoal-900">{row.name}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-bold text-charcoal-900">{row.qty}</p>
                    <p className="text-[10px] text-charcoal-400">{row.days}d left</p>
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                    row.status === 'HEALTHY' ? 'bg-olive-50 text-olive-700 border-olive-200' :
                    row.status === 'REORDER_SOON' ? 'bg-terracotta-50 text-terracotta-700 border-terracotta-200' :
                    row.status === 'CRITICAL' ? 'bg-terracotta-100 text-terracotta-800 border-terracotta-300' :
                    'bg-sand-100 text-charcoal-600 border-sand-400'
                  }`}>{row.status.replace('_', ' ')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);

// ─── Smart Replenishment Section ─────────────────────────────────────────────
const ReplenishmentSection: React.FC = () => (
  <section id="how-it-works" className="py-20 px-6 sm:px-10 lg:px-16 max-w-screen-xl mx-auto">
    <div className="grid lg:grid-cols-2 gap-12 items-center">
      {/* Reorder card mockup */}
      <div className="bg-sand-100 border border-sand-400 rounded-xl overflow-hidden order-2 lg:order-1" style={{ boxShadow: '0 1px 3px rgba(39,37,34,0.06)' }}>
        <div className="px-5 py-3.5 border-b border-sand-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-charcoal-800">Replenishment Intelligence</p>
              <p className="text-[11px] text-charcoal-400">3 recommendations require immediate action</p>
            </div>
            <span className="text-[10px] font-bold bg-terracotta-50 text-terracotta-700 border border-terracotta-200 px-1.5 py-0.5 rounded uppercase tracking-wider">3 Critical</span>
          </div>
        </div>

        {/* Reorder card */}
        <div className="p-5 border-b border-sand-200">
          <div className="flex items-start justify-between mb-3">
            <div>
              <span className="text-[10px] font-bold bg-terracotta-100 text-terracotta-800 border border-terracotta-300 px-1.5 py-0.5 rounded uppercase tracking-wider">Critical</span>
              <p className="text-sm font-semibold text-charcoal-900 mt-1.5">65W GaN Wall Charger</p>
              <p className="text-xs text-charcoal-400 font-mono">PROD-CHG-02 · Delhi NCR Hub</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-extrabold text-terracotta-700">1.8d</p>
              <p className="text-[10px] text-charcoal-400">remaining</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center border-t border-sand-200 pt-3">
            {[
              { label: 'On Hand', val: '45' },
              { label: 'Daily Demand', val: '25' },
              { label: 'Lead Time', val: '7d' },
            ].map((m) => (
              <div key={m.label}>
                <p className="text-xs font-bold text-charcoal-900">{m.val}</p>
                <p className="text-[10px] text-charcoal-400">{m.label}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-sand-200 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-charcoal-400">Recommended Order</p>
              <p className="text-sm font-bold text-charcoal-900">250 units · ₹5,625</p>
            </div>
            <button className="text-[11px] font-semibold text-charcoal-600 border border-sand-400 rounded-lg px-3 py-1.5 hover:bg-sand-200 transition-colors">
              Why reorder? →
            </button>
          </div>
        </div>
      </div>

      <div className="order-1 lg:order-2">
        <p className="text-[10px] font-bold tracking-widest uppercase text-charcoal-400 mb-3">Replenishment Intelligence</p>
        <h2 className="text-3xl font-bold text-charcoal-900 leading-tight mb-4">
          What needs to be
          <br />
          ordered — and why.
        </h2>
        <p className="text-sm text-charcoal-500 leading-relaxed mb-6">
          Innvora calculates reorder urgency from real operational data: current stock,
          daily demand velocity, supplier lead times, and safety stock buffers.
          Every recommendation comes with a transparent explanation.
        </p>
        <div className="space-y-3">
          {[
            'Critical / Reorder Soon / Healthy / Overstocked classification',
            'Recommended quantity based on lead time demand',
            '"Why reorder?" reasoning panel per SKU',
            'Batch purchase order export workflow',
          ].map((item) => (
            <div key={item} className="flex items-center gap-2.5">
              <span className="w-4 h-4 rounded-full bg-terracotta-50 border border-terracotta-200 flex items-center justify-center shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-terracotta-500" />
              </span>
              <span className="text-sm text-charcoal-700">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

// ─── Multi-Location Section ────────────────────────────────────────────────────
const LocationSection: React.FC = () => (
  <section className="py-20 border-t border-sand-400" style={{ backgroundColor: '#F8F4EC' }}>
    <div className="max-w-screen-xl mx-auto px-6 sm:px-10 lg:px-16">
      <div className="mb-10">
        <p className="text-[10px] font-bold tracking-widest uppercase text-charcoal-400 mb-3">Fulfillment Network</p>
        <h2 className="text-3xl font-bold text-charcoal-900 leading-tight max-w-xl">
          Every hub. Every SKU. One view.
        </h2>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { city: 'Mumbai', name: 'Central Fulfillment', skus: 18, value: '₹68K', health: 89 },
          { city: 'Delhi NCR', name: 'Logistics Hub', skus: 22, value: '₹1.1L', health: 72 },
          { city: 'Bengaluru', name: 'Tech Park Warehouse', skus: 15, value: '₹52K', health: 94 },
          { city: 'Hyderabad', name: 'Regional Depot', skus: 12, value: '₹31K', health: 81 },
        ].map((hub) => (
          <div key={hub.city} className="bg-sand-200 border border-sand-400 rounded-xl p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <MapPin className="w-3.5 h-3.5 text-charcoal-500" />
                  <span className="text-xs font-bold text-charcoal-800">{hub.city}</span>
                </div>
                <p className="text-[10px] text-charcoal-400">{hub.name}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-charcoal-900">{hub.health}%</p>
                <p className="text-[10px] text-charcoal-400">healthy</p>
              </div>
            </div>

            {/* Health bar */}
            <div className="h-1 bg-sand-400 rounded-full mb-3">
              <div
                className={`h-full rounded-full ${hub.health > 85 ? 'bg-olive-500' : hub.health > 70 ? 'bg-terracotta-400' : 'bg-terracotta-600'}`}
                style={{ width: `${hub.health}%` }}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-charcoal-900">{hub.skus}</p>
                <p className="text-[10px] text-charcoal-400">SKUs</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-charcoal-900">{hub.value}</p>
                <p className="text-[10px] text-charcoal-400">in stock</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// ─── Event History Section ─────────────────────────────────────────────────────
const EventSection: React.FC = () => (
  <section className="py-20 px-6 sm:px-10 lg:px-16 max-w-screen-xl mx-auto">
    <div className="grid lg:grid-cols-2 gap-12 items-center">
      <div>
        <p className="text-[10px] font-bold tracking-widest uppercase text-charcoal-400 mb-3">Event History & Search</p>
        <h2 className="text-3xl font-bold text-charcoal-900 leading-tight mb-4">
          Every stock movement,
          <br />
          searchable and indexed.
        </h2>
        <p className="text-sm text-charcoal-500 leading-relaxed mb-6">
          Every sale, restock, transfer, adjustment, and return is captured as an inventory event,
          indexed by Amazon OpenSearch, and queryable by SKU, location, event type, or date.
          Complete audit trail. Zero data loss.
        </p>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-sand-200 border border-sand-400 rounded-lg">
            <Search className="w-3.5 h-3.5 text-charcoal-500" />
            <span className="text-xs text-charcoal-500">Search events by SKU, type, location…</span>
          </div>
        </div>
      </div>

      {/* Event stream */}
      <div className="bg-sand-100 border border-sand-400 rounded-xl overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(39,37,34,0.06)' }}>
        <div className="px-5 py-3.5 border-b border-sand-300 flex items-center justify-between">
          <span className="text-xs font-semibold text-charcoal-800">Activity Stream</span>
          <Activity className="w-4 h-4 text-charcoal-400" />
        </div>
        <div className="divide-y divide-sand-200">
          {[
            { type: 'SALE', sku: 'PROD-EAR-01', loc: 'Mumbai', qty: '-12', time: '2 min ago', color: 'terracotta' },
            { type: 'RESTOCK', sku: 'PROD-CHG-02', loc: 'Delhi NCR', qty: '+50', time: '18 min ago', color: 'olive' },
            { type: 'TRANSFER_IN', sku: 'PROD-PWR-03', loc: 'Bengaluru', qty: '+25', time: '1h ago', color: 'sand' },
            { type: 'ADJUSTMENT', sku: 'PROD-MOU-07', loc: 'Hyderabad', qty: '-3', time: '2h ago', color: 'sand' },
            { type: 'RETURN', sku: 'PROD-SPK-04', loc: 'Mumbai', qty: '+2', time: '3h ago', color: 'olive' },
          ].map((ev, i) => (
            <div key={i} className="flex items-center gap-3 px-5 py-3 hover:bg-sand-50 transition-colors">
              <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border shrink-0 ${
                ev.color === 'terracotta' ? 'bg-terracotta-50 text-terracotta-700 border-terracotta-200' :
                ev.color === 'olive' ? 'bg-olive-50 text-olive-700 border-olive-200' :
                'bg-sand-200 text-charcoal-600 border-sand-400'
              }`}>{ev.type.replace('_', ' ')}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-mono text-charcoal-600 truncate">{ev.sku}</p>
                <p className="text-[10px] text-charcoal-400">{ev.loc}</p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-bold ${ev.color === 'terracotta' ? 'text-terracotta-600' : 'text-olive-600'}`}>{ev.qty}</p>
                <p className="text-[10px] text-charcoal-400">{ev.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

// ─── AWS Architecture Section ─────────────────────────────────────────────────
const AWSSection: React.FC = () => (
  <section id="aws" className="py-20 border-t border-sand-400" style={{ backgroundColor: '#F8F4EC' }}>
    <div className="max-w-screen-xl mx-auto px-6 sm:px-10 lg:px-16">
      <div className="mb-10">
        <p className="text-[10px] font-bold tracking-widest uppercase text-charcoal-400 mb-3">Infrastructure</p>
        <h2 className="text-3xl font-bold text-charcoal-900 leading-tight max-w-xl">
          Built on AWS. Event-driven. Production-grade.
        </h2>
      </div>

      {/* Flow diagram */}
      <div className="bg-sand-200 border border-sand-400 rounded-xl p-6 mb-10 overflow-x-auto">
        <div className="flex items-center gap-2 min-w-max flex-nowrap">
          {[
            { label: 'Inventory Event', icon: <Zap className="w-3.5 h-3.5" />, sub: 'REST API call' },
            { label: 'API Gateway', icon: <Shield className="w-3.5 h-3.5" />, sub: 'AWS' },
            { label: 'Lambda', icon: <Zap className="w-3.5 h-3.5" />, sub: 'Receiver' },
            { label: 'SQS', icon: <Activity className="w-3.5 h-3.5" />, sub: 'Queue' },
            { label: 'Lambda', icon: <Zap className="w-3.5 h-3.5" />, sub: 'Processor' },
            { label: 'DynamoDB', icon: <Database className="w-3.5 h-3.5" />, sub: 'State Store' },
            { label: 'OpenSearch', icon: <Search className="w-3.5 h-3.5" />, sub: 'Event Index' },
            { label: 'Dashboard', icon: <BarChart3 className="w-3.5 h-3.5" />, sub: 'Innvora' },
          ].map((node, i, arr) => (
            <React.Fragment key={node.label + i}>
              <div className="flex flex-col items-center gap-1">
                <div className="w-10 h-10 rounded-lg bg-charcoal-800 flex items-center justify-center text-sand-200">
                  {node.icon}
                </div>
                <p className="text-[10px] font-semibold text-charcoal-800 text-center whitespace-nowrap">{node.label}</p>
                <p className="text-[9px] text-charcoal-400 text-center whitespace-nowrap">{node.sub}</p>
              </div>
              {i < arr.length - 1 && (
                <ArrowRight className="w-4 h-4 text-charcoal-400 shrink-0 mb-4" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* AWS Services grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          {
            service: 'API Gateway',
            role: 'Inventory event ingestion endpoint',
            desc: 'Receives inventory events via REST API. Handles auth, throttling, and routing to backend Lambdas.',
          },
          {
            service: 'AWS Lambda',
            role: 'Serverless compute backbone',
            desc: 'Two Lambda functions: one for event ingestion, one for async processing. Scales to zero when idle.',
          },
          {
            service: 'Amazon SQS',
            role: 'Decoupled event queue',
            desc: 'Buffers inventory events between the receiver and processor. Provides durability and retry logic.',
          },
          {
            service: 'Amazon DynamoDB',
            role: 'Inventory state store',
            desc: 'Stores current inventory levels per product per location. Atomic updates via conditional writes.',
          },
          {
            service: 'Amazon OpenSearch',
            role: 'Event search and history',
            desc: 'Indexes every inventory event for full-text search by SKU, location, event type, and date range.',
          },
          {
            service: 'Amazon VPC + IAM',
            role: 'Network isolation and access control',
            desc: 'OpenSearch cluster runs in a private VPC. IAM roles enforce least-privilege access between services.',
          },
        ].map((s) => (
          <div key={s.service} className="bg-sand-100 border border-sand-400 rounded-xl p-5" style={{ boxShadow: '0 1px 3px rgba(39,37,34,0.06)' }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-md bg-charcoal-900 flex items-center justify-center">
                <Database className="w-3 h-3 text-sand-200" />
              </div>
              <span className="text-xs font-bold text-charcoal-900">{s.service}</span>
            </div>
            <p className="text-[10px] font-semibold text-charcoal-500 mb-2 uppercase tracking-wider">{s.role}</p>
            <p className="text-xs text-charcoal-500 leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// ─── Who It's For ─────────────────────────────────────────────────────────────
const AudienceSection: React.FC = () => (
  <section className="py-20 px-6 sm:px-10 lg:px-16 max-w-screen-xl mx-auto">
    <div className="mb-10">
      <p className="text-[10px] font-bold tracking-widest uppercase text-charcoal-400 mb-3">Who Innvora Is For</p>
      <h2 className="text-3xl font-bold text-charcoal-900 leading-tight">
        Designed for the people
        <br />
        who run the operation.
      </h2>
    </div>

    <div className="grid md:grid-cols-3 gap-6">
      {[
        {
          title: 'Independent Store Owners',
          icon: <Package className="w-5 h-5" />,
          desc: 'Run a multi-channel retail operation without a dedicated ops team? Innvora gives you the same inventory intelligence that enterprise retailers have — without the complexity.',
          pain: 'Common problem: Stock running out mid-sale season without warning.',
        },
        {
          title: 'Warehouse Operations Leads',
          icon: <Warehouse className="w-5 h-5" />,
          desc: 'Manage inbound, outbound, and inter-location transfers across multiple fulfillment hubs? Innvora gives you per-location stock health, transfer visibility, and replenishment triggers.',
          pain: 'Common problem: No real-time view of what\'s where and what needs ordering.',
        },
        {
          title: 'Multi-Channel D2C Managers',
          icon: <RefreshCw className="w-5 h-5" />,
          desc: 'Selling on your own site, marketplaces, and in stores simultaneously? Innvora tracks inventory events across all channels and keeps your stock state accurate in real time.',
          pain: 'Common problem: Overselling, stockouts, and manual reconciliation.',
        },
      ].map((a) => (
        <div key={a.title} className="bg-sand-100 border border-sand-400 rounded-xl p-6" style={{ boxShadow: '0 1px 3px rgba(39,37,34,0.06)' }}>
          <div className="w-9 h-9 rounded-lg bg-charcoal-900 text-sand-200 flex items-center justify-center mb-4">
            {a.icon}
          </div>
          <h3 className="text-sm font-bold text-charcoal-900 mb-2">{a.title}</h3>
          <p className="text-sm text-charcoal-500 leading-relaxed mb-4">{a.desc}</p>
          <div className="border-t border-sand-300 pt-3">
            <p className="text-[11px] text-terracotta-600 italic">{a.pain}</p>
          </div>
        </div>
      ))}
    </div>
  </section>
);

// ─── Final CTA ────────────────────────────────────────────────────────────────
const FinalCTA: React.FC<{ onEnter: () => void }> = ({ onEnter }) => (
  <section className="py-24 border-t border-sand-400" style={{ backgroundColor: '#F8F4EC' }}>
    <div className="max-w-screen-xl mx-auto px-6 sm:px-10 lg:px-16">
      <div className="max-w-2xl">
        <p className="text-[10px] font-bold tracking-widest uppercase text-charcoal-400 mb-4">Ready to start?</p>
        <h2 className="text-4xl font-extrabold text-charcoal-900 leading-tight mb-4">
          Your inventory.
          <br />
          Under control.
        </h2>
        <p className="text-base text-charcoal-500 mb-8 leading-relaxed">
          Open the Innvora control center and see real live inventory data from
          our event-driven AWS backend. No sign-up required.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onEnter}
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-charcoal-900 text-sand-100 text-sm font-semibold rounded-lg hover:bg-charcoal-800 transition-colors"
            id="final-cta-btn"
          >
            Open Control Center
            <ArrowRight className="w-4 h-4" />
          </button>
          <a
            href="https://github.com/ShreyaJ-27/Innvora"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-charcoal-700 text-sm font-medium rounded-lg border border-sand-500 hover:bg-sand-200 transition-colors"
          >
            View on GitHub
          </a>
        </div>
      </div>
    </div>
  </section>
);

// ─── Footer ───────────────────────────────────────────────────────────────────
const Footer: React.FC = () => (
  <footer className="border-t border-sand-400 py-8 px-6 sm:px-10 lg:px-16" style={{ backgroundColor: '#E9E0D2' }}>
    <div className="max-w-screen-xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-md bg-charcoal-800 flex items-center justify-center">
          <Warehouse className="w-3 h-3 text-sand-200" />
        </div>
        <span className="text-sm font-semibold text-charcoal-700">Innvora</span>
        <span className="text-charcoal-400 text-xs">— Inventory Operations Platform</span>
      </div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-center gap-1.5 text-[11px] text-charcoal-500">
          <Clock className="w-3.5 h-3.5" />
          Built for AWS Hackathon 2026
        </div>
        <div className="flex items-center gap-3 text-xs text-charcoal-400">
          <span>Powered by AWS Lambda · SQS · DynamoDB · OpenSearch</span>
        </div>
      </div>
    </div>
  </footer>
);

// ─── Landing Page ─────────────────────────────────────────────────────────────
export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const handleEnter = () => navigate('/dashboard');

  return (
    <div
      className="font-sans text-charcoal-900 antialiased"
      style={{ backgroundColor: '#E9E0D2' }}
    >
      <LandingNav onEnter={handleEnter} />
      <HeroSection onEnter={handleEnter} />
      <StatsBand />
      <ValueSection />
      <InventorySection />
      <ReplenishmentSection />
      <LocationSection />
      <EventSection />
      <AWSSection />
      <AudienceSection />
      <FinalCTA onEnter={handleEnter} />
      <Footer />
    </div>
  );
};
