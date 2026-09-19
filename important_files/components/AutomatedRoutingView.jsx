import React, { useState } from 'react';

const INITIAL_RULES = [
  {
    id: 'RULE-BOM-01',
    name: 'Western Corridor Prime Failover',
    origin: 'Mumbai Hub 02 (HUB-BOM-02)',
    destination: 'Thane Hub 01 & Bhiwandi West',
    trigger: 'Hub Capacity > 55% AND Inbound Queue > 30 vehicles',
    targetVolume: '320 Priority Units',
    carrier: 'Amazon Relay Dedicated Shuttles',
    status: 'ACTIVE',
    slaGuaranteed: '99.4%',
    lastTriggered: '10 mins ago'
  },
  {
    id: 'RULE-DEL-02',
    name: 'NCR Optical Sorter Overflow Divert',
    origin: 'Delhi Hub 01 (HUB-DEL-01)',
    destination: 'Noida Hub 03 Express Center',
    trigger: 'Sorter Error Rate > 5.0% for 15 mins',
    targetVolume: '280 Freight Containers',
    carrier: 'Blue Dart Line-Haul Intermodal',
    status: 'ACTIVE',
    slaGuaranteed: '98.8%',
    lastTriggered: '24 mins ago'
  },
  {
    id: 'RULE-BLR-03',
    name: 'South Metro EV Battery Outage Flex Surge',
    origin: 'Bengaluru South 03 (HUB-BLR-03)',
    destination: 'Whitefield Reserve Spoke',
    trigger: 'Fleet Vehicle Readiness < 70%',
    targetVolume: '210 Local Priority Packs',
    carrier: 'Amazon Flex Crowdsourced Fleet',
    status: 'ACTIVE',
    slaGuaranteed: '99.1%',
    lastTriggered: '45 mins ago'
  },
  {
    id: 'RULE-HYD-04',
    name: 'Monsoon Outer Ring Road Dynamic Bypass',
    origin: 'Hyderabad Central (HUB-HYD-01)',
    destination: 'Secunderabad Spoke Cluster',
    trigger: 'Corridor Speed Sensor < 20 km/h',
    targetVolume: 'Non-urgent parcels via ORR Ring 2',
    carrier: 'Regional Fleet Arterial Haulers',
    status: 'STANDBY',
    slaGuaranteed: '97.5%',
    lastTriggered: '1 hour ago'
  }
];

export default function AutomatedRoutingView() {
  const [rules, setRules] = useState(INITIAL_RULES);

  const toggleRule = (id) => {
    setRules(prev => prev.map(r => {
      if (r.id === id) {
        return { ...r, status: r.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE' };
      }
      return r;
    }));
  };

  return (
    <div className="view-panel">
      <div className="view-header">
        <div className="view-header-title">
          <h2>Automated Routing Engine & Lane Failovers</h2>
          <p>Autonomous dynamic waybill routing protocols and line-haul allocation</p>
        </div>

        <div className="engine-status-pill">
          <span className="pulse-indicator"></span>
          <span>AUTONOMOUS DISPATCH ENGINE: ACTIVE</span>
        </div>
      </div>

      <div className="routing-overview-strip">
        <div className="stat-card">
          <span className="stat-label">Active Auto-Rules</span>
          <span className="stat-value mono text-amber">
            {rules.filter(r => r.status === 'ACTIVE').length} / {rules.length}
          </span>
          <span className="stat-subtext">Operating with HITL Thresholds</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Diverted Volume Today</span>
          <span className="stat-value mono">1,840 units</span>
          <span className="stat-subtext">Prevented bottleneck halts</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Carrier Dispatch SLA</span>
          <span className="stat-value mono text-green">99.2%</span>
          <span className="stat-subtext">Within 15-minute dispatch window</span>
        </div>
      </div>

      <div className="rules-container">
        <div className="rules-table-header">
          <span className="col-id">RULE ID</span>
          <span className="col-name">POLICY & ROUTE</span>
          <span className="col-trigger">AUTOMATIC TRIGGER CRITERIA</span>
          <span className="col-carrier">ASSIGNED CARRIER</span>
          <span className="col-status">STATE</span>
          <span className="col-action">ACTION</span>
        </div>

        {rules.map(rule => (
          <div key={rule.id} className="rule-row">
            <div className="col-id mono">{rule.id}</div>
            <div className="col-name">
              <div className="rule-title">{rule.name}</div>
              <div className="rule-path">
                <span>{rule.origin}</span>
                <span className="arrow">➔</span>
                <span className="dest">{rule.destination}</span>
              </div>
            </div>
            <div className="col-trigger">
              <span className="trigger-badge mono">{rule.trigger}</span>
              <span className="rule-last">Last: {rule.lastTriggered}</span>
            </div>
            <div className="col-carrier">
              <div className="carrier-name">{rule.carrier}</div>
              <div className="carrier-sla mono">SLA Retention: {rule.slaGuaranteed}</div>
            </div>
            <div className="col-status">
              <span className={`badge-severity ${rule.status === 'ACTIVE' ? 'badge-resolved' : 'badge-medium'}`}>
                {rule.status}
              </span>
            </div>
            <div className="col-action">
              <button 
                className={`btn-toggle-rule ${rule.status === 'ACTIVE' ? 'btn-pause' : 'btn-resume'}`}
                onClick={() => toggleRule(rule.id)}
              >
                {rule.status === 'ACTIVE' ? 'Pause Rule' : 'Resume Rule'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
