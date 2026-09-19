import React from 'react';

export default function ExceptionCard({ exception, isApproved }) {
  if (!exception) return null;

  const {
    hubId,
    hubName,
    zone,
    currentCapacity,
    maxCapacity,
    capacityPercentage,
    affectedOrders,
    priorityOrders,
    investigation
  } = exception;

  return (
    <div className="side-rail-card">
      <div className="side-card-header">
        <div className="side-card-title-wrap">
          <span className="side-card-title">Hub Diagnostics</span>
          <span className="side-card-badge mono">{hubId}</span>
        </div>
        <span className="side-card-sub text-muted">{zone}</span>
      </div>

      <div className="side-card-body">
        {/* Capacity Overview Bar */}
        <div className="side-capacity-box">
          <div className="side-cap-row">
            <span className="cap-txt">Ingestion Capacity:</span>
            <span className="cap-num mono">
              <strong>{currentCapacity?.toLocaleString()}</strong> / {maxCapacity?.toLocaleString()} ({capacityPercentage}%)
            </span>
          </div>
          <div className="timeline-track">
            <div
              className="timeline-fill"
              style={{
                width: `${capacityPercentage}%`,
                backgroundColor: capacityPercentage <= 60 ? '#ef4444' : '#0ea5e9'
              }}
            />
          </div>
        </div>

        {/* Diagnostic Telemetry Feed */}
        <div className="side-telemetry-block">
          <div className="drawer-sub">ACTIVE SENSOR ALERTS:</div>
          <ul className="side-sensor-list">
            {investigation?.telemetryAlerts?.map((alert, idx) => (
              <li key={idx} className="side-sensor-item">
                <span className="alert-dot dot-red"></span>
                <span className="side-sensor-text">{alert}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Backlog Forecast */}
        <div className="side-backlog-row">
          <span className="backlog-lbl">PROJECTED GRIDLOCK:</span>
          <span className="backlog-val mono text-red">{investigation?.estimatedBacklogTime}</span>
        </div>
      </div>
    </div>
  );
}
