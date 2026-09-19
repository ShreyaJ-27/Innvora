import React from 'react';

export default function StatsStrip({ exceptions = [], activeException }) {
  const totalExceptions = exceptions.length;
  const criticalCount = exceptions.filter(e => e.severity === 'CRITICAL').length;
  const totalAtRisk = exceptions.reduce((sum, e) => sum + (e.affectedOrders || 0), 0);
  const totalPriority = exceptions.reduce((sum, e) => sum + (e.priorityOrders || 0), 0);
  const avgConfidence = exceptions.length 
    ? Math.round(exceptions.reduce((sum, e) => sum + (e.recommendation?.confidence || 90), 0) / exceptions.length)
    : 91;

  return (
    <div className="stats-strip">
      {/* Metric 1 */}
      <div className="stat-card">
        <div className="stat-meta">
          <span className="stat-label">Active Exceptions</span>
          <span className="stat-badge badge-critical">{criticalCount} Critical</span>
        </div>
        <div className="stat-value mono">{totalExceptions}</div>
        <div className="stat-subtext">Across India Fulfillment Zones</div>
      </div>

      {/* Metric 2 */}
      <div className="stat-card">
        <div className="stat-meta">
          <span className="stat-label">Orders At Risk</span>
          <span className="stat-indicator pulse-red"></span>
        </div>
        <div className="stat-value mono text-amber">
          {totalAtRisk.toLocaleString()}
        </div>
        <div className="stat-subtext">Projected SLA jeopardy window</div>
      </div>

      {/* Metric 3 */}
      <div className="stat-card">
        <div className="stat-meta">
          <span className="stat-label">Priority Prime Units</span>
          <span className="stat-tag">SAME-DAY / 1-DAY</span>
        </div>
        <div className="stat-value mono text-red">
          {totalPriority.toLocaleString()}
        </div>
        <div className="stat-subtext">Strict breach penalty threshold</div>
      </div>

      {/* Metric 4 - Active Hub Status */}
      <div className="stat-card focal-stat">
        <div className="stat-meta">
          <span className="stat-label">Focused Hub Capacity</span>
          <span className="stat-mono mono">{activeException?.hubId || 'HUB-BOM-02'}</span>
        </div>
        <div className="stat-value mono">
          {activeException ? `${activeException.capacityPercentage}%` : '56%'}
          <span className="stat-unit">
            ({activeException ? activeException.currentCapacity?.toLocaleString() : '2,800'} / {activeException ? activeException.maxCapacity?.toLocaleString() : '5,000'})
          </span>
        </div>
        <div className="stat-subtext">
          {activeException?.hubName || 'Mumbai Hub 02'} — Critical Congestion
        </div>
      </div>

      {/* Metric 5 - AI Engine Confidence */}
      <div className="stat-card">
        <div className="stat-meta">
          <span className="stat-label">AI Engine Readiness</span>
          <span className="stat-pill">OPT-V3</span>
        </div>
        <div className="stat-value mono text-green">{avgConfidence}%</div>
        <div className="stat-subtext">Avg automated confidence score</div>
      </div>
    </div>
  );
}
