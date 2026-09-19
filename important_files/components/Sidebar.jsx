import React from 'react';

export default function Sidebar({
  activeCount = 4,
  currentView = 'exceptions',
  onViewChange,
  selectedHubFilter = 'ALL',
  onSelectHubFilter
}) {
  const dashboards = [
    { id: 'exceptions', label: 'Delivery Exceptions', badge: activeCount, isRed: activeCount > 0 },
    { id: 'hubs', label: 'Hub Capacity Grid' },
    { id: 'actions', label: 'Automated Routing' },
    { id: 'audit', label: 'Audit & Compliance' },
    { id: 'telemetry', label: 'Live Telemetry' }
  ];

  const hubs = [
    { id: 'ALL', name: 'All Hubs', dotColor: 'dot-cyan' },
    { id: 'HUB-BOM-02', name: 'Mumbai Hub 02', dotColor: 'dot-red', count: '56%' },
    { id: 'HUB-DEL-01', name: 'Delhi Hub 01', dotColor: 'dot-red', count: '65%' },
    { id: 'HUB-BLR-03', name: 'Bengaluru South 03', dotColor: 'dot-orange', count: '75%' },
    { id: 'HUB-HYD-01', name: 'Hyderabad Central', dotColor: 'dot-yellow', count: '74%' },
    { id: 'HUB-THA-01', name: 'Thane Hub 01', dotColor: 'dot-green', count: '42%' },
    { id: 'HUB-CCU-01', name: 'Kolkata Hub 01', dotColor: 'dot-green', count: '64%' }
  ];

  return (
    <aside className="sidebar-container">
      {/* 1. Header Profile (Like Amazon Ops Image 2) */}
      <div className="sidebar-profile">
        <div className="profile-avatar mono">AF</div>
        <div className="profile-info">
          <div className="profile-title">Amazon Ops</div>
          <div className="profile-sub mono">SNIGDHA · LOCALHOST:5173</div>
        </div>
      </div>

      {/* 2. Dashboards Section */}
      <div className="sidebar-group">
        <div className="group-label">DASHBOARDS</div>
        {dashboards.map((dash) => (
          <button
            key={dash.id}
            className={`sidebar-link ${currentView === dash.id ? 'active' : ''}`}
            onClick={() => onViewChange && onViewChange(dash.id)}
          >
            <div className="link-content">
              <svg className="link-icon" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
              </svg>
              <span>{dash.label}</span>
            </div>
            {dash.badge !== undefined && (
              <span className={`pill-badge ${dash.isRed ? 'badge-red' : ''}`}>
                {dash.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* 3. Hubs Filter List (Like Brands Section in Image 2) */}
      <div className="sidebar-group">
        <div className="group-label">FULFILLMENT HUBS</div>
        {hubs.map((hub) => (
          <button
            key={hub.id}
            className={`hub-filter-item ${selectedHubFilter === hub.id ? 'active' : ''}`}
            onClick={() => {
              if (onSelectHubFilter) onSelectHubFilter(hub.id);
              if (onViewChange) onViewChange('exceptions');
            }}
          >
            <div className="hub-filter-left">
              <span className={`hub-dot ${hub.dotColor}`}></span>
              <span className="hub-name">{hub.name}</span>
            </div>
            {hub.count && <span className="hub-load mono">{hub.count}</span>}
          </button>
        ))}
      </div>

      {/* 4. Bottom Live Status */}
      <div className="sidebar-bottom">
        <div className="live-status">
          <span className="live-pulse"></span>
          <span>collectors live</span>
        </div>
        <div className="live-clock mono">19:35 IST</div>
      </div>
    </aside>
  );
}
