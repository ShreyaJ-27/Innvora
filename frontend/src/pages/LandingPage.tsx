import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Warehouse,
  MapPin,
  Zap,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Package,
  TrendingUp,
  Database,
  Shield,
  Clock,
  BarChart2,
  RefreshCw,
  Activity,
} from 'lucide-react';

/* ── Scroll reveal hook ──────────────────────────────────────────────────── */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) el.classList.add('visible'); },
      { threshold: 0.12 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

/* ── Landing Nav ─────────────────────────────────────────────────────────── */
const LandingNav: React.FC<{ onEnter: () => void }> = ({ onEnter }) => (
  <nav
    className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 sm:px-10 h-14 border-b border-sand-400/60"
    style={{ backgroundColor: 'rgba(240,234,224,0.96)', backdropFilter: 'blur(12px)' }}
  >
    <div className="flex items-center gap-2.5">
      <div className="w-7 h-7 flex items-center justify-center" style={{ background: '#272522', borderRadius: '5px' }}>
        <Warehouse className="w-3.5 h-3.5 text-sand-200" />
      </div>
      <span className="font-black text-charcoal-900 text-sm tracking-tight">INNVORA</span>
    </div>

    <div className="hidden md:flex items-center gap-7 text-xs font-medium text-charcoal-500">
      <a href="#inventory" className="hover:text-charcoal-900 transition-colors">Inventory</a>
      <a href="#replenishment" className="hover:text-charcoal-900 transition-colors">Replenishment</a>
      <a href="#hubs" className="hover:text-charcoal-900 transition-colors">Hubs</a>
      <a href="#architecture" className="hover:text-charcoal-900 transition-colors">Architecture</a>
    </div>

    <button
      onClick={onEnter}
      className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-sand-100 hover:opacity-90 transition-opacity"
      style={{ background: '#272522', borderRadius: '5px' }}
    >
      Open Control Center <ArrowRight className="w-3 h-3" />
    </button>
  </nav>
);

/* ── Event Ticker ─────────────────────────────────────────────────────────── */
const events = [
  { type: 'SALE', sku: 'PROD-EAR-01', loc: 'BLR Warehouse', qty: '-12', color: '#C6745A' },
  { type: 'RESTOCK', sku: 'PROD-SPK-03', loc: 'Mumbai Central', qty: '+80', color: '#6B7C3D' },
  { type: 'TRANSFER', sku: 'PROD-CAM-02', loc: 'Delhi NCR Hub', qty: '-30', color: '#8C7A65' },
  { type: 'SALE', sku: 'PROD-PHN-01', loc: 'Hyderabad Depot', qty: '-5', color: '#C6745A' },
  { type: 'RETURN', sku: 'PROD-TAB-04', loc: 'BLR Warehouse', qty: '+3', color: '#A89580' },
  { type: 'RESTOCK', sku: 'PROD-EAR-01', loc: 'Delhi NCR Hub', qty: '+120', color: '#6B7C3D' },
  { type: 'SALE', sku: 'PROD-SPK-03', loc: 'Mumbai Central', qty: '-18', color: '#C6745A' },
  { type: 'ADJUSTMENT', sku: 'PROD-CAM-02', loc: 'BLR Warehouse', qty: '+2', color: '#7D776F' },
];

const EventTicker: React.FC = () => (
  <div className="overflow-hidden border-y border-sand-400/60 bg-sand-100/70 py-3" style={{ maskImage: 'linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%)' }}>
    <div className="flex gap-6 animate-ticker" style={{ width: 'max-content' }}>
      {[...events, ...events].map((ev, i) => (
        <div key={i} className="flex items-center gap-2.5 shrink-0 px-4 py-1">
          <span
            className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5"
            style={{ background: ev.color + '18', color: ev.color, border: `1px solid ${ev.color}40`, borderRadius: '3px' }}
          >
            {ev.type}
          </span>
          <span className="font-mono text-[11px] text-charcoal-700 font-semibold">{ev.sku}</span>
          <span className="text-[10px] text-charcoal-400">{ev.loc}</span>
          <span
            className="text-[11px] font-black"
            style={{ color: ev.qty.startsWith('-') ? '#C6745A' : '#6B7C3D' }}
          >
            {ev.qty}
          </span>
        </div>
      ))}
    </div>
  </div>
);

/* ── Hero ─────────────────────────────────────────────────────────────────── */
const HeroSection: React.FC<{ onEnter: () => void }> = ({ onEnter }) => (
  <section
    className="relative min-h-screen flex items-center overflow-hidden"
    style={{ backgroundColor: '#E9E0D2' }}
  >
    {/* Full-bleed warehouse photo — dominant */}
    <div className="absolute inset-0">
      <img
        src="/images/warehouse-hero.jpg"
        alt="Warehouse operations"
        className="w-full h-full object-cover object-center"
        style={{ opacity: 0.55 }}
      />
      {/* Left-to-right overlay so text stays legible */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(105deg, rgba(233,224,210,0.98) 0%, rgba(233,224,210,0.95) 32%, rgba(233,224,210,0.65) 60%, rgba(233,224,210,0.10) 100%)',
        }}
      />
    </div>

    <div className="relative z-10 w-full max-w-screen-xl mx-auto px-6 sm:px-10 lg:px-16 pt-24 pb-16 grid lg:grid-cols-2 gap-12 items-center">
      {/* Left — Editorial headline */}
      <div className="animate-fade-in-up">
        <div className="flex items-center gap-2 mb-6">
          <span className="ops-live-dot" />
          <span className="text-[10px] font-black uppercase tracking-[0.22em] text-charcoal-500">
            Inventory Operations Platform
          </span>
        </div>

        <h1
          className="font-black text-charcoal-900 leading-[1.0] tracking-tight mb-6"
          style={{ fontSize: 'clamp(48px, 6vw, 80px)' }}
        >
          KNOW WHAT<br />
          YOU HAVE.
          <br />
          <span style={{ color: '#8C7A65' }}>KNOW WHAT<br />NEEDS ACTION.</span>
        </h1>

        <p className="text-[15px] text-charcoal-600 leading-relaxed mb-8 max-w-[460px]">
          Real-time inventory operations and replenishment intelligence
          for independent retailers, warehouse teams, and
          multi-channel D2C businesses.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mb-10">
          <button
            onClick={onEnter}
            id="hero-cta-primary"
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-[13px] font-bold text-sand-100 hover:opacity-90 transition-opacity group"
            style={{ background: '#272522', borderRadius: '6px' }}
          >
            Open Control Center
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
          <a
            href="#inventory"
            id="hero-cta-secondary"
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-[13px] font-medium text-charcoal-700 border border-sand-500 hover:bg-sand-200/60 transition-colors"
            style={{ borderRadius: '6px' }}
          >
            Explore the system
            <ChevronDown className="w-4 h-4" />
          </a>
        </div>

        {/* Trust bar */}
        <div className="flex flex-wrap gap-4 text-[11px] text-charcoal-500">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-olive-500" />
            AWS Serverless backend
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-olive-500" />
            Real-time via SQS
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-olive-500" />
            OpenSearch-indexed
          </div>
        </div>
      </div>

      {/* Right — Operational UI overlay panel */}
      <div className="hidden lg:block animate-slide-right">
        <div
          className="relative rounded-lg overflow-hidden border border-sand-400/50"
          style={{
            background: 'rgba(248,244,236,0.88)',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 32px 80px rgba(39,37,34,0.22)',
          }}
        >
          {/* Panel header */}
          <div
            className="flex items-center justify-between px-4 py-3 border-b border-sand-400/60"
            style={{ background: 'rgba(233,224,210,0.7)' }}
          >
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 flex items-center justify-center" style={{ background: '#272522', borderRadius: '3px' }}>
                <Warehouse className="w-2.5 h-2.5 text-sand-200" />
              </div>
              <span className="text-[11px] font-black text-charcoal-800 uppercase tracking-wider">Innvora / Control Center</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="ops-live-dot" style={{ width: '6px', height: '6px' }} />
              <span className="text-[9px] font-black uppercase tracking-widest text-olive-700">Live</span>
            </div>
          </div>

          {/* Illustrative metrics — clearly UI demo */}
          <div className="p-4 grid grid-cols-2 gap-3">
            {[
              { label: 'TOTAL SKUs', value: '47', sub: 'Illustrative', accent: '#272522' },
              { label: 'INVENTORY VALUE', value: '₹2.4L', sub: 'Illustrative', accent: '#272522' },
              { label: 'AT RISK', value: '8', sub: 'Illustrative', accent: '#B05A3E' },
              { label: 'REORDER SOON', value: '5', sub: 'Illustrative', accent: '#C6745A' },
            ].map((m) => (
              <div key={m.label} className="bg-sand-100/80 border border-sand-400/60 p-3" style={{ borderRadius: '5px' }}>
                <p className="text-[9px] font-black uppercase tracking-widest text-charcoal-400 mb-1">{m.label}</p>
                <p className="text-2xl font-black leading-none" style={{ color: m.accent }}>{m.value}</p>
                <p className="text-[9px] text-charcoal-400 mt-0.5 italic">{m.sub}</p>
              </div>
            ))}
          </div>

          {/* Recent event */}
          <div className="px-4 pb-4">
            <p className="text-[9px] font-black uppercase tracking-widest text-charcoal-400 mb-2">Recent Event</p>
            <div className="flex items-center justify-between bg-sand-200/60 border border-sand-400/50 px-3 py-2.5" style={{ borderRadius: '5px' }}>
              <div className="flex items-center gap-2.5">
                <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5" style={{ background: '#C6745A20', color: '#C6745A', border: '1px solid #C6745A40', borderRadius: '3px' }}>SALE</span>
                <span className="font-mono text-[11px] text-charcoal-700 font-semibold">PROD-EAR-01</span>
              </div>
              <span className="text-[12px] font-black" style={{ color: '#C6745A' }}>−12</span>
            </div>
            <p className="text-[9px] text-charcoal-400 mt-2 italic text-center">
              ↑ Illustrative product UI. Not live production data.
            </p>
          </div>
        </div>
      </div>
    </div>

    {/* Scroll indicator */}
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50">
      <ChevronDown className="w-4 h-4 text-charcoal-700 animate-bounce" />
    </div>
  </section>
);

