import React from 'react';

export default function ActivityLog({ activities = [] }) {
  return (
    <div className="activity-log-panel">
      <div className="activity-header">
        <div className="activity-title-group">
          <span className="activity-heading">OPERATIONAL RESOLUTION AUDIT LOG</span>
          <span className="activity-count mono">{activities.length} Recorded</span>
        </div>
        <span className="audit-secure-badge">
          <svg className="secure-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          IMMUTABLE LEDGER
        </span>
      </div>

      <div className="activity-list">
        {activities.length === 0 ? (
          <div className="empty-activity">No recorded actions in this operational shift yet.</div>
        ) : (
          activities.map((item) => (
            <div key={item.id} className="activity-entry">
              <div className="activity-left">
                <div className="activity-status-dot"></div>
                <div className="activity-content">
                  <div className="activity-action-line">
                    <span className="act-title">{item.action}</span>
                  </div>
                  <div className="activity-meta-line">
                    <span className="act-hub mono">{item.hubName}</span>
                    <span className="meta-sep">•</span>
                    <span className="act-operator">{item.operator}</span>
                    <span className="meta-sep">•</span>
                    <span className="act-impact text-green">{item.impact}</span>
                  </div>
                </div>
              </div>

              <div className="activity-right">
                <span className="act-time mono">{item.timestamp}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
