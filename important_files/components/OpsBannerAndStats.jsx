import React from 'react';

export default function OpsBannerAndStats({
  activeException,
  exceptions = [],
  unapprovedCount = 1,
  onOpenReview,
  onSelectException
}) {
  const totalAtRisk = exceptions.reduce((acc, e) => acc + (e.affectedOrders || 0), 0);
  const totalPriority = exceptions.reduce((acc, e) => acc + (e.priorityOrders || 0), 0);
  const criticalCount = exceptions.filter(e => e.severity === 'CRITICAL').length;

  return (
    <div className="ops-top-section">
      {/* 1. Design Notes Box (Exact style from Image 2) */}
      <div className="design-notes-box">
        <span className="notes-prefix">Operational Workflow.</span>
        <span className="notes-text">
          Primary focus of this resolution command center: <strong>DETECT → INVESTIGATE → ESTIMATE IMPACT → RECOMMEND ACTION → HUMAN APPROVAL → RECORD</strong>.
          Live exceptions are pinned in the priority matrix below; recommended AI reassignments require human sign-off.
        </span>
      </div>

      {/* 2. Red Delay Alerts Box (Exact style from Image 2) */}
      <div className="delay-alerts-box">
        <div className="alert-box-left">
          <div className="alert-header-row">
            <span className="alert-icon">⚠</span>
            <span className="alert-title">DELAY & CAPACITY ALERTS · {criticalCount} CRITICAL</span>
          </div>

          <div className="alert-items-list">
            <div className="alert-line">
              <span className="hub-highlight">Mumbai Hub 02</span> — running at <strong>56% capacity</strong> (2,800 / 5,000 pkgs) · 1,400 orders at risk (600 priority) · AI recommends reassigning 320 priority shipments (91% confidence).
            </div>
            <div className="alert-line">
              <span className="hub-highlight">Delhi Hub 01</span> — optical scanner bay #2 fault · 820 delayed · dynamic freight reroute to Noida Hub 03 ready.
            </div>
          </div>
        </div>

        <div className="alert-box-right">
          <button className="btn-resolve-alert" onClick={onOpenReview}>
            Review & Approve →
          </button>
          <span className="alert-meta-action">Mute · Resolve all</span>
        </div>
      </div>

      {/* 3. Four KPI Stat Cards (Exact 4-card grid from Image 2) */}
      <div className="ops-kpi-grid">
        {/* Card 1: Active Exceptions */}
        <div className="kpi-card">
          <div className="kpi-label">ACTIVE EXCEPTIONS</div>
          <div className="kpi-value-row">
            <span className="kpi-num mono">{exceptions.length}</span>
            {/* Mini SVG Sparkline */}
            <svg className="kpi-sparkline" viewBox="0 0 70 24" fill="none">
              <path d="M2 18 L15 14 L28 19 L42 8 L56 12 L68 4" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="kpi-subtext">across {exceptions.length} India hubs</div>
        </div>

        {/* Card 2: Delayed / Critical */}
        <div className="kpi-card kpi-card-critical">
          <div className="kpi-label text-red">CRITICAL BOTTLENECKS</div>
          <div className="kpi-value-row">
            <span className="kpi-num mono text-red">{criticalCount}</span>
          </div>
          <div className="kpi-subtext">Mumbai Hub 02 (56%) & Delhi (65%)</div>
        </div>

        {/* Card 3: Waiting On Me */}
        <div className="kpi-card">
          <div className="kpi-label">WAITING ON ME</div>
          <div className="kpi-value-row">
            <span className="kpi-num mono text-amber">{unapprovedCount}</span>
          </div>
          <div className="kpi-subtext">oldest: 10 mins ago (Mumbai Hub 02)</div>
        </div>

        {/* Card 4: Orders At Risk */}
        <div className="kpi-card">
          <div className="kpi-label">ORDERS AT RISK (SLA)</div>
          <div className="kpi-value-row">
            <span className="kpi-num mono">{totalAtRisk.toLocaleString()}</span>
          </div>
          <div className="kpi-subtext">{totalPriority.toLocaleString()} Priority Prime shipments</div>
        </div>
      </div>
    </div>
  );
}