/* ── Event ticker section ─────────────────────────────────────────────────── */
const MovementSection: React.FC = () => {
  const ref = useReveal();
  return (
    <section style={{ background: '#E9E0D2', paddingTop: '80px', paddingBottom: '80px' }}>
      <div ref={ref} className="reveal max-w-screen-xl mx-auto px-6 sm:px-10 lg:px-16 text-center mb-10">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-charcoal-400 mb-4">
          Live Event Stream
        </p>
        <h2
          className="font-black text-charcoal-900 mb-4 tracking-tight"
          style={{ fontSize: 'clamp(32px, 4vw, 56px)' }}
        >
          Inventory doesn't sit still.
        </h2>
        <p className="text-charcoal-500 max-w-lg mx-auto text-[15px]">
          Every sale, restock, transfer, and return is captured in real time and immediately reflected across the system.
        </p>
      </div>
      <EventTicker />
      <div className="max-w-screen-xl mx-auto px-6 sm:px-10 lg:px-16 mt-8 text-center">
        <p className="text-[13px] text-charcoal-500">
          Every movement leaves a signal. <span className="font-semibold text-charcoal-700">Every signal drives a decision.</span>
        </p>
      </div>
    </section>
  );
};

/* ── Inventory Section ────────────────────────────────────────────────────── */
const InventorySection: React.FC = () => {
  const refL = useReveal();
  const refR = useReveal();
  return (
    <section id="inventory" style={{ background: '#DDD4C7', paddingTop: '100px', paddingBottom: '100px' }}>
      <div className="max-w-screen-xl mx-auto px-6 sm:px-10 lg:px-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left — warehouse shelves image */}
          <div ref={refL} className="reveal-left relative">
            <div className="relative overflow-hidden" style={{ borderRadius: '8px', aspectRatio: '4/3' }}>
              <img
                src="/images/warehouse-shelves.jpg"
                alt="Warehouse shelving system"
                className="w-full h-full object-cover"
              />
              <div
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(135deg, rgba(39,37,34,0.08) 0%, transparent 60%)',
                  borderRadius: '8px',
                }}
              />
              {/* Corner metric overlay */}
              <div
                className="absolute bottom-4 left-4 px-3 py-2 border border-sand-400/40"
                style={{ background: 'rgba(248,244,236,0.92)', borderRadius: '6px', backdropFilter: 'blur(8px)' }}
              >
                <p className="text-[9px] font-black uppercase tracking-widest text-charcoal-400">
                  Stock Coverage
                </p>
                <p className="text-xl font-black text-charcoal-900 mt-0.5">14.2 days</p>
                <p className="text-[9px] text-charcoal-500 italic">Illustrative</p>
              </div>
            </div>
          </div>

          {/* Right — inventory interface */}
          <div ref={refR} className="reveal-right">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-charcoal-400 mb-4">Product Intelligence</p>
            <h2
              className="font-black text-charcoal-900 leading-tight mb-4 tracking-tight"
              style={{ fontSize: 'clamp(28px, 3.5vw, 44px)' }}
            >
              See every SKU.<br />Know what needs action.
            </h2>
            <p className="text-[14px] text-charcoal-500 mb-8 leading-relaxed">
              Every product tracked against its reorder point, safety stock, and supplier lead time.
              Color-coded pressure indicators surface the right decisions at the right time.
            </p>

            {/* Inventory UI mock */}
            <div className="border border-sand-500 bg-sand-100 overflow-hidden" style={{ borderRadius: '8px' }}>
              <div className="px-4 py-3 border-b border-sand-400 flex items-center justify-between" style={{ background: '#EDE5D8' }}>
                <span className="text-[10px] font-black uppercase tracking-widest text-charcoal-600">Inventory Surface</span>
                <span className="text-[9px] text-charcoal-400 italic">Illustrative UI</span>
              </div>
              {[
                { sku: 'PROD-EAR-01', name: 'Wireless Earbuds', stock: 18, avail: 12, rop: 35, days: 3, status: 'CRITICAL' },
                { sku: 'PROD-SPK-03', name: 'Bluetooth Speaker', stock: 64, avail: 58, rop: 30, days: 12, status: 'HEALTHY' },
                { sku: 'PROD-PHN-01', name: 'Phone Stand Pro', stock: 22, avail: 18, rop: 20, days: 6, status: 'REORDER_SOON' },
              ].map((item) => {
                const pct = Math.min(100, Math.round((item.avail / Math.max(item.rop, 1)) * 100));
                const barColor = item.status === 'CRITICAL' ? '#B05A3E' : item.status === 'REORDER_SOON' ? '#C6745A' : '#6B7C3D';
                const statusBg = item.status === 'CRITICAL' ? '#FBF0EE' : item.status === 'REORDER_SOON' ? '#FBF3F0' : '#F0F4EC';
                const statusColor = item.status === 'CRITICAL' ? '#7A2A22' : item.status === 'REORDER_SOON' ? '#7D3D24' : '#3D5A2B';
                return (
                  <div key={item.sku} className="px-4 py-3 border-b border-sand-300 last:border-0">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] text-charcoal-400">{item.sku}</span>
                          <span
                            className="text-[9px] font-bold uppercase px-1.5 py-0.5"
                            style={{ background: statusBg, color: statusColor, borderRadius: '3px' }}
                          >
                            {item.status.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-[13px] font-semibold text-charcoal-900 mt-0.5">{item.name}</p>
                      </div>
                      <span className="text-[12px] font-black" style={{ color: item.days < 5 ? '#B05A3E' : '#272522' }}>
                        {item.days}d
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-sand-300 overflow-hidden" style={{ borderRadius: '2px' }}>
                        <div
                          className="h-full ops-progress"
                          style={{ width: `${pct}%`, background: barColor, borderRadius: '2px' }}
                        />
                      </div>
                      <span className="text-[10px] font-mono text-charcoal-400 shrink-0">{item.avail}/{item.rop}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ── Replenishment Section ────────────────────────────────────────────────── */
const ReplenishmentSection: React.FC = () => {
  const ref = useReveal();
  return (
    <section id="replenishment" style={{ background: '#1E1C19', paddingTop: '100px', paddingBottom: '100px' }}>
      <div className="max-w-screen-xl mx-auto px-6 sm:px-10 lg:px-16">
        <div ref={ref} className="reveal mb-12 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] mb-4" style={{ color: '#A89580' }}>
            Intelligence Layer
          </p>
          <h2
            className="font-black text-sand-100 tracking-tight mb-4"
            style={{ fontSize: 'clamp(28px, 4vw, 52px)' }}
          >
            Replenishment Intelligence
          </h2>
          <p className="text-[14px] leading-relaxed max-w-xl mx-auto" style={{ color: '#8C7A65' }}>
            Not just alerts — contextual reorder decisions backed by demand modeling,
            lead time, and safety stock calculations.
          </p>
        </div>

        {/* Recommendation card */}
        <div
          className="max-w-2xl mx-auto border"
          style={{ background: '#272522', borderColor: '#3D3228', borderRadius: '8px', overflow: 'hidden' }}
        >
          {/* Card header */}
          <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: '#3D3228' }}>
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.2em]" style={{ color: '#7D776F' }}>
                Reorder Recommendation
              </p>
              <p className="text-[15px] font-black text-sand-200 mt-0.5">Wireless Earbuds</p>
              <p className="text-[11px] mt-0.5" style={{ color: '#6F5F4D' }}>BLR Warehouse · PROD-EAR-01</p>
            </div>
            <div
              className="px-2.5 py-1 text-[9px] font-black uppercase tracking-widest"
              style={{ background: '#B05A3E20', color: '#C6745A', border: '1px solid #B05A3E40', borderRadius: '4px' }}
            >
              CRITICAL
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-px" style={{ background: '#3D3228' }}>
            {[
              { label: 'Available', value: '18' },
              { label: 'Demand', value: '5/day' },
              { label: 'Lead Time', value: '7 days' },
              { label: 'Reorder Point', value: '35' },
            ].map((m) => (
              <div key={m.label} className="px-4 py-4" style={{ background: '#272522' }}>
                <p className="text-[9px] font-black uppercase tracking-widest mb-1" style={{ color: '#6F5F4D' }}>{m.label}</p>
                <p className="text-[20px] font-black" style={{ color: '#F2ECE2' }}>{m.value}</p>
              </div>
            ))}
          </div>

          {/* Recommendation */}
          <div className="px-5 py-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#8C7A65' }}>
                Recommended Order
              </p>
              <p className="text-[24px] font-black" style={{ color: '#D9CCB9' }}>50 units</p>
            </div>
            <div className="p-3 border" style={{ background: '#1E1C19', borderColor: '#3D3228', borderRadius: '5px' }}>
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: '#C6745A' }} />
                <p className="text-[12px] leading-relaxed" style={{ color: '#8C7A65' }}>
                  <strong style={{ color: '#D9CCB9' }}>Why?</strong> Stock coverage is below supplier lead-time requirements.
                  At current demand of 5 units/day with 7-day lead time, you need 35 units minimum.
                  Available stock of 18 creates a gap of 17 units before restock arrives.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ── Hub Section ─────────────────────────────────────────────────────────── */
const HUB_DATA: Record<string, { skus: number; critical: number; reorder: number; health: number; events: string }> = {
  Mumbai:     { skus: 14, critical: 2, reorder: 4, health: 78, events: '312 today' },
  'Delhi NCR':{ skus: 18, critical: 0, reorder: 6, health: 92, events: '441 today' },
  Bengaluru:  { skus: 11, critical: 3, reorder: 3, health: 63, events: '228 today' },
  Hyderabad:  { skus: 9,  critical: 1, reorder: 2, health: 82, events: '183 today' },
};

const HubSection: React.FC = () => {
  const [activeHub, setActiveHub] = useState('Delhi NCR');
  const ref = useReveal();
  const data = HUB_DATA[activeHub];

  return (
    <section id="hubs" style={{ background: '#E9E0D2', paddingTop: '100px', paddingBottom: '100px' }}>
      <div className="max-w-screen-xl mx-auto px-6 sm:px-10 lg:px-16">
        <div ref={ref} className="reveal mb-12">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-charcoal-400 mb-3">
            Multi-Hub Operations
          </p>
          <h2
            className="font-black text-charcoal-900 tracking-tight"
            style={{ fontSize: 'clamp(28px, 4vw, 52px)' }}
          >
            One network.<br />Four fulfillment hubs.
          </h2>
        </div>

        <div className="grid lg:grid-cols-[280px_1fr] gap-8 items-start">
          {/* Hub selector */}
          <div className="space-y-2">
            {Object.keys(HUB_DATA).map((hub) => (
              <button
                key={hub}
                onClick={() => setActiveHub(hub)}
                className="w-full text-left px-4 py-3 border transition-all duration-200"
                style={{
                  borderRadius: '6px',
                  background: activeHub === hub ? '#272522' : 'rgba(248,244,236,0.7)',
                  borderColor: activeHub === hub ? '#272522' : '#D7CABB',
                  transform: activeHub === hub ? 'translateX(4px)' : 'translateX(0)',
                }}
              >
                <div className="flex items-center gap-2.5">
                  <MapPin
                    className="w-3.5 h-3.5 shrink-0"
                    style={{ color: activeHub === hub ? '#C4B49F' : '#A89580' }}
                  />
                  <span
                    className="font-bold text-[13px]"
                    style={{ color: activeHub === hub ? '#F2ECE2' : '#272522' }}
                  >
                    {hub}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Hub detail panel */}
          <div key={activeHub} className="animate-hub">
            <div className="border border-sand-500 bg-sand-100 overflow-hidden" style={{ borderRadius: '8px' }}>
              <div className="px-5 py-4 border-b border-sand-400" style={{ background: '#EDE5D8' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-charcoal-400 mb-0.5">
                      Fulfillment Hub
                    </p>
                    <p className="text-[18px] font-black text-charcoal-900">{activeHub}</p>
                  </div>
                  <div
                    className="px-3 py-1.5 text-[11px] font-black"
                    style={{
                      background: data.health > 80 ? '#F0F4EC' : '#FBF3F0',
                      color: data.health > 80 ? '#3D5A2B' : '#7D3D24',
                      border: `1px solid ${data.health > 80 ? '#C5D4B5' : '#E9C4B5'}`,
                      borderRadius: '4px',
                    }}
                  >
                    {data.health}% Healthy
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-px" style={{ background: '#D7CABB' }}>
                {[
                  { label: 'Active SKUs', value: data.skus },
                  { label: 'Critical', value: data.critical, danger: data.critical > 0 },
                  { label: 'Reorder Soon', value: data.reorder },
                  { label: 'Events', value: data.events },
                ].map((m) => (
                  <div key={m.label} className="px-4 py-4 bg-sand-100">
                    <p className="text-[9px] font-black uppercase tracking-widest text-charcoal-400 mb-1">{m.label}</p>
                    <p
                      className="text-[22px] font-black"
                      style={{ color: m.danger ? '#B05A3E' : '#272522' }}
                    >
                      {m.value}
                    </p>
                  </div>
                ))}
              </div>
              {/* Health bar */}
              <div className="px-5 py-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-charcoal-400">
                    Inventory Health
                  </span>
                  <span className="text-[10px] text-charcoal-500 italic">Illustrative data</span>
                </div>
                <div className="h-2.5 bg-sand-300 overflow-hidden" style={{ borderRadius: '2px' }}>
                  <div
                    className="h-full transition-all duration-500 ops-progress"
                    style={{
                      width: `${data.health}%`,
                      background: data.health > 80 ? '#6B7C3D' : data.critical > 1 ? '#B05A3E' : '#C6745A',
                      borderRadius: '2px',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ── Event Pipeline ───────────────────────────────────────────────────────── */
interface PipelineScenario {
  id: string;
  name: string;
  type: string;
  sku: string;
  qty: string;
  hub: string;
  color: string;
  payload: {
    eventId: string;
    eventType: string;
    sku: string;
    productName: string;
    locationId: string;
    locationName: string;
    quantityChange: number;
    unitPrice: number;
    timestamp: string;
    idempotencyKey: string;
  };
  stages: { name: string; latency: string; detail: string }[];
}

const PIPELINE_SCENARIOS: PipelineScenario[] = [
  {
    id: 'sale',
    name: 'Customer Sale',
    type: 'SALE',
    sku: 'PROD-EAR-01',
    qty: '-12 units',
    hub: 'BLR Warehouse',
    color: '#C6745A',
    payload: {
      eventId: 'evt_99824_blr_sale',
      eventType: 'SALE',
      sku: 'PROD-EAR-01',
      productName: 'Wireless Noise-Canceling Earbuds',
      locationId: 'blr-wh',
      locationName: 'Bengaluru Fulfillment Warehouse',
      quantityChange: -12,
      unitPrice: 12999,
      timestamp: new Date().toISOString(),
      idempotencyKey: 'pos_txn_blr_482910',
    },
    stages: [
      { name: 'API Gateway Ingestion', latency: '14ms', detail: 'HTTPS POST /events validated with HMAC-SHA256 signature' },
      { name: 'SQS FIFO Enqueue', latency: '9ms', detail: 'MessageGroupId: SKU#PROD-EAR-01 guarantees ordered stock ledger' },
      { name: 'Lambda Event Worker', latency: '21ms', detail: 'Cold-start free execution on ARM64 Graviton runtime' },
      { name: 'DynamoDB Atomic Update', latency: '7ms', detail: 'Conditional write: ADD availableStock -12 IF stock >= 12' },
      { name: 'OpenSearch Real-time Index', latency: '11ms', detail: 'Document bulk-indexed into innvora-events-2026' },
      { name: 'Replenishment Re-evaluation', latency: '4ms', detail: 'Stock: 47 -> 35. Days of stock: 3.1d -> Approaching reorder threshold' },
    ],
  },
  {
    id: 'restock',
    name: 'Supplier Inbound Restock',
    type: 'RESTOCK',
    sku: 'PROD-SPK-03',
    qty: '+80 units',
    hub: 'Mumbai Central',
    color: '#6B7C3D',
    payload: {
      eventId: 'evt_99825_mum_restock',
      eventType: 'RESTOCK',
      sku: 'PROD-SPK-03',
      productName: 'Waterproof Bluetooth Speaker Gen 3',
      locationId: 'mum-central',
      locationName: 'Mumbai Central Distribution Center',
      quantityChange: 80,
      unitPrice: 4499,
      timestamp: new Date().toISOString(),
      idempotencyKey: 'asn_rcv_mum_00918',
    },
    stages: [
      { name: 'API Gateway Ingestion', latency: '12ms', detail: 'Warehouse dock barcode scanner triggers ASN intake' },
      { name: 'SQS FIFO Enqueue', latency: '8ms', detail: 'MessageDeduplicationId prevents duplicate dock scans' },
      { name: 'Lambda Event Worker', latency: '18ms', detail: 'Verifies PO match and updates supplier lead-time history' },
      { name: 'DynamoDB Atomic Update', latency: '6ms', detail: 'Stock incremented from 12 -> 92 units' },
      { name: 'OpenSearch Real-time Index', latency: '13ms', detail: 'Ledger indexed for inventory search & audit trails' },
      { name: 'Replenishment Clearance', latency: '5ms', detail: 'Status transitioned: CRITICAL -> HEALTHY. Reorder cleared.' },
    ],
  },
  {
    id: 'transfer',
    name: 'Inter-Hub Stock Transfer',
    type: 'TRANSFER',
    sku: 'PROD-CAM-02',
    qty: '30 units',
    hub: 'Delhi NCR Hub',
    color: '#8C7A65',
    payload: {
      eventId: 'evt_99826_del_transfer',
      eventType: 'TRANSFER_IN',
      sku: 'PROD-CAM-02',
      productName: '4K Action Camera Ultra',
      locationId: 'del-hub',
      locationName: 'Delhi NCR Logistics Depot',
      quantityChange: 30,
      unitPrice: 24999,
      timestamp: new Date().toISOString(),
      idempotencyKey: 'manifest_del_trf_7719',
    },
    stages: [
      { name: 'API Gateway Ingestion', latency: '16ms', detail: 'Inter-hub dispatch manifest scanned on arrival' },
      { name: 'SQS FIFO Enqueue', latency: '9ms', detail: 'Routed to regional queue cluster for Delhi NCR' },
      { name: 'Lambda Event Worker', latency: '22ms', detail: 'Dual-entry reconciliation with Bengaluru dispatch ledger' },
      { name: 'DynamoDB Atomic Update', latency: '8ms', detail: 'Transit reservedStock cleared, availableStock incremented' },
      { name: 'OpenSearch Real-time Index', latency: '14ms', detail: 'Audit history cross-referenced with truck GPS telemetry' },
      { name: 'Replenishment Balance', latency: '6ms', detail: 'Regional demand balance verified: 18 days of stock secured' },
    ],
  },
];

const PipelineSection: React.FC = () => {
  const [activeScenarioId, setActiveScenarioId] = useState('sale');
  const activeScenario = PIPELINE_SCENARIOS.find((s) => s.id === activeScenarioId) || PIPELINE_SCENARIOS[0];

  const pipelineIcons = [Zap, Database, RefreshCw, Warehouse, Activity, TrendingUp];

  return (
    <section className="relative overflow-hidden" style={{ background: '#DDD4C7', paddingTop: '90px', paddingBottom: '90px' }}>
      {/* Background industrial grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: 'linear-gradient(#C4B49F 1px, transparent 1px), linear-gradient(90deg, #C4B49F 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative max-w-screen-xl mx-auto px-6 sm:px-10 lg:px-16">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sand-200/90 border border-sand-400 mb-4">
            <span className="ops-live-dot" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-charcoal-700">
              Real-Time Ingestion Architecture
            </span>
          </div>
          <h2
            className="font-black text-charcoal-900 tracking-tight mb-4"
            style={{ fontSize: 'clamp(32px, 4.5vw, 56px)', lineHeight: 1.05 }}
          >
            Every movement.<br />
            <span style={{ color: '#8C7A65' }}>Instantly processed.</span>
          </h2>
          <p className="text-[15px] text-charcoal-600 leading-relaxed">
            From barcode scan at the warehouse dock to atomic DynamoDB balance update and OpenSearch indexing — in under 60 milliseconds.
          </p>

          {/* Interactive Scenario Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 mt-8">
            {PIPELINE_SCENARIOS.map((sc) => {
              const isSelected = sc.id === activeScenarioId;
              return (
                <button
                  key={sc.id}
                  onClick={() => setActiveScenarioId(sc.id)}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all rounded-md ${
                    isSelected
                      ? 'bg-charcoal-900 text-sand-100 shadow-md scale-105'
                      : 'bg-sand-100/90 hover:bg-sand-200 text-charcoal-700 border border-sand-400/80'
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ background: sc.color }}
                  />
                  <span>{sc.name}</span>
                  <span className="font-mono text-[10px] opacity-75">({sc.qty})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2-Column Operational Theater */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: 6-Stage Visual Waterfall */}
          <div className="lg:col-span-6 space-y-3">
            <div className="flex items-center justify-between px-2 mb-2">
              <span className="text-[10px] font-black uppercase tracking-[0.18em] text-charcoal-500">
                Execution Pipeline Stages
              </span>
              <span className="text-[10px] font-bold text-olive-800 bg-olive-100/80 px-2 py-0.5 rounded border border-olive-200">
                Total Latency: ~58ms
              </span>
            </div>

            {activeScenario.stages.map((stage, idx) => {
              const Icon = pipelineIcons[idx] || Zap;
              return (
                <div
                  key={stage.name}
                  className="p-4 rounded-lg border border-sand-400/90 bg-sand-100/95 shadow-sm transition-all hover:border-charcoal-700 flex items-start gap-3.5 group"
                >
                  <div
                    className="w-9 h-9 rounded flex items-center justify-center shrink-0 mt-0.5"
                    style={{
                      background: activeScenario.color + '18',
                      border: `1px solid ${activeScenario.color}40`,
                    }}
                  >
                    <Icon className="w-4 h-4" style={{ color: activeScenario.color }} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-black text-charcoal-400">
                          0{idx + 1}
                        </span>
                        <h4 className="text-xs font-black uppercase tracking-wider text-charcoal-900 truncate">
                          {stage.name}
                        </h4>
                      </div>
                      <span className="font-mono text-[11px] font-bold text-olive-700 bg-olive-50 px-1.5 py-0.5 rounded border border-olive-200 shrink-0">
                        {stage.latency}
                      </span>
                    </div>
                    <p className="text-xs text-charcoal-600 leading-snug">
                      {stage.detail}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Interactive Telemetry Console & Event Inspector */}
          <div className="lg:col-span-6">
            <div
              className="rounded-xl overflow-hidden border border-[#3D352E] shadow-2xl"
              style={{ background: '#201E1A', color: '#D9CCB9' }}
            >
              {/* Terminal Header */}
              <div
                className="flex items-center justify-between px-5 py-3.5 border-b border-[#3D352E]"
                style={{ background: '#191714' }}
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#B05A3E]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#8C7A65]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#6B7C3D]" />
                  </div>
                  <span className="font-mono text-[11px] text-[#A89885] font-semibold ml-2">
                    aws-sqs-fifo-consumer • ap-south-1
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="ops-live-dot" style={{ width: '6px', height: '6px' }} />
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#6B7C3D]">
                    STREAMING
                  </span>
                </div>
              </div>

              {/* Console Body */}
              <div className="p-5 font-mono text-xs space-y-4">
                {/* Active Event Banner */}
                <div className="p-3 rounded bg-[#2A2723] border border-[#453D34] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider"
                      style={{
                        background: activeScenario.color + '26',
                        color: activeScenario.color,
                        border: `1px solid ${activeScenario.color}50`,
                      }}
                    >
                      {activeScenario.type}
                    </span>
                    <span className="font-bold text-[#EFEBE4]">{activeScenario.sku}</span>
                  </div>
                  <span className="font-bold" style={{ color: activeScenario.color }}>
                    {activeScenario.qty}
                  </span>
                </div>

                {/* Event Packet JSON */}
                <div>
                  <div className="flex items-center justify-between text-[10px] uppercase font-bold text-[#8C7E6E] mb-1.5">
                    <span>Captured JSON Payload</span>
                    <span>Content-Type: application/json</span>
                  </div>
                  <pre
                    className="p-3.5 rounded bg-[#181613] border border-[#352F28] overflow-x-auto text-[11px] text-[#C5B7A5] leading-relaxed max-h-56"
                  >
{`{
  "eventId": "${activeScenario.payload.eventId}",
  "eventType": "${activeScenario.payload.eventType}",
  "sku": "${activeScenario.payload.sku}",
  "locationId": "${activeScenario.payload.locationId}",
  "quantityChange": ${activeScenario.payload.quantityChange},
  "unitPrice": ${activeScenario.payload.unitPrice},
  "idempotencyKey": "${activeScenario.payload.idempotencyKey}",
  "processedAt": "${activeScenario.payload.timestamp}"
}`}
                  </pre>
                </div>

                {/* State Transition Telemetry */}
                <div className="p-3.5 rounded bg-[#27231E] border border-[#3E352B] space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#8C7E6E]">DynamoDB Mutation:</span>
                    <span className="font-bold text-[#6B7C3D]">UpdateItem (TRANSACTION_COMMITTED)</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#8C7E6E]">Amazon OpenSearch:</span>
                    <span className="font-bold text-[#6B7C3D]">201 Created (1 document indexed)</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#8C7E6E]">Replenishment Engine:</span>
                    <span className="font-bold text-[#D9CCB9]">Velocity recomputed for {activeScenario.hub}</span>
                  </div>
                </div>

                <div className="pt-2 text-[10px] text-[#7A6E5F] flex items-center justify-between border-t border-[#352F28]">
                  <span>Sub-second consistency across all hubs</span>
                  <span className="text-[#6B7C3D]">✓ 0 Data Loss Tolerance</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ── AWS Architecture ─────────────────────────────────────────────────────── */
interface ArchNode {
  id: string;
  name: string;
  category: string;
  icon: any;
  metric: string;
  description: string;
  awsSpec: string;
  resilience: string;
  color: string;
}

const ARCH_NODES: ArchNode[] = [
  {
    id: 'apigw',
    name: 'Amazon API Gateway',
    category: 'Ingestion Tier',
    icon: Shield,
    metric: '14ms P95',
    description: 'High-throughput HTTPS REST API terminating at Mumbai (ap-south-1). Enforces token authentication, request schema validation, and burst throttling.',
    awsSpec: 'Managed REST API with Custom Domain & Route 53 latency routing',
    resilience: 'Multi-AZ active failover with CloudFront global edge caching',
    color: '#B05A3E',
  },
  {
    id: 'sqs',
    name: 'Amazon SQS FIFO Queue',
    category: 'Buffering & Shock Absorption',
    icon: Database,
    metric: '10k msg/sec',
    description: 'Guarantees strictly ordered inventory events with MessageGroupId partition hashing. Decouples sudden peak-hour flash sale surges from storage.',
    awsSpec: 'FIFO queue with Content-Based Deduplication & Dead Letter Queue (DLQ)',
    resilience: '14-day message retention with guaranteed once-and-only-once delivery',
    color: '#8C7A65',
  },
  {
    id: 'lambda',
    name: 'AWS Lambda Processor',
    category: 'Serverless Compute',
    icon: Zap,
    metric: '0 cold starts',
    description: 'Auto-scaling event consumer running Node.js 20.x on AWS Graviton3 (ARM64). Processes batches of up to 10 messages with concurrency reservation.',
    awsSpec: 'Event Source Mapping to SQS FIFO with ReportBatchItemFailures',
    resilience: 'Isolated compute containers with exponential backoff retries',
    color: '#C6745A',
  },
  {
    id: 'dynamo',
    name: 'Amazon DynamoDB',
    category: 'Atomic State Store',
    icon: Database,
    metric: '<8ms read/write',
    description: 'Single-Table design housing inventory state, safety buffers, and hub catalogs. Conditional expressions prevent negative stockouts and race conditions.',
    awsSpec: 'On-Demand Capacity Mode with Point-in-Time Recovery (PITR)',
    resilience: 'Synchronously replicated across 3 Availability Zones with 99.999% SLA',
    color: '#6B7C3D',
  },
  {
    id: 'opensearch',
    name: 'Amazon OpenSearch',
    category: 'Search & Ledger Index',
    icon: Activity,
    metric: 'Near-Real-Time',
    description: 'Managed search cluster indexing every granular stock movement. Powers full-text SKU discovery, time-series audits, and replenishment velocity math.',
    awsSpec: 'OpenSearch 2.11 cluster with daily rollover indexes & automated snapshots',
    resilience: 'Dedicated master nodes with multi-AZ cluster deployment',
    color: '#8C7A65',
  },
  {
    id: 'cloudwatch',
    name: 'CloudWatch & X-Ray',
    category: 'Observability & Alarms',
    icon: BarChart2,
    metric: '100% Traced',
    description: 'End-to-end distributed tracing across API Gateway, Lambda, and DynamoDB. Real-time metric alarms trigger automated ops notifications.',
    awsSpec: 'X-Ray active tracing with CloudWatch Metric Alarms & Insights',
    resilience: 'Continuous metric ingestion with 15-month historical retention',
    color: '#5A5349',
  },
];

const ArchSection: React.FC = () => {
  const [selectedNodeId, setSelectedNodeId] = useState('sqs');
  const selectedNode = ARCH_NODES.find((n) => n.id === selectedNodeId) || ARCH_NODES[0];
  const SelectedIcon = selectedNode.icon;

  return (
    <section id="architecture" className="relative overflow-hidden" style={{ background: '#1A1815', paddingTop: '100px', paddingBottom: '100px' }}>
      {/* Visual blueprint overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-25"
        style={{
          backgroundImage: 'radial-gradient(circle, #4A3E31 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      <div className="relative max-w-screen-xl mx-auto px-6 sm:px-10 lg:px-16">
        {/* Header */}
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#27231E] border border-[#3E352B] mb-4">
            <span className="ops-live-dot" style={{ background: '#6B7C3D' }} />
            <span className="text-[10px] font-black uppercase tracking-[0.24em] text-[#A89885]">
              AWS Cloud Architecture • ap-south-1
            </span>
          </div>

          <h2
            className="font-black tracking-tight mb-4 text-[#F0EAE0]"
            style={{ fontSize: 'clamp(32px, 4.5vw, 54px)', lineHeight: 1.05 }}
          >
            Built serverless.<br />
            <span style={{ color: '#A89885' }}>Engineered for zero downtime.</span>
          </h2>

          <p className="text-[15px] leading-relaxed text-[#8C7E6E] max-w-2xl">
            Zero servers to provision or patch. The entire Innvora backend is an event-driven AWS serverless architecture operating with sub-50ms latency, automatic burst scaling, and enterprise data durability.
          </p>
        </div>

        {/* Top Operational Metrics Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 p-5 rounded-xl border border-[#352F28] bg-[#221F1B]">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#7A6E5F]">P95 End-to-End Latency</p>
            <p className="text-2xl sm:text-3xl font-black font-mono text-[#EFEBE4] mt-1">42ms</p>
            <p className="text-[10px] text-[#6B7C3D] mt-0.5">● Sub-100ms SLA</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#7A6E5F]">Durability SLA</p>
            <p className="text-2xl sm:text-3xl font-black font-mono text-[#EFEBE4] mt-1">99.999%</p>
            <p className="text-[10px] text-[#A89885] mt-0.5">Multi-AZ Synchronous</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#7A6E5F]">Queue Ordering</p>
            <p className="text-2xl sm:text-3xl font-black font-mono text-[#EFEBE4] mt-1">FIFO</p>
            <p className="text-[10px] text-[#6B7C3D] mt-0.5">Exact Once Delivery</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#7A6E5F]">Server Management</p>
            <p className="text-2xl sm:text-3xl font-black font-mono text-[#EFEBE4] mt-1">0 Servers</p>
            <p className="text-[10px] text-[#A89885] mt-0.5">100% Serverless</p>
          </div>
        </div>

        {/* Interactive Architecture Topology Canvas */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Left: Interactive Grid of AWS Components */}
          <div className="lg:col-span-7 grid sm:grid-cols-2 gap-3.5">
            {ARCH_NODES.map((node) => {
              const Icon = node.icon;
              const isSelected = node.id === selectedNodeId;
              return (
                <button
                  key={node.id}
                  onClick={() => setSelectedNodeId(node.id)}
                  className={`p-4 rounded-lg border text-left transition-all relative overflow-hidden group ${
                    isSelected
                      ? 'border-[#8C7A65] bg-[#292520] shadow-lg scale-[1.02]'
                      : 'border-[#332D26] bg-[#201D19] hover:border-[#4A3F33] hover:bg-[#25211C]'
                  }`}
                >
                  {isSelected && (
                    <div
                      className="absolute top-0 left-0 right-0 h-1"
                      style={{ background: node.color }}
                    />
                  )}

                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[9px] font-black uppercase tracking-wider text-[#7A6E5F]">
                      {node.category}
                    </span>
                    <span className="font-mono text-[10px] font-bold text-[#A89885] bg-[#181613] px-1.5 py-0.5 rounded border border-[#352F28]">
                      {node.metric}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5 mb-1.5">
                    <div
                      className="w-7 h-7 rounded flex items-center justify-center shrink-0"
                      style={{ background: node.color + '22', border: `1px solid ${node.color}50` }}
                    >
                      <Icon className="w-3.5 h-3.5" style={{ color: node.color }} />
                    </div>
                    <h4 className="text-sm font-black text-[#EFEBE4] truncate group-hover:text-white">
                      {node.name}
                    </h4>
                  </div>

                  <p className="text-[11px] text-[#8C7E6E] line-clamp-2 leading-snug">
                    {node.description}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Right: Selected Node Deep Dive Inspector */}
          <div className="lg:col-span-5">
            <div
              className="rounded-xl border border-[#3E352B] p-6 shadow-2xl space-y-5"
              style={{ background: '#221F1B' }}
            >
              <div className="flex items-start justify-between gap-3 border-b border-[#352F28] pb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: selectedNode.color + '26', border: `1px solid ${selectedNode.color}60` }}
                  >
                    <SelectedIcon className="w-5 h-5" style={{ color: selectedNode.color }} />
                  </div>
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-[#7A6E5F]">
                      {selectedNode.category}
                    </span>
                    <h3 className="text-lg font-black text-[#F0EAE0]">
                      {selectedNode.name}
                    </h3>
                  </div>
                </div>
                <span className="font-mono text-xs font-bold text-[#6B7C3D] bg-[#1A2014] border border-[#2D3D20] px-2 py-0.5 rounded">
                  {selectedNode.metric}
                </span>
              </div>

              <div>
                <h5 className="text-[10px] font-black uppercase tracking-wider text-[#A89885] mb-1">
                  Architecture Role
                </h5>
                <p className="text-xs text-[#C5B7A5] leading-relaxed">
                  {selectedNode.description}
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="p-3 rounded bg-[#1A1815] border border-[#332D26]">
                  <span className="text-[9px] font-black uppercase tracking-wider text-[#7A6E5F] block mb-1">
                    AWS Technical Specification
                  </span>
                  <p className="font-mono text-[11px] text-[#A89885]">
                    {selectedNode.awsSpec}
                  </p>
                </div>

                <div className="p-3 rounded bg-[#1A1815] border border-[#332D26]">
                  <span className="text-[9px] font-black uppercase tracking-wider text-[#7A6E5F] block mb-1">
                    High Availability & Failover Policy
                  </span>
                  <p className="font-mono text-[11px] text-[#6B7C3D]">
                    {selectedNode.resilience}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-[#352F28] flex items-center justify-between text-[10px] text-[#7A6E5F]">
                <span>Region: ap-south-1 (Mumbai)</span>
                <span className="text-[#A89885]">IAM Least-Privilege Enforced</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ── Who It's For ─────────────────────────────────────────────────────────── */
const AudienceSection: React.FC = () => {
  const segments = [
    {
      title: 'Independent & Multi-Store Retailers',
      role: 'Store Owners, Merchandisers, POS Leads',
      tag: 'RETAIL POS SYNC',
      tagColor: '#B05A3E',
      image: '/images/retail-storefront.jpg',
      headline: 'Never stockout on your top 20% high-margin SKUs.',
      desc: 'Connect physical checkout registers and online storefronts into a single deduplicated stock ledger. Automatic reorder recommendations alert your purchasing team days before shelves run dry.',
      highlights: [
        'Live checkout deduction with 0% phantom inventory',
        'Dynamic safety buffer calculations tailored per store',
        'Automatic purchase order generation for suppliers',
      ],
      icon: Package,
    },
    {
      title: 'Warehouse & Logistics Operations',
      role: 'Depot Managers, Dock Leads, Receiving Teams',
      tag: 'DOCK RECEIVING & FIFO',
      tagColor: '#8C7A65',
      image: '/images/warehouse-shelves.jpg',
      headline: 'Every barcode scan. Every pallet hop. Reconciled in real time.',
      desc: 'High-throughput receiving dock scanning powered by AWS SQS FIFO queues. Whether unloading 40 pallets or executing inter-depot bin reassignments, stock state updates atomically in DynamoDB with sub-10ms latency.',
      highlights: [
        'Immutable event ledger with full audit trail',
        'Deduplicated inbound scans eliminate double-counting',
        'Instant variance alerts on physical vs recorded stock',
      ],
      icon: Warehouse,
    },
    {
      title: 'Fast-Growing Multi-Channel D2C Brands',
      role: 'Supply Chain Directors, Operations Heads',
      tag: 'MULTI-HUB FULFILLMENT',
      tagColor: '#6B7C3D',
      image: '/images/fulfillment-ops.jpg',
      headline: 'Orchestrate inventory across 4 regional fulfillment hubs.',
      desc: 'Balance stock distribution between Bengaluru, Mumbai, Delhi, and Hyderabad. The replenishment engine factors in supplier transit lead times, historical velocity, and upcoming promotions to prevent dead stock.',
      highlights: [
        'Multi-node visibility across central depots and 3PLs',
        'Automated inter-hub transfer recommendations',
        'Batch PO export formatted for supplier EDI dispatch',
      ],
      icon: TrendingUp,
    },
  ];

  return (
    <section className="relative overflow-hidden" style={{ background: '#E9E0D2', paddingTop: '100px', paddingBottom: '100px' }}>
      <div className="max-w-screen-xl mx-auto px-6 sm:px-10 lg:px-16">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sand-300/80 border border-sand-400 mb-4">
            <span className="w-2 h-2 rounded-full bg-charcoal-700" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-charcoal-700">
              Operational Purpose
            </span>
          </div>
          <h2
            className="font-black text-charcoal-900 tracking-tight mb-4"
            style={{ fontSize: 'clamp(32px, 4.5vw, 54px)', lineHeight: 1.05 }}
          >
            Built for operations teams<br />
            <span style={{ color: '#8C7A65' }}>who outgrew fragile spreadsheets.</span>
          </h2>
          <p className="text-[15px] text-charcoal-600 leading-relaxed">
            From physical boutique shelves to multi-tier pallet racking and nationwide logistics networks — Innvora delivers real-time visibility where ERPs are too slow.
          </p>
        </div>

        {/* 3 Rich Image-Driven Operational Cards */}
        <div className="grid lg:grid-cols-3 gap-8 items-stretch">
          {segments.map((seg) => {
            const Icon = seg.icon;
            return (
              <div
                key={seg.title}
                className="rounded-xl overflow-hidden border border-sand-400/90 bg-sand-100 flex flex-col shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
              >
                {/* Photo Asset Header */}
                <div className="relative h-56 w-full overflow-hidden bg-sand-300">
                  <img
                    src={seg.image}
                    alt={seg.title}
                    className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Subtle vignette gradient */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background: 'linear-gradient(180deg, rgba(39,37,34,0.1) 0%, rgba(39,37,34,0.7) 100%)',
                    }}
                  />

                  {/* Top Badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span
                      className="px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-wider text-sand-100 shadow-sm"
                      style={{ background: seg.tagColor }}
                    >
                      {seg.tag}
                    </span>
                  </div>

                  {/* Bottom Image Role Tag */}
                  <div className="absolute bottom-3 left-3 right-3 text-sand-100 flex items-center gap-2 text-xs font-semibold">
                    <div
                      className="w-6 h-6 rounded flex items-center justify-center shrink-0"
                      style={{ background: 'rgba(39,37,34,0.85)', backdropFilter: 'blur(4px)' }}
                    >
                      <Icon className="w-3.5 h-3.5 text-sand-200" />
                    </div>
                    <span className="truncate drop-shadow-sm text-[11px] text-sand-200">
                      {seg.role}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-lg font-black text-charcoal-900 leading-snug mb-2">
                      {seg.title}
                    </h3>
                    <p className="text-xs font-bold text-charcoal-700 mb-3" style={{ color: seg.tagColor }}>
                      "{seg.headline}"
                    </p>
                    <p className="text-xs text-charcoal-600 leading-relaxed">
                      {seg.desc}
                    </p>
                  </div>

                  {/* Operational Capabilities Checklist */}
                  <div className="pt-4 border-t border-sand-300 space-y-2">
                    {seg.highlights.map((h, hIdx) => (
                      <div key={hIdx} className="flex items-start gap-2 text-[11px] text-charcoal-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-olive-600 shrink-0 mt-0.5" />
                        <span className="leading-snug">{h}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

/* ── Final CTA ───────────────────────────────────────────────────────────── */
const FinalCTA: React.FC<{ onEnter: () => void }> = ({ onEnter }) => {
  return (
    <section className="relative overflow-hidden" style={{ background: '#DDD4C7', paddingTop: '90px', paddingBottom: '90px' }}>
      <div className="max-w-screen-xl mx-auto px-6 sm:px-10 lg:px-16">
        <div
          className="relative overflow-hidden rounded-2xl border border-sand-500/50 shadow-2xl"
          style={{ background: '#272522' }}
        >
          {/* Subtle warehouse background image blend */}
          <div className="absolute inset-0 pointer-events-none">
            <img
              src="/images/warehouse-hero.jpg"
              alt="Fulfillment Network"
              className="w-full h-full object-cover object-center opacity-15"
            />
            <div
              className="absolute inset-0"
              style={{
                background: 'radial-gradient(circle at center, rgba(39,37,34,0.85) 0%, rgba(39,37,34,0.98) 100%)',
              }}
            />
          </div>

          <div className="relative z-10 px-8 py-16 sm:py-20 text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#352F28] border border-[#483F34] mb-6">
              <span className="ops-live-dot" />
              <span className="text-[10px] font-black uppercase tracking-[0.24em] text-[#C4B49F]">
                AWS Serverless Production Stack Ready
              </span>
            </div>

            <h2
              className="font-black tracking-tight mb-5 text-[#F2ECE2]"
              style={{ fontSize: 'clamp(36px, 5.5vw, 68px)', lineHeight: 1.02 }}
            >
              Your inventory.<br />
              <span style={{ color: '#C4B49F' }}>Fully under control.</span>
            </h2>

            <p className="text-[15px] sm:text-[16px] leading-relaxed mb-8 max-w-xl mx-auto text-[#A89885]">
              Real-time stock levels, automated replenishment intelligence, and an immutable OpenSearch event ledger — all unified in one high-performance workspace.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <button
                onClick={onEnter}
                id="final-cta-btn"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-9 py-4 text-[14px] font-black transition-transform hover:scale-105 active:scale-95 shadow-lg group"
                style={{ background: '#F2ECE2', color: '#272522', borderRadius: '6px' }}
              >
                Launch Operations Control Center
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>

            {/* SLA Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-[#8C7E6E] pt-4 border-t border-[#3D352E]">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-olive-500" />
                <span>Zero Installation Required</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-olive-500" />
                <span>Multi-Hub Synchronization</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-olive-500" />
                <span>Production AWS Infrastructure</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ── Footer ──────────────────────────────────────────────────────────────── */
const Footer: React.FC = () => (
  <footer
    className="border-t border-sand-400/60 pt-12 pb-8 px-6 sm:px-10 lg:px-16"
    style={{ background: '#E3D9CC' }}
  >
    <div className="max-w-screen-xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10 pb-8 border-b border-sand-400/60">
        {/* Brand Column */}
        <div className="md:col-span-1 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 flex items-center justify-center" style={{ background: '#272522', borderRadius: '5px' }}>
              <Warehouse className="w-3.5 h-3.5 text-sand-200" />
            </div>
            <span className="text-sm font-black text-charcoal-900 tracking-tight">INNVORA</span>
          </div>
          <p className="text-xs text-charcoal-600 leading-relaxed">
            Real-time inventory intelligence & replenishment engine for modern retail, warehouse teams, and multi-channel fulfillment.
          </p>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-sand-200 border border-sand-400 text-[10px] font-bold text-charcoal-700">
            <span className="ops-live-dot" /> ap-south-1 Production
          </div>
        </div>

        {/* Modules Column */}
        <div>
          <h4 className="text-[10px] font-black uppercase tracking-widest text-charcoal-500 mb-3">
            Core Modules
          </h4>
          <ul className="space-y-2 text-xs text-charcoal-700 font-medium">
            <li><a href="/dashboard" className="hover:text-charcoal-950 transition-colors">Command Dashboard</a></li>
            <li><a href="/inventory" className="hover:text-charcoal-950 transition-colors">Real-Time Inventory</a></li>
            <li><a href="/reorders" className="hover:text-charcoal-950 transition-colors">Replenishment Intelligence</a></li>
            <li><a href="/activity" className="hover:text-charcoal-950 transition-colors">Audit Event Ledger</a></li>
            <li><a href="/search" className="hover:text-charcoal-950 transition-colors">OpenSearch Explorer</a></li>
          </ul>
        </div>

        {/* Architecture Column */}
        <div>
          <h4 className="text-[10px] font-black uppercase tracking-widest text-charcoal-500 mb-3">
            AWS Architecture
          </h4>
          <ul className="space-y-2 text-xs text-charcoal-700 font-medium">
            <li><span className="text-charcoal-600">API Gateway</span> (REST API)</li>
            <li><span className="text-charcoal-600">Amazon SQS</span> (FIFO Buffering)</li>
            <li><span className="text-charcoal-600">AWS Lambda</span> (ARM64 Runtime)</li>
            <li><span className="text-charcoal-600">Amazon DynamoDB</span> (Single-Table)</li>
            <li><span className="text-charcoal-600">OpenSearch 2.11</span> (Real-Time Index)</li>
          </ul>
        </div>

        {/* Fulfillment Hubs Column */}
        <div>
          <h4 className="text-[10px] font-black uppercase tracking-widest text-charcoal-500 mb-3">
            Fulfillment Nodes
          </h4>
          <ul className="space-y-2 text-xs text-charcoal-700 font-medium">
            <li>Bengaluru Central Warehouse (BLR-WH)</li>
            <li>Mumbai Distribution Center (MUM-CENTRAL)</li>
            <li>Delhi NCR Logistics Depot (DEL-HUB)</li>
            <li>Hyderabad Air Cargo Depot (HYD-DEPOT)</li>
          </ul>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-charcoal-500">
        <p>© {new Date().getFullYear()} Innvora. Enterprise Inventory Operations Platform.</p>
        <p className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-olive-600" />
          <span>All Regional Gateways Operational</span>
        </p>
      </div>
    </div>
  </footer>
);

/* ── Main Export ─────────────────────────────────────────────────────────── */
export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const handleEnter = () => navigate('/dashboard');

  return (
    <div className="min-h-screen font-sans" style={{ background: '#E9E0D2' }}>
      <LandingNav onEnter={handleEnter} />
      <HeroSection onEnter={handleEnter} />
      <MovementSection />
      <InventorySection />
      <ReplenishmentSection />
      <HubSection />
      <PipelineSection />
      <ArchSection />
      <AudienceSection />
      <FinalCTA onEnter={handleEnter} />
      <Footer />
    </div>
  );
};
