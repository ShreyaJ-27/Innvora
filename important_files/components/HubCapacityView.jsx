import React, { useState } from 'react';

const HUBS_DATA = [
  { id: 'HUB-BOM-02', name: 'Mumbai Hub 02', region: 'West (Maharashtra)', current: 2800, max: 5000, pct: 56, status: 'CRITICAL', throughput: '1,420 u/h', dockQueue: 41, issue: 'Inbound surge & sorter throughput drop' },
  { id: 'HUB-BOM-01', name: 'Mumbai Central 01', region: 'West (Maharashtra)', current: 4200, max: 5500, pct: 76, status: 'NOMINAL', throughput: '2,350 u/h', dockQueue: 8, issue: 'Normal operations' },
  { id: 'HUB-THA-01', name: 'Thane Hub 01', region: 'West (Maharashtra)', current: 1680, max: 4000, pct: 42, status: 'OPTIMAL', throughput: '1,890 u/h', dockQueue: 4, issue: 'Available for overflow reroutes' },
  { id: 'HUB-DEL-01', name: 'Delhi Hub 01', region: 'North (NCR)', current: 3900, max: 6000, pct: 65, status: 'CRITICAL', throughput: '1,650 u/h', dockQueue: 28, issue: 'Optical scanner bay #2 fault' },
  { id: 'HUB-NOI-03', name: 'Noida Hub 03', region: 'North (NCR)', current: 2900, max: 5000, pct: 58, status: 'OPTIMAL', throughput: '2,400 u/h', dockQueue: 6, issue: 'Nominal headroom available' },
  { id: 'HUB-BLR-03', name: 'Bengaluru South 03', region: 'South (Karnataka)', current: 3400, max: 4500, pct: 75, status: 'HIGH', throughput: '1,980 u/h', dockQueue: 19, issue: 'EV fleet charging cluster offline' },
  { id: 'HUB-BLR-01', name: 'Whitefield Reserve Hub', region: 'South (Karnataka)', current: 1850, max: 4200, pct: 44, status: 'OPTIMAL', throughput: '1,900 u/h', dockQueue: 3, issue: 'Flex dispatch stand-by' },
  { id: 'HUB-HYD-01', name: 'Hyderabad Central', region: 'South (Telangana)', current: 4100, max: 5500, pct: 74, status: 'MEDIUM', throughput: '2,100 u/h', dockQueue: 14, issue: 'NH44 arterial weather slowdown' },
  { id: 'HUB-CCU-01', name: 'Kolkata Hub 01', region: 'East (West Bengal)', current: 3100, max: 4800, pct: 64, status: 'NOMINAL', throughput: '2,250 u/h', dockQueue: 7, issue: 'Conveyor calibration nominal' },
  { id: 'HUB-MAA-04', name: 'Chennai North 04', region: 'South (Tamil Nadu)', current: 1950, max: 4800, pct: 40, status: 'WARNING', throughput: '1,100 u/h', dockQueue: 22, issue: 'Induction sensor drift' }
];

export default function HubCapacityView({ onSelectHubForException }) {
  const [filterRegion, setFilterRegion] = useState('ALL');

  const filteredHubs = filterRegion === 'ALL' 
    ? HUBS_DATA 
    : HUBS_DATA.filter(h => h.region.includes(filterRegion));

  const getStatusBadge = (status) => {
    switch (status) {
      case 'CRITICAL': return 'badge-critical';
      case 'HIGH': return 'badge-high';
      case 'MEDIUM': return 'badge-medium';
      case 'OPTIMAL': return 'badge-resolved';
      default: return 'badge-resolved';
    }
  };

  const getCapacityBarColor = (pct, status) => {
    if (status === 'CRITICAL') return '#ef4444';
    if (status === 'HIGH') return '#f97316';
    if (pct < 50) return '#10b981';
    return '#ff9900';
  };

  return (
    <div className="view-panel">
      <div className="view-header">
        <div className="view-header-title">
          <h2>National Hub Capacity & Ingestion Grid</h2>
          <p>Real-time telemetry across Tier-1 India fulfillment centers</p>
        </div>

        <div className="view-filters">
          {['ALL', 'West', 'North', 'South', 'East'].map(reg => (
            <button
              key={reg}
              className={`filter-tab ${filterRegion === reg ? 'active' : ''}`}
              onClick={() => setFilterRegion(reg)}
            >
              {reg === 'ALL' ? 'All Regions' : `${reg} Division`}
            </button>
          ))}
        </div>
      </div>

      <div className="hub-grid">
        {filteredHubs.map(hub => (
          <div key={hub.id} className="hub-grid-card">
            <div className="hub-card-top">
              <div>
                <div className="hub-code mono">{hub.id}</div>
                <div className="hub-card-name">{hub.name}</div>
                <div className="hub-region">{hub.region}</div>
              </div>
              <span className={`badge-severity ${getStatusBadge(hub.status)}`}>
                {hub.status}
              </span>
            </div>

            {/* Capacity Meter */}
            <div className="hub-meter-wrap">
              <div className="hub-meter-label">
                <span>Capacity Headroom:</span>
                <span className="mono"><strong>{hub.current.toLocaleString()}</strong> / {hub.max.toLocaleString()} ({hub.pct}%)</span>
              </div>
              <div className="capacity-progress-track">
                <div 
                  className="capacity-progress-fill"
                  style={{ 
                    width: `${hub.pct}%`, 
                    backgroundColor: getCapacityBarColor(hub.pct, hub.status) 
                  }}
                />
              </div>
            </div>

            <div className="hub-stats-row">
              <div className="hub-mini-stat">
                <span className="stat-label">Throughput:</span>
                <span className="mono">{hub.throughput}</span>
              </div>
              <div className="hub-mini-stat">
                <span className="stat-label">Dock Queue:</span>
                <span className={`mono ${hub.dockQueue > 20 ? 'text-red' : ''}`}>{hub.dockQueue} vans</span>
              </div>
            </div>

            <div className="hub-issue-note">
              <span>{hub.issue}</span>
            </div>

            <div className="hub-card-action">
              {hub.status === 'CRITICAL' || hub.status === 'HIGH' ? (
                <button 
                  className="btn-inspect-exception"
                  onClick={() => onSelectHubForException && onSelectHubForException(hub.name)}
                >
                  Inspect Active Exception →
                </button>
              ) : (
                <span className="hub-ready-tag">✓ Nominal Operating Buffer</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
