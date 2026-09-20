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
  Sliders,
  Cpu,
  Layers,
  Compass,
  Eye,
  Play,
  Truck,
  FileText,
  Sparkles,
} from 'lucide-react';
import { TiltCard3D } from '../components/common/TiltCard3D';

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

    <div className="hidden md:flex items-center gap-6 text-xs font-medium text-charcoal-500">
      <a href="#product-tour" className="hover:text-charcoal-900 font-bold text-charcoal-900 flex items-center gap-1.5 transition-colors">
        <Sparkles className="w-3 h-3 text-olive-600" /> 3D Tour
      </a>
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

/* ── Hero 3D Deck ─────────────────────────────────────────────────────────── */
const Hero3DDeck: React.FC = () => {
  const [deckTab, setDeckTab] = useState<'stream' | 'math' | 'mesh'>('stream');

  return (
    <div className="relative perspective-1200 w-full max-w-lg mx-auto preserve-3d">
      {/* Floating 3D Badge: Top Right */}
      <div
        className="absolute -top-5 -right-4 z-30 chip-3d-float px-3.5 py-1.5 rounded-full border border-sand-400/80 bg-sand-50/95 text-charcoal-900 flex items-center gap-2 text-[11px] font-bold shadow-2xl animate-float-slow"
        style={{ transform: 'translateZ(45px)' }}
      >
        <span className="ops-live-dot" />
        <span>SQS FIFO • <strong className="text-olive-700 font-mono">38ms</strong> Ingestion</span>
      </div>

      {/* Floating 3D Badge: Bottom Left */}
      <div
        className="absolute -bottom-5 -left-4 z-30 chip-3d-float px-3.5 py-1.5 rounded-full border border-sand-400/80 bg-sand-50/95 text-charcoal-900 flex items-center gap-2 text-[11px] font-bold shadow-2xl animate-float-alt"
        style={{ transform: 'translateZ(40px)' }}
      >
        <AlertTriangle className="w-3.5 h-3.5 text-terracotta-600" />
        <span>Reorder Alert: <strong className="text-terracotta-700 font-mono">3.6d</strong> Runway</span>
      </div>

      {/* 3D Tilt Card Base */}
      <TiltCard3D
        initialTiltX={7}
        initialTiltY={-8}
        initialRotateZ={1}
        maxTilt={12}
        perspective={1100}
        scale={1.02}
        className="w-full"
      >
        <div
          className="relative rounded-xl overflow-hidden border border-sand-400/80 bevel-3d"
          style={{
            background: 'rgba(248, 244, 236, 0.94)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 30px 70px -15px rgba(39,37,34,0.32), 0 0 0 1px rgba(255,255,255,0.7) inset',
          }}
        >
          {/* Deck Header & Mode Switcher */}
          <div
            className="flex items-center justify-between px-4 py-3 border-b border-sand-400/70"
            style={{ background: 'rgba(233, 224, 210, 0.85)' }}
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 flex items-center justify-center rounded" style={{ background: '#272522' }}>
                <Warehouse className="w-3 h-3 text-sand-200" />
              </div>
              <div>
                <span className="text-[11px] font-black text-charcoal-900 uppercase tracking-wider block leading-none">
                  Innvora Control Deck
                </span>
                <span className="text-[9px] text-charcoal-500 font-mono">ap-south-1 • Production</span>
              </div>
            </div>

            {/* Interactive Mode Pills */}
            <div className="flex items-center gap-1 bg-sand-300/80 p-0.5 rounded-lg border border-sand-400/60">
              <button
                onClick={(e) => { e.stopPropagation(); setDeckTab('stream'); }}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                  deckTab === 'stream'
                    ? 'bg-charcoal-900 text-sand-100 shadow-sm'
                    : 'text-charcoal-600 hover:text-charcoal-900'
                }`}
              >
                Pulse
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setDeckTab('math'); }}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                  deckTab === 'math'
                    ? 'bg-charcoal-900 text-sand-100 shadow-sm'
                    : 'text-charcoal-600 hover:text-charcoal-900'
                }`}
              >
                Math
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setDeckTab('mesh'); }}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                  deckTab === 'mesh'
                    ? 'bg-charcoal-900 text-sand-100 shadow-sm'
                    : 'text-charcoal-600 hover:text-charcoal-900'
                }`}
              >
                Mesh
              </button>
            </div>
          </div>

          {/* Tab 1: Live Pulse Stream View */}
          {deckTab === 'stream' && (
            <div className="p-4 space-y-3 animate-fade-in">
              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-sand-100/90 border border-sand-400/60 p-2.5 rounded-lg">
                  <p className="text-[9px] font-black uppercase tracking-widest text-charcoal-400">Ledger Velocity</p>
                  <p className="text-xl font-black font-mono text-charcoal-900 mt-0.5">12.4 <span className="text-xs font-normal text-charcoal-500">ops/s</span></p>
                  <p className="text-[9px] text-olive-700 font-semibold mt-0.5">● Real-time SQS FIFO</p>
                </div>
                <div className="bg-sand-100/90 border border-sand-400/60 p-2.5 rounded-lg">
                  <p className="text-[9px] font-black uppercase tracking-widest text-charcoal-400">Inventory Value</p>
                  <p className="text-xl font-black font-mono text-charcoal-900 mt-0.5">₹2.44L</p>
                  <p className="text-[9px] text-charcoal-500 mt-0.5">47 tracked SKUs</p>
                </div>
              </div>

              {/* Live Event Stream Cards */}
              <div className="space-y-1.5">
                <p className="text-[9px] font-black uppercase tracking-wider text-charcoal-400">Latest Processed Mutations</p>
                {[
                  { type: 'SALE', sku: 'PROD-EAR-01', name: 'Wireless Earbuds', loc: 'BLR Warehouse', delta: '-12', color: '#C6745A' },
                  { type: 'RESTOCK', sku: 'PROD-SPK-03', name: 'Bluetooth Speaker', loc: 'Mumbai Central', delta: '+80', color: '#6B7C3D' },
                  { type: 'TRANSFER', sku: 'PROD-CAM-02', name: '4K Action Camera', loc: 'Delhi NCR Hub', delta: '-30', color: '#8C7A65' },
                ].map((ev, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between bg-sand-200/70 border border-sand-300/80 px-2.5 py-2 rounded-lg text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="text-[9px] font-black px-1.5 py-0.5 rounded"
                        style={{ background: ev.color + '20', color: ev.color, border: `1px solid ${ev.color}40` }}
                      >
                        {ev.type}
                      </span>
                      <div>
                        <span className="font-mono text-[11px] font-bold text-charcoal-800">{ev.sku}</span>
                        <span className="text-[10px] text-charcoal-500 block">{ev.loc}</span>
                      </div>
                    </div>
                    <span
                      className="font-mono text-xs font-black"
                      style={{ color: ev.delta.startsWith('-') ? '#C6745A' : '#6B7C3D' }}
                    >
                      {ev.delta} units
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 2: Replenishment Math View */}
          {deckTab === 'math' && (
            <div className="p-4 space-y-3 animate-fade-in">
              <div className="p-3 rounded-lg bg-charcoal-900 text-sand-100 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sand-400">Active SKU</span>
                  <span className="font-mono font-bold text-terracotta-400">PROD-EAR-01</span>
                </div>
                <p className="text-sm font-black text-white">Wireless Noise-Canceling Earbuds</p>
                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-charcoal-800 text-sand-300">
                  <span>Stock Runway: <strong>3.6 Days</strong></span>
                  <span className="text-terracotta-400 font-bold">● Critical Threshold</span>
                </div>
              </div>

              {/* Dynamic Formula Preview */}
              <div className="bg-sand-100/90 border border-sand-400/60 p-3 rounded-lg space-y-1.5 text-xs">
                <p className="text-[9px] font-black uppercase tracking-wider text-charcoal-400">
                  Predictive Reorder Point
                </p>
                <div className="flex items-center justify-between font-mono font-bold text-charcoal-900">
                  <span>Lead Time × Velocity + Buffer:</span>
                  <span className="text-sm text-terracotta-700">35 Units</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-charcoal-600">
                  <span>Available on Hand:</span>
                  <span className="font-mono font-bold">18 Units</span>
                </div>
                <div className="p-2 rounded bg-sand-200 border border-sand-300 flex items-center justify-between text-xs font-black text-charcoal-900">
                  <span>Drafted PO Quantity:</span>
                  <span className="text-olive-700 font-mono">+50 Units</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Nationwide Hub Mesh View */}
          {deckTab === 'mesh' && (
            <div className="p-4 space-y-2.5 animate-fade-in">
              <p className="text-[9px] font-black uppercase tracking-wider text-charcoal-400">
                4 Synchronized Regional Nodes
              </p>
              {[
                { name: 'Bengaluru Central', code: 'BLR-WH', health: '86%', status: 'Active Intake', color: '#6B7C3D' },
                { name: 'Mumbai Distribution', code: 'MUM-CENTRAL', health: '78%', status: 'High Shift', color: '#C6745A' },
                { name: 'Delhi NCR Hub', code: 'DEL-HUB', health: '92%', status: 'Optimal', color: '#6B7C3D' },
                { name: 'Hyderabad Depot', code: 'HYD-DEPOT', health: '88%', status: 'Balanced', color: '#6B7C3D' },
              ].map((hub) => (
                <div
                  key={hub.code}
                  className="flex items-center justify-between bg-sand-100/90 border border-sand-300 p-2 rounded-lg text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold bg-sand-200 px-1.5 py-0.5 rounded border border-sand-300">
                      {hub.code}
                    </span>
                    <span className="font-semibold text-charcoal-800">{hub.name}</span>
                  </div>
                  <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded" style={{ background: hub.color + '18', color: hub.color }}>
                    {hub.health}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Footer note */}
          <div className="px-4 py-2.5 bg-sand-200/60 border-t border-sand-300 flex items-center justify-between text-[10px] text-charcoal-500">
            <span className="flex items-center gap-1.5">
              <span className="ops-live-dot" style={{ width: '5px', height: '5px' }} />
              Live Interactive 3D Canvas
            </span>
            <span className="font-mono font-semibold text-charcoal-600">Move mouse to tilt</span>
          </div>
        </div>
      </TiltCard3D>
    </div>
  );
};

/* ── Hero Section ─────────────────────────────────────────────────────────── */
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

    {/* 3D Parallax Depth Orbs — ambient floating spheres */}
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ perspective: '800px' }}>
      {/* Large background orb - green */}
      <div
        className="absolute rounded-full animate-float-slow"
        style={{
          width: '480px', height: '480px',
          top: '10%', right: '-8%',
          background: 'radial-gradient(circle at 30% 30%, rgba(107,124,61,0.18) 0%, rgba(107,124,61,0.05) 50%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />
      {/* Medium orb - terracotta */}
      <div
        className="absolute rounded-full animate-float-alt"
        style={{
          width: '320px', height: '320px',
          bottom: '15%', right: '5%',
          background: 'radial-gradient(circle at 60% 40%, rgba(198,116,90,0.14) 0%, rgba(198,116,90,0.04) 60%, transparent 80%)',
          filter: 'blur(45px)',
        }}
      />
      {/* Small floating particle orbs */}
      <div
        className="absolute w-3 h-3 rounded-full bg-olive-500/40 animate-particle"
        style={{ top: '30%', right: '22%', animationDelay: '0s' }}
      />
      <div
        className="absolute w-2 h-2 rounded-full bg-terracotta-400/50 animate-particle-alt"
        style={{ top: '55%', right: '15%', animationDelay: '1.2s' }}
      />
      <div
        className="absolute w-4 h-4 rounded-full bg-sand-500/30 animate-particle"
        style={{ top: '70%', right: '35%', animationDelay: '2.1s' }}
      />
      <div
        className="absolute w-2 h-2 rounded-full bg-olive-600/40 animate-particle-alt"
        style={{ top: '20%', right: '40%', animationDelay: '0.7s' }}
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

        {/* Animated stat pills */}
        <div className="flex flex-wrap gap-2.5 mb-8">
          {[
            { label: 'P95 Latency', value: '38ms', color: '#6B7C3D' },
            { label: 'Data Loss', value: '0%', color: '#6B7C3D' },
            { label: 'Hubs Synced', value: '4 Nodes', color: '#8C7A65' },
            { label: 'Mode', value: 'Serverless', color: '#5A5349' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-sand-400/70 bg-sand-100/80"
              style={{ backdropFilter: 'blur(8px)' }}
            >
              <span className="text-[9px] font-black uppercase tracking-widest text-charcoal-400">{stat.label}</span>
              <span className="font-mono text-xs font-black" style={{ color: stat.color }}>{stat.value}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-10">
          <button
            onClick={onEnter}
            id="hero-cta-primary"
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-[13px] font-bold text-sand-100 hover:opacity-90 transition-opacity group shadow-lg"
            style={{ background: '#272522', borderRadius: '6px' }}
          >
            Open Control Center
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
          <a
            href="#product-tour"
            id="hero-cta-secondary"
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-[13px] font-medium text-charcoal-700 border border-sand-500 hover:bg-sand-200/60 transition-colors"
            style={{ borderRadius: '6px' }}
          >
            Interactive 3D Tour
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

      {/* Right — 3D Interactive Hero Deck */}
      <div className="hidden lg:block animate-slide-right">
        <Hero3DDeck />
      </div>
    </div>

    {/* Scroll indicator */}
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50">
      <ChevronDown className="w-4 h-4 text-charcoal-700 animate-bounce" />
    </div>
  </section>
);

/* ── 3D Interactive Product Tour Section ───────────────────────────────────── */
const ProductTourSection: React.FC = () => {
  const [activeTour, setActiveTour] = useState<'pulse' | 'replenish' | 'hubs' | 'serverless'>('pulse');

  // Module 1: Live Pulse state
  const [pulseStock, setPulseStock] = useState(18);
  const [lastAction, setLastAction] = useState<{ type: string; delta: number; time: string; msgId: string }>({
    type: 'SALE',
    delta: -3,
    time: 'Just now',
    msgId: 'msg_sqs_481029_fifo',
  });
  const [actionBlink, setActionBlink] = useState(false);

  const triggerMutation = (type: string, delta: number) => {
    setPulseStock((prev) => Math.max(0, prev + delta));
    setLastAction({
      type,
      delta,
      time: new Date().toLocaleTimeString(),
      msgId: `msg_sqs_${Math.floor(Math.random() * 899999 + 100000)}_fifo`,
    });
    setActionBlink(true);
    setTimeout(() => setActionBlink(false), 500);
  };

  // Module 2: Replenishment Math state
  const [velocity, setVelocity] = useState(5); // units/day
  const [leadTimeDays, setLeadTimeDays] = useState(7); // days
  const [safetyBufferPct, setSafetyBufferPct] = useState(25); // %

  const leadTimeDemand = velocity * leadTimeDays;
  const safetyUnits = Math.round(leadTimeDemand * (safetyBufferPct / 100));
  const calculatedROP = leadTimeDemand + safetyUnits;
  const runwayDays = (pulseStock / Math.max(velocity, 1)).toFixed(1);
  const targetStock = calculatedROP * 2;
  const recommendedPO = Math.max(0, targetStock - pulseStock);

  // Module 3: Nationwide Hub Mesh state
  const [selectedHubKey, setSelectedHubKey] = useState<'blr' | 'mum' | 'del' | 'hyd'>('blr');
  const [transferTriggered, setTransferTriggered] = useState(false);

  const hubMeshList = {
    blr: {
      name: 'Bengaluru Central Fulfillment Hub',
      code: 'BLR-WH',
      stock: 482,
      critical: 1,
      transitRoute: 'BLR → DEL Hub',
      transferUnits: 30,
      eta: '4.5 hrs',
      capacity: '78%',
      sqft: '48,000 sq.ft',
    },
    mum: {
      name: 'Mumbai Distribution Center',
      code: 'MUM-CENTRAL',
      stock: 614,
      critical: 2,
      transitRoute: 'MUM → HYD Depot',
      transferUnits: 45,
      eta: '3.2 hrs',
      capacity: '91%',
      sqft: '62,000 sq.ft',
    },
    del: {
      name: 'Delhi NCR Logistics Depot',
      code: 'DEL-HUB',
      stock: 390,
      critical: 0,
      transitRoute: 'DEL → BLR Hub',
      transferUnits: 15,
      eta: '7.8 hrs',
      capacity: '74%',
      sqft: '54,000 sq.ft',
    },
    hyd: {
      name: 'Hyderabad Air Cargo Depot',
      code: 'HYD-DEPOT',
      stock: 285,
      critical: 0,
      transitRoute: 'HYD → MUM Central',
      transferUnits: 20,
      eta: '2.1 hrs',
      capacity: '62%',
      sqft: '35,000 sq.ft',
    },
  };

  const currentHub = hubMeshList[selectedHubKey];

  const handleSimulateTransfer = () => {
    setTransferTriggered(true);
    setTimeout(() => setTransferTriggered(false), 3500);
  };

  // Module 4: Serverless state
  const [selectedArchStep, setSelectedArchStep] = useState<number>(1);
  const archSteps = [
    { step: 1, name: 'API Gateway', time: '14ms', role: 'HTTPS Ingestion & HMAC Verification', spec: 'AWS REST API + WAF' },
    { step: 2, name: 'Amazon SQS FIFO', time: '8ms', role: 'Strictly Ordered Partition Shock Buffer', spec: 'MessageGroupId: SKU#PROD' },
    { step: 3, name: 'AWS Lambda', time: '18ms', role: 'Zero Cold-Start Graviton3 ARM64 Worker', spec: 'Node.js 20.x ESM Concurrency' },
    { step: 4, name: 'Amazon DynamoDB', time: '6ms', role: 'Atomic Mutation with ACID Transaction', spec: 'Single-Table Design' },
    { step: 5, name: 'Amazon OpenSearch', time: '11ms', role: 'Real-Time Vector Search & Audit Ledger', spec: '2.11 Multi-Node Cluster' },
  ];

  return (
    <section id="product-tour" className="relative overflow-hidden" style={{ background: '#E3D9CC', paddingTop: '90px', paddingBottom: '90px' }}>
      {/* Background blueprint grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: 'radial-gradient(circle, #8C7A65 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      <div className="relative max-w-screen-xl mx-auto px-6 sm:px-10 lg:px-16">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sand-300 border border-sand-400 mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-olive-700" />
            <span className="text-[10px] font-black uppercase tracking-[0.22em] text-charcoal-800">
              Interactive 3D Walkthrough • Test It Live
            </span>
          </div>
          <h2
            className="font-black text-charcoal-900 tracking-tight mb-4"
            style={{ fontSize: 'clamp(32px, 4.5vw, 54px)', lineHeight: 1.05 }}
          >
            See Innvora in action.<br />
            <span style={{ color: '#8C7A65' }}>Get the complete operational gist in seconds.</span>
          </h2>
          <p className="text-[15px] text-charcoal-600 leading-relaxed max-w-xl mx-auto">
            Test how barcode triggers, automated purchasing math, multi-hub transfers, and AWS serverless queues interact in an authentic live environment.
          </p>
        </div>

        {/* 4 Capability Navigation Pills */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto mb-10">
          {[
            { id: 'pulse', label: '01. Real-Time Stock', sub: 'Sub-second SQS FIFO Ledger', icon: Zap },
            { id: 'replenish', label: '02. Replenishment Math', sub: 'Lead Time & Runway Model', icon: Sliders },
            { id: 'hubs', label: '03. Multi-Hub Mesh', sub: 'Nationwide 4-Node Balancing', icon: MapPin },
            { id: 'serverless', label: '04. AWS Serverless', sub: 'Zero Cold-Start Pipeline', icon: Cpu },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTour === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTour(tab.id as any)}
                className={`p-3.5 rounded-xl border text-left transition-all duration-200 card-3d-hover ${
                  isSelected
                    ? 'bg-charcoal-900 text-sand-100 border-charcoal-800 shadow-xl scale-[1.02]'
                    : 'bg-sand-100/90 text-charcoal-800 border-sand-400/80 hover:bg-sand-50'
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-olive-400' : 'text-charcoal-500'}`} />
                  <span className="text-xs font-black uppercase tracking-wider">{tab.label}</span>
                </div>
                <p className={`text-[11px] leading-tight ${isSelected ? 'text-sand-300' : 'text-charcoal-500'}`}>
                  {tab.sub}
                </p>
              </button>
            );
          })}
        </div>

        {/* Interactive 3D Stage & Explainability Panel */}
        <div className="grid lg:grid-cols-12 gap-8 items-stretch">
          {/* Left: Interactive 3D Canvas */}
          <div className="lg:col-span-7 flex flex-col">
            <TiltCard3D
              initialTiltX={4}
              initialTiltY={-4}
              maxTilt={8}
              perspective={1200}
              scale={1.01}
              className="w-full flex-1 flex flex-col"
            >
              <div
                className="flex-1 rounded-2xl border border-sand-400/90 p-6 sm:p-7 shadow-2xl flex flex-col justify-between bevel-3d"
                style={{
                  background: 'rgba(248, 244, 236, 0.95)',
                  backdropFilter: 'blur(20px)',
                }}
              >
                {/* ── Tab 1: Live Pulse Interactive Sandbox ── */}
                {activeTour === 'pulse' && (
                  <div className="space-y-5 animate-fade-in">
                    <div className="flex items-center justify-between pb-3 border-b border-sand-300">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-charcoal-400">
                          Interactive Barcode / POS Simulator
                        </span>
                        <h3 className="text-lg font-black text-charcoal-900">
                          Wireless Noise-Canceling Earbuds (PROD-EAR-01)
                        </h3>
                      </div>
                      <span className="ops-live-dot" />
                    </div>

                    {/* Stock Counter with 3D pulse */}
                    <div className="p-4 rounded-xl bg-sand-200/80 border border-sand-300 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-wider text-charcoal-500">Live Available Stock</p>
                        <p
                          className={`text-4xl font-black font-mono transition-transform duration-300 ${
                            actionBlink ? 'scale-110 text-olive-700' : 'text-charcoal-950'
                          }`}
                        >
                          {pulseStock} <span className="text-sm font-normal text-charcoal-500">units</span>
                        </p>
                        <p className="text-[11px] text-charcoal-500 mt-0.5">
                          Estimated Runway: <strong className="text-charcoal-800">{(pulseStock / 5).toFixed(1)} days</strong> @ 5 units/day
                        </p>
                      </div>

                      <div className="text-right">
                        <span
                          className="px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider"
                          style={{
                            background: pulseStock < 10 ? '#C6745A20' : '#6B7C3D20',
                            color: pulseStock < 10 ? '#C6745A' : '#6B7C3D',
                            border: `1px solid ${pulseStock < 10 ? '#C6745A50' : '#6B7C3D50'}`,
                          }}
                        >
                          {pulseStock < 10 ? 'CRITICAL LOW' : pulseStock < 25 ? 'REORDER SOON' : 'HEALTHY'}
                        </span>
                        <p className="text-[10px] text-charcoal-400 mt-1">Reorder Point: 35</p>
                      </div>
                    </div>

                    {/* Interactive Action Buttons */}
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wider text-charcoal-400 mb-2">
                        Click to simulate operational transaction:
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <button
                          onClick={() => triggerMutation('SALE', -3)}
                          className="px-3 py-2.5 rounded-lg border border-terracotta-300 bg-terracotta-50/80 hover:bg-terracotta-100 text-terracotta-900 text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 active:scale-95"
                        >
                          <span>🛒 POS Checkout</span>
                          <span className="font-mono text-[11px] font-black text-terracotta-700">(-3)</span>
                        </button>
                        <button
                          onClick={() => triggerMutation('RESTOCK', +25)}
                          className="px-3 py-2.5 rounded-lg border border-olive-300 bg-olive-50/80 hover:bg-olive-100 text-olive-900 text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 active:scale-95"
                        >
                          <span>📥 Dock Receiving</span>
                          <span className="font-mono text-[11px] font-black text-olive-700">(+25)</span>
                        </button>
                        <button
                          onClick={() => triggerMutation('RETURN', +1)}
                          className="px-3 py-2.5 rounded-lg border border-sand-400 bg-sand-200/80 hover:bg-sand-300 text-charcoal-800 text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 active:scale-95"
                        >
                          <span>🔄 Return Restock</span>
                          <span className="font-mono text-[11px] font-black text-charcoal-700">(+1)</span>
                        </button>
                      </div>
                    </div>

                    {/* Real-time SQS Ledger Feed */}
                    <div className="p-3.5 rounded-xl bg-charcoal-900 text-sand-100 font-mono text-xs space-y-1.5 shadow-inner">
                      <div className="flex items-center justify-between text-[10px] text-sand-400 border-b border-charcoal-800 pb-1.5">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-olive-500 animate-pulse" />
                          AWS SQS FIFO Message Payload
                        </span>
                        <span className="text-olive-400 font-bold">{lastAction.time}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] pt-1">
                        <span className="text-sand-300">{lastAction.msgId}</span>
                        <span
                          className="font-bold"
                          style={{ color: lastAction.delta < 0 ? '#E2846B' : '#88A856' }}
                        >
                          {lastAction.type} {lastAction.delta > 0 ? `+${lastAction.delta}` : lastAction.delta} units
                        </span>
                      </div>
                      <p className="text-[10px] text-sand-400 truncate">
                        PartitionKey: SKU#PROD-EAR-01 • DynamoDB Transaction Committed (4ms)
                      </p>
                    </div>
                  </div>
                )}

                {/* ── Tab 2: Replenishment Math Simulator ── */}
                {activeTour === 'replenish' && (
                  <div className="space-y-5 animate-fade-in">
                    <div className="flex items-center justify-between pb-3 border-b border-sand-300">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-charcoal-400">
                          Predictive Reorder Point Sandbox
                        </span>
                        <h3 className="text-lg font-black text-charcoal-900">
                          Dynamic Mathematical Formula Model
                        </h3>
                      </div>
                      <span className="font-mono text-xs font-bold text-olive-700 bg-olive-50 px-2 py-0.5 rounded border border-olive-200">
                        Active Equation
                      </span>
                    </div>

                    {/* Interactive Sliders */}
                    <div className="space-y-3.5 bg-sand-200/60 p-4 rounded-xl border border-sand-300">
                      <div>
                        <div className="flex items-center justify-between text-xs font-bold text-charcoal-800 mb-1">
                          <span>Daily Sales Velocity:</span>
                          <span className="font-mono text-charcoal-900">{velocity} units/day</span>
                        </div>
                        <input
                          type="range"
                          min={1}
                          max={20}
                          value={velocity}
                          onChange={(e) => setVelocity(Number(e.target.value))}
                          className="w-full accent-charcoal-900 cursor-pointer"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-xs font-bold text-charcoal-800 mb-1">
                          <span>Supplier Delivery Lead Time:</span>
                          <span className="font-mono text-charcoal-900">{leadTimeDays} days</span>
                        </div>
                        <input
                          type="range"
                          min={2}
                          max={14}
                          value={leadTimeDays}
                          onChange={(e) => setLeadTimeDays(Number(e.target.value))}
                          className="w-full accent-charcoal-900 cursor-pointer"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-xs font-bold text-charcoal-800 mb-1">
                          <span>Safety Stock Buffer:</span>
                          <span className="font-mono text-charcoal-900">{safetyBufferPct}% ({safetyUnits} units)</span>
                        </div>
                        <input
                          type="range"
                          min={10}
                          max={50}
                          step={5}
                          value={safetyBufferPct}
                          onChange={(e) => setSafetyBufferPct(Number(e.target.value))}
                          className="w-full accent-charcoal-900 cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* Calculated Output Cards */}
                    <div className="grid grid-cols-3 gap-2.5">
                      <div className="p-3 rounded-lg bg-sand-100 border border-sand-400/80">
                        <p className="text-[9px] font-black uppercase tracking-wider text-charcoal-400">Reorder Point (ROP)</p>
                        <p className="text-xl font-black font-mono text-charcoal-900 mt-0.5">{calculatedROP}</p>
                        <p className="text-[9px] text-charcoal-500">Threshold units</p>
                      </div>
                      <div className="p-3 rounded-lg bg-sand-100 border border-sand-400/80">
                        <p className="text-[9px] font-black uppercase tracking-wider text-charcoal-400">Runway Days</p>
                        <p className="text-xl font-black font-mono text-terracotta-700 mt-0.5">{runwayDays}d</p>
                        <p className="text-[9px] text-charcoal-500">Until stockout</p>
                      </div>
                      <div className="p-3 rounded-lg bg-sand-100 border border-sand-400/80">
                        <p className="text-[9px] font-black uppercase tracking-wider text-charcoal-400">Drafted Order</p>
                        <p className="text-xl font-black font-mono text-olive-700 mt-0.5">+{recommendedPO}</p>
                        <p className="text-[9px] text-charcoal-500">Units to supplier</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Tab 3: Nationwide Hub Mesh ── */}
                {activeTour === 'hubs' && (
                  <div className="space-y-5 animate-fade-in">
                    <div className="flex items-center justify-between pb-3 border-b border-sand-300">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-charcoal-400">
                          Cross-Hub Inventory Balancing
                        </span>
                        <h3 className="text-lg font-black text-charcoal-900">
                          Nationwide Multi-Depot Synchronization
                        </h3>
                      </div>
                      <span className="ops-live-dot" />
                    </div>

                    {/* Hub Selector Pills */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {Object.entries(hubMeshList).map(([k, hub]) => {
                        const isSel = selectedHubKey === k;
                        return (
                          <button
                            key={k}
                            onClick={() => setSelectedHubKey(k as any)}
                            className={`p-2.5 rounded-lg border text-left transition-all ${
                              isSel
                                ? 'bg-charcoal-900 text-sand-100 border-charcoal-800 shadow-md scale-105'
                                : 'bg-sand-100 border-sand-300 text-charcoal-800 hover:bg-sand-200'
                            }`}
                          >
                            <span className="font-mono text-[10px] font-bold block">{hub.code}</span>
                            <span className="text-xs font-black truncate block mt-0.5">{hub.name.split(' ')[0]}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Active Hub Card */}
                    <div className="p-4 rounded-xl bg-sand-200/80 border border-sand-300 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-black text-charcoal-900 text-sm">{currentHub.name}</h4>
                          <p className="text-[11px] text-charcoal-500">Footprint: {currentHub.sqft} • Capacity: {currentHub.capacity}</p>
                        </div>
                        <span className="text-xs font-mono font-black text-charcoal-900 bg-sand-100 px-2 py-1 rounded border border-sand-400">
                          {currentHub.stock} Total Units
                        </span>
                      </div>

                      {/* Active transit banner */}
                      <div className="p-3 rounded-lg bg-sand-100 border border-sand-300/90 flex items-center justify-between text-xs">
                        <div>
                          <span className="text-[9px] font-bold uppercase text-charcoal-400 block">Scheduled Inter-Hub Transit</span>
                          <span className="font-bold text-charcoal-900">{currentHub.transitRoute}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-bold text-olive-700 block">+{currentHub.transferUnits} units</span>
                          <span className="text-[10px] text-charcoal-500">ETA: {currentHub.eta}</span>
                        </div>
                      </div>

                      {/* Simulate Transfer Button */}
                      <div className="pt-2">
                        {transferTriggered ? (
                          <div className="p-2.5 rounded-lg bg-olive-100 border border-olive-300 text-xs font-bold text-olive-900 flex items-center gap-2 animate-fade-in">
                            <CheckCircle2 className="w-4 h-4 text-olive-600 shrink-0" />
                            <span>Transfer dispatched via SQS! Stock held in escrow until dock check-in.</span>
                          </div>
                        ) : (
                          <button
                            onClick={handleSimulateTransfer}
                            className="w-full py-2.5 rounded-lg bg-charcoal-900 text-sand-100 text-xs font-bold hover:bg-charcoal-800 transition-all flex items-center justify-center gap-2 shadow-md active:scale-98"
                          >
                            <Truck className="w-3.5 h-3.5" /> Dispatch Simulated Inter-Hub Transfer ({currentHub.transferUnits} units)
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Tab 4: AWS Serverless Architecture ── */}
                {activeTour === 'serverless' && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="flex items-center justify-between pb-3 border-b border-sand-300">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-charcoal-400">
                          Production Cloud Topology
                        </span>
                        <h3 className="text-lg font-black text-charcoal-900">
                          AWS Serverless Event Spine
                        </h3>
                      </div>
                      <span className="font-mono text-xs font-bold text-olive-700 bg-olive-50 px-2 py-0.5 rounded border border-olive-200">
                        Total P95: 58ms
                      </span>
                    </div>

                    {/* Step Waterfall */}
                    <div className="space-y-2">
                      {archSteps.map((step) => {
                        const isSelected = selectedArchStep === step.step;
                        return (
                          <button
                            key={step.step}
                            onClick={() => setSelectedArchStep(step.step)}
                            className={`w-full p-2.5 rounded-lg border text-left transition-all flex items-center justify-between text-xs ${
                              isSelected
                                ? 'bg-charcoal-900 text-sand-100 border-charcoal-800 shadow-md'
                                : 'bg-sand-100/90 text-charcoal-800 border-sand-300 hover:bg-sand-200'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="font-mono text-[10px] font-bold text-charcoal-400">0{step.step}</span>
                              <span className="font-black truncate">{step.name}</span>
                              <span className={`text-[10px] truncate hidden sm:inline ${isSelected ? 'text-sand-400' : 'text-charcoal-500'}`}>
                                • {step.role}
                              </span>
                            </div>
                            <span className="font-mono font-bold text-[11px] text-olive-600 bg-olive-50/20 px-1.5 py-0.5 rounded border border-olive-500/30 shrink-0">
                              {step.time}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Step Detail Box */}
                    <div className="p-3 rounded-lg bg-sand-200/80 border border-sand-300 text-xs">
                      <span className="text-[9px] font-bold uppercase text-charcoal-500 block mb-0.5">
                        Selected Service Specification
                      </span>
                      <p className="font-mono font-bold text-charcoal-900">
                        {archSteps[selectedArchStep - 1].spec}
                      </p>
                      <p className="text-[11px] text-charcoal-600 mt-1">
                        {archSteps[selectedArchStep - 1].role}. Guaranteed zero data loss with Dead Letter Queue (DLQ) fallback.
                      </p>
                    </div>
                  </div>
                )}

                {/* Footer Canvas Bar */}
                <div className="pt-4 border-t border-sand-300 mt-4 flex items-center justify-between text-[11px] text-charcoal-500">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-olive-600" />
                    Live Dynamic 3D Simulation
                  </span>
                  <span className="font-mono font-bold text-charcoal-700">Tilt mouse for perspective</span>
                </div>
              </div>
            </TiltCard3D>
          </div>

          {/* Right: Explainability & Operational Gist */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-5">
            <div className="rounded-2xl border border-sand-400/90 bg-sand-100/90 p-6 shadow-md space-y-5">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-charcoal-400 block mb-1">
                  Why It Matters
                </span>
                <h3 className="text-xl font-black text-charcoal-900 leading-tight">
                  {activeTour === 'pulse' && 'Eliminate phantom inventory across online & offline.'}
                  {activeTour === 'replenish' && 'Stop locking capital into slow-moving dead stock.'}
                  {activeTour === 'hubs' && 'Deliver next-day orders without burning freight budget.'}
                  {activeTour === 'serverless' && 'Handle flash-sale peak volume with 0% dropped transactions.'}
                </h3>
              </div>

              <div className="space-y-3 text-xs text-charcoal-600 leading-relaxed">
                {activeTour === 'pulse' && (
                  <>
                    <p>
                      <strong>The Problem:</strong> Traditional ERPs sync in 6 to 24-hour batches. When an item sells in a retail store, online stores continue taking orders, resulting in embarrassing backorders and cancellations.
                    </p>
                    <p>
                      <strong>Innvora's Fix:</strong> Barcodes beep, SQS queues ingest, and DynamoDB updates atomically in under 38 milliseconds. Every channel shares the same immutable reality.
                    </p>
                  </>
                )}

                {activeTour === 'replenish' && (
                  <>
                    <p>
                      <strong>The Problem:</strong> Static min/max thresholds fail when sales accelerate during weekends or promotions. Teams either run out or order months of excess inventory.
                    </p>
                    <p>
                      <strong>Innvora's Fix:</strong> The formula continually factors lead time, current sales velocity, and safety buffers to generate the exact purchase order quantity for suppliers.
                    </p>
                  </>
                )}

                {activeTour === 'hubs' && (
                  <>
                    <p>
                      <strong>The Problem:</strong> One regional warehouse sits with excess stock while another runs dry. Splitting orders across regions increases customer delivery wait times and freight expenses.
                    </p>
                    <p>
                      <strong>Innvora's Fix:</strong> Real-time cross-depot balancing suggests optimal transfer dispatches days before localized stockouts occur.
                    </p>
                  </>
                )}

                {activeTour === 'serverless' && (
                  <>
                    <p>
                      <strong>The Problem:</strong> High-traffic sales spikes crash monolithic inventory relational databases due to table lock contention.
                    </p>
                    <p>
                      <strong>Innvora's Fix:</strong> SQS FIFO queues act as a shock absorber. AWS Lambda on Graviton scales horizontally to process thousands of transactions per second seamlessly.
                    </p>
                  </>
                )}
              </div>

              {/* Quick Spec Checklist */}
              <div className="pt-4 border-t border-sand-300 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-charcoal-800">
                  <CheckCircle2 className="w-4 h-4 text-olive-600 shrink-0" />
                  <span>Sub-second ledger mutability</span>
                </div>
                <div className="flex items-center gap-2 text-charcoal-800">
                  <CheckCircle2 className="w-4 h-4 text-olive-600 shrink-0" />
                  <span>AWS Dead Letter Queue (DLQ) 0% data drop guarantee</span>
                </div>
                <div className="flex items-center gap-2 text-charcoal-800">
                  <CheckCircle2 className="w-4 h-4 text-olive-600 shrink-0" />
                  <span>Integrated supplier PO dispatch pipeline</span>
                </div>
              </div>
            </div>

            {/* Bottom Callout */}
            <div className="p-4 rounded-xl bg-sand-200/90 border border-sand-400 text-xs text-charcoal-700 flex items-center justify-between">
              <div>
                <strong className="block text-charcoal-900">Ready to explore with your inventory?</strong>
                <span>Open the control center to test live filtering, search, and ordering.</span>
              </div>
              <a
                href="#inventory"
                className="px-4 py-2 rounded-lg bg-charcoal-900 text-sand-100 font-bold text-xs shrink-0 hover:bg-charcoal-800 transition-colors"
              >
                Inspect SKUs
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ── Event ticker & live movement section ──────────────────────────────────── */
const LIVE_STREAM_EVENTS = [
  { id: '1', type: 'SALE', sku: 'PROD-EAR-01', name: 'Wireless Earbuds', loc: 'BLR Warehouse', delta: -12, time: '3s ago', color: '#C6745A' },
  { id: '2', type: 'RESTOCK', sku: 'PROD-SPK-03', name: 'Bluetooth Speaker Gen 3', loc: 'Mumbai Central', delta: +80, time: '14s ago', color: '#6B7C3D' },
  { id: '3', type: 'TRANSFER', sku: 'PROD-CAM-02', name: '4K Action Camera', loc: 'Delhi NCR Hub', delta: -30, time: '28s ago', color: '#8C7A65' },
  { id: '4', type: 'SALE', sku: 'PROD-PHN-01', name: 'Phone Stand Pro', loc: 'Hyderabad Depot', delta: -5, time: '41s ago', color: '#C6745A' },
  { id: '5', type: 'RETURN', sku: 'PROD-TAB-04', name: 'Pro Tablet Stand', loc: 'BLR Warehouse', delta: +3, time: '55s ago', color: '#8C7A65' },
  { id: '6', type: 'RESTOCK', sku: 'PROD-EAR-01', name: 'Wireless Earbuds', loc: 'Delhi NCR Hub', delta: +120, time: '1m ago', color: '#6B7C3D' },
];

const MovementSection: React.FC = () => {
  return (
    <section className="relative overflow-hidden" style={{ background: '#E9E0D2', paddingTop: '90px', paddingBottom: '90px' }}>
      <div className="max-w-screen-xl mx-auto px-6 sm:px-10 lg:px-16">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sand-300/90 border border-sand-400 mb-4">
            <span className="ops-live-dot" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-charcoal-700">
              Continuous Event Ledger
            </span>
          </div>
          <h2
            className="font-black text-charcoal-900 mb-4 tracking-tight"
            style={{ fontSize: 'clamp(32px, 4.5vw, 56px)', lineHeight: 1.05 }}
          >
            Inventory doesn't sit still.<br />
            <span style={{ color: '#8C7A65' }}>Every transaction leaves a pulse.</span>
          </h2>
          <p className="text-charcoal-600 max-w-xl mx-auto text-[15px] leading-relaxed">
            Every physical barcode scan, retail register transaction, and dock receiving intake is captured in real time and immediately processed across the AWS FIFO pipeline.
          </p>
        </div>

        {/* Live Operational Counters Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 p-5 rounded-xl border border-sand-400/80 bg-sand-100 shadow-sm">
          <div className="border-r border-sand-300 pr-3 last:border-0">
            <p className="text-[10px] font-black uppercase tracking-wider text-charcoal-400">Events Processed Today</p>
            <p className="text-2xl sm:text-3xl font-black font-mono text-charcoal-950 mt-1">2,840</p>
            <p className="text-[10px] text-olive-700 font-semibold mt-0.5">● Sub-second ledger updates</p>
          </div>
          <div className="border-r border-sand-300 pr-3 last:border-0">
            <p className="text-[10px] font-black uppercase tracking-wider text-charcoal-400">P95 SQS Latency</p>
            <p className="text-2xl sm:text-3xl font-black font-mono text-charcoal-950 mt-1">38ms</p>
            <p className="text-[10px] text-charcoal-500 mt-0.5">FIFO ordering guaranteed</p>
          </div>
          <div className="border-r border-sand-300 pr-3 last:border-0">
            <p className="text-[10px] font-black uppercase tracking-wider text-charcoal-400">Event Drops</p>
            <p className="text-2xl sm:text-3xl font-black font-mono text-olive-700 mt-1">0%</p>
            <p className="text-[10px] text-charcoal-500 mt-0.5">Dead-letter queue protected</p>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-charcoal-400">Synchronized Hubs</p>
            <p className="text-2xl sm:text-3xl font-black font-mono text-charcoal-950 mt-1">4 Nodes</p>
            <p className="text-[10px] text-charcoal-500 mt-0.5">Nationwide fulfillment mesh</p>
          </div>
        </div>

        {/* 2-Column Live Ingestion Theater with 3D Tilt */}
        <div className="grid lg:grid-cols-12 gap-8 items-stretch mb-10">
          {/* Left: Simulated Live Stream */}
          <div className="lg:col-span-7 flex flex-col">
            <TiltCard3D maxTilt={4} perspective={1400} scale={1.01} className="w-full h-full flex flex-col">
              <div className="h-full rounded-xl border border-sand-400/90 bg-sand-100 p-6 shadow-xl flex flex-col justify-between bevel-3d">
                <div className="flex items-center justify-between pb-4 border-b border-sand-300">
                  <div className="flex items-center gap-2">
                    <span className="ops-live-dot" />
                    <span className="text-xs font-black uppercase tracking-wider text-charcoal-900">
                      Live Event Ledger Stream
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-charcoal-500 bg-sand-200 px-2 py-0.5 rounded border border-sand-300">
                    Auto-Refreshing
                  </span>
                </div>

                <div className="my-4 space-y-2.5">
                  {LIVE_STREAM_EVENTS.map((ev) => {
                    const isPositive = ev.delta > 0;
                    return (
                      <div
                        key={ev.id}
                        className="p-3 rounded-lg border border-sand-300 bg-sand-50/90 hover:border-sand-400 transition-colors flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span
                            className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider shrink-0"
                            style={{
                              background: ev.color + '18',
                              color: ev.color,
                              border: `1px solid ${ev.color}40`,
                            }}
                          >
                            {ev.type}
                          </span>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-xs font-bold text-charcoal-800">{ev.sku}</span>
                              <span className="text-xs text-charcoal-600 truncate hidden sm:inline">• {ev.name}</span>
                            </div>
                            <p className="text-[10px] text-charcoal-400">{ev.loc} · {ev.time}</p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span
                            className="font-mono font-black text-sm"
                            style={{ color: isPositive ? '#6B7C3D' : '#C6745A' }}
                          >
                            {isPositive ? `+${ev.delta}` : ev.delta}
                          </span>
                          <p className="text-[9px] text-charcoal-400">units</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-3 border-t border-sand-300 flex items-center justify-between text-xs text-charcoal-500">
                  <span>Capturing mutations across all sales channels</span>
                  <span className="font-semibold text-charcoal-700">OpenSearch 2.11 Indexed</span>
                </div>
              </div>
            </TiltCard3D>
          </div>

          {/* Right: Regional Velocity & Throughput Gauge */}
          <div className="lg:col-span-5 flex flex-col">
            <TiltCard3D maxTilt={4} perspective={1400} scale={1.01} className="w-full h-full flex flex-col">
              <div className="h-full rounded-xl border border-sand-400/90 bg-sand-100 p-6 shadow-xl flex flex-col justify-between bevel-3d">
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-sand-300 mb-4">
                    <span className="text-xs font-black uppercase tracking-wider text-charcoal-900">
                      Regional Ingestion Velocity
                    </span>
                    <span className="font-mono text-[11px] font-bold text-olive-700 bg-olive-50 px-2 py-0.5 rounded border border-olive-200">
                      12.4 msg/sec
                    </span>
                  </div>

                  <p className="text-xs text-charcoal-600 mb-6 leading-relaxed">
                    Distribution of real-time inventory events across regional AWS ingress endpoints over the last 24 hours.
                  </p>

                  {/* Hub distribution progress bars */}
                  <div className="space-y-4">
                    {[
                      { hub: 'Mumbai Central (MUM-CENTRAL)', pct: 36, color: '#272522', events: '1,022 events' },
                      { hub: 'Delhi NCR Logistics (DEL-HUB)', pct: 31, color: '#8C7A65', events: '880 events' },
                      { hub: 'Bengaluru Central (BLR-WH)', pct: 21, color: '#6B7C3D', events: '596 events' },
                      { hub: 'Hyderabad Air Cargo (HYD-DEPOT)', pct: 12, color: '#C6745A', events: '342 events' },
                    ].map((item) => (
                      <div key={item.hub} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-charcoal-800">{item.hub}</span>
                          <span className="font-mono text-[11px] text-charcoal-500">{item.events} ({item.pct}%)</span>
                        </div>
                        <div className="h-2 rounded-full bg-sand-300 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${item.pct}%`, background: item.color }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 p-3 rounded-lg bg-sand-200/80 border border-sand-300 text-xs text-charcoal-700">
                  <strong className="block text-charcoal-900 mb-0.5">High-Velocity Ingestion Protection:</strong>
                  Automatic SQS partition sharding absorbs retail peak spikes without database locking.
                </div>
              </div>
            </TiltCard3D>
          </div>
        </div>
      </div>

      {/* Infinite Scrolling Marquee */}
      <EventTicker />
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
          {/* Left — warehouse shelves image in 3D */}
          <div ref={refL} className="reveal-left relative">
            <TiltCard3D maxTilt={6} perspective={1200} scale={1.02} className="w-full">
              <div className="relative overflow-hidden rounded-xl shadow-2xl border border-sand-400/80 bevel-3d" style={{ aspectRatio: '4/3' }}>
                <img
                  src="/images/warehouse-shelves.jpg"
                  alt="Warehouse shelving system"
                  className="w-full h-full object-cover"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(135deg, rgba(39,37,34,0.08) 0%, transparent 60%)',
                  }}
                />
                {/* Floating corner metric chip in 3D */}
                <div
                  className="absolute bottom-4 left-4 px-4 py-2.5 border border-sand-400/80 chip-3d-float rounded-xl"
                  style={{ background: 'rgba(248,244,236,0.95)', transform: 'translateZ(30px)' }}
                >
                  <p className="text-[9px] font-black uppercase tracking-widest text-charcoal-400">
                    Stock Coverage
                  </p>
                  <p className="text-2xl font-black text-charcoal-900 mt-0.5">14.2 days</p>
                  <p className="text-[9px] text-olive-700 font-semibold">● 94.8% SLA Protected</p>
                </div>
              </div>
            </TiltCard3D>
          </div>

          {/* Right — inventory interface in 3D */}
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

            {/* Inventory UI mock in 3D */}
            <TiltCard3D maxTilt={5} perspective={1200} scale={1.01} className="w-full">
              <div className="border border-sand-500 bg-sand-100 overflow-hidden rounded-xl shadow-xl bevel-3d">
                <div className="px-4 py-3 border-b border-sand-400 flex items-center justify-between" style={{ background: '#EDE5D8' }}>
                  <span className="text-[10px] font-black uppercase tracking-widest text-charcoal-600">Inventory Surface</span>
                  <span className="text-[9px] text-charcoal-400 italic">Live Interactive View</span>
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
                    <div key={item.sku} className="px-4 py-3 border-b border-sand-300 last:border-0 hover:bg-sand-200/50 transition-colors">
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
            </TiltCard3D>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ── Replenishment Section ────────────────────────────────────────────────── */
interface ReorderItem {
  id: string;
  sku: string;
  name: string;
  hub: string;
  status: string;
  available: number;
  demand: number;
  leadTime: number;
  rop: number;
  recommendedOrder: number;
  gap: number;
  runwayDays: number;
  dailyBurn: number[];
  supplier: string;
}

const REORDER_ITEMS: ReorderItem[] = [
  {
    id: 'earbuds',
    sku: 'PROD-EAR-01',
    name: 'Wireless Noise-Canceling Earbuds',
    hub: 'BLR Warehouse',
    status: 'CRITICAL',
    available: 18,
    demand: 5,
    leadTime: 7,
    rop: 35,
    recommendedOrder: 50,
    gap: 17,
    runwayDays: 3.6,
    dailyBurn: [18, 13, 8, 3, 0, 0, 0],
    supplier: 'Acoustic Labs Shenzhen (Direct)',
  },
  {
    id: 'speaker',
    sku: 'PROD-SPK-03',
    name: 'Bluetooth Speaker Gen 3',
    hub: 'Mumbai Central',
    status: 'REORDER_SOON',
    available: 32,
    demand: 4,
    leadTime: 5,
    rop: 28,
    recommendedOrder: 40,
    gap: 8,
    runwayDays: 8.0,
    dailyBurn: [32, 28, 24, 20, 16, 12, 8],
    supplier: 'SoundCore Components India',
  },
  {
    id: 'camera',
    sku: 'PROD-CAM-02',
    name: '4K Action Camera Ultra',
    hub: 'Delhi NCR Hub',
    status: 'HEALTHY',
    available: 45,
    demand: 2,
    leadTime: 6,
    rop: 18,
    recommendedOrder: 0,
    gap: 0,
    runwayDays: 22.5,
    dailyBurn: [45, 43, 41, 39, 37, 35, 33],
    supplier: 'VisionTech Optronics Japan',
  },
  {
    id: 'tablet',
    sku: 'PROD-TAB-04',
    name: 'Pro Tablet Stand Aluminum',
    hub: 'Hyderabad Depot',
    status: 'OVERSTOCKED',
    available: 95,
    demand: 1,
    leadTime: 4,
    rop: 15,
    recommendedOrder: 0,
    gap: 0,
    runwayDays: 95.0,
    dailyBurn: [95, 94, 93, 92, 91, 90, 89],
    supplier: 'Apex Metalworks Pune',
  },
];

const ReplenishmentSection: React.FC = () => {
  const [selectedItemId, setSelectedItemId] = useState('earbuds');
  const [approved, setApproved] = useState(false);
  const current = REORDER_ITEMS.find((item) => item.id === selectedItemId) || REORDER_ITEMS[0];

  const handleApprove = () => {
    setApproved(true);
    setTimeout(() => setApproved(false), 3000);
  };

  return (
    <section id="replenishment" className="relative overflow-hidden" style={{ background: '#1A1815', paddingTop: '100px', paddingBottom: '100px' }}>
      {/* Background blueprint overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: 'radial-gradient(circle, #4A3E31 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      <div className="relative max-w-screen-xl mx-auto px-6 sm:px-10 lg:px-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#27231E] border border-[#3E352B] mb-4">
            <span className="ops-live-dot" style={{ background: '#C6745A' }} />
            <span className="text-[10px] font-black uppercase tracking-[0.24em] text-[#C4B49F]">
              Intelligence Layer • Replenishment Math
            </span>
          </div>
          <h2
            className="font-black tracking-tight mb-4 text-[#F2ECE2]"
            style={{ fontSize: 'clamp(32px, 4.5vw, 56px)', lineHeight: 1.05 }}
          >
            Replenishment Intelligence.<br />
            <span style={{ color: '#A89885' }}>Predictive reorder math. Zero guesswork.</span>
          </h2>
          <p className="text-[15px] leading-relaxed max-w-xl mx-auto text-[#8C7E6E]">
            Not generic low-stock alerts — actionable purchase recommendations backed by daily consumption velocity, supplier delivery lead times, and safety buffers.
          </p>

          {/* Interactive SKU Picker */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
            {REORDER_ITEMS.map((item) => {
              const isSelected = item.id === selectedItemId;
              const badgeBg = item.status === 'CRITICAL' ? '#B05A3E' : item.status === 'REORDER_SOON' ? '#C6745A' : item.status === 'OVERSTOCKED' ? '#8C7A65' : '#6B7C3D';
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setSelectedItemId(item.id);
                    setApproved(false);
                  }}
                  className={`px-4 py-2.5 rounded-lg border text-xs font-bold transition-all flex items-center gap-2 ${
                    isSelected
                      ? 'border-[#C4B49F] bg-[#292520] text-[#F2ECE2] shadow-lg scale-105'
                      : 'border-[#332D26] bg-[#201D19] text-[#8C7E6E] hover:border-[#4A3F33]'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full" style={{ background: badgeBg }} />
                  <span>{item.name}</span>
                  <span className="font-mono text-[10px] opacity-75">({item.status})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2-Column Replenishment Theater */}
        <div className="grid lg:grid-cols-12 gap-8 items-stretch">
          {/* Left: Active Diagnostic Card */}
          <div
            className="lg:col-span-6 rounded-xl border border-[#3E352B] p-6 sm:p-7 shadow-2xl flex flex-col justify-between"
            style={{ background: '#221F1B' }}
          >
            <div>
              {/* Header */}
              <div className="flex items-start justify-between gap-3 border-b border-[#352F28] pb-4 mb-5">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#7A6E5F]">
                    Reorder Diagnostic Card
                  </span>
                  <h3 className="text-xl font-black text-[#F0EAE0] mt-1">
                    {current.name}
                  </h3>
                  <p className="font-mono text-xs text-[#8C7E6E] mt-0.5">
                    {current.sku} • {current.hub}
                  </p>
                </div>
                <span
                  className="px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider"
                  style={{
                    background: current.status === 'CRITICAL' ? '#B05A3E26' : current.status === 'REORDER_SOON' ? '#C6745A26' : '#6B7C3D26',
                    color: current.status === 'CRITICAL' ? '#C6745A' : current.status === 'REORDER_SOON' ? '#D9826C' : '#8FA855',
                    border: `1px solid ${current.status === 'CRITICAL' ? '#B05A3E50' : '#6B7C3D50'}`,
                  }}
                >
                  {current.status}
                </span>
              </div>

              {/* 4 Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
                <div className="p-3 rounded bg-[#1A1815] border border-[#332D26]">
                  <p className="text-[9px] uppercase font-bold text-[#7A6E5F]">On Hand</p>
                  <p className="text-lg font-black font-mono text-[#F2ECE2] mt-0.5">{current.available}</p>
                </div>
                <div className="p-3 rounded bg-[#1A1815] border border-[#332D26]">
                  <p className="text-[9px] uppercase font-bold text-[#7A6E5F]">Demand</p>
                  <p className="text-lg font-black font-mono text-[#F2ECE2] mt-0.5">{current.demand}/day</p>
                </div>
                <div className="p-3 rounded bg-[#1A1815] border border-[#332D26]">
                  <p className="text-[9px] uppercase font-bold text-[#7A6E5F]">Lead Time</p>
                  <p className="text-lg font-black font-mono text-[#F2ECE2] mt-0.5">{current.leadTime}d</p>
                </div>
                <div className="p-3 rounded bg-[#1A1815] border border-[#332D26]">
                  <p className="text-[9px] uppercase font-bold text-[#7A6E5F]">Reorder Point</p>
                  <p className="text-lg font-black font-mono text-[#F2ECE2] mt-0.5">{current.rop}</p>
                </div>
              </div>

              {/* Recommended Order Banner */}
              <div className="p-4 rounded-lg bg-[#2B2722] border border-[#483F34] flex items-center justify-between mb-5">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#A89885]">
                    Recommended Purchase Order
                  </span>
                  <p className="text-2xl font-black font-mono text-[#F2ECE2] mt-0.5">
                    {current.recommendedOrder > 0 ? `${current.recommendedOrder} units` : 'No Action Required'}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#7A6E5F] block">Primary Supplier</span>
                  <span className="text-xs font-bold text-[#C5B7A5] truncate max-w-[180px] inline-block">
                    {current.supplier}
                  </span>
                </div>
              </div>

              {/* Why This Decision Box */}
              <div className="p-3.5 rounded bg-[#1A1815] border border-[#352F28] flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-[#C6745A] shrink-0 mt-0.5" />
                <p className="text-xs text-[#A89885] leading-relaxed">
                  <strong className="text-[#EFEBE4]">Why? </strong>
                  {current.recommendedOrder > 0
                    ? `Current stock of ${current.available} is insufficient to cover the ${current.leadTime}-day supplier lead time requirement (${current.leadTime * current.demand} units demand). Immediate order of ${current.recommendedOrder} units restores safety buffers.`
                    : `Stock coverage of ${current.available} units exceeds the calculated reorder threshold of ${current.rop} units. Capital is optimized without stockout exposure.`}
                </p>
              </div>
            </div>

            {/* Approve Button */}
            <div className="pt-5 border-t border-[#352F28] mt-5 flex items-center justify-between">
              {approved ? (
                <span className="text-xs font-bold text-[#6B7C3D] flex items-center gap-1.5 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 text-[#6B7C3D]" /> Purchase Order PO-8821 drafted and queued for EDI dispatch
                </span>
              ) : (
                <span className="text-[11px] text-[#7A6E5F]">
                  Runway: <strong className="text-[#EFEBE4]">{current.runwayDays} days</strong> until stockout
                </span>
              )}

              {current.recommendedOrder > 0 && (
                <button
                  onClick={handleApprove}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded bg-[#F2ECE2] text-[#272522] font-black text-xs hover:bg-white transition-all shadow-md"
                >
                  Approve Order ({current.recommendedOrder} units) <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Right: Stockout Runway Curve & Formula Visualization */}
          <div
            className="lg:col-span-6 rounded-xl border border-[#3E352B] p-6 sm:p-7 shadow-2xl flex flex-col justify-between"
            style={{ background: '#221F1B' }}
          >
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#352F28] mb-4">
                <span className="text-xs font-black uppercase tracking-wider text-[#A89885]">
                  7-Day Stock Runway Projection
                </span>
                <span className="font-mono text-[10px] text-[#6B7C3D] bg-[#1A2014] px-2 py-0.5 rounded border border-[#2D3D20]">
                  Dynamic Velocity Model
                </span>
              </div>

              {/* Stock burn visual SVG */}
              <div className="h-44 rounded-lg bg-[#181613] border border-[#332D26] p-3 mb-5 overflow-hidden">
                <svg viewBox="0 0 480 140" className="w-full h-full" role="img" aria-label="Stock trajectory">
                  <defs>
                    <linearGradient id="burnGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#C6745A" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#C6745A" stopOpacity="0.02" />
                    </linearGradient>
                  </defs>
                  {/* Grid lines */}
                  <line x1="20" x2="460" y1="30" y2="30" stroke="#2D2721" strokeDasharray="3 3" />
                  <line x1="20" x2="460" y1="70" y2="70" stroke="#2D2721" strokeDasharray="3 3" />
                  <line x1="20" x2="460" y1="110" y2="110" stroke="#2D2721" strokeDasharray="3 3" />

                  {/* ROP Threshold Guide */}
                  <line x1="20" x2="460" y1="65" y2="65" stroke="#8C7A65" strokeWidth="1.5" strokeDasharray="4 4" />
                  <text x="25" y="60" fontSize="9" fill="#8C7A65" fontFamily="monospace">ROP Level ({current.rop})</text>

                  {/* Burn curve points */}
                  {(() => {
                    const maxVal = Math.max(...current.dailyBurn, current.rop + 10, 40);
                    const pts = current.dailyBurn.map((val, i) => {
                      const x = 30 + i * (400 / 6);
                      const y = 120 - (val / maxVal) * 95;
                      return `${x},${y}`;
                    }).join(' ');

                    return (
                      <>
                        <polygon points={`30,125 ${pts} 430,125`} fill="url(#burnGrad)" />
                        <polyline points={pts} fill="none" stroke={current.status === 'CRITICAL' ? '#C6745A' : '#6B7C3D'} strokeWidth="3" strokeLinecap="round" />
                        {current.dailyBurn.map((val, i) => {
                          const x = 30 + i * (400 / 6);
                          const y = 120 - (val / maxVal) * 95;
                          return (
                            <g key={i}>
                              <circle cx={x} cy={y} r="3.5" fill="#F2ECE2" stroke={current.status === 'CRITICAL' ? '#C6745A' : '#6B7C3D'} strokeWidth="2" />
                              <text x={x} y="136" textAnchor="middle" fontSize="9" fill="#7A6E5F" fontFamily="monospace">D+{i}</text>
                            </g>
                          );
                        })}
                      </>
                    );
                  })()}
                </svg>
              </div>

              {/* Mathematical Formula Breakdown */}
              <div className="space-y-2 text-xs">
                <div className="p-3 rounded bg-[#1A1815] border border-[#332D26]">
                  <span className="text-[9px] font-black uppercase tracking-wider text-[#7A6E5F] block mb-1">
                    Replenishment Formula
                  </span>
                  <p className="font-mono text-[11px] text-[#A89885]">
                    Recommended Qty = (Lead Time × Daily Demand) + Safety Buffer - Available On Hand
                  </p>
                </div>
                <div className="p-3 rounded bg-[#1A1815] border border-[#332D26] flex items-center justify-between">
                  <span className="text-[#8C7E6E]">Lead Time Demand:</span>
                  <span className="font-mono font-bold text-[#EFEBE4]">{current.leadTime * current.demand} units</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#352F28] mt-4 flex items-center justify-between text-[11px] text-[#7A6E5F]">
              <span>Dynamic safety buffers protect working capital</span>
              <span className="text-[#6B7C3D]">Zero stockout SLA</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ── Hub Section ─────────────────────────────────────────────────────────── */
interface HubDetail {
  id: string;
  name: string;
  code: string;
  city: string;
  skus: number;
  critical: number;
  reorder: number;
  health: number;
  events: string;
  sqft: string;
  capacity: number;
  manager: string;
  status: string;
  leadCategories: string[];
  activeTransfers: { route: string; sku: string; units: number; eta: string }[];
}

const HUB_PROFILES: Record<string, HubDetail> = {
  'Delhi NCR': {
    id: 'del-hub',
    name: 'Delhi NCR Logistics Depot',
    code: 'DEL-HUB',
    city: 'Delhi NCR',
    skus: 18,
    critical: 0,
    reorder: 6,
    health: 92,
    events: '441 today',
    sqft: '54,000 sq.ft',
    capacity: 76,
    manager: 'A. Verma (Operations Lead)',
    status: 'Optimal Intake',
    leadCategories: ['Smart Electronics (42%)', 'Audio Systems (34%)', 'Accessories (24%)'],
    activeTransfers: [
      { route: 'BLR → DEL', sku: 'PROD-CAM-02', units: 30, eta: 'Arriving in 6h' },
    ],
  },
  Mumbai: {
    id: 'mum-central',
    name: 'Mumbai Central Distribution Center',
    code: 'MUM-CENTRAL',
    city: 'Mumbai',
    skus: 14,
    critical: 2,
    reorder: 4,
    health: 78,
    events: '312 today',
    sqft: '62,000 sq.ft',
    capacity: 91,
    manager: 'R. Patel (Depot Manager)',
    status: 'High Volume Shift',
    leadCategories: ['Audio Systems (55%)', 'Wearables (28%)', 'Peripherals (17%)'],
    activeTransfers: [
      { route: 'MUM → HYD', sku: 'PROD-SPK-03', units: 45, eta: 'In Transit (Air Cargo)' },
    ],
  },
  Bengaluru: {
    id: 'blr-wh',
    name: 'Bengaluru Central Fulfillment Hub',
    code: 'BLR-WH',
    city: 'Bengaluru',
    skus: 11,
    critical: 3,
    reorder: 3,
    health: 63,
    events: '228 today',
    sqft: '45,000 sq.ft',
    capacity: 82,
    manager: 'S. Sharma (Hub Lead)',
    status: 'Restock Receiving In Progress',
    leadCategories: ['Smart Wearables (48%)', 'Audio Systems (32%)', 'Tablets (20%)'],
    activeTransfers: [
      { route: 'DEL → BLR', sku: 'PROD-EAR-01', units: 50, eta: 'Dispatched from Delhi' },
    ],
  },
  Hyderabad: {
    id: 'hyd-depot',
    name: 'Hyderabad Air Cargo Depot',
    code: 'HYD-DEPOT',
    city: 'Hyderabad',
    skus: 9,
    critical: 1,
    reorder: 2,
    health: 82,
    events: '183 today',
    sqft: '38,000 sq.ft',
    capacity: 68,
    manager: 'K. Reddy (Logistics Lead)',
    status: 'Express Dispatch Active',
    leadCategories: ['Tablet Hardware (40%)', 'Cameras (35%)', 'Audio (25%)'],
    activeTransfers: [
      { route: 'MUM → HYD', sku: 'PROD-SPK-03', units: 45, eta: 'Expected 2h' },
    ],
  },
};

const HubSection: React.FC = () => {
  const [activeHubKey, setActiveHubKey] = useState('Delhi NCR');
  const activeHub = HUB_PROFILES[activeHubKey] || HUB_PROFILES['Delhi NCR'];

  return (
    <section id="hubs" className="relative overflow-hidden" style={{ background: '#E9E0D2', paddingTop: '100px', paddingBottom: '100px' }}>
      <div className="max-w-screen-xl mx-auto px-6 sm:px-10 lg:px-16">
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sand-300/80 border border-sand-400 mb-4">
            <span className="w-2 h-2 rounded-full bg-charcoal-700" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-charcoal-700">
              Nationwide Multi-Hub Operations
            </span>
          </div>
          <h2
            className="font-black text-charcoal-900 tracking-tight mb-4"
            style={{ fontSize: 'clamp(32px, 4.5vw, 56px)', lineHeight: 1.05 }}
          >
            One synchronized network.<br />
            <span style={{ color: '#8C7A65' }}>Four fulfillment hubs.</span>
          </h2>
          <p className="text-[15px] text-charcoal-600 leading-relaxed">
            Multi-location inventory orchestration across India. Dynamic stock rebalancing and automated inter-hub transfer recommendations based on regional velocity.
          </p>
        </div>

        {/* 2-Column Hub Operations Theater */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Left: Interactive Hub Switcher & Nationwide Route Matrix */}
          <div className="lg:col-span-4 space-y-4">
            <p className="text-[10px] font-black uppercase tracking-wider text-charcoal-500 px-1">
              Select Regional Hub
            </p>
            <div className="space-y-2.5">
              {Object.keys(HUB_PROFILES).map((key) => {
                const hub = HUB_PROFILES[key];
                const isSelected = activeHubKey === key;
                return (
                  <button
                    key={key}
                    onClick={() => setActiveHubKey(key)}
                    className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-center justify-between ${
                      isSelected
                        ? 'bg-charcoal-900 border-charcoal-900 text-sand-100 shadow-md scale-[1.02]'
                        : 'bg-sand-100 border-sand-400/90 text-charcoal-800 hover:bg-sand-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <MapPin
                        className="w-4 h-4 shrink-0"
                        style={{ color: isSelected ? '#C4B49F' : '#8C7A65' }}
                      />
                      <div>
                        <span className="font-bold text-sm block leading-tight">{hub.city}</span>
                        <span className="font-mono text-[10px] opacity-75">{hub.code}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`text-xs font-black px-2 py-0.5 rounded ${
                          isSelected ? 'bg-charcoal-800 text-sand-200' : 'bg-sand-200 text-charcoal-700'
                        }`}
                      >
                        {hub.health}% Healthy
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Inter-Hub Transit Status Box */}
            <div className="p-4 rounded-xl border border-sand-400/80 bg-sand-100/90 mt-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-charcoal-500">
                  Active Stock in Transit
                </span>
                <span className="ops-live-dot" />
              </div>
              {activeHub.activeTransfers.map((trf, idx) => (
                <div key={idx} className="p-3 rounded bg-sand-200/80 border border-sand-300 text-xs">
                  <div className="flex items-center justify-between font-bold text-charcoal-900 mb-1">
                    <span>{trf.route}</span>
                    <span className="text-olive-700 font-mono">+{trf.units} units</span>
                  </div>
                  <p className="text-[11px] text-charcoal-600">{trf.sku} · {trf.eta}</p>
                </div>
              ))}
              <p className="text-[10px] text-charcoal-400 italic text-center pt-1">
                Inter-hub reconciliation handled via SQS FIFO
              </p>
            </div>
          </div>

          {/* Right: Comprehensive Hub Operational Command Panel */}
          <div className="lg:col-span-8">
            <div className="rounded-xl border border-sand-500/80 bg-sand-100 shadow-xl overflow-hidden animate-hub">
              {/* Hub Card Header */}
              <div className="p-6 bg-sand-200/90 border-b border-sand-400/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-charcoal-700 bg-sand-300 px-2 py-0.5 rounded border border-sand-400">
                      {activeHub.code}
                    </span>
                    <span className="text-xs font-bold text-olive-800 bg-olive-100/80 border border-olive-200 px-2 py-0.5 rounded">
                      {activeHub.status}
                    </span>
                  </div>
                  <h3 className="text-2xl font-black text-charcoal-950">
                    {activeHub.name}
                  </h3>
                  <p className="text-xs text-charcoal-600 mt-0.5">
                    Lead: <strong>{activeHub.manager}</strong> · Facility Footprint: <strong>{activeHub.sqft}</strong>
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-charcoal-400">Storage Utilization</p>
                  <p className="text-2xl font-black font-mono text-charcoal-900 mt-0.5">{activeHub.capacity}%</p>
                  <p className="text-[10px] text-charcoal-500">of modeled capacity</p>
                </div>
              </div>

              {/* 4 Hub Metric Counters */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-sand-300">
                <div className="p-5 bg-sand-100">
                  <p className="text-[10px] font-black uppercase tracking-wider text-charcoal-400 mb-1">Monitored SKUs</p>
                  <p className="text-2xl font-black font-mono text-charcoal-900">{activeHub.skus}</p>
                </div>
                <div className="p-5 bg-sand-100">
                  <p className="text-[10px] font-black uppercase tracking-wider text-charcoal-400 mb-1">Critical Stockouts</p>
                  <p className={`text-2xl font-black font-mono ${activeHub.critical > 0 ? 'text-terracotta-700' : 'text-charcoal-900'}`}>
                    {activeHub.critical}
                  </p>
                </div>
                <div className="p-5 bg-sand-100">
                  <p className="text-[10px] font-black uppercase tracking-wider text-charcoal-400 mb-1">Reorder Soon</p>
                  <p className="text-2xl font-black font-mono text-charcoal-900">{activeHub.reorder}</p>
                </div>
                <div className="p-5 bg-sand-100">
                  <p className="text-[10px] font-black uppercase tracking-wider text-charcoal-400 mb-1">Daily Events</p>
                  <p className="text-2xl font-black font-mono text-charcoal-900">{activeHub.events}</p>
                </div>
              </div>

              {/* Health Progress Bar */}
              <div className="p-6 border-b border-sand-300">
                <div className="flex items-center justify-between mb-2 text-xs">
                  <span className="font-bold text-charcoal-800">Operational Inventory Health</span>
                  <span className="font-bold font-mono text-charcoal-900">{activeHub.health}% in guardrails</span>
                </div>
                <div className="h-3 rounded-full bg-sand-300 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 ops-progress"
                    style={{
                      width: `${activeHub.health}%`,
                      background: activeHub.health > 80 ? '#6B7C3D' : activeHub.critical > 1 ? '#B05A3E' : '#C6745A',
                    }}
                  />
                </div>
              </div>

              {/* Category Inventory Breakdown */}
              <div className="p-6 bg-sand-50">
                <p className="text-[10px] font-black uppercase tracking-wider text-charcoal-500 mb-3">
                  Top Product Category Distribution
                </p>
                <div className="grid sm:grid-cols-3 gap-3 text-xs">
                  {activeHub.leadCategories.map((cat, i) => (
                    <div key={i} className="p-3 rounded-lg bg-sand-100 border border-sand-300 font-bold text-charcoal-800">
                      {cat}
                    </div>
                  ))}
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
    <section className="relative overflow-hidden section-depth" style={{ background: '#DDD4C7', paddingTop: '90px', paddingBottom: '90px' }}>
      {/* Background industrial grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: 'linear-gradient(#C4B49F 1px, transparent 1px), linear-gradient(90deg, #C4B49F 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      {/* Ambient depth orbs */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(140,122,101,0.12) 0%, transparent 70%)', filter: 'blur(50px)' }} />
      <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(107,124,61,0.08) 0%, transparent 70%)', filter: 'blur(40px)' }} />

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
          <div className="lg:col-span-6 space-y-0">
            <div className="flex items-center justify-between px-2 mb-4">
              <span className="text-[10px] font-black uppercase tracking-[0.18em] text-charcoal-500">
                Execution Pipeline Stages
              </span>
              <span className="text-[10px] font-bold text-olive-800 bg-olive-100/80 px-2 py-0.5 rounded border border-olive-200">
                Total Latency: ~58ms
              </span>
            </div>

            {activeScenario.stages.map((stage, idx) => {
              const Icon = pipelineIcons[idx] || Zap;
              const isLast = idx === activeScenario.stages.length - 1;
              return (
                <div key={stage.name} className="relative">
                  {/* Animated connector line between stages */}
                  {!isLast && (
                    <div className="absolute left-[22px] top-[52px] w-[3px] z-10" style={{ height: '28px' }}>
                      <div
                        className="w-full h-full"
                        style={{
                          background: `linear-gradient(to bottom, ${activeScenario.color}80, ${activeScenario.color}20)`,
                        }}
                      />
                      {/* Animated dot traveling the connector */}
                      <div
                        className="absolute top-0 left-0 right-0 h-1 rounded-full"
                        style={{
                          background: activeScenario.color,
                          animation: `scan-flow ${1.2 + idx * 0.15}s ease-in-out infinite`,
                          animationDelay: `${idx * 0.25}s`,
                        }}
                      />
                    </div>
                  )}
                  <div
                    className="pipeline-stage-3d p-4 rounded-lg border border-sand-400/90 bg-sand-100/95 shadow-sm flex items-start gap-3.5 group mb-7"
                    style={{ color: activeScenario.color }}
                  >
                    <div
                      className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0 mt-0.5 relative"
                      style={{
                        background: activeScenario.color + '15',
                        border: `1.5px solid ${activeScenario.color}50`,
                        boxShadow: `0 0 16px 2px ${activeScenario.color}18`,
                      }}
                    >
                      <span
                        className="absolute -top-2 -left-2 w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-black text-sand-100"
                        style={{ background: activeScenario.color }}
                      >
                        {idx + 1}
                      </span>
                      <Icon className="w-4 h-4" style={{ color: activeScenario.color }} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2">
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
    <section id="architecture" className="relative overflow-hidden section-depth" style={{ background: '#1A1815', paddingTop: '100px', paddingBottom: '100px' }}>
      {/* Visual blueprint overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-25"
        style={{
          backgroundImage: 'radial-gradient(circle, #4A3E31 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />
      {/* Ambient glow orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(107,124,61,0.06) 0%, transparent 65%)', filter: 'blur(80px)' }} />
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(198,116,90,0.05) 0%, transparent 70%)', filter: 'blur(60px)' }} />

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

        {/* Animated Architecture Flow Diagram */}
        <div className="mb-10 rounded-xl border border-[#3E352B] overflow-hidden" style={{ background: '#191714' }}>
          <div className="px-5 py-3 border-b border-[#3E352B] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#B05A3E]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#8C7A65]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#6B7C3D]" />
              </div>
              <span className="font-mono text-[11px] text-[#7A6E5F] ml-1">innvora-event-pipeline • ap-south-1 • Live Topology</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#6B7C3D] animate-pulse" />
              <span className="font-mono text-[10px] font-bold text-[#6B7C3D]">STREAMING</span>
            </div>
          </div>

          {/* SVG Architecture Flow */}
          <div className="relative overflow-x-auto">
            <svg viewBox="0 0 900 160" className="w-full" style={{ minWidth: '600px', height: '160px' }} aria-label="AWS Architecture data flow">
              <defs>
                <filter id="nodeGlow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                  <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
                <marker id="arrowGreen" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L0,6 L8,3 z" fill="#6B7C3D" opacity="0.7" />
                </marker>
                <marker id="arrowAmber" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L0,6 L8,3 z" fill="#C6745A" opacity="0.7" />
                </marker>
              </defs>

              {/* Connection lines between nodes */}
              {/* API GW → SQS */}
              <line x1="145" y1="80" x2="215" y2="80" stroke="#6B7C3D" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.4" markerEnd="url(#arrowGreen)" />
              <line x1="145" y1="80" x2="215" y2="80" stroke="#6B7C3D" strokeWidth="2.5" strokeDasharray="8 290" opacity="0.9" className="data-flow-line" />
              {/* SQS → Lambda */}
              <line x1="305" y1="80" x2="375" y2="80" stroke="#C6745A" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.4" markerEnd="url(#arrowAmber)" />
              <line x1="305" y1="80" x2="375" y2="80" stroke="#C6745A" strokeWidth="2.5" strokeDasharray="8 290" opacity="0.9" className="data-flow-line-2" />
              {/* Lambda → DynamoDB */}
              <line x1="465" y1="80" x2="535" y2="80" stroke="#6B7C3D" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.4" markerEnd="url(#arrowGreen)" />
              <line x1="465" y1="80" x2="535" y2="80" stroke="#6B7C3D" strokeWidth="2.5" strokeDasharray="8 290" opacity="0.9" className="data-flow-line-3" />
              {/* DynamoDB → OpenSearch */}
              <line x1="625" y1="80" x2="695" y2="80" stroke="#8C7A65" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.4" markerEnd="url(#arrowGreen)" />
              <line x1="625" y1="80" x2="695" y2="80" stroke="#8C7A65" strokeWidth="2.5" strokeDasharray="8 290" opacity="0.85" className="data-flow-line" />
              {/* OpenSearch → CloudWatch */}
              <line x1="785" y1="80" x2="818" y2="80" stroke="#5A5349" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.4" markerEnd="url(#arrowGreen)" />
              <line x1="785" y1="80" x2="818" y2="80" stroke="#5A5349" strokeWidth="2.5" strokeDasharray="8 290" opacity="0.75" className="data-flow-line-2" />

              {/* Nodes */}
              {[
                { id: 'apigw', x: 50, label: 'API GW', sub: '14ms', color: '#B05A3E' },
                { id: 'sqs', x: 210, label: 'SQS FIFO', sub: '9ms', color: '#8C7A65' },
                { id: 'lambda', x: 370, label: 'Lambda', sub: '18ms', color: '#C6745A' },
                { id: 'dynamo', x: 530, label: 'DynamoDB', sub: '7ms', color: '#6B7C3D' },
                { id: 'opensearch', x: 690, label: 'OpenSearch', sub: '12ms', color: '#8C7A65' },
                { id: 'cloudwatch', x: 820, label: 'CloudWatch', sub: 'Traced', color: '#5A5349' },
              ].map((node) => (
                <g
                  key={node.id}
                  onClick={() => setSelectedNodeId(node.id)}
                  style={{ cursor: 'pointer' }}
                  filter={selectedNodeId === node.id ? 'url(#nodeGlow)' : undefined}
                >
                  {/* Outer glow ring when selected */}
                  {selectedNodeId === node.id && (
                    <circle cx={node.x + 45} cy={80} r="36" fill="none" stroke={node.color} strokeWidth="1.5" opacity="0.4" strokeDasharray="4 3" />
                  )}
                  {/* Node circle */}
                  <circle
                    cx={node.x + 45}
                    cy={80}
                    r="28"
                    fill={selectedNodeId === node.id ? node.color + '30' : '#221F1B'}
                    stroke={node.color}
                    strokeWidth={selectedNodeId === node.id ? '2' : '1.5'}
                    opacity={selectedNodeId === node.id ? 1 : 0.7}
                  />
                  {/* Label */}
                  <text x={node.x + 45} y="75" textAnchor="middle" fontSize="9" fontWeight="800" fill={selectedNodeId === node.id ? '#F0EAE0' : '#A89885'} fontFamily="monospace">
                    {node.label}
                  </text>
                  <text x={node.x + 45} y="89" textAnchor="middle" fontSize="8" fill={node.color} fontFamily="monospace" fontWeight="700">
                    {node.sub}
                  </text>
                  {/* Pulse rings on selected */}
                  {selectedNodeId === node.id && (
                    <>
                      <circle cx={node.x + 45} cy={80} r="32" fill="none" stroke={node.color} strokeWidth="1" opacity="0.2">
                        <animate attributeName="r" values="28;42" dur="1.5s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.3;0" dur="1.5s" repeatCount="indefinite" />
                      </circle>
                    </>
                  )}
                  {/* Node label below */}
                  <text x={node.x + 45} y="124" textAnchor="middle" fontSize="8" fill="#7A6E5F" fontFamily="sans-serif">
                    {node.id === 'apigw' ? 'Ingestion' : node.id === 'sqs' ? 'Buffering' : node.id === 'lambda' ? 'Compute' : node.id === 'dynamo' ? 'State' : node.id === 'opensearch' ? 'Search' : 'Observ.'}
                  </text>
                </g>
              ))}

              {/* P95 total latency annotation */}
              <text x="450" y="148" textAnchor="middle" fontSize="9" fill="#6B7C3D" fontFamily="monospace" fontWeight="700">Total P95: 58ms ✓</text>
            </svg>
          </div>
        </div>

        {/* Top Operational Metrics Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 p-5 rounded-xl border border-[#352F28] bg-[#221F1B]">
          {[
            { label: 'P95 End-to-End Latency', value: '42ms', sub: '● Sub-100ms SLA', subColor: '#6B7C3D' },
            { label: 'Durability SLA', value: '99.999%', sub: 'Multi-AZ Synchronous', subColor: '#A89885' },
            { label: 'Queue Ordering', value: 'FIFO', sub: 'Exact Once Delivery', subColor: '#6B7C3D' },
            { label: 'Server Management', value: '0 Servers', sub: '100% Serverless', subColor: '#A89885' },
          ].map((m) => (
            <div key={m.label}>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#7A6E5F]">{m.label}</p>
              <p className="text-2xl sm:text-3xl font-black font-mono text-[#EFEBE4] mt-1 animate-counter-up">{m.value}</p>
              <p className="text-[10px] mt-0.5" style={{ color: m.subColor }}>{m.sub}</p>
            </div>
          ))}
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
                  className={`arch-node-3d p-4 rounded-lg border text-left relative overflow-hidden group ${
                    isSelected
                      ? 'border-[#8C7A65] bg-[#292520] shadow-lg'
                      : 'border-[#332D26] bg-[#201D19] hover:border-[#4A3F33] hover:bg-[#25211C]'
                  }`}
                >
                  {/* Top color stripe */}
                  <div
                    className="absolute top-0 left-0 right-0 transition-all duration-300"
                    style={{
                      height: isSelected ? '3px' : '1px',
                      background: node.color,
                      opacity: isSelected ? 1 : 0.3,
                    }}
                  />
                  {/* Subtle glow backdrop when selected */}
                  {isSelected && (
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background: `radial-gradient(circle at 50% 0%, ${node.color}12 0%, transparent 60%)`,
                      }}
                    />
                  )}

                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[9px] font-black uppercase tracking-wider text-[#7A6E5F]">
                      {node.category}
                    </span>
                    <span
                      className="font-mono text-[10px] font-bold bg-[#181613] px-1.5 py-0.5 rounded border border-[#352F28]"
                      style={{ color: isSelected ? node.color : '#A89885' }}
                    >
                      {node.metric}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5 mb-1.5">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-300"
                      style={{
                        background: node.color + (isSelected ? '30' : '16'),
                        border: `1px solid ${node.color}${isSelected ? '70' : '35'}`,
                        boxShadow: isSelected ? `0 0 12px 3px ${node.color}22` : 'none',
                      }}
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
              className="rounded-xl border border-[#3E352B] p-6 shadow-2xl space-y-5 relative overflow-hidden"
              style={{ background: '#221F1B' }}
            >
              {/* Top glow streak */}
              <div
                className="absolute top-0 left-0 right-0 h-px"
                style={{ background: `linear-gradient(90deg, transparent, ${selectedNode.color}80, transparent)` }}
              />
              {/* Ambient glow */}
              <div
                className="absolute top-0 left-0 right-0 h-24 pointer-events-none"
                style={{ background: `radial-gradient(ellipse at 50% -20%, ${selectedNode.color}18 0%, transparent 70%)` }}
              />

              <div className="flex items-start justify-between gap-3 border-b border-[#352F28] pb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      background: selectedNode.color + '28',
                      border: `1.5px solid ${selectedNode.color}70`,
                      boxShadow: `0 0 20px 4px ${selectedNode.color}20`,
                    }}
                  >
                    <SelectedIcon className="w-6 h-6" style={{ color: selectedNode.color }} />
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
                <span
                  className="font-mono text-xs font-bold border px-2 py-0.5 rounded"
                  style={{ color: selectedNode.color, background: selectedNode.color + '18', borderColor: selectedNode.color + '50' }}
                >
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
                  <p className="font-mono text-[11px]" style={{ color: selectedNode.color }}>
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

        {/* 3 Rich Image-Driven Operational Cards in 3D */}
        <div className="grid lg:grid-cols-3 gap-8 items-stretch">
          {segments.map((seg) => {
            const Icon = seg.icon;
            return (
              <TiltCard3D key={seg.title} maxTilt={6} perspective={1100} scale={1.02} className="h-full flex flex-col">
                <div
                  className="rounded-xl overflow-hidden border border-sand-400/90 bg-sand-100 flex flex-col shadow-xl h-full bevel-3d group"
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
                    <div className="absolute top-3 left-3 flex items-center gap-1.5" style={{ transform: 'translateZ(25px)' }}>
                      <span
                        className="px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-wider text-sand-100 shadow-sm"
                        style={{ background: seg.tagColor }}
                      >
                        {seg.tag}
                      </span>
                    </div>

                    {/* Bottom Image Role Tag */}
                    <div className="absolute bottom-3 left-3 right-3 text-sand-100 flex items-center gap-2 text-xs font-semibold" style={{ transform: 'translateZ(20px)' }}>
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
              </TiltCard3D>
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
      <ProductTourSection />
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
