import React, { useState } from 'react';

const AUDIT_RECORDS = [
  {
    id: 'TX-89410-BOM',
    timestamp: '2026-09-18 19:10:45 IST',
    cloudTrailId: 'arn:aws:cloudtrail:ap-south-1:992817291:event/e7b29a',
    hub: 'Mumbai Hub 02 (HUB-BOM-02)',
    action: 'Approved: Reassign 320 Priority Shipments to Thane Hub 01 & Bhiwandi West',
    operator: 'Snigdha (West Lead)',
    decision: 'HITL_APPROVED',
    hash: '0x8f2a...c4b1',
    impact: '320 Prime Deliveries Preserved, +₹4,200 Cost Variance'
  },
  {
    id: 'TX-89408-PUN',
    timestamp: '2026-09-18 18:47:12 IST',
    cloudTrailId: 'arn:aws:cloudtrail:ap-south-1:992817291:event/f8812c',
    hub: 'Pune Central Hub',
    action: 'Approved: Re-routed 180 parcels to Hinjewadi Spoke',
    operator: 'K. Deshmukh (Lead Ops)',
    decision: 'HITL_APPROVED',
    hash: '0x4e19...7a90',
    impact: '100% SLA preserved on 180 parcels'
  },
  {
    id: 'TX-89405-CCU',
    timestamp: '2026-09-18 18:19:00 IST',
    cloudTrailId: 'arn:aws:cloudtrail:ap-south-1:992817291:event/aa331d',
    hub: 'Kolkata Hub 01',
    action: 'Auto-Resolved: Conveyor speed calibrated to 2.2 m/s',
    operator: 'AmazonFlow Autonomous Agent',
    decision: 'AUTO_RESOLVED',
    hash: '0x1c88...66df',
    impact: 'Throughput restored to 3,400 u/h'
  },
  {
    id: 'TX-89399-JAI',
    timestamp: '2026-09-18 18:00:22 IST',
    cloudTrailId: 'arn:aws:cloudtrail:ap-south-1:992817291:event/77b819',
    hub: 'Jaipur North 02',
    action: 'Approved: Dynamic SLA window adjusted (+2h) for heavy sandstorm',
    operator: 'R. Sharma (Ops Manager)',
    decision: 'HITL_APPROVED',
    hash: '0x33fd...01ea',
    impact: '940 customers notified proactively'
  }
];

export default function AuditComplianceView() {
  const [filterType, setFilterType] = useState('ALL');
  const [verified, setVerified] = useState(false);

  const filtered = filterType === 'ALL'
    ? AUDIT_RECORDS
    : AUDIT_RECORDS.filter(r => r.decision === filterType);

  const handleVerify = () => {
    setVerified(true);
    setTimeout(() => setVerified(false), 3000);
  };

  return (
    <div className="view-panel">
      <div className="view-header">
        <div className="view-header-title">
          <h2>Regulatory Compliance & Immutable Audit Ledger</h2>
          <p>Cryptographically verified human-in-the-loop and autonomous fulfillment actions</p>
        </div>

        <div className="view-actions">
          <button className="btn-secondary" onClick={handleVerify}>
            {verified ? (
              <>
                <span className="text-green">✓ Cryptographic Chain Validated</span>
              </>
            ) : (
              <>
                <span>Verify SHA-256 Ledger Integrity</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="audit-stats-strip">
        <div className="stat-card">
          <span className="stat-label">Total Audited Events</span>
          <span className="stat-value mono">1,429</span>
          <span className="stat-subtext">Current Fiscal Quarter</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">HITL Compliance Rate</span>
          <span className="stat-value mono text-green">100.0%</span>
          <span className="stat-subtext">Zero unverified diversions</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">AWS CloudTrail Retention</span>
          <span className="stat-value mono">365 Days</span>
          <span className="stat-subtext">SOC-2 Type II Certified</span>
        </div>
      </div>

      <div className="audit-table-wrap">
        <div className="audit-filter-bar">
          <div className="filter-title">FILTER BY DECISION:</div>
          <div className="filter-tabs-row">
            {['ALL', 'HITL_APPROVED', 'AUTO_RESOLVED'].map(f => (
              <button
                key={f}
                className={`filter-tab ${filterType === f ? 'active' : ''}`}
                onClick={() => setFilterType(f)}
              >
                {f.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="audit-table">
          <div className="audit-row header">
            <span className="col-event">EVENT / TRANSACTION</span>
            <span className="col-hub">HUB LOCATION</span>
            <span className="col-action-desc">DECISION & ACTION DETAILS</span>
            <span className="col-operator">OPERATOR / AGENT</span>
            <span className="col-hash">HASH SIGNATURE</span>
          </div>

          {filtered.map(row => (
            <div key={row.id} className="audit-row">
              <div className="col-event">
                <div className="event-id mono">{row.id}</div>
                <div className="event-time mono">{row.timestamp}</div>
                <div className="cloudtrail-id mono">{row.cloudTrailId}</div>
              </div>
              <div className="col-hub">
                <span className="hub-name-bold">{row.hub}</span>
              </div>
              <div className="col-action-desc">
                <div className="action-txt">{row.action}</div>
                <div className="action-impact text-green">{row.impact}</div>
              </div>
              <div className="col-operator">
                <div className="op-name">{row.operator}</div>
                <span className={`badge-sm ${row.decision === 'HITL_APPROVED' ? 'badge-resolved' : 'badge-high'}`}>
                  {row.decision}
                </span>
              </div>
              <div className="col-hash mono">
                <span className="hash-pill">{row.hash}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
