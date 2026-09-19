import React from 'react';
import { ArrowUpRight, TrendingUp, Package, Truck, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

export default function HeroOverview({
  onViewDetails,
  activeException,
}) {
  // Sales trend bar heights for visual bar chart
  const salesBars = [32, 45, 40, 60, 52, 75, 88, 95];

  return (
    <section className="ref-hero-container">
      {/* Background Warehouse / Logistics Conveyor Visual with Dark Gradient */}
      <div className="ref-hero-bg">
        {/* SVG Decorative Automated Logistics Conveyor Grid */}
        <svg
          className="ref-hero-svg"
          viewBox="0 0 1200 600"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <linearGradient id="gridGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#D8FF3E" stopOpacity="0.08" />
              <stop offset="50%" stopColor="#0ea5e9" stopOpacity="0.04" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.8" />
            </linearGradient>
            <radialGradient id="hubGlow" cx="70%" cy="30%" r="50%">
              <stop offset="0%" stopColor="#D8FF3E" stopOpacity="0.18" />
              <stop offset="60%" stopColor="#171717" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="beamGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#D8FF3E" stopOpacity="0" />
              <stop offset="50%" stopColor="#D8FF3E" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#D8FF3E" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Ambient Glow */}
          <rect width="1200" height="600" fill="url(#hubGlow)" />

          {/* Perspective Warehouse Bay Beams & Conveyor Lines */}
          <g stroke="rgba(255,255,255,0.06)" strokeWidth="1">
            <line x1="100" y1="0" x2="250" y2="600" />
            <line x1="300" y1="0" x2="450" y2="600" />
            <line x1="500" y1="0" x2="650" y2="600" />
            <line x1="700" y1="0" x2="850" y2="600" />
            <line x1="900" y1="0" x2="1050" y2="600" />

            <line x1="0" y1="120" x2="1200" y2="120" />
            <line x1="0" y1="260" x2="1200" y2="260" />
            <line x1="0" y1="420" x2="1200" y2="420" />
          </g>

          {/* Conveyor Belt Paths */}
          <path
            d="M 50 480 Q 400 450 750 490 T 1200 470"
            stroke="rgba(216,255,62,0.25)"
            strokeWidth="3"
            fill="none"
            strokeDasharray="12 8"
          />
          <path
            d="M 0 520 Q 500 480 900 530 T 1250 500"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="4"
            fill="none"
          />

          {/* Floating Conveyor Hub Nodes */}
          <circle cx="750" cy="240" r="180" fill="url(#gridGrad)" />
          <circle cx="820" cy="220" r="4" fill="#D8FF3E" opacity="0.8" />
          <circle cx="940" cy="280" r="5" fill="#D8FF3E" opacity="0.6" />
          <circle cx="680" cy="340" r="4" fill="#38bdf8" opacity="0.7" />
          <line x1="820" y1="220" x2="940" y2="280" stroke="rgba(216,255,62,0.3)" strokeWidth="1.5" />
          <line x1="820" y1="220" x2="680" y2="340" stroke="rgba(56,189,248,0.3)" strokeWidth="1.5" />
        </svg>

        <div className="ref-hero-overlay" />
      </div>

      {/* Main Content Layout inside Hero */}
      <div className="ref-hero-inner">
        {/* LEFT COLUMN: Stacked Title & Primary CTA */}
        <div className="ref-hero-left">
          <div className="ref-ai-badge">
            <Zap className="w-3.5 h-3.5 text-[#D8FF3E]" />
            <span>AI-Powered Platform</span>
          </div>

          <h1 className="ref-hero-heading">
            <span>OWN</span>
            <span>THE OUTCOME</span>
          </h1>

          <p className="ref-hero-subtext">
            Autonomous exception routing, warehouse capacity balancing, and real-time inventory intelligence.
          </p>

          <div className="ref-hero-actions">
            <button
              type="button"
              className="ref-btn-lime"
              onClick={onViewDetails}
            >
              <span>View Details</span>
              <ArrowRight className="w-4 h-4 text-[#171717]" />
            </button>

            {activeException && (
              <div className="ref-hero-active-hub">
                <span className="ref-pulse-dot" />
                <span>Active: <strong>{activeException.hubName}</strong> ({activeException.severity})</span>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Glassmorphic Upper KPI Cards */}
        <div className="ref-hero-right">
          <div className="ref-glass-grid">
            <div className="ref-glass-kpi">
              <span className="ref-glass-label">Incoming Stock</span>
              <div className="ref-glass-val mono">2,480</div>
              <span className="ref-glass-sub text-lime">+4.7% vs last week</span>
            </div>

            <div className="ref-glass-kpi">
              <span className="ref-glass-label">Orders</span>
              <div className="ref-glass-val mono">8,900</div>
              <span className="ref-glass-sub text-gray">99.4% on-schedule</span>
            </div>

            <div className="ref-glass-kpi">
              <span className="ref-glass-label">Shipments</span>
              <div className="ref-glass-val mono">24</div>
              <span className="ref-glass-sub text-lime">Active Line-Hauls</span>
            </div>

            <div className="ref-glass-kpi">
              <span className="ref-glass-label">Warehouse Load</span>
              <div className="ref-glass-val mono">65%</div>
              <span className="ref-glass-sub text-amber">Optimal Headroom</span>
            </div>

            <div className="ref-glass-kpi full-width">
              <div className="flex justify-between items-center">
                <div>
                  <span className="ref-glass-label">Write-On</span>
                  <div className="ref-glass-val mono">1,240 units</div>
                </div>
                <div className="ref-kpi-chip">
                  <span>Reconciled</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* LOWER HERO ANALYTICS OVERLAY CARDS */}
      <div className="ref-hero-bottom-analytics">
        {/* 1. Sales Increase Card with Lime Bar Chart */}
        <div className="ref-analytics-card">
          <div className="ref-analytics-header">
            <span className="ref-analytics-title">Sales Increase</span>
            <span className="ref-trend-badge text-lime">
              <ArrowUpRight className="w-3.5 h-3.5" /> +14.8%
            </span>
          </div>
          <div className="ref-mini-barchart">
            {salesBars.map((height, i) => (
              <div key={i} className="ref-bar-track">
                <div
                  className="ref-bar-fill"
                  style={{ height: `${height}%` }}
                />
              </div>
            ))}
          </div>
          <div className="ref-analytics-footer">
            <span>Weekly Momentum</span>
            <span className="mono font-semibold text-white">+₹2.4M</span>
          </div>
        </div>

        {/* 2. Warehouse Load Card with Progress Bar */}
        <div className="ref-analytics-card">
          <div className="ref-analytics-header">
            <span className="ref-analytics-title">Warehouse Load</span>
            <span className="ref-analytics-metric mono text-lime">65%</span>
          </div>
          <div className="ref-progress-track">
            <div className="ref-progress-bar" style={{ width: '65%' }} />
          </div>
          <div className="ref-analytics-footer">
            <span>Capacity Utilized</span>
            <span className="mono text-gray">3,250 / 5,000 pkgs</span>
          </div>
        </div>

        {/* 3. Write-Off Card */}
        <div className="ref-analytics-card">
          <div className="ref-analytics-header">
            <span className="ref-analytics-title">Write-Off</span>
            <span className="ref-analytics-metric mono text-white">1,240 units</span>
          </div>
          <div className="ref-spark-track">
            <svg viewBox="0 0 120 28" className="ref-sparkline-svg">
              <path
                d="M 0 20 Q 30 24 60 12 T 120 4"
                fill="none"
                stroke="#D8FF3E"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div className="ref-analytics-footer">
            <span>Audit Reconciliation</span>
            <span className="text-lime text-[11px] font-semibold">Low Discrepancy</span>
          </div>
        </div>
      </div>
    </section>
  );
}
