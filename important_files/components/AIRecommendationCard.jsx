import React, { useState } from 'react';

export default function AIRecommendationCard({
  exception,
  recommendation,
  isApproved,
  onOpenReview
}) {
  const [showConfidenceDetails, setShowConfidenceDetails] = useState(false);

  if (!recommendation) return null;

  const {
    actionTitle,
    shortSummary,
    confidence,
    confidenceBreakdown,
    impactMitigation,
    targetHubs
  } = recommendation;

  return (
    <div className="side-rail-card">
      {/* Header */}
      <div className="side-card-header">
        <div className="side-card-title-wrap">
          <span className="side-card-title">AI Recommendation</span>
          <span className="side-card-badge mono">{exception?.hubId || 'HUB-BOM-02'}</span>
        </div>
        <button
          className="confidence-pill-btn mono"
          onClick={() => setShowConfidenceDetails(!showConfidenceDetails)}
          title="Click to toggle reasoning factors"
        >
          <span>{confidence}% Conf</span>
          <span className="arrow-toggle">{showConfidenceDetails ? '▲' : '▼'}</span>
        </button>
      </div>

      {/* Expandable Confidence Factors */}
      {showConfidenceDetails && confidenceBreakdown && (
        <div className="side-breakdown-drawer">
          <div className="drawer-sub">DECISION MATRIX FACTORS</div>
          {confidenceBreakdown.map((item, idx) => (
            <div key={idx} className="drawer-factor-item">
              <div className="factor-txt-row">
                <span className="f-name">{item.factor}</span>
                <span className="f-score mono text-green">{item.score}%</span>
              </div>
              <div className="f-track">
                <div className="f-fill" style={{ width: `${item.score}%` }} />
              </div>
              <span className="f-note">{item.note}</span>
            </div>
          ))}
        </div>
      )}

      {/* Main Body */}
      <div className="side-card-body">
        <h3 className="side-action-title">{actionTitle}</h3>
        <p className="side-action-summary">{shortSummary}</p>

        {/* Diversion Target Hubs */}
        <div className="side-data-row">
          <span className="side-data-label">Diversion Hubs:</span>
          <div className="target-hub-pills">
            {targetHubs?.map((hub, idx) => (
              <span key={idx} className="target-hub-pill mono">{hub}</span>
            ))}
          </div>
        </div>

        {/* Impact Highlights */}
        <div className="impact-mini-grid">
          <div className="impact-mini-cell">
            <span className="mini-lbl">SLA PRESERVATION</span>
            <span className="mini-val text-green mono">{impactMitigation?.slaBreachPrevented}</span>
          </div>
          <div className="impact-mini-cell">
            <span className="mini-lbl">COST VARIANCE</span>
            <span className="mini-val mono">{impactMitigation?.costImpact}</span>
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <div className="side-card-footer">
        {isApproved ? (
          <div className="side-approved-banner">
            <span className="dot dot-green"></span>
            <span>Rerouting Approved & Dispatched</span>
          </div>
        ) : (
          <button className="btn-cyan-action" onClick={onOpenReview}>
            <span>Review Recommendation</span>
            <span className="btn-arrow">→</span>
          </button>
        )}
      </div>
    </div>
  );
}
